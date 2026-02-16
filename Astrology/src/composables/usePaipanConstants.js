// Constants and lookup tables for Paipan chart

export const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
export const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
export const PALACE_SEQ = ['命', '兄', '夫', '子', '财', '疾', '迁', '友', '官', '田', '福', '父']

export const PALACE_SHORT = {
    '命宫': '命', '兄弟': '兄', '夫妻': '夫', '子女': '子', '财帛': '财', '疾厄': '疾',
    '迁移': '迁', '交友': '友', '仆役': '友', '官禄': '官', '田宅': '田', '福德': '福', '父母': '父',
}

export const MUTAGEN_LABELS = ['禄', '权', '科', '忌']

export const SCOPE_COLORS = {
    'ben': '#d32f2f',
    'da': '#388e3c',
    'yi': '#1976d2',
    'yue': '#7b1fa2'
}

export const MUTAGEN_Type_COLORS = { '禄': '#009900', '权': '#cc6600', '科': '#6633cc', '忌': '#cc0000' }

export const SIHUA_TABLE = {
    '甲': ['廉贞', '破军', '武曲', '太阳'],
    '乙': ['天机', '天梁', '紫微', '太阴'],
    '丙': ['天同', '天机', '文昌', '廉贞'],
    '丁': ['太阴', '天同', '天机', '巨门'],
    '戊': ['贪狼', '太阴', '右弼', '天机'],
    '己': ['武曲', '贪狼', '天梁', '文曲'],
    '庚': ['太阳', '武曲', '太阴', '天同'],
    '辛': ['巨门', '太阳', '文曲', '文昌'],
    '壬': ['天梁', '紫微', '左辅', '武曲'],
    '癸': ['破军', '巨门', '太阴', '贪狼'],
}

export const TIME_OPTIONS = [
    { value: 0, label: '早子时 (23:00-00:00)' },
    { value: 1, label: '丑时 (01:00-03:00)' },
    { value: 2, label: '寅时 (03:00-05:00)' },
    { value: 3, label: '卯时 (05:00-07:00)' },
    { value: 4, label: '辰时 (07:00-09:00)' },
    { value: 5, label: '巳时 (09:00-11:00)' },
    { value: 6, label: '午时 (11:00-13:00)' },
    { value: 7, label: '未时 (13:00-15:00)' },
    { value: 8, label: '申时 (15:00-17:00)' },
    { value: 9, label: '酉时 (17:00-19:00)' },
    { value: 10, label: '戌时 (19:00-21:00)' },
    { value: 11, label: '亥时 (21:00-23:00)' },
    { value: 12, label: '晚子时 (00:00-01:00)' },
]

export const BRANCH_GRID = {
    '巳': { r: 1, c: 1 }, '午': { r: 1, c: 2 }, '未': { r: 1, c: 3 }, '申': { r: 1, c: 4 },
    '辰': { r: 2, c: 1 }, '酉': { r: 2, c: 4 },
    '卯': { r: 3, c: 1 }, '戌': { r: 3, c: 4 },
    '寅': { r: 4, c: 1 }, '丑': { r: 4, c: 2 }, '子': { r: 4, c: 3 }, '亥': { r: 4, c: 4 },
}

export const MONTH_NAMES = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']

// Flying Si Hua background colors (softer, translucent)
export const FLYING_BG = {
    '禄': 'rgba(76,175,80,0.75)',
    '权': 'rgba(156,39,176,0.75)',
    '科': 'rgba(33,150,243,0.75)',
    '忌': 'rgba(244,67,54,0.75)'
}

// Helper functions
export function bIdx(b) { return BRANCHES.indexOf(b) }

export function yearSB(y) {
    return STEMS[((y - 4) % 10 + 10) % 10] + BRANCHES[((y - 4) % 12 + 12) % 12]
}

export function gridStyle(palace) {
    const g = BRANCH_GRID[palace.earthlyBranch]
    return g ? { 'grid-row': g.r, 'grid-column': g.c } : {}
}

export function bClass(b) {
    if (b === '庙' || b === '旺') return 'b-good'
    if (b === '陷' || b === '不') return 'b-bad'
    return 'b-mid'
}
