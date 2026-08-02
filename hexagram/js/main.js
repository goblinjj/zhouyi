import { Divination } from './core/divination.js';
import { PALACE_ELEMENTS } from './data/constants.js';
import { Solar, Lunar } from 'lunar-javascript';
import { Takashima } from './modules/takashima.js';
import { calcTrueSolarTime, calcSunriseSunset, calcUnequalShichen, findShichen, calcHourGanZhi } from '@shared/true-solar-time';
import { CITIES } from '@shared/cities';

const castingBtn = document.getElementById('cast-btn');
const manualInputBtn = document.getElementById('manual-input-btn');
const manualInputPanel = document.getElementById('manual-input-panel');
const manualSubmitBtn = document.getElementById('manual-submit-btn');
const manualHint = document.getElementById('manual-hint');
const resetBtn = document.getElementById('reset-btn');
const statusMsg = document.getElementById('status-message');
const dateInfo = document.getElementById('date-info');
const hexBoard = document.getElementById('hex-board');
const boardLines = hexBoard.querySelector('.board-lines');
const boardTitlePrimary = hexBoard.querySelector('.board-title-primary');
const boardTitleVaried = hexBoard.querySelector('.board-title-varied');
const boardInfoPrimary = hexBoard.querySelector('.board-info-primary');
const boardInfoVaried = hexBoard.querySelector('.board-info-varied');
const huHexContainer = document.getElementById('hu-hexagram');
const aiAction = document.getElementById('ai-action');

const REL_CN = { "Parents": "父母", "Offspring": "子孙", "Official": "官鬼", "Wealth": "妻财", "Brothers": "兄弟" };
const BEAST_CN = {
    "Green Dragon": "青龙", "Vermilion Bird": "朱雀", "Hook Snake": "勾陈",
    "Flying Snake": "腾蛇", "White Tiger": "白虎", "Black Tortoise": "玄武"
};
const ELEMENT_CN = { "Metal": "金", "Wood": "木", "Water": "水", "Fire": "火", "Earth": "土" };
const BRANCH_CN = {
    "Zi": "子", "Chou": "丑", "Yin": "寅", "Mao": "卯", "Chen": "辰", "Si": "巳",
    "Wu": "午", "Wei": "未", "Shen": "申", "You": "酉", "Xu": "戌", "Hai": "亥"
};
const PALACE_CN = {
    "Qian": "乾", "Dui": "兑", "Li": "离", "Zhen": "震", "Xun": "巽", "Kan": "坎", "Gen": "艮", "Kun": "坤"
};

const divination = new Divination();
const takashima = new Takashima();

// 铜钱钱文：正面「乾隆通宝」（上下右左对读），背面满文「宝（左）泉（右）」宝泉局
const COIN_FACE_FRONT = '<span class="coin-face"><span class="ch t">乾</span><span class="ch b">隆</span><span class="ch r">通</span><span class="ch l">寶</span><span class="coin-hole"></span></span>';
const COIN_FACE_BACK = '<span class="coin-face"><span class="ch l manchu">ᠪᠣᠣ</span><span class="ch r manchu">ᠴᡳᠣᠸᠠᠨ</span><span class="coin-hole"></span></span>';

// 字面（乾隆通宝）为阴，背面（满文）为阳
// isYin=true 显示字面（乾隆通宝），false 显示背面（满文）
function setCoinFace(coin, isYin) {
    coin.innerHTML = isYin ? COIN_FACE_FRONT : COIN_FACE_BACK;
}

// Initialize Takashima data
takashima.init();

// True solar time state
let currentCity = { name: '北京', lng: 116.41, lat: 39.90, tz: 8 };
let useTrueSolarTime = true;

function initCitySelector() {
    const cityInput = document.getElementById('city-input');
    const cityDropdown = document.getElementById('city-dropdown');
    const cityNameEl = document.getElementById('city-name');
    const tstCheckbox = document.getElementById('tst-checkbox');

    tstCheckbox.addEventListener('change', () => {
        useTrueSolarTime = tstCheckbox.checked;
        refreshDate();
    });

    cityInput.addEventListener('input', () => {
        const q = cityInput.value.trim();
        if (!q) { cityDropdown.style.display = 'none'; return; }
        const qLower = q.toLowerCase();
        const matches = CITIES.filter(c => c.name.includes(q) || c.nameEn.toLowerCase().includes(qLower)).slice(0, 8);
        if (matches.length === 0) { cityDropdown.style.display = 'none'; return; }
        cityDropdown.innerHTML = matches.map(c =>
            `<li data-lng="${c.lng}" data-lat="${c.lat}" data-tz="${c.tz}" data-name="${c.name}">${c.name}<span class="city-extra">${c.province || ''}</span></li>`
        ).join('');
        cityDropdown.style.display = 'block';
    });

    cityInput.addEventListener('focus', () => {
        if (cityInput.value.trim()) cityInput.dispatchEvent(new Event('input'));
    });

    cityDropdown.addEventListener('mousedown', (e) => {
        const li = e.target.closest('li');
        if (!li) return;
        e.preventDefault();
        currentCity = {
            name: li.dataset.name,
            lng: parseFloat(li.dataset.lng),
            lat: parseFloat(li.dataset.lat),
            tz: parseFloat(li.dataset.tz)
        };
        cityNameEl.textContent = currentCity.name;
        cityInput.value = '';
        cityDropdown.style.display = 'none';
        refreshDate();
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.city-picker')) cityDropdown.style.display = 'none';
    });
}

function refreshDate() {
    const dateData = initDate();
    const dayGan = dateData.dayStem;
    currentDayStem = STEM_MAP[dayGan] || "Jia";
    currentXunKong = dateData.xunKong || "";
    currentDayBranch = dateData.dayBranch || "";
    currentMonthBranch = dateData.monthBranch || "";
}

