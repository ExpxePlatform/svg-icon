const svgtofont = require('svgtofont')
const path = require('path')

/**
 * 将 svg 打包成字体库
 * see npm-svgtofont
 */
svgtofont({
  src: path.resolve(process.cwd(), 'svg/'),
  dist: path.resolve(process.cwd(), 'src/icon-fonts'),
  css: true
})
