// 紫微斗数格局检测 - 对应典籍《紫微斗数格局详解》全部格局

function hasStar(palace, starName) {
  if (!palace) return false
  return [...(palace.majorStars || []), ...(palace.minorStars || []), ...(palace.adjectiveStars || [])]
    .some(s => s.name === starName)
}

function hasMutagen(palace, mutagenValue) {
  if (!palace) return false
  return [...(palace.majorStars || []), ...(palace.minorStars || [])]
    .some(s => s.mutagen === mutagenValue)
}

function getStarBrightness(palace, starName) {
  if (!palace) return null
  const star = [...(palace.majorStars || []), ...(palace.minorStars || [])]
    .find(s => s.name === starName)
  return star?.brightness || null
}

function isBright(b) { return b === '庙' || b === '旺' }
function isDark(b)   { return b === '陷' || b === '不' }

// 是否有煞星（擎羊陀罗火铃空劫）
function hasSha(palace) {
  if (!palace) return false
  return ['擎羊', '陀罗', '火星', '铃星', '地空', '地劫'].some(s => hasStar(palace, s))
}

function getFlankPalaces(palaces, palace) {
  if (!palace || !palaces) return [null, null]
  return [
    palaces.find(p => p.index === (palace.index - 1 + 12) % 12) || null,
    palaces.find(p => p.index === (palace.index + 1) % 12) || null,
  ]
}

function getTrianglePalaces(palaces, palace) {
  if (!palace || !palaces) return []
  return [
    palaces.find(p => p.index === (palace.index + 4) % 12),
    palaces.find(p => p.index === (palace.index + 8) % 12),
  ].filter(Boolean)
}

function getOppositePalace(palaces, palace) {
  if (!palace || !palaces) return null
  return palaces.find(p => p.index === (palace.index + 6) % 12) || null
}

// 三方四正（本宫 + 三合两宫 + 对宫）
function getSanfang(palaces, palace) {
  if (!palace || !palaces) return []
  const tri = getTrianglePalaces(palaces, palace)
  const opp = getOppositePalace(palaces, palace)
  return [palace, ...tri, opp].filter(Boolean)
}

// 六合宫（暗合）
const LIUHE = {
  '子': '丑', '丑': '子', '寅': '亥', '亥': '寅',
  '卯': '戌', '戌': '卯', '辰': '酉', '酉': '辰',
  '巳': '申', '申': '巳', '午': '未', '未': '午',
}
function getAnhePalace(palaces, palace) {
  if (!palace) return null
  const branch = LIUHE[palace.earthlyBranch]
  return branch ? (palaces.find(p => p.earthlyBranch === branch) || null) : null
}

