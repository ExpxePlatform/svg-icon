const { alias } = require('./build/config.js')

module.exports = {
  pages: {
    index: {
      entry: 'examples/main.js',
      template: 'examples/index.html',
      filename: 'index.html'
    }
  },
  configureWebpack: {
    resolve: {
      extensions: ['.js', '.vue', '.json'],
      alias
    }
  }
}
