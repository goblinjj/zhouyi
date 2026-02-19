// True Solar Time calculation module
// Implements Spencer 1971 Equation of Time and cosine-weighted unequal shichen (时辰)
import { ref, computed } from 'vue'

// ============================================================
// Constants
// ============================================================

const DEG2RAD = Math.PI / 180
const RAD2DEG = 180 / Math.PI

// 12 shichen in standard order (index 0-11)
const SHICHEN_NAMES = [
  '子时', '丑时', '寅时', '卯时', '辰时', '巳时',
  '午时', '未时', '申时', '酉时', '戌时', '亥时',
]
const EARTHLY_BRANCHES = [
  '子', '丑', '寅', '卯', '辰', '巳',
  '午', '未', '申', '酉', '戌', '亥',
]

// Angular center of each shichen (degrees, 0° = midnight, 180° = noon)
// 子=0°, 丑=30°, 寅=60°, 卯=90°, ..., 亥=330°
const SHICHEN_ANGLES = Array.from({ length: 12 }, (_, i) => i * 30)

// ============================================================
// Pure calculation functions
// ============================================================

/**
 * Day of year for a given Date object (1-366).
 */
export function dayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 1)
  const diff = date - start
  return Math.floor(diff / 86400000) + 1
}

/**
 * Equation of Time using Spencer (1971) formula.
 * @returns {number} EoT in minutes
 */
export function equationOfTime(doy) {
  const B = (2 * Math.PI * (doy - 1)) / 365
  return 229.18 * (
    0.000075 +
    0.001868 * Math.cos(B) -
    0.032077 * Math.sin(B) -
    0.014615 * Math.cos(2 * B) -
    0.04089 * Math.sin(2 * B)
  )
}

/**
 * Geographic time difference due to longitude offset from the standard meridian.
 * @returns {number} difference in minutes
 */
export function geographicTimeDiff(longitude, timezoneOffset) {
  const standardMeridian = timezoneOffset * 15
  return (longitude - standardMeridian) * 4
}

/**
 * Calculate true solar time from standard clock time.
 * @returns {{ hours: number, minutes: number }}
 */
export function calcTrueSolarTime(dateStr, timeStr, longitude, timezoneOffset) {
  const date = new Date(dateStr + 'T00:00:00')
  const doy = dayOfYear(date)
  const eot = equationOfTime(doy)
  const geoDiff = geographicTimeDiff(longitude, timezoneOffset)

  const [h, m] = timeStr.split(':').map(Number)
  let totalMinutes = h * 60 + m + geoDiff + eot

  // Wrap into [0, 1440)
  totalMinutes = ((totalMinutes % 1440) + 1440) % 1440

  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: Math.floor(totalMinutes % 60),
  }
}

/**
 * Calculate sunrise and sunset in local standard (clock) time.
 * Returns null for polar day / polar night.
 */
export function calcSunriseSunset(dateStr, latitude, longitude, timezoneOffset) {
  const date = new Date(dateStr + 'T00:00:00')
  const doy = dayOfYear(date)

  const decl = 23.45 * Math.sin(DEG2RAD * (360 / 365) * (284 + doy))
  const declRad = decl * DEG2RAD
  const latRad = latitude * DEG2RAD

  const cosHa =
    (Math.sin(-0.833 * DEG2RAD) - Math.sin(latRad) * Math.sin(declRad)) /
    (Math.cos(latRad) * Math.cos(declRad))

  if (cosHa < -1 || cosHa > 1) return null

  const haDeg = Math.acos(cosHa) * RAD2DEG
  const eot = equationOfTime(doy)
  const geoDiff = geographicTimeDiff(longitude, timezoneOffset)

  const sunriseHours = 12 - haDeg / 15 - eot / 60 - geoDiff / 60
  const sunsetHours = 12 + haDeg / 15 - eot / 60 - geoDiff / 60

  return {
    sunrise: fractionalHoursToHM(sunriseHours),
    sunset: fractionalHoursToHM(sunsetHours),
  }
}

function fractionalHoursToHM(frac) {
  let totalMin = Math.round(frac * 60)
  totalMin = ((totalMin % 1440) + 1440) % 1440
  return { h: Math.floor(totalMin / 60), m: totalMin % 60 }
}

function minutesToHM(totalMin) {
  let m = Math.round(totalMin)
  m = ((m % 1440) + 1440) % 1440
  return { h: Math.floor(m / 60), m: m % 60 }
}

/**
 * Calculate 13 unequal-length shichen using cosine-weighted smooth distribution.
 *
 * The duration of each shichen follows a cosine curve:
 *   duration_i = 120 - amplitude × cos(θ_i)
 *
 * where θ_i is the angular center of shichen i (0° = midnight, 180° = noon),
 * and amplitude = (dayDuration - 720) / 3.732.
 *
 * This produces:
 *   - In summer: 午时 longest, 子时 shortest, smooth gradient between
 *   - In winter: 子时 longest, 午时 shortest
 *   - At equinox: all equal (120 min each)
 *
 * 子时 is split at midnight into 晚子时 (before midnight) and 早子时 (after midnight).
 * Returns 13 entries ordered: 晚子时, 丑, 寅, 卯, ..., 亥, 早子时
 *
 * @param {{ h: number, m: number }} sunrise
 * @param {{ h: number, m: number }} sunset
 * @returns {Array<{ name: string, branch: string, start: {h,m}, end: {h,m}, durationMin: number }>}
 */
