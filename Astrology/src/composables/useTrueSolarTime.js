// True Solar Time Vue composable
// Pure calculation functions are in @shared/true-solar-time
import { ref, computed } from 'vue'
import {
  dayOfYear,
  equationOfTime,
  geographicTimeDiff,
  calcTrueSolarTime,
  calcSunriseSunset,
  calcUnequalShichen,
  findShichen,
  formatTime,
  SHICHEN_NAMES,
  EARTHLY_BRANCHES,
} from '@shared/true-solar-time'

// Re-export pure functions so existing imports don't break
export {
  dayOfYear,
  equationOfTime,
  geographicTimeDiff,
  calcTrueSolarTime,
  calcSunriseSunset,
  calcUnequalShichen,
  findShichen,
  formatTime,
  SHICHEN_NAMES,
  EARTHLY_BRANCHES,
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
