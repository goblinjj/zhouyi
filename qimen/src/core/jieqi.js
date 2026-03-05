import { Solar } from 'lunar-javascript'
import { TIAN_GAN, DI_ZHI, JIA_ZI_TABLE } from './constants'

// 阳遁局数表：冬至→芒种，每个节气对应 [上元, 中元, 下元]
export const YANG_DUN_JU = {
  '冬至': [1, 7, 4], '小寒': [2, 8, 5], '大寒': [3, 9, 6],
  '立春': [8, 5, 2], '雨水': [9, 6, 3], '惊蛰': [1, 7, 4],
  '春分': [3, 9, 6], '清明': [4, 1, 7], '谷雨': [5, 2, 8],
  '立夏': [4, 1, 7], '小满': [5, 2, 8], '芒种': [6, 3, 9],
}

// 阴遁局数表：夏至→大雪，每个节气对应 [上元, 中元, 下元]
export const YIN_DUN_JU = {
  '夏至': [9, 3, 6], '小暑': [8, 2, 5], '大暑': [7, 1, 4],
  '立秋': [2, 5, 8], '处暑': [1, 4, 7], '白露': [9, 3, 6],
  '秋分': [7, 1, 4], '寒露': [6, 9, 3], '霜降': [5, 8, 2],
  '立冬': [6, 9, 3], '小雪': [5, 8, 2], '大雪': [4, 7, 1],
}

// 24节气顺序（从冬至开始）
const TERM_ORDER = [
  '冬至', '小寒', '大寒', '立春', '雨水', '惊蛰',
  '春分', '清明', '谷雨', '立夏', '小满', '芒种',
  '夏至', '小暑', '大暑', '立秋', '处暑', '白露',
  '秋分', '寒露', '霜降', '立冬', '小雪', '大雪',
]

/**
 * 获取干支信息
 * @param {Date} date - JavaScript Date 对象
 * @returns {Object} 年月日时的干支
 */
export function getGanZhi(date) {
  const solar = Solar.fromDate(date)
  const lunar = solar.getLunar()
  const eightChar = lunar.getEightChar()

  return {
    year: { stem: eightChar.getYear()[0], branch: eightChar.getYear()[1] },
    month: { stem: eightChar.getMonth()[0], branch: eightChar.getMonth()[1] },
    day: { stem: eightChar.getDay()[0], branch: eightChar.getDay()[1] },
    hour: { stem: eightChar.getTime()[0], branch: eightChar.getTime()[1] },
    yearFull: eightChar.getYear(),
    monthFull: eightChar.getMonth(),
    dayFull: eightChar.getDay(),
    hourFull: eightChar.getTime(),
  }
}

/**
 * 将 Solar 对象转为 Date
 */
function solarToDate(solar) {
  return new Date(
    solar.getYear(),
    solar.getMonth() - 1,
    solar.getDay(),
    solar.getHour ? solar.getHour() : 0,
    solar.getMinute ? solar.getMinute() : 0,
    solar.getSecond ? solar.getSecond() : 0
  )
}

/**
 * 计算两个日期之间的天数差（只看日期，不看时分秒）
 */
function daysBetween(date1, date2) {
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate())
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate())
  return Math.round((d2 - d1) / (24 * 60 * 60 * 1000))
}

/**
 * 查找当前日期所在的节气
 * @param {Date} date - JavaScript Date 对象
 * @returns {Object} { name: 节气名, date: 节气Date, isYangDun: 是否阳遁 }
 */
export function findSolarTerm(date) {
  const solar = Solar.fromDate(date)
  const lunar = solar.getLunar()

  // 获取当前日期的前一个节气和后一个节气
  const prevJieQi = lunar.getPrevJieQi()
  const nextJieQi = lunar.getNextJieQi()

  const prevName = prevJieQi.getName()
  const prevDate = solarToDate(prevJieQi.getSolar())

  // 判断阴遁/阳遁：冬至到夏至（不含）为阳遁，夏至到冬至（不含）为阴遁
  const prevIdx = TERM_ORDER.indexOf(prevName)
  // 冬至(0)到芒种(11)为阳遁节气，夏至(12)到大雪(23)为阴遁节气
  const isYangDun = prevIdx >= 0 && prevIdx < 12

  return {
    name: prevName,
    date: prevDate,
    isYangDun,
  }
}

