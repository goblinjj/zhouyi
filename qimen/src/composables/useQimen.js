import { ref, computed } from 'vue'
import { generateQimenChart } from '../core/qimen'
import { calcTrueSolarTime } from '@shared/true-solar-time'

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

  const chart = computed(() => {
    if (!inputDate.value || !inputTime.value) return null

    const [h, m] = inputTime.value.split(':').map(Number)
    let date = new Date(inputDate.value + 'T00:00:00')
    if (isNaN(date.getTime())) return null
    date.setHours(h, m, 0, 0)

    if (useTrueSolar.value) {
      const tst = calcTrueSolarTime(inputDate.value, inputTime.value, city.value.lng, city.value.tz)
      date = new Date(date)
      date.setHours(tst.hours, tst.minutes, 0, 0)
    }

    try {
      return generateQimenChart(date)
    } catch (e) {
      console.error('Qimen calculation error:', e)
      return null
    }
  })

  return { city, inputDate, inputTime, useTrueSolar, chart, initNow }
}
