// True Solar Time calculation module
// Implements Spencer 1971 Equation of Time and unequal-length shichen (时辰)
import { ref, computed } from 'vue'

// ============================================================
// Constants
// ============================================================

const DEG2RAD = Math.PI / 180
const RAD2DEG = 180 / Math.PI

const SHICHEN_NAMES = [
  '子时', '丑时', '寅时', '卯时', '辰时', '巳时',
  '午时', '未时', '申时', '酉时', '戌时', '亥时',
]

const EARTHLY_BRANCHES = [
  '子', '丑', '寅', '卯', '辰', '巳',
  '午', '未', '申', '酉', '戌', '亥',
]

// ============================================================
// Pure calculation functions
// ============================================================

/**
 * Day of year for a given Date object (1-366).
 * @param {Date} date
 * @returns {number}
 */
export function dayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 1)
  const diff = date - start
  return Math.floor(diff / 86400000) + 1
}

/**
 * Equation of Time using Spencer (1971) formula.
 * @param {number} doy - day of year (1-366)
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
 * @param {number} longitude - observer longitude in degrees (east positive)
 * @param {number} timezoneOffset - timezone offset in hours from UTC (e.g. 8 for UTC+8)
 * @returns {number} difference in minutes
 */
export function geographicTimeDiff(longitude, timezoneOffset) {
  const standardMeridian = timezoneOffset * 15
  return (longitude - standardMeridian) * 4
}

/**
 * Calculate true solar time from standard clock time.
 * @param {string} dateStr - "YYYY-MM-DD"
 * @param {string} timeStr - "HH:MM"
 * @param {number} longitude - degrees east
 * @param {number} timezoneOffset - hours from UTC
 * @returns {{ hours: number, minutes: number }}
 */
export function calcTrueSolarTime(dateStr, timeStr, longitude, timezoneOffset) {
  const date = new Date(dateStr + 'T00:00:00')
  const doy = dayOfYear(date)
  const eot = equationOfTime(doy)
  const geoDiff = geographicTimeDiff(longitude, timezoneOffset)

  const [h, m] = timeStr.split(':').map(Number)
  const inputMinutes = h * 60 + m

  let totalMinutes = inputMinutes + geoDiff + eot

  // Wrap into [0, 1440)
  totalMinutes = ((totalMinutes % 1440) + 1440) % 1440

  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: Math.floor(totalMinutes % 60),
  }
}

/**
 * Calculate sunrise and sunset in local standard (clock) time.
 * @param {string} dateStr - "YYYY-MM-DD"
 * @param {number} latitude - degrees (north positive)
 * @param {number} longitude - degrees (east positive)
 * @param {number} timezoneOffset - hours from UTC
 * @returns {{ sunrise: {h: number, m: number}, sunset: {h: number, m: number} } | null}
 *   Returns null for polar day / polar night (no sunrise or sunset).
 */
export function calcSunriseSunset(dateStr, latitude, longitude, timezoneOffset) {
  const date = new Date(dateStr + 'T00:00:00')
  const doy = dayOfYear(date)

  // Solar declination (degrees)
  const decl = 23.45 * Math.sin(DEG2RAD * (360 / 365) * (284 + doy))
  const declRad = decl * DEG2RAD
  const latRad = latitude * DEG2RAD

  // Hour angle with atmospheric refraction correction (-0.833 degrees)
  const cosHa =
    (Math.sin(-0.833 * DEG2RAD) - Math.sin(latRad) * Math.sin(declRad)) /
    (Math.cos(latRad) * Math.cos(declRad))

  // Polar day or polar night: no sunrise/sunset
  if (cosHa < -1 || cosHa > 1) {
    return null
  }

  const haRad = Math.acos(cosHa)
  const haDeg = haRad * RAD2DEG

  const eot = equationOfTime(doy)
  const geoDiff = geographicTimeDiff(longitude, timezoneOffset)

  // Sunrise and sunset in standard clock time (hours, fractional)
  const sunriseHours = 12 - haDeg / 15 - eot / 60 - geoDiff / 60
  const sunsetHours = 12 + haDeg / 15 - eot / 60 - geoDiff / 60

  return {
    sunrise: fractionalHoursToHM(sunriseHours),
    sunset: fractionalHoursToHM(sunsetHours),
  }
}

