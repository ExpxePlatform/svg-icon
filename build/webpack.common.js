const path = require('path')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const { alias, externals, name } = require('./config.js')

module.exports = {
  mode: 'production',
  entry: {
    app: ['./src/index.js']
  },
  output: {
    path: path.resolve(process.cwd(), './lib'),
    publicPath: '/dist/',
    filename: `${name}.common.js`,
    chunkFilename: '[id].js',
    libraryExport: 'default',
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