function initDate() {
    try {
        const now = new Date();
        const d = Solar.fromDate(now);
        const lunar = d.getLunar();
        const bazi = lunar.getEightChar();

        const ganZhiYear = bazi.getYear();
        const ganZhiMonth = bazi.getMonth();
        const ganZhiDay = bazi.getDay();
        let ganZhiHour = bazi.getTime();
        let tstNote = '';

        if (useTrueSolarTime) {
            const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            const tst = calcTrueSolarTime(dateStr, timeStr, currentCity.lng, currentCity.tz);
            const sunData = calcSunriseSunset(dateStr, currentCity.lat, currentCity.lng, currentCity.tz);
            if (sunData) {
                const shichenTable = calcUnequalShichen(sunData.sunrise, sunData.sunset);
                const sc = findShichen(tst.hours, tst.minutes, shichenTable);
                if (sc) {
                    const dayStem = ganZhiDay[0];
                    const isLateZi = sc.subBranch === '晚子';
                    ganZhiHour = calcHourGanZhi(dayStem, sc.branch, isLateZi);
                    const tstTime = `${String(tst.hours).padStart(2,'0')}:${String(tst.minutes).padStart(2,'0')}`;
                    const scStart = `${String(sc.start.h).padStart(2,'0')}:${String(sc.start.m).padStart(2,'0')}`;
                    const scEnd = `${String(sc.end.h).padStart(2,'0')}:${String(sc.end.m).padStart(2,'0')}`;
                    tstNote = ` <span style="font-size:0.85em;color:var(--accent-gold);">(${tstTime}- ${sc.name}(${scStart}~${scEnd}))</span>`;
                }
            }
        }

        dateInfo.innerHTML = `
            ${d.getYear()}年${d.getMonth()}月${d.getDay()}日
            农历:${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}
            <br>
            ${ganZhiYear}年 ${ganZhiMonth}月 ${ganZhiDay}日
            <span class="shichen-highlight">${ganZhiHour}时</span>${tstNote}
            <br>
            <span class="xunkong-info">空亡: ${lunar.getDayXunKong()}</span>
        `;
        return {
            dayStem: bazi.getDay().substring(0, 1),
            xunKong: lunar.getDayXunKong(),
            dayBranch: lunar.getDayZhi(),
            monthBranch: lunar.getMonthZhi()
        };

    } catch (e) {
        console.error(e);
        dateInfo.innerHTML = "错误: 日期库加载失败。";
        return { dayStem: "甲" };
    }
}

const STEM_MAP = {
    "甲": "Jia", "乙": "Yi", "丙": "Bing", "丁": "Ding", "戊": "Wu",
    "己": "Ji", "庚": "Geng", "辛": "Xin", "壬": "Ren", "癸": "Gui"
};

const CLASH_MAP = {
    "子": "午", "午": "子", "丑": "未", "未": "丑",
    "寅": "申", "申": "寅", "卯": "酉", "酉": "卯",
    "辰": "戌", "戌": "辰", "巳": "亥", "亥": "巳"
};

// ── 十二长生（以日辰为准，阳生顺行；火土同宫长生在寅）──
const BRANCH_ORDER = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const TWELVE_STAGES = ["长生", "沐浴", "冠带", "临官", "帝旺", "衰", "病", "死", "墓", "绝", "胎", "养"];
const CHANG_SHENG_START = { "Metal": "巳", "Wood": "亥", "Water": "申", "Fire": "寅", "Earth": "寅" };
const STAGE_CLASS = {
    "长生": "tag-cs-good", "冠带": "tag-cs-good", "临官": "tag-cs-good", "帝旺": "tag-cs-good",
    "病": "tag-cs-bad", "死": "tag-cs-bad", "墓": "tag-cs-bad", "绝": "tag-cs-bad"
};

// 取某爻五行在日支上所处的十二长生位
function getChangSheng(element, dayBranch) {
    const start = CHANG_SHENG_START[element];
    if (!start || !dayBranch) return "";
    const offset = (BRANCH_ORDER.indexOf(dayBranch) - BRANCH_ORDER.indexOf(start) + 12) % 12;
    return TWELVE_STAGES[offset];
}

let currentDayStem = "Jia";
let currentXunKong = "";
let currentDayBranch = "";
let currentMonthBranch = "";

document.addEventListener('DOMContentLoaded', () => {
    initCitySelector();
    const dateData = initDate();
    const dayGan = dateData.dayStem;
    currentDayStem = STEM_MAP[dayGan] || "Jia";
    currentXunKong = dateData.xunKong || "";
    currentDayBranch = dateData.dayBranch || "";
    currentMonthBranch = dateData.monthBranch || "";

    renderHistoryList();

    // Initialize UI state
    window.startCasting();

    // Check for test mode
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('test')) {
        divination.cast();
        castingStep = 6;
        coinContainer.style.display = 'none';
        castingBtn.style.display = 'none';
        resetBtn.style.display = 'inline-block';
        resetBtn.innerText = "重新起卦";
        statusMsg.innerText = "测试模式：直接生成结果";

        renderResult(divination.castResult);
    }
});

const castingButtonText = [
    "开始起卦 (掷初爻)", "掷二爻", "掷三爻", "掷四爻", "掷五爻", "掷上爻"
];

let castingStep = 0;
const coinContainer = document.getElementById('coin-container');

// 手动排盘面板恢复初始态：六爻全部未选中
function resetManualPanel() {
    manualInputPanel.querySelectorAll('input[type="radio"]').forEach(r => { r.checked = false; });
    manualInputPanel.querySelectorAll('.manual-row-missing').forEach(row => row.classList.remove('manual-row-missing'));
    manualHint.style.display = 'none';
}

// 选中某爻后立即消掉该行的未选提示
manualInputPanel.addEventListener('change', (e) => {
    const row = e.target.closest('.manual-row');
    if (row) row.classList.remove('manual-row-missing');
    if (!manualInputPanel.querySelector('.manual-row-missing')) manualHint.style.display = 'none';
});

window.startCasting = () => {
    castingStep = 0;
    divination.reset();
    resetManualPanel();
    hexBoard.style.display = 'none';
    hexBoard.classList.add('no-varied');
    hexBoard.classList.remove('has-hidden');
    boardLines.innerHTML = '';
    boardInfoPrimary.innerHTML = '';
    boardInfoVaried.innerHTML = '';
    [boardTitlePrimary, boardTitleVaried].forEach(t => {
        t.querySelector('.hexagram-name').textContent = '';
        t.querySelector('.hexagram-palace').textContent = '';
    });
    aiAction.style.display = 'none';
    huHexContainer.style.display = 'none';
    huHexContainer.querySelector('.board-lines').innerHTML = '';
    huHexContainer.querySelector('.board-info-primary').innerHTML = '';

    castingBtn.innerText = castingButtonText[0];
    castingBtn.disabled = false;
    castingBtn.style.display = 'inline-block';
    manualInputBtn.style.display = 'inline-block';
    manualInputBtn.innerText = '手动排盘';
    manualInputPanel.style.display = 'none';
    resetBtn.style.display = 'none';
    statusMsg.innerText = "点击按钮开始抛掷铜钱...";
    coinContainer.style.display = 'none';
};

