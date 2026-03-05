import { ref, computed } from 'vue'
import { generateQimenChart } from '../core/qimen'
import { calcTrueSolarTime, calcSunriseSunset, calcUnequalShichen, findShichen, calcHourGanZhi } from '@shared/true-solar-time'
import { Solar } from 'lunar-javascript'

export function useQimen() {
  const city = ref({ name: '北京', lng: 116.41, lat: 39.90, tz: 8 })
  const inputDate = ref('')
  const inputTime = ref('')
  const useTrueSolar = ref(true)

  function initNow() {
    const now = new Date()
    const y = now.getFullYear()
    const mo = String(now.getMonth() + 1).padStart(2, '0')
    const d = String(now.getDate()).padStart(2, '0')
    inputDate.value = `${y}-${mo}-${d}`
    inputTime.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  }

  // Compute unequal shichen info when TST is enabled
  const shichenInfo = computed(() => {
    if (!useTrueSolar.value || !inputDate.value || !inputTime.value) return null
    const tst = calcTrueSolarTime(inputDate.value, inputTime.value, city.value.lng, city.value.tz)
    const sunData = calcSunriseSunset(inputDate.value, city.value.lat, city.value.lng, city.value.tz)
    if (!sunData) return null
    const shichenTable = calcUnequalShichen(sunData.sunrise, sunData.sunset)
    const sc = findShichen(tst.hours, tst.minutes, shichenTable)
    if (!sc) return null

    // Get day stem for hour pillar calculation
    const [h, m] = inputTime.value.split(':').map(Number)
    const date = new Date(inputDate.value + 'T00:00:00')
    date.setHours(h, m, 0, 0)
    const solar = Solar.fromDate(date)
    const dayStem = solar.getLunar().getEightChar().getDay()[0]
    const isLateZi = sc.subBranch === '晚子'
    const hourGZ = calcHourGanZhi(dayStem, sc.branch, isLateZi)

    return {
      tst,
      shichen: sc,
      hourGZ,
      tstText: `${String(tst.hours).padStart(2, '0')}:${String(tst.minutes).padStart(2, '0')}`,
    }
  })

  const chart = computed(() => {
    if (!inputDate.value || !inputTime.value) return null

    const [h, m] = inputTime.value.split(':').map(Number)
    const date = new Date(inputDate.value + 'T00:00:00')
    if (isNaN(date.getTime())) return null
    date.setHours(h, m, 0, 0)

    // Pass hour GZ override when using unequal shichen TST
    const hourGZOverride = shichenInfo.value ? shichenInfo.value.hourGZ : null

    try {
      return generateQimenChart(date, hourGZOverride)
    } catch (e) {
      console.error('Qimen calculation error:', e)
      return null
    }
  })

  return { city, inputDate, inputTime, useTrueSolar, chart, initNow, shichenInfo }
}
