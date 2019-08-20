const path = require('path')
const fs = require('fs')
const { name } = require('../package.json')
const nodeExternals = require('webpack-node-externals')
const mixinsList = fs.readdirSync(path.resolve(__dirname, '../src/mixins'))

const alias = {
  '@': path.resolve(__dirname, '../src')
}
alias[name] = path.resolve(__dirname, '../')

const externals = {
  vue: 'vue',
  'core-js': 'core-js',
  ...nodeExternals()
}
mixinsList.forEach(file => {
  file = path.basename(file, '.js')
  externals[`${name}/src/mixins/${file}`] = `${name}/lib/mixins/${file}`
})

module.exports = {
  alias,
  externals,
  mixinsList
}