castingBtn.addEventListener('click', () => {
    if (castingStep < 6) {
        performToss();
    }
});

resetBtn.addEventListener('click', () => {
    window.startCasting();
});

manualInputBtn.addEventListener('click', () => {
    const isVisible = manualInputPanel.style.display !== 'none';
    if (isVisible) {
        manualInputPanel.style.display = 'none';
        manualInputBtn.innerText = '手动排盘';
    } else {
        manualInputPanel.style.display = 'block';
        manualInputBtn.innerText = '收起输入';
        coinContainer.style.display = 'none';
    }
});

manualSubmitBtn.addEventListener('click', () => {
    const raw = [];
    const missing = [];
    const LINE_NAMES = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"];
    for (let i = 0; i < 6; i++) {
        const selected = document.querySelector(`input[name="line${i}"]:checked`);
        if (!selected) {
            missing.push(i);
            continue;
        }
        raw.push(parseInt(selected.value));
    }

    // 六爻必须全部选定才能排盘
    if (missing.length > 0) {
        manualHint.textContent = `请先选择：${missing.map(i => LINE_NAMES[i]).join('、')}`;
        manualHint.style.display = 'block';
        missing.forEach(i => {
            const row = document.querySelector(`.manual-row[data-line="${i}"]`);
            if (!row) return;
            row.classList.remove('manual-row-missing');
            void row.offsetWidth; // 重启动画
            row.classList.add('manual-row-missing');
        });
        return;
    }
    manualHint.style.display = 'none';

    divination.castResult = raw;
    castingStep = 6;
    coinContainer.style.display = 'none';
    castingBtn.style.display = 'none';
    manualInputBtn.style.display = 'none';
    manualInputPanel.style.display = 'none';
    resetBtn.style.display = 'inline-block';
    resetBtn.innerText = '重新起卦';
    statusMsg.innerText = '手动排盘完成';

    renderResult(divination.castResult);
});

function performToss() {
    castingBtn.disabled = true;
    manualInputBtn.style.display = 'none';
    manualInputPanel.style.display = 'none';
    statusMsg.innerText = "掷铜钱中...";
    coinContainer.style.display = 'flex';

    // 1. Determine targets (Collision limit)
    const containerW = coinContainer.offsetWidth;
    const containerH = coinContainer.offsetHeight;
    const coinSize = coinContainer.querySelector('.coin').offsetWidth || 64;
    const targets = [];
    let attempts = 0;
    while (targets.length < 3 && attempts < 100) {
        const left = Math.random() * (containerW - coinSize);
        const top = Math.random() * (containerH - coinSize);

        let overlap = false;
        for (const t of targets) {
            const dx = t.left - left;
            const dy = t.top - top;
            if (Math.sqrt(dx * dx + dy * dy) < (coinSize + 10)) {
                overlap = true;
                break;
            }
        }
        if (!overlap) {
            targets.push({ left, top });
        }
        attempts++;
    }
    // Fallback if placement fails
    while (targets.length < 3) {
        targets.push({ left: Math.random() * (containerW - coinSize), top: Math.random() * (containerH - coinSize) });
    }

    // 2. Prepare coins
    const coins = coinContainer.querySelectorAll('.coin');
    const indices = [0, 1, 2];
    // Shuffle indices for stopping order
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    // 3. Start Motion
    indices.forEach((coinIdx, i) => {
        const c = coins[coinIdx];
        const target = targets[coinIdx];

        // Random start position (cluster near center for "toss" effect)
        c.style.transition = 'none';
        c.style.left = ((containerW - coinSize) / 2 + (Math.random() - 0.5) * 50) + 'px';
        c.style.top = ((containerH - coinSize) / 2 + (Math.random() - 0.5) * 50) + 'px';
        c.style.transform = `rotate(${Math.random() * 360}deg)`;

        // Trigger reflow
        c.offsetHeight;

        const stopDelay = 800 + (i * 600) + Math.random() * 300;

        // Reset class to start spin
        c.className = 'coin spinning';
        setCoinFace(c, false);

        // spin speed
        c.style.animationDuration = (0.5 + Math.random() * 0.3) + 's';

        // Smooth Roll: Transition to target over the duration of the delay
        c.style.transition = `left ${stopDelay}ms ease-out, top ${stopDelay}ms ease-out`;

        // Set Target Position
        c.style.left = target.left + 'px';
        c.style.top = target.top + 'px';

        // Store delay on the element for retrieval
        c.dataset.stopDelay = stopDelay;
    });

    // 4. Logic & Feedback
    const lineVal = divination.castLine();
    const coinValues = decomposeToCoins(lineVal);
    let completedCount = 0;

    setVibration(3);

    // Visual Flicker Interval (Texture swap only, NO movement - pure texture toggle)
    const flickerInterval = setInterval(() => {
        const spinningCoins = coinContainer.querySelectorAll('.coin.spinning');
        if (spinningCoins.length === 0) {
            clearInterval(flickerInterval);
            return;
        }
        spinningCoins.forEach(c => {
            const isYin = Math.random() > 0.5;
            // Preserve spinning class, just toggle yin/yang class for color
            c.classList.remove('yin', 'yang');
            c.classList.add(isYin ? 'yin' : 'yang');
            setCoinFace(c, isYin);
        });
    }, 80);

    // 5. Stopping Logic
    indices.forEach((coinIdx, i) => {
        const c = coins[coinIdx];
        const delay = parseFloat(c.dataset.stopDelay);

        setTimeout(() => {
            const val = coinValues[coinIdx];

            // Stop spinning
            c.className = 'coin';
            c.style.animationDuration = '';
            c.style.transition = ''; // Clear transition

            // Set Final Face
            if (val === 2) {
                c.classList.add('yin');
                setCoinFace(c, true);
            } else {
                c.classList.add('yang');
                setCoinFace(c, false);
            }

            // Final resting rotation (random angle on floor)
            c.style.transform = `rotate(${Math.random() * 360}deg)`;

            completedCount++;
            setVibration(3 - completedCount);

            if (completedCount === 3) {
                clearInterval(flickerInterval);
                finishToss(lineVal);
            }
        }, delay);
    });
}

