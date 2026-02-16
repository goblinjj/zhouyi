import data from '@/data/index'

let stars = {};

for (var v of data) {
    let cTitle = v.category.title
    if (typeof stars[cTitle] === 'undefined') {
        stars[cTitle] = [];
    }
    stars[cTitle].push(v)
}

export default stars;