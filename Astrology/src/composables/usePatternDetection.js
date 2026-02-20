// 紫微斗数格局检测 - 支持本命/大运/流年/流月四层颜色分级

// ============================================================
// 模块级上下文（单线程安全）
// ============================================================
let _ctx = null // { flowStars: {[idx]: [{name}]}, transientMutagens: {[starName]: string[]} }

// ============================================================
// 辅助函数
// ============================================================

function hasStar(palace, starName) {
  if (!palace) return false
  const natalHas = [
    ...(palace.majorStars || []),
    ...(palace.minorStars || []),
    ...(palace.adjectiveStars || []),
  ].some(s => s.name === starName)
  if (natalHas) return true
  if (!_ctx) return false
  return (_ctx.flowStars?.[palace.index] || []).some(s => s.name === starName)
}

function hasMutagen(palace, mutagenValue) {
  if (!palace) return false
  const natalHas = [...(palace.majorStars || []), ...(palace.minorStars || [])]
    .some(s => s.mutagen === mutagenValue)
  if (natalHas) return true
  if (!_ctx) return false
  const tm = _ctx.transientMutagens || {}
  const allNames = [
    ...(palace.majorStars || []).map(s => s.name),
    ...(palace.minorStars || []).map(s => s.name),
    ...(_ctx.flowStars?.[palace.index] || []).map(s => s.name),
  ]
  return allNames.some(name => (tm[name] || []).includes(mutagenValue))
}

function getStarBrightness(palace, starName) {
  if (!palace) return null
  return [...(palace.majorStars || []), ...(palace.minorStars || [])]
    .find(s => s.name === starName)?.brightness || null
}

function isBright(b) { return b === '庙' || b === '旺' }
function isDark(b) { return b === '陷' || b === '不' }