function setVibration(level) {
    if (window.vibrationTimer) clearInterval(window.vibrationTimer);
    if (!navigator.vibrate) return;
    navigator.vibrate(0); // Stop current

    if (level <= 0) return;

    // Simulate intensity levels using pulse patterns
    const patterns = {
        3: { duration: 80, interval: 100 },
        2: { duration: 50, interval: 150 },
        1: { duration: 30, interval: 300 }
    };

    const p = patterns[level];
    const run = () => navigator.vibrate(p.duration);

    run(); // Start immediately
    window.vibrationTimer = setInterval(run, p.interval);
}

function finishToss(lineVal) {
    castingStep++;

    if (castingStep === 1) {
        hexBoard.style.display = 'block';
    }

    const stepName = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"][castingStep - 1];
    statusMsg.innerText = `${stepName}掷得: ${getLineName(lineVal)}`;

    renderSingleLine(lineVal, castingStep - 1);

    castingBtn.disabled = false;

    if (castingStep < 6) {
        castingBtn.innerText = castingButtonText[castingStep];
    } else {
        statusMsg.innerText = "起卦完成";
        castingBtn.style.display = 'none';
        resetBtn.innerText = "重新起卦";
        resetBtn.style.display = 'inline-block';

        setTimeout(() => {
            const result = divination.castResult;
            renderResult(result);
        }, 500);
    }
}

function decomposeToCoins(sum) {
    let coins;
    if (sum === 6) coins = [2, 2, 2];
    else if (sum === 9) coins = [3, 3, 3];
    else if (sum === 7) coins = [2, 2, 3]; // 2+2+3=7 (Shao Yang) - 1 Yang, 2 Yins
    else if (sum === 8) coins = [2, 3, 3]; // 2+3+3=8 (Shao Yin) - 1 Yin, 2 Yangs
    else coins = [2, 3, 3];

    // Shuffle for visual effect
    for (let i = coins.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [coins[i], coins[j]] = [coins[j], coins[i]];
    }
    return coins;
}

function getLineName(val) {
    if (val === 6) return "老阴 (变)";
    if (val === 7) return "少阳 (静)";
    if (val === 8) return "少阴 (静)";
    if (val === 9) return "老阳 (变)";
    return "";
}

// 起卦过程中逐爻追加（此时尚未成卦，只有爻符与阴阳老少）
function renderSingleLine(val, index) {
    const isMoving = (val === 6 || val === 9);
    const symbol = getLineSymbol(val % 2 !== 0 ? 1 : 0, val);
    const row = document.createElement('div');
    row.className = 'cast-row';
    row.innerHTML =
        `<span class="cast-idx">${["初", "二", "三", "四", "五", "上"][index]}爻</span>` +
        `<span class="cast-sym${isMoving ? ' moving' : ''}${isDotSymbol(symbol) ? ' bc-sym-dot' : ''}">${symbol}</span>` +
        `<span class="cast-name">${getLineName(val)}</span>`;
    boardLines.appendChild(row);
}

function renderResult(castResult) {
    const hexs = divination.getHexagrams();
    const primaryChart = divination.chart(hexs.primary, currentDayStem);
    const primaryBinary = hexs.primary.join('');

    const variedChart = hexs.varied ? divination.chart(hexs.varied, currentDayStem) : null;
    const variedName = variedChart ? variedChart.name : null;

    // 本卦与变卦共用一张爻表，逐爻同行对齐
    renderBoard(hexBoard, {
        primaryChart,
        primaryLines: hexs.primary,
        rawLines: hexs.raw,
        variedChart,
        variedLines: hexs.varied
    });
    setBoardTitle(boardTitlePrimary, primaryChart);
    hexBoard.style.display = 'block';

    // 高岛易断取用爻：无动爻取卦辞，单动取该爻，多动另有取法
    const variedBinary = hexs.varied ? hexs.varied.join('') : "";
    const focal = takashima.calculateFocalElement(hexs.raw, primaryBinary, variedBinary);
    addTakashimaButton(boardInfoPrimary, focal.hexCode, focal.index, focal.description);
    addStudyLink(boardInfoPrimary, primaryBinary, primaryChart.name);
    addAiButton(aiAction);
    aiAction.style.display = 'block';

    if (variedChart) {
        setBoardTitle(boardTitleVaried, variedChart);
        const variedBinaryCode = hexs.varied.join('');
        addTakashimaButton(boardInfoVaried, variedBinaryCode, null, "变卦卦辞");
        addStudyLink(boardInfoVaried, variedBinaryCode, variedName);

        // 互卦：有动爻时由本卦内四爻互联生成
        const huLines = divination.huGua(hexs.primary);
        const huChart = divination.chart(huLines, currentDayStem);
        huHexContainer.style.display = 'block';
        renderBoard(huHexContainer, { primaryChart: huChart, primaryLines: huLines, rawLines: null });
        setBoardTitle(huHexContainer.querySelector('.board-title-primary'), huChart);
        const huInfo = huHexContainer.querySelector('.board-info-primary');
        const huBinaryCode = huLines.join('');
        addTakashimaButton(huInfo, huBinaryCode, null, "互卦卦辞");
        addStudyLink(huInfo, huBinaryCode, huChart.name);
    } else {
        // 无动爻：清掉上一卦可能残留的变卦标题与按钮
        boardTitleVaried.querySelector('.hexagram-name').textContent = '';
        boardTitleVaried.querySelector('.hexagram-palace').textContent = '';
        boardInfoVaried.innerHTML = '';
        huHexContainer.style.display = 'none';
    }

    // Save to history (skip when restoring)
    if (!renderResult._skipSave) {
        saveToHistory(hexs.raw, primaryChart.name, variedName);
    }
}

