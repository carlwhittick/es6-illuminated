import babel from 'rollup-plugin-babel'
import eslint from 'rollup-plugin-eslint'
import { uglify } from 'rollup-plugin-uglify'
import copy from 'rollup-plugin-copy';

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
        }),
        uglify(),
        copy({
            './dist/illuminated.js': './docs/js/illuminated.js',
            verbose: true
        })
    ]
}