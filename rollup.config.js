import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { uglify } from 'rollup-plugin-uglify';

export default {
    input: 'src/validator.js',
    output: {
        format: 'cjs',
        file: 'dist/Validator.js'
    },
    plugins: [
        resolve(),
        commonjs(),
        babel({
            babelrc: false,
            presets: [
                [
                    '@babel/preset-env',
                    {
                        modules: false,
                        targets: {
                            browsers: ['last 3 versions']
                        }
                    }
                ]
            ],
            exclude: ['node_modules/**']
        }),
        uglify()
    ]
};