// 卦名 + 宫位世应，写入表头对应的一栏
function setBoardTitle(titleEl, chartData) {
    const pName = PALACE_CN[chartData.palace.palace] || chartData.palace.palace;
    const genText = chartData.palace.generation === 6 ? "六冲" :
        (chartData.palace.generation === "YouHun" ? "游魂" :
            (chartData.palace.generation === "GuiHun" ? "归魂" :
                chartData.palace.generation + "世"));
    titleEl.querySelector('.hexagram-name').textContent = chartData.name;
    titleEl.querySelector('.hexagram-palace').textContent =
        `${pName}宫${ELEMENT_CN[PALACE_ELEMENTS[chartData.palace.palace]]} - ${genText}`;
}

// 爻符：老阳 O、老阴 X（动爻），少阳 .、少阴 ..（静爻）
function getLineSymbol(binaryVal, rawVal) {
    if (rawVal === 9) return 'O';
    if (rawVal === 6) return 'X';
    return binaryVal === 1 ? '.' : '..';
}

// 点号落在基线上，需要单独抬到行的中线
function isDotSymbol(symbol) {
    return symbol === '.' || symbol === '..';
}

// 纳甲三角标：右上=十二长生（日辰），右下=旬空，左下=日破/月破
function buildBranchTags(element, branchText) {
    let html = '';

    const changSheng = getChangSheng(element, currentDayBranch);
    if (changSheng) {
        html += `<span class="bb-tag bb-cs ${STAGE_CLASS[changSheng] || 'tag-cs-flat'}">${changSheng}</span>`;
    }

    // 旬空与日/月破挂在下沿，同一条 flex 里横排，避免互相压盖
    let bottom = '';
    if (currentXunKong && currentXunKong.includes(branchText)) {
        bottom += '<span class="bb-tag tag-kong">空</span>';
    }

    const isRiPo = currentDayBranch && CLASH_MAP[branchText] === currentDayBranch;
    const isYuePo = currentMonthBranch && CLASH_MAP[branchText] === currentMonthBranch;
    if (isRiPo && isYuePo) {
        bottom += '<span class="bb-tag tag-ripo">日月破</span>';
    } else if (isRiPo) {
        bottom += '<span class="bb-tag tag-ripo">日破</span>';
    } else if (isYuePo) {
        bottom += '<span class="bb-tag tag-yuepo">月破</span>';
    }
    if (bottom) html += `<span class="bb-bottom">${bottom}</span>`;

    return html;
}

// 六亲 / 纳甲 / 爻符 (/ 世应) 一格，本卦与变卦共用。
// showTags：变卦只有动爻变出的那一爻参与生克，静爻位不挂角标。
function buildGuaCell(chartData, index, symbol, isMoving, withShiYing, showTags) {
    const relText = REL_CN[chartData.relations[index]] || '';
    const branchText = BRANCH_CN[chartData.branches[index]] || '';
    const elText = ELEMENT_CN[chartData.elements[index]] || '';
    const tags = showTags ? buildBranchTags(chartData.elements[index], branchText) : '';

    let html = `<span class="bc-rel">${relText}</span>` +
        `<span class="bc-branch">${branchText}${elText}${tags}</span>` +
        `<span class="bc-sym${isMoving ? ' moving' : ''}${isDotSymbol(symbol) ? ' bc-sym-dot' : ''}">${symbol}</span>`;

    if (withShiYing) {
        const shi = chartData.palace.shi === (index + 1) ? "世" : "";
        const ying = chartData.palace.ying === (index + 1) ? "应" : "";
        html += `<span class="bc-shi">${shi}${ying}</span>`;
    }
    return html;
}

// 渲染一张爻表。variedChart 为空时只有本卦一栏（起卦中 / 互卦 / 无动爻）
function renderBoard(boardEl, { primaryChart, primaryLines, rawLines, variedChart, variedLines }) {
    const linesEl = boardEl.querySelector('.board-lines');
    linesEl.innerHTML = '';

    const hidden = primaryChart.hiddenSpirits || {};
    const hasHidden = Object.keys(hidden).length > 0;
    boardEl.classList.toggle('no-varied', !variedChart);
    boardEl.classList.toggle('has-hidden', hasHidden);

    primaryLines.forEach((val, index) => {
        const raw = rawLines ? rawLines[index] : null;
        const isMoving = raw === 6 || raw === 9;

        const row = document.createElement('div');
        row.className = 'bl-row';

        let html = '';

        if (hasHidden) {
            const hs = hidden[index];
            html += '<div class="bc bc-hidden" title="伏神">' + (hs
                ? `<span>${REL_CN[hs.relation]}</span><span>${BRANCH_CN[hs.branch]}${ELEMENT_CN[hs.element]}</span>`
                : '') + '</div>';
        }

        html += `<div class="bc bc-gua bc-primary">` +
            buildGuaCell(primaryChart, index, getLineSymbol(val, raw), isMoving, true, true) +
            `</div>`;

        if (variedChart) {
            html += `<div class="bc bc-gua bc-varied">` +
                buildGuaCell(variedChart, index, getLineSymbol(variedLines[index], null), false, false, isMoving) +
                `</div>`;
        }

        // 六兽只随日干而定，本卦变卦相同，故只在末列出现一次
        const beast = primaryChart.sixBeasts ? primaryChart.sixBeasts[index] : "";
        html += `<div class="bc bc-beast">${BEAST_CN[beast] || ''}</div>`;

        row.innerHTML = html;
        linesEl.appendChild(row);
    });
}

// Takashima Modal Logic
const modal = document.getElementById("takashima-modal");
const modalTitle = document.getElementById("modal-title");
const modalBody = document.getElementById("modal-body");
const closeBtn = document.querySelector(".close-btn");

function closeModal() {
    modal.style.display = "none";
}

if (closeBtn) {
    closeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        closeModal();
    });
}

modal.addEventListener('click', function (event) {
    if (event.target === modal) {
        closeModal();
    }
});


async function showTakashimaModal(binaryCode, movingLineIndex) {
    modalTitle.innerText = "加载中...";
    modalBody.innerHTML = "正在获取高岛易断解释，请稍候...";
    modal.style.display = "block";

    const result = await takashima.getExplanation(binaryCode, movingLineIndex);

    if (result.error) {
        modalTitle.innerText = result.title;
        modalBody.innerHTML = result.error;
        return;
    }

    renderTakashimaContent(result);
}

