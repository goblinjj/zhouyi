import { Solar } from 'lunar-javascript';
import { tintGanZhi } from '../data/constants.js';

// 旬空日历：按公历月铺格，每格填日干支与所属旬的旬空。
// 旬每十日一换（甲日为旬首），换旬即换旬空；旬空二支值日之时即出空填实。
//
// 所有日期一律用当日 12:00 构造 Lunar，绕开子时日界——日历格本身就是民用日，
// 与 main.js#initDate 的 dayShift 是两码事，那里的进位另行体现在传入的 anchorGanZhi 上。

const WEEK_CN = ['日', '一', '二', '三', '四', '五', '六'];

let modal = null;
let titleEl = null;
let gridEl = null;
let todayBtn = null;

// 面板当前所看的年月，以及"当前日"的日干支（由调用方按六爻日界口径给出）
let viewYear = 0;
let viewMonth = 0;      // 1-12
let anchorYear = 0;
let anchorMonth = 0;
let anchorDay = 0;

function dayInfo(year, month, day) {
    const lunar = Solar.fromYmdHms(year, month, day, 12, 0, 0).getLunar();
    return {
        ganZhi: lunar.getDayInGanZhi(),
        xunKong: lunar.getDayXunKong()
    };
}

function renderCalendar() {
    if (!titleEl || !gridEl) return;

    titleEl.textContent = `${viewYear} 年 ${viewMonth} 月`;
    if (todayBtn) {
        todayBtn.style.visibility =
            (viewYear === anchorYear && viewMonth === anchorMonth) ? 'hidden' : 'visible';
    }

    let html = WEEK_CN.map(w => `<span class="xk-weekday">${w}</span>`).join('');

    const first = new Date(viewYear, viewMonth - 1, 1);
    const leading = first.getDay();
    const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();

    for (let i = 0; i < leading; i++) html += '<span class="xk-cell xk-blank"></span>';

    // 旬块交替底色：以该日所属旬的旬首距年初的序数定奇偶，跨月翻页仍能接上
    for (let day = 1; day <= daysInMonth; day++) {
        const { ganZhi, xunKong } = dayInfo(viewYear, viewMonth, day);
        const stem = ganZhi.charAt(0);
        const isXunHead = stem === '甲';

        // 同一旬内旬空相同，直接用旬空首支定底色，无需回溯旬首日期。
        // 六旬的旬空首支依次为 戌申午辰寅子，在此串里下标 5→0 递减，奇偶天然交替
        const bandIndex = '子寅辰午申戌'.indexOf(xunKong.charAt(0));
        const band = bandIndex % 2 === 0 ? 'xk-band-a' : 'xk-band-b';

        const isAnchor = viewYear === anchorYear && viewMonth === anchorMonth && day === anchorDay;

        html += `<span class="xk-cell ${band}${isXunHead ? ' xk-xun-head' : ''}${isAnchor ? ' xk-anchor' : ''}">` +
            `<em class="xk-day">${day}</em>` +
            `<span class="xk-gz">${tintGanZhi(ganZhi)}</span>` +
            (isXunHead ? `<span class="xk-kong"><i class="xk-kong-label">空</i>${tintGanZhi(xunKong)}</span>` : '') +
            '</span>';
    }

    gridEl.innerHTML = html;
}

function shiftMonth(delta) {
    const d = new Date(viewYear, viewMonth - 1 + delta, 1);
    viewYear = d.getFullYear();
    viewMonth = d.getMonth() + 1;
    renderCalendar();
}

function ensureModal() {
    if (modal) return;
    modal = document.getElementById('xunkong-modal');
    if (!modal) return;

    titleEl = modal.querySelector('#xk-title');
    gridEl = modal.querySelector('#xk-grid');
    todayBtn = modal.querySelector('#xk-today');

    modal.querySelector('#xk-prev').addEventListener('click', () => shiftMonth(-1));
    modal.querySelector('#xk-next').addEventListener('click', () => shiftMonth(1));
    todayBtn.addEventListener('click', () => {
        viewYear = anchorYear;
        viewMonth = anchorMonth;
        renderCalendar();
    });

    modal.querySelector('.close-btn').addEventListener('click', closeXunKongCalendar);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeXunKongCalendar();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') closeXunKongCalendar();
    });
}

export function closeXunKongCalendar() {
    if (modal) modal.style.display = 'none';
}

// dayDate 是六爻口径下"当前日"的公历日期（YYYY-MM-DD，已含真太阳时与晚子进位），
// 按精确日期高亮而非按干支全月比对——历史回看时干支可能落在别的月份
export function openXunKongCalendar(dayDate = '') {
    ensureModal();
    if (!modal) return;

    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dayDate);
    if (m) {
        anchorYear = Number(m[1]);
        anchorMonth = Number(m[2]);
        anchorDay = Number(m[3]);
    } else {
        const now = new Date();
        anchorYear = now.getFullYear();
        anchorMonth = now.getMonth() + 1;
        anchorDay = now.getDate();
    }

    viewYear = anchorYear;
    viewMonth = anchorMonth;
    renderCalendar();
    modal.style.display = 'block';
}