export function calcUnequalShichen(sunrise, sunset) {
  const sunriseMin = sunrise.h * 60 + sunrise.m
  const sunsetMin = sunset.h * 60 + sunset.m
  const dayDuration = sunsetMin - sunriseMin

  // Cosine amplitude: determines how much shichen durations vary
  // Sum constraint: Σ(6 daytime) = dayDuration requires this exact value
  const amplitude = (dayDuration - 720) / 3.732

  // Calculate duration for each of the 12 shichen
  const durations = SHICHEN_ANGLES.map(angle => {
    return 120 - amplitude * Math.cos(angle * DEG2RAD)
  })

  // Build timeline: anchor at midnight = center of 子时
  // 子时 starts at: midnight - duration_子/2 = 1440 - duration_子/2
  // Then lay out in order: 子, 丑, 寅, ..., 亥
  const ziHalf = durations[0] / 2
  let cursor = 1440 - ziHalf // start of 子时 (before midnight)

  const shichen12 = []
  for (let i = 0; i < 12; i++) {
    const startMin = cursor
    const endMin = cursor + durations[i]
    shichen12.push({
      name: SHICHEN_NAMES[i],
      branch: EARTHLY_BRANCHES[i],
      start: minutesToHM(startMin),
      end: minutesToHM(endMin),
      durationMin: Math.round(durations[i]),
    })
    cursor = endMin
  }

  // Split 子时 at midnight into 早子时 and 晚子时
  const zi = shichen12[0]
  const ziStartMin = 1440 - ziHalf // e.g. 23:10
  const earlyZiDuration = Math.round(ziHalf)  // from start to midnight
  const lateZiDuration = Math.round(durations[0] - ziHalf) // from midnight to end

  const earlyZi = {
    name: '晚子时',
    branch: '子',
    subBranch: '晚子',
    start: minutesToHM(ziStartMin),
    end: { h: 0, m: 0 },
    durationMin: earlyZiDuration,
  }
  const lateZi = {
    name: '早子时',
    branch: '子',
    subBranch: '早子',
    start: { h: 0, m: 0 },
    end: zi.end,
    durationMin: lateZiDuration,
  }

  // Return 13 entries: 早子时, 丑, 寅, ..., 亥, 晚子时
  return [lateZi, ...shichen12.slice(1), earlyZi]
}

/**
 * Find which shichen a given time falls in.
 * Works with the 13-entry table (早子时/晚子时 split).
 */
export function findShichen(hours, minutes, shichenTable) {
  if (!shichenTable || shichenTable.length === 0) return null

  const timeMin = hours * 60 + minutes

  for (const sc of shichenTable) {
    const startMin = sc.start.h * 60 + sc.start.m
    const endMin = sc.end.h * 60 + sc.end.m

    if (endMin > startMin) {
      if (timeMin >= startMin && timeMin < endMin) return sc
    } else if (endMin === startMin) {
      // Zero-length edge case (midnight boundary) - skip
      continue
    } else {
      // Crosses midnight
      if (timeMin >= startMin || timeMin < endMin) return sc
    }
  }

  return null
}

/**
 * Format hours and minutes as "HH:MM".
 */
export function formatTime(h, m) {
  return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0')
}

// ============================================================
// Vue composable
// ============================================================

export function useTrueSolarTime() {
  const dateStr = ref('')
  const timeStr = ref('12:00')
  const longitude = ref(116.41)
  const latitude = ref(39.90)
  const timezone = ref(8)

  const result = computed(() => {
    if (!dateStr.value || !timeStr.value) return null

    const date = new Date(dateStr.value + 'T00:00:00')
    if (isNaN(date.getTime())) return null

    const doy = dayOfYear(date)
    const eot = equationOfTime(doy)
    const geoDiff = geographicTimeDiff(longitude.value, timezone.value)

    const tst = calcTrueSolarTime(
      dateStr.value, timeStr.value, longitude.value, timezone.value,
    )

    const sunResult = calcSunriseSunset(
      dateStr.value, latitude.value, longitude.value, timezone.value,
    )

    if (!sunResult) {
      return {
        trueSolarTime: tst, eot, geoDiff,
        sunrise: null, sunset: null,
        shichenTable: null, currentShichen: null,
        dayDurationMin: null, nightDurationMin: null,
        longestShichenMin: null, shortestShichenMin: null,
        polarCondition: true,
      }
    }

    const { sunrise, sunset } = sunResult
    const sunriseMin = sunrise.h * 60 + sunrise.m
    const sunsetMin = sunset.h * 60 + sunset.m
    const dayDurationMin = sunsetMin - sunriseMin
    const nightDurationMin = 1440 - dayDurationMin

    const shichenTable = calcUnequalShichen(sunrise, sunset)
    const currentShichen = findShichen(tst.hours, tst.minutes, shichenTable)

    // Find longest and shortest full shichen (exclude split 子时 halves)
    const fullDurations = shichenTable
      .filter(sc => !sc.subBranch)
      .map(sc => sc.durationMin)
    const longestShichenMin = Math.max(...fullDurations)
    const shortestShichenMin = Math.min(...fullDurations)

    return {
      trueSolarTime: tst, eot, geoDiff,
      sunrise, sunset,
      shichenTable, currentShichen,
      dayDurationMin, nightDurationMin,
      longestShichenMin, shortestShichenMin,
      polarCondition: false,
    }
  })

  return { dateStr, timeStr, longitude, latitude, timezone, result }
}