let mainSectionIdCounter = 0;

function sectionHtml(title, original, modern, cssClass) {
    if (!original) return '';
    const sid = `main-sec-${mainSectionIdCounter++}`;
    const hasModern = !!modern;
    const toggleBtn = hasModern
        ? `<button class="section-toggle-btn modal-toggle-btn">译文</button>`
        : '';
    const modernBlock = hasModern
        ? `<div class="${cssClass} section-modern" hidden>${escapeHtml(modern)}</div>`
        : '';
    return `<div class="modal-section" id="${sid}" data-nav-title="${title}">` +
        `<div class="modal-section-title">${title}${toggleBtn}</div>` +
        `<div class="${cssClass} section-original">${escapeHtml(original)}</div>` +
        modernBlock +
        `</div>`;
}

function buildModalNav(bodyElement) {
    const sections = bodyElement.querySelectorAll('[data-nav-title]');
    if (sections.length < 3) return;

    const nav = document.createElement('div');
    nav.className = 'modal-nav';
    sections.forEach(sec => {
        const link = document.createElement('a');
        link.className = 'modal-nav-link';
        link.textContent = sec.dataset.navTitle;
        link.href = '#' + sec.id;
        link.addEventListener('click', (e) => {
            e.preventDefault();
            sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        nav.appendChild(link);
    });
    bodyElement.insertBefore(nav, bodyElement.firstChild);
}

function renderTakashimaContent(result) {
    mainSectionIdCounter = 0;
    modalTitle.innerText = result.title;

    let bodyHtml = '';

    bodyHtml += sectionHtml('卦辞', result.guaci, result.modern_guaci, 'modal-classical-text');
    bodyHtml += sectionHtml('总注', result.general_text, result.modern_general_text, 'modal-modern-text');

    if (result.lineText !== undefined) {
        bodyHtml += sectionHtml('爻辞', result.lineText, result.modern_lineText, 'modal-classical-text');
    }

    bodyHtml += sectionHtml('高岛易断', result.takashima, result.modern_takashima, 'modal-takashima-text');

    modalBody.innerHTML = bodyHtml;

    buildModalNav(modalBody);

    // Bind per-section toggle buttons
    modalBody.querySelectorAll('.section-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const sec = btn.closest('.modal-section');
            const origEl = sec.querySelector('.section-original');
            const modernEl = sec.querySelector('.section-modern');
            const showingModern = !modernEl.hidden;
            origEl.hidden = !showingModern;
            modernEl.hidden = showingModern;
            btn.textContent = showingModern ? '译文' : '原文';
            btn.classList.toggle('active', !showingModern);
        });
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
}

// Add button to page dynamically or existing container
function addTakashimaButton(container, binaryCode, movingLineIndex, description) {
    // Check if button already exists to avoid duplicates if re-rendering
    let btn = container.querySelector('.takashima-btn');
    if (!btn) {
        btn = document.createElement('button');
        btn.className = 'takashima-btn';
        btn.style.marginTop = '10px';
        btn.style.fontSize = '14px';
        btn.style.padding = '5px 10px';
        btn.style.backgroundColor = '#666'; // Distinct from main action
        container.appendChild(btn);
    }

    // Update text
    btn.innerText = "爻辞";
    btn.title = description ? `高岛易断 · ${description}` : "高岛易断";

    // Update click handler with current context
    btn.onclick = () => {
        showTakashimaModal(binaryCode, movingLineIndex);
    };
}

// ── AI Interpret ──
const aiModal = document.getElementById('ai-modal');
const aiModalTitle = document.getElementById('ai-modal-title');
const aiInputArea = document.getElementById('ai-input-area');
const aiResultArea = document.getElementById('ai-result-area');
const aiQuestion = document.getElementById('ai-question');
const aiSubmitBtn = document.getElementById('ai-submit-btn');
const aiContent = document.getElementById('ai-content');
const aiError = document.getElementById('ai-error');
const aiRetryBtn = document.getElementById('ai-retry-btn');
const aiCloseBtn = document.querySelector('.ai-close-btn');

let currentHexagramInfo = '';

if (aiCloseBtn) {
    aiCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        aiModal.style.display = 'none';
    });
}

aiModal.addEventListener('click', (e) => {
    if (e.target === aiModal) aiModal.style.display = 'none';
});

