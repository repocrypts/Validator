import {join} from 'path'

const include = join(__dirname, 'src')

export default {
    entry: './src/Validator',
    output: {
        path: join(__dirname, 'dist'),
        libraryTarget: 'umd',
        library: 'Validator',
    },
    devtool: 'source-map',
    module: {
        loaders: [
            {test: /\.js$/, loader: 'babel', include}
        ]
    }
}