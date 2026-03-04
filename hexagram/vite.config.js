import { resolve } from 'path'
import { fileURLToPath, URL } from 'node:url'

export default {
    base: '/hexagram/',
    resolve: {
        alias: {
            '@shared': fileURLToPath(new URL('../shared', import.meta.url)),
        },
    },
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                study: resolve(__dirname, 'study.html'),
            }
        }
    }
}