function collectHexagramInfo() {
    const hexs = divination.getHexagrams();
    const primaryChart = divination.chart(hexs.primary, currentDayStem);

    const pName = PALACE_CN[primaryChart.palace.palace] || primaryChart.palace.palace;
    const palaceEl = ELEMENT_CN[PALACE_ELEMENTS[primaryChart.palace.palace]] || '';
    const genText = primaryChart.palace.generation === 6 ? "六冲" :
        (primaryChart.palace.generation === "YouHun" ? "游魂" :
            (primaryChart.palace.generation === "GuiHun" ? "归魂" :
                primaryChart.palace.generation + "世"));

    let info = `本卦：${primaryChart.name}（${pName}宫${palaceEl} ${genText}）\n`;
    info += `世爻：第${primaryChart.palace.shi}爻  应爻：第${primaryChart.palace.ying}爻\n\n`;

    const lineNames = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"];
    info += `六爻详情（从初爻到上爻；方括号标注世应、动爻、旬空、日破，以及以日辰为准的十二长生）：\n`;

    for (let i = 0; i < 6; i++) {
        const rel = REL_CN[primaryChart.relations[i]] || primaryChart.relations[i];
        const branch = BRANCH_CN[primaryChart.branches[i]] || primaryChart.branches[i];
        const element = ELEMENT_CN[primaryChart.elements[i]] || primaryChart.elements[i];
        const beast = BEAST_CN[primaryChart.sixBeasts?.[i]] || '';
        const isMoving = hexs.raw[i] === 6 || hexs.raw[i] === 9;
        const movingText = isMoving ? (hexs.raw[i] === 9 ? "（动爻-老阳）" : "（动爻-老阴）") : "";
        const shiYing = primaryChart.palace.shi === (i + 1) ? " [世]" : (primaryChart.palace.ying === (i + 1) ? " [应]" : "");

        let xunkongTag = '';
        if (currentXunKong && currentXunKong.includes(branch)) xunkongTag = ' [旬空]';
        let ripoTag = '';
        if (currentDayBranch && CLASH_MAP[branch] === currentDayBranch) ripoTag = ' [日破]';
        const cs = getChangSheng(primaryChart.elements[i], currentDayBranch);
        const csTag = cs ? ` [${cs}]` : '';

        info += `${lineNames[i]}：${beast} ${rel} ${branch}${element}${shiYing}${movingText}${xunkongTag}${ripoTag}${csTag}\n`;
    }

    if (hexs.varied) {
        const variedChart = divination.chart(hexs.varied, currentDayStem);
        info += `\n变卦：${variedChart.name}\n`;

        // 变爻（动爻变出的那一爻）才参与生克，逐条列出
        for (let i = 0; i < 6; i++) {
            if (hexs.raw[i] !== 6 && hexs.raw[i] !== 9) continue;
            const rel = REL_CN[variedChart.relations[i]] || '';
            const branch = BRANCH_CN[variedChart.branches[i]] || '';
            const element = ELEMENT_CN[variedChart.elements[i]] || '';
            const cs = getChangSheng(variedChart.elements[i], currentDayBranch);
            info += `  ${lineNames[i]}变出：${rel} ${branch}${element}${cs ? ` [${cs}]` : ''}\n`;
        }

        // 互卦：本卦下卦取 2、3、4 爻，上卦取 3、4、5 爻
        const huChart = divination.chart(divination.huGua(hexs.primary), currentDayStem);
        const huPName = PALACE_CN[huChart.palace.palace] || huChart.palace.palace;
        const huPalaceEl = ELEMENT_CN[PALACE_ELEMENTS[huChart.palace.palace]] || '';
        info += `互卦：${huChart.name}（${huPName}宫${huPalaceEl}，由本卦下卦取二三四爻、上卦取三四五爻互联而成）\n`;
    }

    info += `\n日期：${dateInfo.textContent.trim()}\n`;

    return info;
}

function addAiButton(container) {
    let btn = container.querySelector('.ai-btn');
    if (!btn) {
        btn = document.createElement('button');
        btn.className = 'ai-btn';
        btn.style.marginTop = '10px';
        container.appendChild(btn);
    }
    btn.innerText = 'AI 解卦';
    btn.onclick = () => {
        currentHexagramInfo = collectHexagramInfo();
        aiModal.style.display = 'block';
        // Preserve previous result if exists
        if (!aiContent.innerHTML.trim()) {
            aiInputArea.style.display = 'block';
            aiResultArea.style.display = 'none';
            aiQuestion.value = '';
            aiSubmitBtn.disabled = false;
            aiSubmitBtn.innerText = '开始解卦';
        }
    };
}

function simpleMarkdown(text) {
    let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Headers
    html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Bold & italic
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Unordered list items
    html = html.replace(/^[-*] (.+)$/gm, '<li>$1</li>');

    // Ordered list items
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    // Wrap consecutive <li> in <ul>
    html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

    // Paragraphs: double newline
    html = html.replace(/\n\n+/g, '</p><p>');
    // Single newline to <br>
    html = html.replace(/\n/g, '<br>');

    html = '<p>' + html + '</p>';
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>(<h[1-4]>)/g, '$1');
    html = html.replace(/(<\/h[1-4]>)<\/p>/g, '$1');
    html = html.replace(/<p>(<ul>)/g, '$1');
    html = html.replace(/(<\/ul>)<\/p>/g, '$1');

    return html;
}

async function startAiInterpret(question) {
    aiInputArea.style.display = 'none';
    aiResultArea.style.display = 'block';
    aiContent.innerHTML = '<div class="ai-loading"><span class="ai-loading-dot"></span><span class="ai-loading-dot"></span><span class="ai-loading-dot"></span><span class="ai-loading-text">正在解卦中，请稍候...</span></div>';
    aiError.style.display = 'none';
    aiRetryBtn.style.display = 'none';

    let fullText = '';

    try {
        const response = await fetch('/api/ai-interpret', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question, hexagramInfo: currentHexagramInfo }),
        });

        if (!response.ok) {
            let errorMsg = '网络连接失败，请检查网络后重试';
            try {
                const errData = await response.json();
                if (errData.error) errorMsg = errData.error;
            } catch { }
            showAiError(errorMsg);
            return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (!line.startsWith('data: ')) continue;
                const data = line.slice(6).trim();
                if (data === '[DONE]') continue;

                try {
                    const parsed = JSON.parse(data);
                    if (parsed.error) {
                        fullText += '\n\n（传输中断，内容可能不完整）';
                        aiContent.innerHTML = simpleMarkdown(fullText);
                        showAiError(parsed.error);
                        return;
                    }
                    if (parsed.text) {
                        fullText += parsed.text;
                        aiContent.innerHTML = simpleMarkdown(fullText) + '<span class="ai-cursor"></span>';
                    }
                } catch { }
            }
        }

        // Render final
        aiContent.innerHTML = simpleMarkdown(fullText);

    } catch (err) {
        if (fullText) {
            fullText += '\n\n（传输中断，内容可能不完整）';
            aiContent.innerHTML = simpleMarkdown(fullText);
        }
        showAiError('网络连接失败，请检查网络后重试');
    }
}

function showAiError(msg) {
    aiError.textContent = msg;
    aiError.style.display = 'block';
    aiRetryBtn.style.display = 'block';
}

aiSubmitBtn.addEventListener('click', () => {
    const q = aiQuestion.value.trim();
    if (!q) return;
    startAiInterpret(q);
});

