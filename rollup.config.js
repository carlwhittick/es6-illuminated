import babel from 'rollup-plugin-babel'
import eslint from 'rollup-plugin-eslint'

export default {
    entry: './src/illuminated.js',
    output: {
        file: './dist/illuminated.js',
        format: 'umd',
    },
    moduleName: 'illuminated',
    sourceMap: 'inline',
    plugins: [
        eslint(),
        babel({
            exclude: 'node_modules/**'
        })
    ]
}