/**
 * Convert fractional hours to { h, m }, wrapping into [0, 24).
 * @param {number} frac - fractional hours (may be negative or > 24)
 * @returns {{ h: number, m: number }}
 */
function fractionalHoursToHM(frac) {
  let totalMin = Math.round(frac * 60)
  totalMin = ((totalMin % 1440) + 1440) % 1440
  return {
    h: Math.floor(totalMin / 60),
    m: totalMin % 60,
  }
}

/**
 * Convert { h, m } to total minutes since midnight.
 * @param {{ h: number, m: number }} hm
 * @returns {number}
 */
function hmToMinutes(hm) {
  return hm.h * 60 + hm.m
}

/**
 * Calculate the 12 unequal-length shichen based on actual sunrise and sunset.
 *
 * Daytime shichen (卯辰巳午未申): sunrise to sunset, divided into 6 equal parts.
 * Nighttime shichen (酉戌亥子丑寅): sunset to next sunrise, divided into 6 equal parts.
 *
 * Output is ordered: 子丑寅卯辰巳午未申酉戌亥
 *
 * @param {{ h: number, m: number }} sunrise
 * @param {{ h: number, m: number }} sunset
 * @returns {Array<{ name: string, branch: string, start: {h: number, m: number}, end: {h: number, m: number}, durationMin: number }>}
 */
export function calcUnequalShichen(sunrise, sunset) {
  const sunriseMin = hmToMinutes(sunrise)
  const sunsetMin = hmToMinutes(sunset)

  const dayDuration = sunsetMin - sunriseMin   // minutes of daytime
  const nightDuration = 1440 - dayDuration      // minutes of nighttime

  const dayShichenLen = dayDuration / 6
  const nightShichenLen = nightDuration / 6

  // Build shichen in chronological order starting from sunset (酉),
  // then map to the standard 子-亥 order.

  // Nighttime order starting at sunset: 酉(9) 戌(10) 亥(11) 子(0) 丑(1) 寅(2)
  // Daytime order starting at sunrise: 卯(3) 辰(4) 巳(5) 午(6) 未(7) 申(8)

  const nightBranches = [9, 10, 11, 0, 1, 2]  // index into EARTHLY_BRANCHES
  const dayBranches = [3, 4, 5, 6, 7, 8]

  const shichenMap = {} // keyed by branch index (0-11)

  // Nighttime shichen: from sunset, wrapping past midnight
  for (let i = 0; i < 6; i++) {
    const branchIdx = nightBranches[i]
    let startMin = sunsetMin + i * nightShichenLen
    let endMin = sunsetMin + (i + 1) * nightShichenLen

    shichenMap[branchIdx] = {
      name: SHICHEN_NAMES[branchIdx],
      branch: EARTHLY_BRANCHES[branchIdx],
      start: minutesToHM(startMin),
      end: minutesToHM(endMin),
      durationMin: Math.round(nightShichenLen),
    }
  }

  // Daytime shichen: from sunrise to sunset
  for (let i = 0; i < 6; i++) {
    const branchIdx = dayBranches[i]
    const startMin = sunriseMin + i * dayShichenLen
    const endMin = sunriseMin + (i + 1) * dayShichenLen

    shichenMap[branchIdx] = {
      name: SHICHEN_NAMES[branchIdx],
      branch: EARTHLY_BRANCHES[branchIdx],
      start: minutesToHM(startMin),
      end: minutesToHM(endMin),
      durationMin: Math.round(dayShichenLen),
    }
  }

  // Return in standard order: 子丑寅卯辰巳午未申酉戌亥
  return Array.from({ length: 12 }, (_, i) => shichenMap[i])
}

/**
 * Convert total minutes (may exceed 1440 or be negative) to { h, m } wrapped to [0, 24h).
 * @param {number} totalMin
 * @returns {{ h: number, m: number }}
 */
