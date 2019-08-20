const path = require('path')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const { alias, mixinsList } = require('./config.js')

const entry = {}
mixinsList.forEach(file => {
  file = path.basename(file, '.js')
  entry[file] = path.resolve(__dirname, `../src/mixins/${file}.js`)
})

module.exports = {
  mode: 'production',
  entry,
  output: {
    path: path.resolve(process.cwd(), './lib/mixins'),
    publicPath: '/dist/',
    filename: '[name].js',
    chunkFilename: '[id].js',
    libraryTarget: 'commonjs'
  },
  resolve: {
    extensions: ['.js'],
    alias,
    modules: ['node_modules']
  },
  optimization: {
    minimize: false
  },
  module: {
    rules: [
      {
        test: /\.(jsx?|babel|es6)$/,
        include: process.cwd(),
        loader: 'babel-loader'
      }
    ]
  },
  plugins: [new ProgressBarPlugin()]
}
