import {
  RING_PALACES, STEMS_ORDER, TIAN_GAN, DI_ZHI, JIA_ZI_TABLE,
  XUN_SHOU_MAP, STAR_POSITIONS, STAR_RING, GATE_POSITIONS, GATE_RING,
  GOD_RING, PALACE_NAMES, PALACE_ELEMENTS
} from './constants'
import { getGanZhi, determineJu } from './jieqi'

/**
 * Step 2: 排地盘 — place 三奇六仪 into 9 palaces
 * 阳遁: 戊 starts at juNum, fills ascending (1→2→3→...→9→1)
 * 阴遁: 戊 starts at juNum, fills descending (9→8→7→...→1→9)
 */
function buildEarthPlate(juNum, isYangDun) {
  const plate = {}
  for (let i = 0; i < 9; i++) {
    let palace
    if (isYangDun) {
      // ascending: juNum, juNum+1, ..., wrapping 1-9
      palace = ((juNum - 1 + i) % 9) + 1
    } else {
      // descending: juNum, juNum-1, ..., wrapping 9-1
      palace = ((juNum - 1 - i + 9) % 9) + 1
    }
    plate[palace] = STEMS_ORDER[i]
  }
  return plate
}

/**
 * Step 3: Find 值符 (duty star) and 值使 (duty gate)
 * From the hour GZ, find which 甲X旬 it belongs to, get the 六仪,
 * then find that 六仪 on the earth plate.
 */
function findDutyStarGate(hourGZ, earthPlate) {
  // Find the 旬首 for this hour
  const gzIndex = JIA_ZI_TABLE.indexOf(hourGZ)
  if (gzIndex === -1) {
    throw new Error(`无效时柱: ${hourGZ}`)
  }
  const xunStartIndex = gzIndex - (gzIndex % 10)
  const xunShouGZ = JIA_ZI_TABLE[xunStartIndex]
  const xunYi = XUN_SHOU_MAP[xunShouGZ] // the 六仪 that 甲 hides under

  // Find which palace has this 六仪 on the earth plate
  let dutyPalace = null
  for (let p = 1; p <= 9; p++) {
    if (earthPlate[p] === xunYi) {
      dutyPalace = p
      break
    }
  }

  // 寄坤二宫: if palace 5, use 2
  const effectivePalace = dutyPalace === 5 ? 2 : dutyPalace

  const dutyStar = STAR_POSITIONS[effectivePalace]
  const dutyGate = GATE_POSITIONS[effectivePalace]

  return {
    xunShouGZ,
    xunYi,
    xunStartIndex,
    dutyPalace,
    effectivePalace,
    dutyStar,
    dutyGate,
  }
}

/**
 * Step 4: 排天盘 — Stars rotate ("值符随时干")
 * The duty star moves to the palace where the hour stem sits on the earth plate.
 * All 8 ring stars rotate by the same offset. Each star carries its home earth stem.
 */