function minutesToHM(totalMin) {
  let m = Math.round(totalMin)
  m = ((m % 1440) + 1440) % 1440
  return {
    h: Math.floor(m / 60),
    m: m % 60,
  }
}

/**
 * Find which shichen a given time falls in.
 *
 * Handles the 子时 midnight-straddling case: 子时 may start before midnight and end after,
 * so we compare using minutes-from-sunset as a reference to avoid wrap-around issues.
 *
 * @param {number} hours
 * @param {number} minutes
 * @param {Array} shichenTable - from calcUnequalShichen
 * @returns {object|null} the matching shichen object, or null
 */
export function findShichen(hours, minutes, shichenTable) {
  if (!shichenTable || shichenTable.length === 0) return null

  const timeMin = hours * 60 + minutes

  for (const sc of shichenTable) {
    const startMin = sc.start.h * 60 + sc.start.m
    const endMin = sc.end.h * 60 + sc.end.m

    if (endMin > startMin) {
      // Normal case: does not cross midnight
      if (timeMin >= startMin && timeMin < endMin) return sc
    } else {
      // Crosses midnight (e.g. 子时: start=23:00, end=01:00)
      if (timeMin >= startMin || timeMin < endMin) return sc
    }
  }

  return null
}

/**
 * Format hours and minutes as "HH:MM".
 * @param {number} h
 * @param {number} m
 * @returns {string}
 */
export function formatTime(h, m) {
  return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0')
}

// ============================================================
// Vue composable
// ============================================================

/**
 * Vue 3 composable for true solar time calculations.
 * Provides reactive inputs and a computed result object.
 *
 * @returns {{
 *   dateStr: import('vue').Ref<string>,
 *   timeStr: import('vue').Ref<string>,
 *   longitude: import('vue').Ref<number>,
 *   latitude: import('vue').Ref<number>,
 *   timezone: import('vue').Ref<number>,
 *   result: import('vue').ComputedRef<object|null>,
 * }}
 */
export function useTrueSolarTime() {
  const dateStr = ref('')
  const timeStr = ref('12:00')
  const longitude = ref(116.41)   // Beijing default
  const latitude = ref(39.90)
  const timezone = ref(8)         // UTC+8

  const result = computed(() => {
    if (!dateStr.value || !timeStr.value) return null

    const date = new Date(dateStr.value + 'T00:00:00')
    if (isNaN(date.getTime())) return null

    const doy = dayOfYear(date)
    const eot = equationOfTime(doy)
    const geoDiff = geographicTimeDiff(longitude.value, timezone.value)

    const tst = calcTrueSolarTime(
      dateStr.value,
      timeStr.value,
      longitude.value,
      timezone.value,
    )

    const sunResult = calcSunriseSunset(
      dateStr.value,
      latitude.value,
      longitude.value,
      timezone.value,
    )

    // Polar day/night: no sunrise/sunset means we cannot compute unequal shichen
    if (!sunResult) {
      return {
        trueSolarTime: tst,
        eot,
        geoDiff,
        sunrise: null,
        sunset: null,
        shichenTable: null,
        currentShichen: null,
        dayDurationMin: null,
        nightDurationMin: null,
        dayShichenMin: null,
        nightShichenMin: null,
        polarCondition: true,
      }
    }

    const { sunrise, sunset } = sunResult

    const sunriseMin = sunrise.h * 60 + sunrise.m
    const sunsetMin = sunset.h * 60 + sunset.m
    const dayDurationMin = sunsetMin - sunriseMin
    const nightDurationMin = 1440 - dayDurationMin
    const dayShichenMin = Math.round(dayDurationMin / 6)
    const nightShichenMin = Math.round(nightDurationMin / 6)

    const shichenTable = calcUnequalShichen(sunrise, sunset)
    const currentShichen = findShichen(tst.hours, tst.minutes, shichenTable)

    return {
      trueSolarTime: tst,
      eot,
      geoDiff,
      sunrise,
      sunset,
      shichenTable,
      currentShichen,
      dayDurationMin,
      nightDurationMin,
      dayShichenMin,
      nightShichenMin,
      polarCondition: false,
    }
  })

  return { dateStr, timeStr, longitude, latitude, timezone, result }
}