// 煞星仅检查本命，流星不破坏已成的吉格
function hasSha(palace) {
  if (!palace) return false
  const sha = ['擎羊', '陀罗', '火星', '铃星', '地空', '地劫']
  const all = [...(palace.majorStars || []), ...(palace.minorStars || []), ...(palace.adjectiveStars || [])]
  return sha.some(s => all.some(star => star.name === s))
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

function getSanfang(palaces, palace) {
  if (!palace || !palaces) return []
  return [palace, ...getTrianglePalaces(palaces, palace), getOppositePalace(palaces, palace)].filter(Boolean)
}

const LIUHE = {
  '子': '丑', '丑': '子', '寅': '亥', '亥': '寅',
  '卯': '戌', '戌': '卯', '辰': '酉', '酉': '辰',
  '巳': '申', '申': '巳', '午': '未', '未': '午',
}
function getAnhePalace(palaces, palace) {
  const branch = LIUHE[palace?.earthlyBranch]
  return branch ? (palaces?.find(p => p.earthlyBranch === branch) || null) : null
}

// ============================================================
// 格局列表
// ============================================================
const PATTERNS = [
  {
    name: '君臣庆会',
    check(p, ps) {
      if (!hasStar(p, '紫微') && !hasStar(p, '天府') && !hasStar(p, '太阳')) return false

      const sf = getSanfang(ps, p)

      // 紫微为主的君臣庆会，必须要有天府或天相（双星之一即可，依题意紫微天相也可，故至少要有府或相），或者紫相/紫府同宫
      if (hasStar(p, '紫微')) {
        const hasFuXiang = sf.some(x => hasStar(x, '天府') || hasStar(x, '天相'))
        if (!hasFuXiang) return false
      }

      // 检查三组吉星，每组至少要有一颗
      const hasZuoYou = sf.some(x => hasStar(x, '左辅')) || sf.some(x => hasStar(x, '右弼'))
      const hasChangQu = sf.some(x => hasStar(x, '文昌')) || sf.some(x => hasStar(x, '文曲'))
      const hasKuiYue = sf.some(x => hasStar(x, '天魁')) || sf.some(x => hasStar(x, '天钺'))

      if (!hasZuoYou || !hasChangQu || !hasKuiYue) return false

      return true
    },
  },
  {
    name: '紫府同宫',
    check: (p) => hasStar(p, '紫微') && hasStar(p, '天府') && ['寅', '申'].includes(p.earthlyBranch),
  },
  {
    name: '金舆扶驾',
    check(p, ps) {
      if (!hasStar(p, '紫微')) return false
      const [a, b] = getFlankPalaces(ps, p)
      return (hasStar(a, '太阳') && hasStar(b, '太阴')) || (hasStar(a, '太阴') && hasStar(b, '太阳'))
    },
  },
  {
    name: '紫府夹命',
    check(p, ps) {
      if (!hasStar(p, '天机') || !hasStar(p, '太阴')) return false
      if (!['寅', '申'].includes(p.earthlyBranch)) return false
      const [a, b] = getFlankPalaces(ps, p)
      return (hasStar(a, '紫微') && hasStar(b, '天府')) || (hasStar(a, '天府') && hasStar(b, '紫微'))
    },
  },
  {
    name: '极向离明',
    check: (p) => hasStar(p, '紫微') && p.earthlyBranch === '午' && !hasSha(p),
  },
  {
    name: '极居卯酉',
    check: (p) => hasStar(p, '紫微') && hasStar(p, '贪狼') && ['卯', '酉'].includes(p.earthlyBranch),
  },
  {
    name: '机月同梁',
    check(p, ps) {
      const sf = getSanfang(ps, p)
      return sf.some(x => hasStar(x, '天机')) && sf.some(x => hasStar(x, '太阴')) &&
        sf.some(x => hasStar(x, '天同')) && sf.some(x => hasStar(x, '天梁'))
    },
  },
  { name: '善荫朝纲', check: (p) => hasStar(p, '天机') && hasStar(p, '天梁') },
  { name: '机巨同临', check: (p) => hasStar(p, '天机') && hasStar(p, '巨门') },
  { name: '机巨居卯', check: (p) => hasStar(p, '天机') && hasStar(p, '巨门') && p.earthlyBranch === '卯' },
  { name: '日月同宫', check: (p) => hasStar(p, '太阳') && hasStar(p, '太阴') && ['丑', '未'].includes(p.earthlyBranch) },
  { name: '巨日同宫', check: (p) => hasStar(p, '巨门') && hasStar(p, '太阳') && ['寅', '申'].includes(p.earthlyBranch) },
  { name: '日照雷门', check: (p) => hasStar(p, '太阳') && hasStar(p, '天梁') && p.earthlyBranch === '卯' },
  {
    name: '日月并明',
    check(p, ps) {
      const sf = getSanfang(ps, p)
      const sunP = sf.find(x => hasStar(x, '太阳'))
      const moonP = sf.find(x => hasStar(x, '太阴'))
      if (!sunP || !moonP) return false
      return isBright(getStarBrightness(sunP, '太阳')) && isBright(getStarBrightness(moonP, '太阴'))
    },
  },
  {
    name: '日月反背',
    check(p, ps) {
      const sf = getSanfang(ps, p)
      const sunP = sf.find(x => hasStar(x, '太阳'))
      const moonP = sf.find(x => hasStar(x, '太阴'))
      if (!sunP || !moonP) return false
      return isDark(getStarBrightness(sunP, '太阳')) && isDark(getStarBrightness(moonP, '太阴'))
    },
  },
  {
    name: '日月照璧',
    check: (p) => hasStar(p, '太阳') && hasStar(p, '太阴') && ['丑', '未'].includes(p.earthlyBranch) && (p.name || '').includes('田宅'),
  },
  { name: '金灿光辉', check: (p) => hasStar(p, '太阳') && p.earthlyBranch === '午' },
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
  {
    name: '日月夹命',
    check(p, ps) {
      const [a, b] = getFlankPalaces(ps, p)
      return (hasStar(a, '太阳') && hasStar(b, '太阴')) || (hasStar(a, '太阴') && hasStar(b, '太阳'))
    },
  },
  {
    name: '日月夹财',
    check(p, ps) {
      if (!(p.name || '').includes('财帛')) return false
      const [a, b] = getFlankPalaces(ps, p)
      return (hasStar(a, '太阳') && hasStar(b, '太阴')) || (hasStar(a, '太阴') && hasStar(b, '太阳'))
    },
  },
  { name: '月朗天门', check: (p) => hasStar(p, '太阴') && p.earthlyBranch === '亥' },
  { name: '月生沧海', check: (p) => hasStar(p, '天同') && hasStar(p, '太阴') && p.earthlyBranch === '子' },
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
  { name: '武贪同行', check: (p) => hasStar(p, '武曲') && hasStar(p, '贪狼') && ['丑', '未'].includes(p.earthlyBranch) },
  {
    name: '铃昌陀武',
    check(p, ps) {
      const sf = getSanfang(ps, p)
      return sf.some(x => hasStar(x, '武曲')) && sf.some(x => hasStar(x, '文昌')) &&
        sf.some(x => hasStar(x, '铃星')) && sf.some(x => hasStar(x, '陀罗'))
    },
  },
  {
    name: '刑囚夹印',
    check(p, ps) {
      const tongGong = hasStar(p, '廉贞') && hasStar(p, '天相') && (hasStar(p, '天刑') || hasStar(p, '擎羊'))
      let jiaGong = false
      if (hasStar(p, '天相')) {
        const [a, b] = getFlankPalaces(ps, p)
        const aHasQiu = hasStar(a, '廉贞')
        const bHasQiu = hasStar(b, '廉贞')
        const aHasXing = hasStar(a, '天刑') || hasStar(a, '擎羊')
        const bHasXing = hasStar(b, '天刑') || hasStar(b, '擎羊')
        if ((aHasQiu && bHasXing) || (aHasXing && bHasQiu)) {
          jiaGong = true
        }
      }
      return tongGong || jiaGong
    },
  },
  { name: '生不逢时', check: (p) => hasStar(p, '廉贞') && (hasStar(p, '地空') || hasStar(p, '地劫')) },
  { name: '雄宿朝元', check: (p) => hasStar(p, '廉贞') && ['寅', '申'].includes(p.earthlyBranch) && !hasSha(p) },
  {
    name: '府相朝垣',
    check(p, ps) {
      // 必须是命宫，且命宫无主星（正曜），天府天相在三方四正方成格
      if ((p.majorStars || []).length > 0) return false
      const sf = getSanfang(ps, p)
      return sf.some(x => hasStar(x, '天府')) && sf.some(x => hasStar(x, '天相'))
    },
  },
  { name: '火贪格', check: (p) => hasStar(p, '火星') && hasStar(p, '贪狼') },
  { name: '铃贪格', check: (p) => hasStar(p, '铃星') && hasStar(p, '贪狼') },
  { name: '石中隐玉', check: (p) => hasStar(p, '巨门') && ['子', '午'].includes(p.earthlyBranch) },
  { name: '梁马飘荡', check: (p) => hasStar(p, '天梁') && hasStar(p, '天马') },
  {
    name: '阳梁昌禄',
    check(p, ps) {
      const sf = getSanfang(ps, p)
      return sf.some(x => hasStar(x, '太阳')) && sf.some(x => hasStar(x, '天梁')) &&
        sf.some(x => hasStar(x, '文昌')) && sf.some(x => hasStar(x, '禄存'))
    },
  },
  { name: '七杀朝斗', check: (p) => hasStar(p, '七杀') && ['子', '午', '寅', '申'].includes(p.earthlyBranch) },
  { name: '英星入庙', check: (p) => hasStar(p, '破军') && ['子', '午'].includes(p.earthlyBranch) },
  { name: '众水朝东', check: (p) => hasStar(p, '破军') && hasStar(p, '文曲') && ['寅', '卯'].includes(p.earthlyBranch) },
  {
    name: '三奇嘉会',
    check(p, ps) {
      const sf = getSanfang(ps, p)
      return sf.some(x => hasMutagen(x, '禄')) && sf.some(x => hasMutagen(x, '权')) && sf.some(x => hasMutagen(x, '科'))
    },
  },
  {
    name: '禄马交驰',
    check(p, ps) {
      if (hasStar(p, '禄存') && hasStar(p, '天马')) return true
      const opp = getOppositePalace(ps, p)
      return (hasStar(p, '禄存') && hasStar(opp, '天马')) || (hasStar(p, '天马') && hasStar(opp, '禄存'))
    },
  },
  {
    name: '禄合鸳鸯',
    check(p, ps) {
      const opp = getOppositePalace(ps, p)
      return (hasStar(p, '禄存') && hasMutagen(p, '禄')) ||
        (hasStar(p, '禄存') && hasMutagen(opp, '禄')) ||
        (hasMutagen(p, '禄') && hasStar(opp, '禄存'))
    },
  },
  {
    name: '明禄暗禄',
    check(p, ps) {
      const anhe = getAnhePalace(ps, p)
      return (hasStar(p, '禄存') || hasMutagen(p, '禄')) && (hasStar(anhe, '禄存') || hasMutagen(anhe, '禄'))
    },
  },
  { name: '禄马佩印', check: (p) => hasStar(p, '禄存') && hasStar(p, '天马') && hasStar(p, '天相') },
  { name: '两重华盖', check: (p) => hasStar(p, '禄存') && hasMutagen(p, '禄') && (hasStar(p, '地空') || hasStar(p, '地劫')) },
  {
    name: '羊陀夹忌',
    check(p, ps) {
      if (!hasStar(p, '禄存')) return false
      const [a, b] = getFlankPalaces(ps, p)
      const isJia = (hasStar(a, '擎羊') && hasStar(b, '陀罗')) || (hasStar(a, '陀罗') && hasStar(b, '擎羊'))
      if (!isJia) return false
      const opp = getOppositePalace(ps, p)
      return hasMutagen(p, '忌') || hasMutagen(opp, '忌')
    },
  },
  { name: '马头带箭', check: (p) => hasStar(p, '擎羊') && p.earthlyBranch === '午' },
  { name: '左右同宫', check: (p) => hasStar(p, '左辅') && hasStar(p, '右弼') && ['丑', '未'].includes(p.earthlyBranch) },
  {
    name: '左右夹命',
    check(p, ps) {
      const [a, b] = getFlankPalaces(ps, p)
      return (hasStar(a, '左辅') && hasStar(b, '右弼')) || (hasStar(a, '右弼') && hasStar(b, '左辅'))
    },
  },
  {
    name: '辅弼拱主',
    check(p, ps) {
      if (!hasStar(p, '紫微')) return false
      const sf = getSanfang(ps, p)
      return sf.some(x => x !== p && hasStar(x, '左辅')) && sf.some(x => x !== p && hasStar(x, '右弼'))
    },
  },
  {
    name: '魁钺夹命',
    check(p, ps) {
      const [a, b] = getFlankPalaces(ps, p)
      return (hasStar(a, '天魁') && hasStar(b, '天钺')) || (hasStar(a, '天钺') && hasStar(b, '天魁'))
    },
  },
  {
    name: '日出扶桑',
    check: (p) => hasStar(p, '太阳') && p.earthlyBranch === '卯'
  },
  {
    name: '将星得地',
    check: (p) => hasStar(p, '武曲') && ['辰', '戌'].includes(p.earthlyBranch)
  },
  {
    name: '财禄夹马',
    check(p, ps) {
      if (!hasStar(p, '天马')) return false
      const [a, b] = getFlankPalaces(ps, p)
      const isWuHuaJia = (hasStar(a, '武曲') && hasMutagen(b, '禄')) || (hasStar(b, '武曲') && hasMutagen(a, '禄'))
      const isWuLuJia = (hasStar(a, '武曲') && hasStar(b, '禄存')) || (hasStar(b, '武曲') && hasStar(a, '禄存'))
      return isWuHuaJia || isWuLuJia
    }
  },
  {
    name: '廉贞文武',
    check(p, ps) {
      if (!hasStar(p, '廉贞')) return false
      const sf = getSanfang(ps, p)
      const guanP = sf.find(x => (x.name || '').includes('官禄'))
      if (!guanP || !hasStar(guanP, '武曲')) return false
      return sf.some(x => hasStar(x, '文昌') || hasStar(x, '文曲'))
    }
  },
  {
    name: '财荫夹印',
    check(p, ps) {
      if (!hasStar(p, '天相')) return false
      const [a, b] = getFlankPalaces(ps, p)
      return (hasMutagen(a, '禄') && hasStar(b, '天梁')) || (hasMutagen(b, '禄') && hasStar(a, '天梁'))
    }
  },
  {
    name: '寿星入庙',
    check: (p) => hasStar(p, '天梁') && p.earthlyBranch === '午'
  },
  {
    name: '辅拱文星',
    check(p, ps) {
      if (!hasStar(p, '文昌') && !hasStar(p, '文曲')) return false
      const sf = getSanfang(ps, p)
      const [a, b] = getFlankPalaces(ps, p)
      const isJia = (hasStar(a, '左辅') && hasStar(b, '右弼')) || (hasStar(a, '右弼') && hasStar(b, '左辅'))
      const isGong = sf.some(x => x !== p && hasStar(x, '左辅')) && sf.some(x => x !== p && hasStar(x, '右弼'))
      return isJia || isGong
    }
  },
  {
    name: '坐贵向贵', // (Check for 天乙拱命格 requirement)
    check(p, ps) {
      const opp = getOppositePalace(ps, p)
      return (hasStar(p, '天魁') && hasStar(opp, '天钺')) || (hasStar(p, '天钺') && hasStar(opp, '天魁'))
    }
  },
  {
    name: '天乙拱命',
    check(p, ps) {
      // 坐贵向贵优先于天乙拱命（如果不在这里排他也可以在页面显示时处理。但直接利用已有规律，若不是对宫则三方四正有即可）
      const opp = getOppositePalace(ps, p)
      const isZuoGuiXiangGui = (hasStar(p, '天魁') && hasStar(opp, '天钺')) || (hasStar(p, '天钺') && hasStar(opp, '天魁'))
      if (isZuoGuiXiangGui) return false // Prevent double trigger; Let "坐贵向贵格" take this

      const sf = getSanfang(ps, p)
      return sf.some(x => hasStar(x, '天魁')) && sf.some(x => hasStar(x, '天钺'))
    }
  },
  {
    name: '火羊格',
    check(p, ps) {
      const sf = getSanfang(ps, p)
      const hasHuo = sf.some(x => hasStar(x, '火星'))
      const hasYang = sf.some(x => hasStar(x, '擎羊'))
      const hasOtherSha = sf.some(x => hasStar(x, '铃星') || hasStar(x, '陀罗') || hasStar(x, '地空') || hasStar(x, '地劫'))
      return hasHuo && hasYang && !hasOtherSha
    }
  },
  {
    name: '铃陀格',
    check(p, ps) {
      const sf = getSanfang(ps, p)
      const hasLing = sf.some(x => hasStar(x, '铃星'))
      const hasTuo = sf.some(x => hasStar(x, '陀罗'))
      const hasOtherSha = sf.some(x => hasStar(x, '火星') || hasStar(x, '擎羊') || hasStar(x, '地空') || hasStar(x, '地劫'))
      return hasLing && hasTuo && !hasOtherSha
    }
  },
  {
    name: '擎羊入庙',
    check: (p) => hasStar(p, '擎羊') && ['丑', '辰', '未', '戌'].includes(p.earthlyBranch)
  },
  {
    name: '贞杀同宫',
    check: (p) => hasStar(p, '廉贞') && hasStar(p, '七杀') && ['丑', '未'].includes(p.earthlyBranch)
  },
  {
    name: '巨逢四煞',
    check(p, ps) {
      if (!hasStar(p, '巨门')) return false
      const sf = getSanfang(ps, p)
      return sf.some(x => hasStar(x, '擎羊')) && sf.some(x => hasStar(x, '陀罗')) &&
        sf.some(x => hasStar(x, '火星')) && sf.some(x => hasStar(x, '铃星'))
    }
  },
  {
    name: '文星遇夹',
    check(p, ps) {
      if (!hasStar(p, '文昌') && !hasStar(p, '文曲')) return false
      const [a, b] = getFlankPalaces(ps, p)
      const jiaKongJie = (hasStar(a, '地空') && hasStar(b, '地劫')) || (hasStar(a, '地劫') && hasStar(b, '地空'))
      const jiaHuoLing = (hasStar(a, '火星') && hasStar(b, '铃星')) || (hasStar(a, '铃星') && hasStar(b, '火星'))
      const jiaYangTuo = (hasStar(a, '擎羊') && hasStar(b, '陀罗')) || (hasStar(a, '陀罗') && hasStar(b, '擎羊'))
      return jiaKongJie || jiaHuoLing || jiaYangTuo
    }
  },
  {
    name: '火铃夹命',
    check(p, ps) {
      const [a, b] = getFlankPalaces(ps, p)
      const isJia = (hasStar(a, '火星') && hasStar(b, '铃星')) || (hasStar(a, '铃星') && hasStar(b, '火星'))
      return isJia && !hasStar(p, '贪狼') // 若为贪狼则不作此论
    }
  },
  {
    name: '马落空亡',
    check(p, ps) {
      if (!hasStar(p, '天马')) return false
      const sf = getSanfang(ps, p)
      return sf.some(x => hasStar(x, '地空') || hasStar(x, '地劫'))
    }
  },
  {
    name: '两重华盖',
    check: (p) => hasStar(p, '禄存') && hasMutagen(p, '禄') && (hasStar(p, '地空') && hasStar(p, '地劫'))
  },
  {
    name: '禄逢冲破',
    check(p, ps) {
      if (!hasStar(p, '禄存') && !hasMutagen(p, '禄')) return false
      const sf = getSanfang(ps, p)
      return sf.some(x => hasStar(x, '地空')) || sf.some(x => hasStar(x, '地劫'))
    }
  },
  {
    name: '泛水桃花',
    check(p) {
      const tanLangZi = hasStar(p, '贪狼') && p.earthlyBranch === '子'
      const lianTanHai = hasStar(p, '廉贞') && hasStar(p, '贪狼') && p.earthlyBranch === '亥' && hasStar(p, '陀罗')
      return tanLangZi || lianTanHai
    }
  },
  {
    name: '风流綵杖',
    check: (p) => hasStar(p, '贪狼') && p.earthlyBranch === '寅' && hasStar(p, '陀罗')
  },
  {
    name: '贫士格',
    check(p, ps) {
      if (!hasStar(p, '贪狼')) return false
      const sf = getSanfang(ps, p)
      const hasSha = sf.some(x => hasStar(x, '地空') || hasStar(x, '地劫') || hasStar(x, '大耗') || hasMutagen(x, '忌'))
      const hasJiXing = sf.some(x => hasStar(x, '禄存') || hasMutagen(x, '禄') || hasStar(x, '火星') || hasStar(x, '铃星'))
      return hasSha && !hasJiXing
    }
  },
  {
    name: '双忌夹命',
    check(p, ps) {
      const [a, b] = getFlankPalaces(ps, p)
      const isJia = hasMutagen(a, '忌') && hasMutagen(b, '忌')
      return isJia && !hasMutagen(p, '忌')
    }
  },
  {
    name: '双忌夹忌',
    check(p, ps) {
      if (!hasMutagen(p, '忌')) return false
      const [a, b] = getFlankPalaces(ps, p)
      return hasMutagen(a, '忌') && hasMutagen(b, '忌')
    }
  },
]

// ============================================================
// 上下文构建：按指定 scopes 列表提取流星和流化
// ============================================================
const MUTAGEN_LABELS = ['禄', '权', '科', '忌']

function buildCtx(horoscopeData, scopes) {
  const flowStars = {}
  const transientMutagens = {}

  for (const scope of scopes) {
    const scopeData = horoscopeData?.[scope]
    if (!scopeData) continue

    // 流星（完整星名）
    if (Array.isArray(scopeData.stars)) {
      scopeData.stars.forEach((palaceStars, idx) => {
        if (!palaceStars?.length) return
        if (!flowStars[idx]) flowStars[idx] = []
        palaceStars.forEach(s => {
          if (s?.name) flowStars[idx].push({ name: s.name })
        })
      })
    }

    // 流化
    if (Array.isArray(scopeData.mutagen)) {
      scopeData.mutagen.forEach((starName, i) => {
        if (!starName || i >= 4) return
        if (!transientMutagens[starName]) transientMutagens[starName] = []
        const label = MUTAGEN_LABELS[i]
        if (!transientMutagens[starName].includes(label)) {
          transientMutagens[starName].push(label)
        }
      })
    }
  }

  return { flowStars, transientMutagens }
}

// ============================================================
// 主检测函数：四层递进，不重复
// ============================================================
export function usePatternDetection() {
  /**
   * @param {Object} palace - 当前选中宫位
   * @param {Array}  allPalaces - 所有12宫
   * @param {Object} horoscopeData - 已选大限/流年/流月的流星数据
   * @param {Object} scopeFlags - { decadal: bool, yearly: bool, monthly: bool }
   * @returns {Array} [{ name, scope: 'natal'|'decadal'|'yearly'|'monthly' }]
   */
  function detectPatterns(palace, allPalaces, horoscopeData, scopeFlags) {
    if (!palace || !allPalaces?.length) return []

    const found = new Map() // name → scope

    function runPass(scope, ctx) {
      _ctx = ctx
      for (const pattern of PATTERNS) {
        if (found.has(pattern.name)) continue
        try {
          if (pattern.check(palace, allPalaces)) {
            found.set(pattern.name, scope)
          }
        } catch { /* ignore */ }
      }
      _ctx = null
    }

    // 第1轮：本命
    runPass('natal', null)

    // 第2轮：+大限
    if (scopeFlags?.decadal && horoscopeData?.decadal) {
      runPass('decadal', buildCtx(horoscopeData, ['decadal']))
    }

    // 第3轮：+大限+流年（累积，格局可能需要两者共同促成）
    if (scopeFlags?.yearly && horoscopeData?.yearly) {
      const scopes = ['decadal', 'yearly'].filter(s => horoscopeData[s])
      runPass('yearly', buildCtx(horoscopeData, scopes))
    }

    // 第4轮：+大限+流年+流月
    if (scopeFlags?.monthly && horoscopeData?.monthly) {
      const scopes = ['decadal', 'yearly', 'monthly'].filter(s => horoscopeData[s])
      runPass('monthly', buildCtx(horoscopeData, scopes))
    }

    return Array.from(found.entries()).map(([name, scope]) => ({ name, scope }))
  }

  return { detectPatterns }
}
