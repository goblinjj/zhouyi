// Horoscope state management and scope logic
import { ref, computed } from 'vue'
import { astro } from 'iztro'
import {
    STEMS, BRANCHES, PALACE_SEQ, PALACE_SHORT,
    MONTH_NAMES,
    MUTAGEN_LABELS, SCOPE_COLORS, SIHUA_TABLE, FLYING_BG,
    bIdx, yearSB,
} from './usePaipanConstants'

export function useHoroscope(astrolabe) {
    // ===== State =====
    const horoscopeData = ref(null)
    const scopeData = ref({ decadal: null, yearly: null, monthly: null })
    const selectedPalaceIdx = ref(null)
    const selDecadal = ref(null)
    const selYear = ref(null)
    const selMonth = ref(null)
    const selDay = ref(1)
    const selHour = ref(0)

    // ===== Computed =====
    const birthYear = computed(() => {
        if (!astrolabe.value) return 0
        return parseInt(astrolabe.value.solarDate.split('-')[0])
    })

    const fourPillars = computed(() => {
        if (!astrolabe.value) return null
        const cd = astrolabe.value.rawDates?.chineseDate
        if (!cd) return null
        return {
            year: cd.yearly ? cd.yearly[0] + cd.yearly[1] : '',
            month: cd.monthly ? cd.monthly[0] + cd.monthly[1] : '',
            day: cd.daily ? cd.daily[0] + cd.daily[1] : '',
            hour: cd.hourly ? cd.hourly[0] + cd.hourly[1] : '',
        }
    })

    // 三方四正
    const sanfangSet = computed(() => {
        if (selectedPalaceIdx.value === null || !astrolabe.value) return new Set()
        const p = astrolabe.value.palaces[selectedPalaceIdx.value]
        const b = bIdx(p.earthlyBranch)
        return new Set([b, (b + 4) % 12, (b + 8) % 12, (b + 6) % 12])
    })

    // Derived names - uses the deepest active scope's palace names
    const derivedNames = computed(() => {
        if (selectedPalaceIdx.value === null || !astrolabe.value) return {}
        const selP = astrolabe.value.palaces[selectedPalaceIdx.value]
        const selBi = bIdx(selP.earthlyBranch)
        let activePalaceName = selP.name
        if (selDecadal.value && horoscopeData.value?.decadal?.palaceNames) {
            activePalaceName = horoscopeData.value.decadal.palaceNames[selectedPalaceIdx.value]
        }
        if (selYear.value && horoscopeData.value?.yearly?.palaceNames) {
            activePalaceName = horoscopeData.value.yearly.palaceNames[selectedPalaceIdx.value]
        }
        if (selMonth.value && horoscopeData.value?.monthly?.palaceNames) {
            activePalaceName = horoscopeData.value.monthly.palaceNames[selectedPalaceIdx.value]
        }
        const selShort = PALACE_SHORT[activePalaceName] || activePalaceName[0]
        const result = {}
        astrolabe.value.palaces.forEach(p => {
            const offset = (selBi - bIdx(p.earthlyBranch) + 12) % 12
            if (p.index !== selectedPalaceIdx.value) {
                result[p.index] = selShort + '之' + PALACE_SEQ[offset]
            }
        })
        return result
    })

    // Flying Si Hua backgrounds
    const flyingSihuaBg = computed(() => {
        if (selectedPalaceIdx.value === null || !astrolabe.value) return {}
        const p = astrolabe.value.palaces[selectedPalaceIdx.value]
        const stars = SIHUA_TABLE[p.heavenlyStem]
        if (!stars) return {}
        const result = {}
        stars.forEach((starName, i) => {
            result[starName] = FLYING_BG[MUTAGEN_LABELS[i]]
        })
        return result
    })

    // Decadal list
    const decadalList = computed(() => {
        if (!astrolabe.value) return []
        return astrolabe.value.palaces
            .filter(p => p.decadal)
            .map(p => ({
                palaceIdx: p.index,
                range: p.decadal.range,
                stem: p.decadal.heavenlyStem,
                branch: p.decadal.earthlyBranch,
                name: p.name,
            }))
            .sort((a, b) => a.range[0] - b.range[0])
    })

    // Year list
    const yearList = computed(() => {
        if (!selDecadal.value || !birthYear.value) return []
        const [s, e] = selDecadal.value.range
        return Array.from({ length: e - s + 1 }, (_, i) => {
            const age = s + i
            const yr = birthYear.value + age - 1
            return { year: yr, age, sb: yearSB(yr) }
        })
    })

    // Month list
    const monthList = computed(() => {
        if (!selYear.value || !birthYear.value) return []
        const currentSelectedYear = selYear.value

        return Array.from({ length: 12 }, (_, i) => {
            const m = i + 1
            try {
                const h = astro.byLunar(`${currentSelectedYear}-${m}-1`, 0, '男', false)
                const solarMonthStr = h.solarDate.split('-')[1]
                const solarMonth = parseInt(solarMonthStr, 10)

                return {
                    index: m,
                    lunarName: MONTH_NAMES[i],
                    sb: (h.rawDates?.chineseDate?.monthly || []).join(''),
                    solarMonth: `${solarMonth}月`
                }
            } catch (e) {
                return {
                    index: m,
                    lunarName: MONTH_NAMES[i],
                    sb: '',
                    solarMonth: ''
                }
            }
        })
    })

    // Flow stars
    const flowStarsByPalace = computed(() => {
        if (!horoscopeData.value) return {}
        const result = {}
        const scopes = []
        if (selDecadal.value) scopes.push('decadal')
        if (selYear.value) scopes.push('yearly')
        if (selMonth.value) scopes.push('monthly')

        const scopeColorMap = { decadal: SCOPE_COLORS.da, yearly: SCOPE_COLORS.yi, monthly: SCOPE_COLORS.yue }
        for (const scope of scopes) {
            const data = horoscopeData.value[scope]
            if (!data?.stars) continue
            data.stars.forEach((stars, idx) => {
                if (!stars?.length) return
                if (!result[idx]) result[idx] = []
                stars.forEach(s => {
                    const shortName = s.name.length > 2 ? s.name.slice(-1) : s.name.slice(-1)
                    result[idx].push({
                        name: shortName,
                        mutagen: s.mutagen,
                        scope,
                        color: scopeColorMap[scope],
                    })
                })
            })
        }
        return result
    })

    // Si Hua Stack helper
    function getStarMutagens(starName, birthMutagen) {
        const stack = [null, null, null, null]

        if (birthMutagen) {
            stack[0] = { label: birthMutagen, color: SCOPE_COLORS.ben }
        }
        if (selDecadal.value && horoscopeData.value?.decadal?.mutagen) {
            const idx = horoscopeData.value.decadal.mutagen.indexOf(starName)
            if (idx !== -1) {
                stack[1] = { label: MUTAGEN_LABELS[idx], color: SCOPE_COLORS.da }
            }
        }
        if (selYear.value && horoscopeData.value?.yearly?.mutagen) {
            const idx = horoscopeData.value.yearly.mutagen.indexOf(starName)
            if (idx !== -1) {
                stack[2] = { label: MUTAGEN_LABELS[idx], color: SCOPE_COLORS.yi }
            }
        }
        if (selMonth.value && horoscopeData.value?.monthly?.mutagen) {
            const idx = horoscopeData.value.monthly.mutagen.indexOf(starName)
            if (idx !== -1) {
                stack[3] = { label: MUTAGEN_LABELS[idx], color: SCOPE_COLORS.yue }
            }
        }
        return stack
    }

    // ===== Horoscope scope management =====
    function callHoroscope(dateStr) {
        try {
            return astrolabe.value.horoscope(dateStr, selHour.value)
        } catch (e) {
            console.warn('Horoscope error:', e)
            return null
        }
    }

    function composeHoroscopeData() {
        const sd = scopeData.value
        if (!sd.decadal && !sd.yearly && !sd.monthly) {
            horoscopeData.value = null
            return
        }
        const base = sd.monthly || sd.yearly || sd.decadal
        horoscopeData.value = {
            ...base,
            decadal: sd.decadal?.decadal || base.decadal,
            yearly: sd.yearly?.yearly || base.yearly,
            monthly: sd.monthly?.monthly || base.monthly,
            age: sd.yearly?.age || sd.decadal?.age || base.age,
        }
    }

    // ===== Methods =====
    function resetSelections() {
        selectedPalaceIdx.value = null
        selDecadal.value = null
        selYear.value = null
        selMonth.value = null
        horoscopeData.value = null
        scopeData.value = { decadal: null, yearly: null, monthly: null }
    }

    function autoSelectLifePalace() {
        if (!astrolabe.value) return
        // Find 命宫 at the deepest user-selected scope (monthly > yearly > decadal > natal)
        // Only check a scope if the user has actually selected it
        const scopeChecks = [
            { key: 'monthly', selected: selMonth.value },
            { key: 'yearly', selected: selYear.value },
            { key: 'decadal', selected: selDecadal.value },
        ]
        for (const { key, selected } of scopeChecks) {
            if (!selected) continue
            const names = horoscopeData.value?.[key]?.palaceNames
            if (names) {
                const idx = names.indexOf('命宫')
                if (idx !== -1) {
                    selectedPalaceIdx.value = idx
                    return
                }
            }
        }
        // Fallback: natal 命宫
        const p = astrolabe.value.palaces.find(p => p.name === '命宫')
        if (p) selectedPalaceIdx.value = p.index
    }

    function clickPalace(idx) {
        selectedPalaceIdx.value = selectedPalaceIdx.value === idx ? null : idx
    }

    function isSanfang(palace) {
        return sanfangSet.value.has(bIdx(palace.earthlyBranch))
    }

    function isSelected(palace) {
        return selectedPalaceIdx.value === palace.index
    }

    function selectDecadal(d) {
        if (selDecadal.value?.palaceIdx === d.palaceIdx) {
            selDecadal.value = null
            selYear.value = null
            selMonth.value = null
            scopeData.value = { decadal: null, yearly: null, monthly: null }
            composeHoroscopeData()
            autoSelectLifePalace()
            return
        }
        selDecadal.value = d
        selYear.value = null
        selMonth.value = null
        const midAge = Math.floor((d.range[0] + d.range[1]) / 2)
        const midYear = birthYear.value + midAge - 1
        const result = callHoroscope(`${midYear}-7-1`)
        scopeData.value = { decadal: result, yearly: null, monthly: null }
        composeHoroscopeData()
        autoSelectLifePalace()
    }

    function selectYear(y) {
        if (selYear.value === y.year) {
            selYear.value = null
            selMonth.value = null
            scopeData.value = { ...scopeData.value, yearly: null, monthly: null }
            composeHoroscopeData()
            autoSelectLifePalace()
            return
        }
        selYear.value = y.year
        selMonth.value = null
        const result = callHoroscope(`${y.year}-7-1`)
        scopeData.value = { ...scopeData.value, yearly: result, monthly: null }
        composeHoroscopeData()
        autoSelectLifePalace()
    }

    function selectMonth(m) {
        if (selMonth.value === m) {
            selMonth.value = null
            scopeData.value = { ...scopeData.value, monthly: null }
            composeHoroscopeData()
            autoSelectLifePalace()
            return
        }
        selMonth.value = m
        const yr = selYear.value || birthYear.value
        const result = callHoroscope(`${yr}-${m}-15`)
        scopeData.value = { ...scopeData.value, monthly: result }
        composeHoroscopeData()
        autoSelectLifePalace()
    }

    return {
        // State
        horoscopeData, selectedPalaceIdx,
        selDecadal, selYear, selMonth, selDay, selHour,
        // Computed
        birthYear, fourPillars, sanfangSet, derivedNames,
        flyingSihuaBg, decadalList, yearList, monthList, flowStarsByPalace,
        // Methods
        getStarMutagens, resetSelections, clickPalace,
        isSanfang, isSelected, autoSelectLifePalace,
        selectDecadal, selectYear, selectMonth,
    }
}
