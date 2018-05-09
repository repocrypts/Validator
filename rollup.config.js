import babel from 'rollup-plugin-babel'

var babelOptions = {
  presets: [
    ["env", {"modules": false}]
  ],
  exclude: 'node_modules/**',
  plugins: ['external-helpers']
}

export default {
  experimentalCodeSplitting: true,
  input: ['src/Validator.js', 'src/index.js'],
  output: {
    dir: 'dist',
    format: 'cjs'
  },
  plugins: [ babel(babelOptions) ]
}