/**
 * 查找符头：日干为甲或己的最近一天（含当天，向前找）
 * @param {Date} date - 起始日期
 * @returns {Date} 符头日期
 */
function findFuTou(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  for (let i = 0; i < 10; i++) {
    const checkDate = new Date(d.getTime() - i * 24 * 60 * 60 * 1000)
    const solar = Solar.fromDate(checkDate)
    const lunar = solar.getLunar()
    const dayStem = lunar.getEightChar().getDay()[0]
    if (dayStem === '甲' || dayStem === '己') {
      return checkDate
    }
  }
  // 理论上不会到这里，甲或己每5天出现一次
  return d
}

/**
 * 拆补法定局：确定上中下元和局数
 *
 * 拆补法核心：以节气日期的符头（甲/己日）为起点，划分三元（上/中/下），各5天共15天。
 * 当日期超过当前节气符头的15天周期时，使用下一个节气的符头重新计算。
 *
 * @param {Date} date - JavaScript Date 对象
 * @param {Object} [ganZhi] - 干支信息（可选，不传则自动计算）
 * @returns {Object} { isYangDun, juNum, currentTerm, yuan }
 */
export function determineJu(date, ganZhi) {
  if (!ganZhi) {
    ganZhi = getGanZhi(date)
  }

  const solar = Solar.fromDate(date)
  const lunar = solar.getLunar()
  const prevJieQi = lunar.getPrevJieQi()
  const nextJieQi = lunar.getNextJieQi()

  const prevName = prevJieQi.getName()
  const prevDate = solarToDate(prevJieQi.getSolar())
  const nextName = nextJieQi.getName()
  const nextDate = solarToDate(nextJieQi.getSolar())

  // 找当前节气的符头
  const termFuTou = findFuTou(prevDate)

  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const daysFromFuTou = daysBetween(termFuTou, dateOnly)

  let usedTermName, usedIsYangDun
  let yuan, yuanIndex

  if (daysFromFuTou >= 15) {
    // 超过15天，使用下一个节气的符头重新计算
    const nextFuTou = findFuTou(nextDate)
    const daysFromNextFuTou = daysBetween(nextFuTou, dateOnly)

    usedTermName = nextName
    const nextIdx = TERM_ORDER.indexOf(nextName)
    usedIsYangDun = nextIdx >= 0 && nextIdx < 12

    if (daysFromNextFuTou < 5) {
      yuan = '上'; yuanIndex = 0
    } else if (daysFromNextFuTou < 10) {
      yuan = '中'; yuanIndex = 1
    } else {
      yuan = '下'; yuanIndex = 2
    }
  } else {
    usedTermName = prevName
    const prevIdx = TERM_ORDER.indexOf(prevName)
    usedIsYangDun = prevIdx >= 0 && prevIdx < 12

    if (daysFromFuTou < 5) {
      yuan = '上'; yuanIndex = 0
    } else if (daysFromFuTou < 10) {
      yuan = '中'; yuanIndex = 1
    } else {
      yuan = '下'; yuanIndex = 2
    }
  }

  // 从局数表中查找
  const juTable = usedIsYangDun ? YANG_DUN_JU : YIN_DUN_JU
  const juArr = juTable[usedTermName]

  if (!juArr) {
    throw new Error(`未找到节气 "${usedTermName}" 对应的局数表`)
  }

  const juNum = juArr[yuanIndex]

  return {
    isYangDun: usedIsYangDun,
    juNum,
    currentTerm: usedTermName,
    yuan,
  }
}