const aiCopyBtn = document.getElementById('ai-copy-btn');
aiCopyBtn.addEventListener('click', async () => {
    const q = aiQuestion.value.trim();
    let prompt = `你是一位精通六爻占卜的易学大师，请根据以下卦象信息进行专业解读。\n\n解卦顺序（务必按此顺序展开分析）：\n1. 世应分析：先从应爻、世爻入手，解析卦主（求占之人）与所占之事之间的关系与态势（世为己、应为他/事，看其旺衰、生克、动静、比和冲合）\n2. 用神剖判：再根据所占之事取用神（如问财取财爻、问官取官爻、问婚取应爻或官鬼/妻财等），结合日月生克、动变化出，解释求占之事当前的状态与吉凶\n3. 卦象背景与事态演进：回归卦象本身（卦名、卦辞、上下卦象意），并按"本卦→互卦→变卦"的三段时序串讲事情的来龙去脉：\n   - 本卦＝现状/起局：当前所处的态势与格局；\n   - 互卦＝过程/中段：如何从现状走向结局——发展路径、所经曲折阻力、可借助或须防范的因素、潜藏隐情（互卦由本卦内四爻互联而成，下卦取二三四爻、上卦取三四五爻，专主"过程"）；\n   - 变卦＝结局/终局：事情最终的走向与结果（变卦由动爻变出，专主"结果"）。\n   务必讲清三者的因果衔接：现状如何、要经历怎样的过程、最终落到什么结局。\n\n在以上主线之上，补充六兽参考、动爻与变爻（据动爻判定结局吉凶）、旬空与日破；若有互卦则重点回答"如何达到这个结局"（关键节点、助力与障碍、可操作建议），若无动爻（无互卦）则事态静定、不展开此项。最后给出综合判断与实际可行的建议。\n\n卦象信息：\n${currentHexagramInfo}`;
    if (q) prompt += `\n\n占卜事件：${q}`;
    try {
        await navigator.clipboard.writeText(prompt);
        aiCopyBtn.innerText = '已复制';
        setTimeout(() => { aiCopyBtn.innerText = '复制提问'; }, 2000);
    } catch {
        aiCopyBtn.innerText = '复制失败';
        setTimeout(() => { aiCopyBtn.innerText = '复制提问'; }, 2000);
    }
});

aiRetryBtn.addEventListener('click', () => {
    const q = aiQuestion.value.trim();
    if (!q) {
        // Show input area again
        aiInputArea.style.display = 'block';
        aiResultArea.style.display = 'none';
        return;
    }
    startAiInterpret(q);
});

function addStudyLink(container, binaryCode, hexName) {
    let link = container.querySelector('.study-link');
    if (!link) {
        link = document.createElement('a');
        link.className = 'study-link';
        link.target = '_blank';
        container.appendChild(link);
    }
    const hexId = takashima.indexMap ? takashima.indexMap[binaryCode] : null;
    if (hexId) {
        link.href = `study.html?hex=${hexId}`;
        link.textContent = '卦辞';
        link.title = `${hexName || '卦象'}完整解释`;
        link.style.display = '';
    } else {
        link.style.display = 'none';
    }
}

// ── History (localStorage) ──
const HISTORY_KEY = 'hexagram_history';
const HISTORY_MAX = 50;

function getHistory() {
    try {
        return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    } catch { return []; }
}

function saveToHistory(raw, primaryName, variedName) {
    const history = getHistory();
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const d = Solar.fromDate(now);
    const lunar = d.getLunar();
    const bazi = lunar.getEightChar();

    const record = {
        id: Date.now(),
        date: dateStr,
        ganZhiDate: `${bazi.getYear()}年 ${bazi.getMonth()}月 ${bazi.getDay()}日 ${bazi.getTime()}时`,
        raw: raw,
        primaryName: primaryName,
        variedName: variedName,
        dayStem: currentDayStem,
        dayBranch: currentDayBranch,
        monthBranch: currentMonthBranch,
        xunKong: currentXunKong
    };

    history.unshift(record);
    if (history.length > HISTORY_MAX) history.length = HISTORY_MAX;
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    renderHistoryList();
}

function renderHistoryList() {
    const section = document.getElementById('history-section');
    const list = document.getElementById('history-list');
    if (!section || !list) return;

    const history = getHistory();
    if (history.length === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';
    list.innerHTML = '';

    history.forEach(record => {
        const item = document.createElement('div');
        item.className = 'history-item';
        const variedText = record.variedName ? ` → ${record.variedName}` : '';
        item.innerHTML = `
            <span class="history-date">${record.date}</span>
            <span class="history-name">${record.primaryName}${variedText}</span>
            <span class="history-delete" title="删除">&times;</span>
        `;
        item.querySelector('.history-name').addEventListener('click', () => restoreFromHistory(record));
        item.querySelector('.history-date').addEventListener('click', () => restoreFromHistory(record));
        item.querySelector('.history-delete').addEventListener('click', (e) => {
            e.stopPropagation();
            item.classList.add('fade-out');
            setTimeout(() => {
                deleteHistoryItem(record.id);
            }, 300);
        });
        list.appendChild(item);
    });

    // Clear all button
    let clearBtn = section.querySelector('.history-clear-btn');
    if (!clearBtn) {
        clearBtn = document.createElement('button');
        clearBtn.className = 'history-clear-btn';
        clearBtn.textContent = '清空全部';
        clearBtn.addEventListener('click', clearAllHistory);
        section.appendChild(clearBtn);
    }
}

function deleteHistoryItem(id) {
    const history = getHistory().filter(r => r.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    renderHistoryList();
}

function clearAllHistory() {
    localStorage.removeItem(HISTORY_KEY);
    renderHistoryList();
}

function restoreFromHistory(record) {
    // Restore date context
    if (record.dayStem) currentDayStem = record.dayStem;
    if (record.dayBranch) currentDayBranch = record.dayBranch;
    if (record.monthBranch) currentMonthBranch = record.monthBranch;
    if (record.xunKong) currentXunKong = record.xunKong;

    // Update date display to history record time
    if (record.date && record.ganZhiDate) {
        const xkText = record.xunKong || '';
        dateInfo.innerHTML = `${record.date}<br>${record.ganZhiDate}<br><span class="xunkong-info">空亡: ${xkText}</span>`;
    }

    divination.castResult = record.raw;
    castingStep = 6;
    coinContainer.style.display = 'none';
    castingBtn.style.display = 'none';
    resetBtn.style.display = 'inline-block';
    resetBtn.innerText = "重新起卦";
    statusMsg.innerText = `历史记录: ${record.primaryName}`;

    renderResult._skipSave = true;
    renderResult(record.raw);
    renderResult._skipSave = false;
}