// ============================================================
// 格局列表（按典籍顺序）
// ============================================================
const PATTERNS = [

  // ① 君臣庆会
  // 紫微与破军同宫，三方有辅弼；或紫微与天相同宫，三方有昌曲；或天府坐命得辅弼昌曲
  {
    name: '君臣庆会',
    check(p, ps) {
      const sf = getSanfang(ps, p)
      if (hasStar(p, '紫微') && hasStar(p, '破军')) {
        return sf.some(x => hasStar(x, '左辅')) || sf.some(x => hasStar(x, '右弼'))
      }
      if (hasStar(p, '紫微') && hasStar(p, '天相')) {
        return sf.some(x => hasStar(x, '文昌')) || sf.some(x => hasStar(x, '文曲'))
      }
      if (hasStar(p, '天府')) {
        return (sf.some(x => hasStar(x, '左辅')) || sf.some(x => hasStar(x, '右弼'))) &&
               (sf.some(x => hasStar(x, '文昌')) || sf.some(x => hasStar(x, '文曲')))
      }
      return false
    },
  },

  // ② 紫府同宫
  {
    name: '紫府同宫',
    check: (p) => hasStar(p, '紫微') && hasStar(p, '天府') && ['寅', '申'].includes(p.earthlyBranch),
  },

  // ③ 金舆扶驾
  // 紫微守命，前后宫日月夹
  {
    name: '金舆扶驾',
    check(p, ps) {
      if (!hasStar(p, '紫微')) return false
      const [a, b] = getFlankPalaces(ps, p)
      return (hasStar(a, '太阳') && hasStar(b, '太阴')) ||
             (hasStar(a, '太阴') && hasStar(b, '太阳'))
    },
  },

  // ④ 紫府夹命
  // 天机太阴同宫于寅/申，紫微天府夹命
  {
    name: '紫府夹命',
    check(p, ps) {
      if (!hasStar(p, '天机') || !hasStar(p, '太阴')) return false
      if (!['寅', '申'].includes(p.earthlyBranch)) return false
      const [a, b] = getFlankPalaces(ps, p)
      return (hasStar(a, '紫微') && hasStar(b, '天府')) ||
             (hasStar(a, '天府') && hasStar(b, '紫微'))
    },
  },

  // ⑤ 极向离明
  // 紫微独坐午宫，不见煞
  {
    name: '极向离明',
    check: (p) => hasStar(p, '紫微') && p.earthlyBranch === '午' && !hasSha(p),
  },

  // ⑥ 极居卯酉
  // 紫微贪狼同宫于卯/酉
  {
    name: '极居卯酉',
    check: (p) => hasStar(p, '紫微') && hasStar(p, '贪狼') && ['卯', '酉'].includes(p.earthlyBranch),
  },

  // ⑦ 机月同梁
  // 天机太阴天同天梁四星俱在三方四正
  {
    name: '机月同梁',
    check(p, ps) {
      const sf = getSanfang(ps, p)
      return sf.some(x => hasStar(x, '天机')) &&
             sf.some(x => hasStar(x, '太阴')) &&
             sf.some(x => hasStar(x, '天同')) &&
             sf.some(x => hasStar(x, '天梁'))
    },
  },

  // ⑧ 善荫朝纲
  {
    name: '善荫朝纲',
    check: (p) => hasStar(p, '天机') && hasStar(p, '天梁'),
  },

  // ⑨ 机巨同临
  {
    name: '机巨同临',
    check: (p) => hasStar(p, '天机') && hasStar(p, '巨门'),
  },

  // ⑩ 机巨居卯
  {
    name: '机巨居卯',
    check: (p) => hasStar(p, '天机') && hasStar(p, '巨门') && p.earthlyBranch === '卯',
  },

  // ⑪ 日月同宫（丑/未）
  {
    name: '日月同宫',
    check: (p) => hasStar(p, '太阳') && hasStar(p, '太阴') && ['丑', '未'].includes(p.earthlyBranch),
  },

  // ⑫ 巨日同宫（寅/申）
  {
    name: '巨日同宫',
    check: (p) => hasStar(p, '巨门') && hasStar(p, '太阳') && ['寅', '申'].includes(p.earthlyBranch),
  },

  // ⑬ 日照雷门（太阳天梁同宫于卯）
  {
    name: '日照雷门',
    check: (p) => hasStar(p, '太阳') && hasStar(p, '天梁') && p.earthlyBranch === '卯',
  },

  // ⑭ 日月并明
  // 太阳太阴在三方四正皆庙旺
  {
    name: '日月并明',
    check(p, ps) {
      const sf = getSanfang(ps, p)
      const sunP = sf.find(x => hasStar(x, '太阳'))
      const moonP = sf.find(x => hasStar(x, '太阴'))
      if (!sunP || !moonP) return false
      return isBright(getStarBrightness(sunP, '太阳')) &&
             isBright(getStarBrightness(moonP, '太阴'))
    },
  },

  // ⑮ 日月反背
  // 太阳太阴在三方四正皆落陷
  {
    name: '日月反背',
    check(p, ps) {
      const sf = getSanfang(ps, p)
      const sunP = sf.find(x => hasStar(x, '太阳'))
      const moonP = sf.find(x => hasStar(x, '太阴'))
      if (!sunP || !moonP) return false
      return isDark(getStarBrightness(sunP, '太阳')) &&
             isDark(getStarBrightness(moonP, '太阴'))
    },
  },

  // ⑯ 日月照璧
  // 太阳太阴同守田宅宫（丑/未）
  {
    name: '日月照璧',
    check: (p) =>
      hasStar(p, '太阳') && hasStar(p, '太阴') &&
      ['丑', '未'].includes(p.earthlyBranch) &&
      (p.name || '').includes('田宅'),
  },

  // ⑰ 金灿光辉（太阳独守午宫）
  {
    name: '金灿光辉',
    check: (p) => hasStar(p, '太阳') && p.earthlyBranch === '午',
  },

  // ⑱ 日月藏辉
  // 日月反背，三方四正再逢巨门
  {
    name: '日月藏辉',
    check(p, ps) {
      const sf = getSanfang(ps, p)
      const sunP = sf.find(x => hasStar(x, '太阳'))
      const moonP = sf.find(x => hasStar(x, '太阴'))
      if (!sunP || !moonP) return false
      if (!isDark(getStarBrightness(sunP, '太阳')) || !isDark(getStarBrightness(moonP, '太阴'))) return false
      return sf.some(x => hasStar(x, '巨门'))
    },
  },

  // ⑳ 日月夹命
  {
    name: '日月夹命',
    check(p, ps) {
      const [a, b] = getFlankPalaces(ps, p)
      return (hasStar(a, '太阳') && hasStar(b, '太阴')) ||
             (hasStar(a, '太阴') && hasStar(b, '太阳'))
    },
  },

  // ㉑ 日月夹财
  // 太阳太阴夹财帛宫
  {
    name: '日月夹财',
    check(p, ps) {
      if (!(p.name || '').includes('财帛')) return false
      const [a, b] = getFlankPalaces(ps, p)
      return (hasStar(a, '太阳') && hasStar(b, '太阴')) ||
             (hasStar(a, '太阴') && hasStar(b, '太阳'))
    },
  },

  // ㉒ 月朗天门（太阴于亥）
  {
    name: '月朗天门',
    check: (p) => hasStar(p, '太阴') && p.earthlyBranch === '亥',
  },

  // ㉓ 月生沧海（天同太阴于子）
  {
    name: '月生沧海',
    check: (p) => hasStar(p, '天同') && hasStar(p, '太阴') && p.earthlyBranch === '子',
  },

  // ㉔ 明珠出海
  // 命宫在未（借星），迁移宫有天同巨门，太阳庙旺于卯，太阴庙旺于亥
  {
    name: '明珠出海',
    check(p, ps) {
      if (p.earthlyBranch !== '未') return false
      const opp = getOppositePalace(ps, p)
      if (!opp || !hasStar(opp, '天同') || !hasStar(opp, '巨门')) return false
      const maoP = ps.find(x => x.earthlyBranch === '卯')
      const haiP = ps.find(x => x.earthlyBranch === '亥')
      return maoP && isBright(getStarBrightness(maoP, '太阳')) &&
             haiP && isBright(getStarBrightness(haiP, '太阴'))
    },
  },

  // ㉕ 武贪同行（丑/未）
  {
    name: '武贪同行',
    check: (p) => hasStar(p, '武曲') && hasStar(p, '贪狼') && ['丑', '未'].includes(p.earthlyBranch),
  },

  // ㉖ 铃昌陀武（凶格）
  // 武曲、文昌、铃星、陀罗四星在三方四正
  {
    name: '铃昌陀武',
    check(p, ps) {
      const sf = getSanfang(ps, p)
      return sf.some(x => hasStar(x, '武曲')) &&
             sf.some(x => hasStar(x, '文昌')) &&
             sf.some(x => hasStar(x, '铃星')) &&
             sf.some(x => hasStar(x, '陀罗'))
    },
  },

  // ㉗ 刑囚夹印
  // 廉贞、天相在三方四正，天刑/擎羊同会
  {
    name: '刑囚夹印',
    check(p, ps) {
      const sf = getSanfang(ps, p)
      return sf.some(x => hasStar(x, '廉贞')) &&
             sf.some(x => hasStar(x, '天相')) &&
             (sf.some(x => hasStar(x, '天刑')) || sf.some(x => hasStar(x, '擎羊')))
    },
  },

  // ㉘ 生不逢时（廉贞+地空/地劫同宫）
  {
    name: '生不逢时',
    check: (p) => hasStar(p, '廉贞') && (hasStar(p, '地空') || hasStar(p, '地劫')),
  },

  // ㉙ 雄宿朝元（廉贞独坐寅/申，不见煞）
  {
    name: '雄宿朝元',
    check: (p) => hasStar(p, '廉贞') && ['寅', '申'].includes(p.earthlyBranch) && !hasSha(p),
  },

  // ㉚ 府相朝垣
  // 天府、天相在三方四正相照
  {
    name: '府相朝垣',
    check(p, ps) {
      const sf = getSanfang(ps, p)
      return sf.some(x => hasStar(x, '天府')) && sf.some(x => hasStar(x, '天相'))
    },
  },

  // ㉛ 火贪格
  {
    name: '火贪格',
    check: (p) => hasStar(p, '火星') && hasStar(p, '贪狼'),
  },

  // ㉛ 铃贪格
  {
    name: '铃贪格',
    check: (p) => hasStar(p, '铃星') && hasStar(p, '贪狼'),
  },

  // ㉜ 石中隐玉（巨门于子/午）
  {
    name: '石中隐玉',
    check: (p) => hasStar(p, '巨门') && ['子', '午'].includes(p.earthlyBranch),
  },

  // ㉝ 梁马飘荡（天梁+天马同宫）
  {
    name: '梁马飘荡',
    check: (p) => hasStar(p, '天梁') && hasStar(p, '天马'),
  },

  // ㉞ 阳梁昌禄
  // 太阳、天梁、文昌、禄存俱在三方四正
  {
    name: '阳梁昌禄',
    check(p, ps) {
      const sf = getSanfang(ps, p)
      return sf.some(x => hasStar(x, '太阳')) &&
             sf.some(x => hasStar(x, '天梁')) &&
             sf.some(x => hasStar(x, '文昌')) &&
             sf.some(x => hasStar(x, '禄存'))
    },
  },

  // ㉟ 杀破狼
  // 命宫有七杀/破军/贪狼其中之一即成格
  {
    name: '杀破狼',
    check: (p) => hasStar(p, '七杀') || hasStar(p, '破军') || hasStar(p, '贪狼'),
  },

  // ㊱ 七杀朝斗（七杀于子/午/寅/申）
  {
    name: '七杀朝斗',
    check: (p) => hasStar(p, '七杀') && ['子', '午', '寅', '申'].includes(p.earthlyBranch),
  },

  // ㊳ 英星入庙（破军于子/午）
  {
    name: '英星入庙',
    check: (p) => hasStar(p, '破军') && ['子', '午'].includes(p.earthlyBranch),
  },

  // ㊴ 众水朝东（破军+文曲于寅/卯）
  {
    name: '众水朝东',
    check: (p) => hasStar(p, '破军') && hasStar(p, '文曲') && ['寅', '卯'].includes(p.earthlyBranch),
  },

  // ㊵ 三奇加会
  // 化禄、化权、化科俱在三方四正
  {
    name: '三奇加会',
    check(p, ps) {
      const sf = getSanfang(ps, p)
      return sf.some(x => hasMutagen(x, '禄')) &&
             sf.some(x => hasMutagen(x, '权')) &&
             sf.some(x => hasMutagen(x, '科'))
    },
  },

  // ㊶ 禄马交驰
  {
    name: '禄马交驰',
    check(p, ps) {
      if (hasStar(p, '禄存') && hasStar(p, '天马')) return true
      const opp = getOppositePalace(ps, p)
      return (hasStar(p, '禄存') && hasStar(opp, '天马')) ||
             (hasStar(p, '天马') && hasStar(opp, '禄存'))
    },
  },

  // ㊷ 禄合鸳鸯（双禄交流：化禄+禄存同宫或对宫）
  {
    name: '禄合鸳鸯',
    check(p, ps) {
      const opp = getOppositePalace(ps, p)
      const here = hasStar(p, '禄存')
      const hereC = hasMutagen(p, '禄')
      const thereLu = hasStar(opp, '禄存')
      const thereC = hasMutagen(opp, '禄')
      return (here && hereC) || (here && thereC) || (hereC && thereLu)
    },
  },

  // ㊸ 明禄暗禄（化禄/禄存坐命，暗合宫有另一禄）
  {
    name: '明禄暗禄',
    check(p, ps) {
      const anhe = getAnhePalace(ps, p)
      const here = hasStar(p, '禄存') || hasMutagen(p, '禄')
      const there = hasStar(anhe, '禄存') || hasMutagen(anhe, '禄')
      return here && there
    },
  },

  // ㊹ 禄马佩印（禄存+天马+天相同宫）
  {
    name: '禄马佩印',
    check: (p) => hasStar(p, '禄存') && hasStar(p, '天马') && hasStar(p, '天相'),
  },

  // ㊺ 两重华盖（双禄同宫遇空劫）
  {
    name: '两重华盖',
    check: (p) =>
      hasStar(p, '禄存') && hasMutagen(p, '禄') &&
      (hasStar(p, '地空') || hasStar(p, '地劫')),
  },

  // ㊼ 羊陀夹命
  // 禄存坐命，擎羊陀罗夹此宫
  {
    name: '羊陀夹命',
    check(p, ps) {
      if (!hasStar(p, '禄存')) return false
      const [a, b] = getFlankPalaces(ps, p)
      return (hasStar(a, '擎羊') && hasStar(b, '陀罗')) ||
             (hasStar(a, '陀罗') && hasStar(b, '擎羊'))
    },
  },

  // ㊽ 马头带箭（擎羊同坐午宫）
  {
    name: '马头带箭',
    check: (p) => hasStar(p, '擎羊') && p.earthlyBranch === '午',
  },

  // ㊾ 左右同宫（丑/未）
  {
    name: '左右同宫',
    check: (p) => hasStar(p, '左辅') && hasStar(p, '右弼') && ['丑', '未'].includes(p.earthlyBranch),
  },

  // ㊿ 左右夹命
  {
    name: '左右夹命',
    check(p, ps) {
      const [a, b] = getFlankPalaces(ps, p)
      return (hasStar(a, '左辅') && hasStar(b, '右弼')) ||
             (hasStar(a, '右弼') && hasStar(b, '左辅'))
    },
  },

  // ㊿+1 辅弼拱主（紫微坐命，左右弼在三方四正拱照）
  {
    name: '辅弼拱主',
    check(p, ps) {
      if (!hasStar(p, '紫微')) return false
      const sf = getSanfang(ps, p)
      return sf.some(x => x !== p && hasStar(x, '左辅')) &&
             sf.some(x => x !== p && hasStar(x, '右弼'))
    },
  },

  // 魁钺夹命
  {
    name: '魁钺夹命',
    check(p, ps) {
      const [a, b] = getFlankPalaces(ps, p)
      return (hasStar(a, '天魁') && hasStar(b, '天钺')) ||
             (hasStar(a, '天钺') && hasStar(b, '天魁'))
    },
  },

  // 坐贵向贵（天魁/天钺一在本宫一在对宫）
  {
    name: '坐贵向贵',
    check(p, ps) {
      const opp = getOppositePalace(ps, p)
      return (hasStar(p, '天魁') && hasStar(opp, '天钺')) ||
             (hasStar(p, '天钺') && hasStar(opp, '天魁'))
    },
  },

  // 劫空夹命
  {
    name: '劫空夹命',
    check(p, ps) {
      const [a, b] = getFlankPalaces(ps, p)
      return (hasStar(a, '地劫') && hasStar(b, '地空')) ||
             (hasStar(a, '地空') && hasStar(b, '地劫'))
    },
  },

  // 禄逢两杀（禄存/化禄遇地空+地劫）
  {
    name: '禄逢两杀',
    check: (p) =>
      (hasStar(p, '禄存') || hasMutagen(p, '禄')) &&
      hasStar(p, '地空') && hasStar(p, '地劫'),
  },

  // 文贵文华（文昌文曲同宫于丑/未）
  {
    name: '文贵文华',
    check: (p) => hasStar(p, '文昌') && hasStar(p, '文曲') && ['丑', '未'].includes(p.earthlyBranch),
  },

  // 文星朝命（文昌/文曲坐命，三方有化科）
  {
    name: '文星朝命',
    check(p, ps) {
      if (!hasStar(p, '文昌') && !hasStar(p, '文曲')) return false
      const sf = getSanfang(ps, p)
      return sf.some(x => hasMutagen(x, '科'))
    },
  },

  // 昌曲夹命
  {
    name: '昌曲夹命',
    check(p, ps) {
      const [a, b] = getFlankPalaces(ps, p)
      return (hasStar(a, '文昌') && hasStar(b, '文曲')) ||
             (hasStar(a, '文曲') && hasStar(b, '文昌'))
    },
  },

  // 文星暗拱（文昌文曲在暗合宫拱照）
  {
    name: '文星暗拱',
    check(p, ps) {
      const anhe = getAnhePalace(ps, p)
      return hasStar(anhe, '文昌') || hasStar(anhe, '文曲')
    },
  },

  // 权禄生逢（化权+化禄在三方四正相会）
  {
    name: '权禄生逢',
    check(p, ps) {
      const sf = getSanfang(ps, p)
      return sf.some(x => hasMutagen(x, '禄')) && sf.some(x => hasMutagen(x, '权'))
    },
  },

  // 科明暗禄（化科坐命，三方四正或暗合宫有禄存）
  {
    name: '科明暗禄',
    check(p, ps) {
      if (!hasMutagen(p, '科')) return false
      const sf = getSanfang(ps, p)
      const anhe = getAnhePalace(ps, p)
      return sf.some(x => hasStar(x, '禄存')) || hasStar(anhe, '禄存')
    },
  },

  // 科权禄夹（两侧邻宫有四化吉星）
  {
    name: '科权禄夹',
    check(p, ps) {
      const [a, b] = getFlankPalaces(ps, p)
      const aOk = hasMutagen(a, '禄') || hasMutagen(a, '权') || hasMutagen(a, '科')
      const bOk = hasMutagen(b, '禄') || hasMutagen(b, '权') || hasMutagen(b, '科')
      return aOk && bOk
    },
  },

  // 甲第登庸（化科坐命，对宫化权，三方有昌曲）
  {
    name: '甲第登庸',
    check(p, ps) {
      if (!hasMutagen(p, '科')) return false
      const opp = getOppositePalace(ps, p)
      if (!hasMutagen(opp, '权')) return false
      const sf = getSanfang(ps, p)
      return sf.some(x => hasStar(x, '文昌')) || sf.some(x => hasStar(x, '文曲'))
    },
  },
]

export function usePatternDetection() {
  function detectPatterns(palace, allPalaces) {
    if (!palace || !allPalaces?.length) return []
    return PATTERNS.filter(pattern => {
      try {
        return pattern.check(palace, allPalaces)
      } catch {
        return false
      }
    }).map(pattern => pattern.name)
  }

  return { detectPatterns }
}