function buildHeavenPlate(earthPlate, dutyInfo, hourStem, isYangDun) {
  const { dutyStar, effectivePalace } = dutyInfo

  // Find the hour stem on the earth plate
  // If hour stem is 甲, use the 旬首六仪 instead
  const lookupStem = hourStem === '甲' ? dutyInfo.xunYi : hourStem
  let targetPalace = null
  for (let p = 1; p <= 9; p++) {
    if (earthPlate[p] === lookupStem) {
      targetPalace = p
      break
    }
  }
  // 寄坤二宫
  if (targetPalace === 5) targetPalace = 2

  // Find duty star's position in STAR_RING
  const dutyRingIdx = STAR_RING.indexOf(dutyStar)
  // Find duty star's home position in RING_PALACES
  const homeRingIdx = RING_PALACES.indexOf(effectivePalace)
  // Find target position in RING_PALACES
  const targetRingIdx = RING_PALACES.indexOf(targetPalace)

  // Rotation offset: how many steps on the ring from home to target
  const offset = (targetRingIdx - homeRingIdx + 8) % 8

  // Place stars and heaven stems
  const stars = {}    // palace -> star name
  const heavenStems = {} // palace -> heaven stem

  for (let i = 0; i < 8; i++) {
    const starIdx = (dutyRingIdx + i) % 8
    const star = STAR_RING[starIdx]

    // This star's home palace (on RING_PALACES)
    const starHomeRingIdx = STAR_RING.indexOf(star)
    // Find which RING_PALACES index this star normally sits at
    // Star home palace: STAR_POSITIONS maps palace->star, we need star->palace
    let starHomePalace = null
    for (const [p, s] of Object.entries(STAR_POSITIONS)) {
      if (s === star) { starHomePalace = Number(p); break }
    }

    // New position on ring
    const newRingIdx = (RING_PALACES.indexOf(starHomePalace) + offset + 8) % 8
    const newPalace = RING_PALACES[newRingIdx]

    stars[newPalace] = star
    // Star carries its home palace's earth stem
    heavenStems[newPalace] = earthPlate[starHomePalace]
  }

  // 天禽 follows 天芮: find where 天芮 went
  const tianRuiPalace = Object.entries(stars).find(([, s]) => s === '天芮')
  if (tianRuiPalace) {
    // Palace 5 gets 天禽 star, but its heaven stem comes from earth plate[5]
    stars[5] = '天禽'
    heavenStems[5] = earthPlate[5]
  }

  return { stars, heavenStems, targetPalace }
}

/**
 * Step 5: 排人盘 — Gates rotate ("值使随时支")
 * The duty gate walks from its home palace to a target determined by
 * counting branches from 旬首地支 to 时辰地支.
 */
function buildHumanPlate(dutyInfo, hourBranch, isYangDun) {
  const { dutyGate, effectivePalace, xunShouGZ } = dutyInfo

  // Get 旬首地支
  const xunShouBranch = xunShouGZ[1]

  // Count steps from 旬首地支 to 时辰地支
  const fromIdx = DI_ZHI.indexOf(xunShouBranch)
  const toIdx = DI_ZHI.indexOf(hourBranch)
  const steps = (toIdx - fromIdx + 12) % 12

  // Walk order: palace numbers ascending (skip 5) for 阳遁, descending for 阴遁
  const yangWalkOrder = [1, 2, 3, 4, 6, 7, 8, 9] // skip 5
  const yinWalkOrder = [9, 8, 7, 6, 4, 3, 2, 1]   // skip 5
  const walkOrder = isYangDun ? yangWalkOrder : yinWalkOrder

  // Start at duty gate's home palace (effectivePalace)
  const startIdx = walkOrder.indexOf(effectivePalace)

  // Walk 'steps' steps along walkOrder
  const targetIdx = (startIdx + steps) % 8
  const gateTargetPalace = walkOrder[targetIdx]

  // Now rotate ALL 8 gates on RING_PALACES by the offset
  // Find duty gate in GATE_RING
  const dutyGateRingIdx = GATE_RING.indexOf(dutyGate)

  // Find home and target on RING_PALACES
  const homeRingIdx = RING_PALACES.indexOf(effectivePalace)
  const targetRingIdx = RING_PALACES.indexOf(gateTargetPalace)

  // Gates ALWAYS rotate clockwise on RING_PALACES
  const offset = (targetRingIdx - homeRingIdx + 8) % 8

  const gates = {} // palace -> gate name
  for (let i = 0; i < 8; i++) {
    const gateIdx = (dutyGateRingIdx + i) % 8
    const gate = GATE_RING[gateIdx]

    // Find this gate's home palace
    let gateHomePalace = null
    for (const [p, g] of Object.entries(GATE_POSITIONS)) {
      if (g === gate) { gateHomePalace = Number(p); break }
    }

    const gateHomeRingIdx = RING_PALACES.indexOf(gateHomePalace)
    const newRingIdx = (gateHomeRingIdx + offset + 8) % 8
    const newPalace = RING_PALACES[newRingIdx]
    gates[newPalace] = gate
  }

  return { gates }
}

