import data from '@/data/index'

let groups = {}

for (var v of data) {
    let cTitle = v.category.title
    if (typeof groups[cTitle] === 'undefined') {
        groups[cTitle] = []
    }
    groups[cTitle].push(v)
}

export default groups
