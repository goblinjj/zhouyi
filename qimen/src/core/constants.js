// 九宫环形队列（顺时针：坎艮震巽离坤兑乾）
export const RING_PALACES = [1, 8, 3, 4, 9, 2, 7, 6]

// 三奇六仪序列
export const STEMS_ORDER = ['戊', '己', '庚', '辛', '壬', '癸', '丁', '丙', '乙']

// 十天干
export const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']

// 十二地支
export const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

// 六甲旬首映射
export const XUN_SHOU_MAP = {
  '甲子': '戊', '甲戌': '己', '甲申': '庚',
  '甲午': '辛', '甲辰': '壬', '甲寅': '癸'
}

// 地支→宫位映射
export const BRANCH_PALACE = {
  '子': 1, '丑': 8, '未': 8, '寅': 3, '卯': 3,
  '辰': 4, '巳': 4, '午': 9, '申': 2, '酉': 7,
  '戌': 6, '亥': 6
}

// 九星本位
export const STAR_POSITIONS = {
  1: '天蓬', 8: '天任', 3: '天冲', 4: '天辅',
  9: '天英', 2: '天芮', 7: '天柱', 6: '天心', 5: '天禽'
}

// 九星环形顺序（天禽不在环上，跟天芮走）
export const STAR_RING = ['天蓬', '天任', '天冲', '天辅', '天英', '天芮', '天柱', '天心']

// 八门本位
export const GATE_POSITIONS = {
  1: '休门', 8: '生门', 3: '伤门', 4: '杜门',
  9: '景门', 2: '死门', 7: '惊门', 6: '开门'
}

// 八门环形顺序
export const GATE_RING = ['休门', '生门', '伤门', '杜门', '景门', '死门', '惊门', '开门']

// 八神环形顺序
export const GOD_RING = ['值符', '腾蛇', '太阴', '六合', '白虎', '玄武', '九地', '九天']

// 宫位名称
export const PALACE_NAMES = {
  1: '坎一宫', 2: '坤二宫', 3: '震三宫', 4: '巽四宫',
  5: '中五宫', 6: '乾六宫', 7: '兑七宫', 8: '艮八宫', 9: '离九宫'
}

// 宫位五行
export const PALACE_ELEMENTS = {
  1: '水', 2: '土', 3: '木', 4: '木',
  5: '土', 6: '金', 7: '金', 8: '土', 9: '火'
}

// 九宫格显示位置（CSS grid: row, col）洛书排列
export const PALACE_GRID = {
  4: { row: 1, col: 1 }, 9: { row: 1, col: 2 }, 2: { row: 1, col: 3 },
  3: { row: 2, col: 1 }, 5: { row: 2, col: 2 }, 7: { row: 2, col: 3 },
  8: { row: 3, col: 1 }, 1: { row: 3, col: 2 }, 6: { row: 3, col: 3 }
}

// 五行颜色
export const WUXING_COLORS = {
  '木': '#2e7d32', // 绿
  '火': '#c62828', // 红
  '土': '#b8860b', // 黄棕
  '金': '#bf6c00', // 金橙
  '水': '#1565c0', // 蓝
}

// 九星五行
export const STAR_ELEMENTS = {
  '天蓬': '水', '天任': '土', '天冲': '木', '天辅': '木',
  '天英': '火', '天芮': '土', '天柱': '金', '天心': '金', '天禽': '土'
}

// 八门五行
export const GATE_ELEMENTS = {
  '休门': '水', '生门': '土', '伤门': '木', '杜门': '木',
  '景门': '火', '死门': '土', '惊门': '金', '开门': '金'
}

// 八神五行
export const GOD_ELEMENTS = {
  '值符': '土', '腾蛇': '火', '太阴': '金', '六合': '木',
  '白虎': '金', '玄武': '水', '九地': '土', '九天': '火'
}

// 天干五行
export const STEM_ELEMENTS = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'
}

// 获取五行对应颜色
export function getWuxingColor(element) {
  return WUXING_COLORS[element] || '#3c2415'
}

// 六十甲子表
export const JIA_ZI_TABLE = (() => {
  const table = []
  for (let i = 0; i < 60; i++) {
    table.push(TIAN_GAN[i % 10] + DI_ZHI[i % 12])
  }
  return table
})()