/**
 * Step 6: 排神盘 — God plate
 * 值符 god goes to same palace as 值符 star (heaven target palace).
 * 阳遁: fill clockwise; 阴遁: fill counter-clockwise on RING_PALACES.
 */
function buildGodPlate(heavenTargetPalace, isYangDun) {
  const gods = {} // palace -> god name
  const startRingIdx = RING_PALACES.indexOf(heavenTargetPalace)

  for (let i = 0; i < 8; i++) {
    let ringIdx
    if (isYangDun) {
      ringIdx = (startRingIdx + i) % 8
    } else {
      ringIdx = (startRingIdx - i + 8) % 8
    }
    gods[RING_PALACES[ringIdx]] = GOD_RING[i]
  }

  return { gods }
}

/**
 * Calculate 空亡 (void branches)
 * The 2 branches not covered in the current hour's 旬.
 */
function calcKongWang(xunStartIndex) {
  const branch1 = DI_ZHI[(xunStartIndex + 10) % 12]
  const branch2 = DI_ZHI[(xunStartIndex + 11) % 12]
  return [branch1, branch2]
}

/**
 * Main entry: generate a complete Qi Men Dun Jia chart
 * @param {Date} date - JavaScript Date object
 * @returns {Object} complete chart data
 */
export function generateQimenChart(date, hourGZOverride = null) {
  // Step 1: 干支 & 定局
  const ganZhi = getGanZhi(date)
  const { isYangDun, juNum, currentTerm, yuan } = determineJu(date, ganZhi)

  // Allow overriding the hour pillar (for unequal shichen TST)
  if (hourGZOverride) {
    ganZhi.hour.stem = hourGZOverride[0]
    ganZhi.hour.branch = hourGZOverride[1]
    ganZhi.hourFull = hourGZOverride
  }

  const hourGZ = ganZhi.hourFull
  const hourStem = ganZhi.hour.stem
  const hourBranch = ganZhi.hour.branch

  // Step 2: 排地盘
  const earthPlate = buildEarthPlate(juNum, isYangDun)

  // Step 3: 值符值使
  const dutyInfo = findDutyStarGate(hourGZ, earthPlate)

  // Step 4: 排天盘
  const { stars, heavenStems, targetPalace } = buildHeavenPlate(
    earthPlate, dutyInfo, hourStem, isYangDun
  )

  // Step 5: 排人盘
  const { gates } = buildHumanPlate(dutyInfo, hourBranch, isYangDun)

  // Step 6: 排神盘
  const { gods } = buildGodPlate(targetPalace, isYangDun)

  // 空亡
  const kongWang = calcKongWang(dutyInfo.xunStartIndex)

  // Assemble palaces
  const palaces = {}
  for (let p = 1; p <= 9; p++) {
    palaces[p] = {
      number: p,
      name: PALACE_NAMES[p],
      element: PALACE_ELEMENTS[p],
      earthStem: earthPlate[p],
      heavenStem: heavenStems[p] || earthPlate[p], // palace 5 fallback
      star: stars[p] || STAR_POSITIONS[p], // palace 5 gets 天禽 from step 4
      gate: gates[p] || null,  // palace 5 has no gate
      god: gods[p] || null,    // palace 5 has no god
    }
  }

  return {
    dateTime: date,
    ganZhi: {
      year: { stem: ganZhi.year.stem, branch: ganZhi.year.branch, full: ganZhi.yearFull },
      month: { stem: ganZhi.month.stem, branch: ganZhi.month.branch, full: ganZhi.monthFull },
      day: { stem: ganZhi.day.stem, branch: ganZhi.day.branch, full: ganZhi.dayFull },
      hour: { stem: ganZhi.hour.stem, branch: ganZhi.hour.branch, full: ganZhi.hourFull },
    },
    isYangDun,
    juNum,
    currentTerm,
    yuan,
    dutyStar: dutyInfo.dutyStar,
    dutyGate: dutyInfo.dutyGate,
    xunShou: dutyInfo.xunShouGZ,
    kongWang,
    palaces,
  }
}
