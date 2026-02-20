// Pattern detection for 紫微斗数 格局

function hasStar(palace, starName) {
  if (!palace) return false
  return [...(palace.majorStars || []), ...(palace.minorStars || []), ...(palace.adjectiveStars || [])]
    .some(s => s.name === starName)
}

function getFlankPalaces(palaces, palace) {
  if (!palace || !palaces) return [null, null]
  const prev = palaces.find(p => p.index === (palace.index - 1 + 12) % 12) || null
  const next = palaces.find(p => p.index === (palace.index + 1) % 12) || null
  return [prev, next]
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

const PATTERNS = [
  // ===== 同宫格局 =====
  {
    name: '紫府同宫',
    check: (p) => hasStar(p, '紫微') && hasStar(p, '天府'),
  },
  {
    name: '日月同宫',
    check: (p) => hasStar(p, '太阳') && hasStar(p, '太阴'),
  },
  {
    name: '火贪格',
    check: (p) => hasStar(p, '火星') && hasStar(p, '贪狼'),
  },
  {
    name: '铃贪格',
    check: (p) => hasStar(p, '铃星') && hasStar(p, '贪狼'),
  },
  {
    name: '左右同宫',
    check: (p) => hasStar(p, '左辅') && hasStar(p, '右弼'),
  },
  {
    name: '昌曲同宫',
    check: (p) => hasStar(p, '文昌') && hasStar(p, '文曲'),
  },
  {
    name: '三奇嘉会',
    check: (p) => hasStar(p, '文昌') && hasStar(p, '文曲') && hasStar(p, '禄存'),
  },
  {
    name: '武贪同行',
    check: (p) => hasStar(p, '武曲') && hasStar(p, '贪狼'),
  },
  {
    name: '禄马交驰',
    check: (p, ps) => {
      if (hasStar(p, '禄存') && hasStar(p, '天马')) return true
      const opp = getOppositePalace(ps, p)
      return (hasStar(p, '禄存') && hasStar(opp, '天马')) ||
             (hasStar(p, '天马') && hasStar(opp, '禄存'))
    },
  },
  // ===== 特定地支格局 =====
  {
    name: '极向离明',
    check: (p) => hasStar(p, '紫微') && p.earthlyBranch === '午',
  },
  {
    name: '七杀朝斗',
    check: (p) => hasStar(p, '七杀') && (p.earthlyBranch === '子' || p.earthlyBranch === '午'),
  },
  {
    name: '贪狼入庙',
    check: (p) => hasStar(p, '贪狼') && (p.earthlyBranch === '子' || p.earthlyBranch === '午'),
  },
  {
    name: '杀破狼',
    check: (p) => {
      const cardinal = ['子', '午', '卯', '酉']
      if (!cardinal.includes(p.earthlyBranch)) return false
      return hasStar(p, '七杀') || hasStar(p, '破军') || hasStar(p, '贪狼')
    },
  },
  {
    name: '机月同梁',
    check: (p) => {
      const cardinal = ['子', '午', '卯', '酉']
      if (!cardinal.includes(p.earthlyBranch)) return false
      return hasStar(p, '天机') || hasStar(p, '太阴') ||
             hasStar(p, '天同') || hasStar(p, '天梁')
    },
  },
  // ===== 夹宫格局 =====
  {
    name: '昌曲夹',
    check: (p, ps) => {
      const [prev, next] = getFlankPalaces(ps, p)
      return (hasStar(prev, '文昌') && hasStar(next, '文曲')) ||
             (hasStar(prev, '文曲') && hasStar(next, '文昌'))
    },
  },
  {
    name: '魁钺夹',
    check: (p, ps) => {
      const [prev, next] = getFlankPalaces(ps, p)
      return (hasStar(prev, '天魁') && hasStar(next, '天钺')) ||
             (hasStar(prev, '天钺') && hasStar(next, '天魁'))
    },
  },
  {
    name: '羊陀夹',
    check: (p, ps) => {
      const [prev, next] = getFlankPalaces(ps, p)
      return (hasStar(prev, '擎羊') && hasStar(next, '陀罗')) ||
             (hasStar(prev, '陀罗') && hasStar(next, '擎羊'))
    },
  },
  {
    name: '日月夹',
    check: (p, ps) => {
      const [prev, next] = getFlankPalaces(ps, p)
      return (hasStar(prev, '太阳') && hasStar(next, '太阴')) ||
             (hasStar(prev, '太阴') && hasStar(next, '太阳'))
    },
  },
  {
    name: '辅弼夹',
    check: (p, ps) => {
      const [prev, next] = getFlankPalaces(ps, p)
      return (hasStar(prev, '左辅') && hasStar(next, '右弼')) ||
             (hasStar(prev, '右弼') && hasStar(next, '左辅'))
    },
  },
  // ===== 三合格局 =====
  {
    name: '君臣庆会',
    check: (p, ps) => {
      if (!hasStar(p, '紫微')) return false
      const triangles = getTrianglePalaces(ps, p)
      const all = [p, ...triangles]
      return all.some(x => hasStar(x, '左辅')) && all.some(x => hasStar(x, '右弼'))
    },
  },
  {
    name: '府相朝垣',
    check: (p, ps) => {
      const triangles = getTrianglePalaces(ps, p)
      const opp = getOppositePalace(ps, p)
      const all = [p, ...triangles, opp].filter(Boolean)
      return all.some(x => hasStar(x, '天府')) && all.some(x => hasStar(x, '天相'))
    },
  },
  {
    name: '紫微辅弼',
    check: (p, ps) => {
      if (!hasStar(p, '紫微')) return false
      const [prev, next] = getFlankPalaces(ps, p)
      const hasLeft = hasStar(prev, '左辅') || hasStar(next, '左辅')
      const hasRight = hasStar(prev, '右弼') || hasStar(next, '右弼')
      return hasLeft && hasRight
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
