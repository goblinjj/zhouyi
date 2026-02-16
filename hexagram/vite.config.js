import { resolve } from 'path'

export default {
    base: '/hexagram/',
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                study: resolve(__dirname, 'study.html'),
            }
        }
    }
}
