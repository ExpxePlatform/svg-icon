const path = require('path')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const entry = require('../components.json')
const { alias, externals } = require('./config.js')

module.exports = {
  mode: 'production',
  entry,
  output: {
    path: path.resolve(process.cwd(), './lib'),
    publicPath: '/dist/',
    filename: '[name].js',
    chunkFilename: '[id].js',
    libraryTarget: 'commonjs2'
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias,
    modules: ['node_modules']
  },
  externals,
  performance: {
    hints: false
  },
  stats: 'none',
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
