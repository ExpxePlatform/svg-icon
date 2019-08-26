const path = require('path')
const fs = require('fs')
const { name } = require('../package.json')

const alias = {
  '@': path.resolve(__dirname, '../src')
}
alias[name] = path.resolve(__dirname, '../')

const externals = {
  vue: 'vue'
}
const mixinsList = fs.readdirSync(path.resolve(__dirname, '../src/mixins'))
mixinsList.forEach(file => {
  file = path.basename(file, '.js')
  externals[`${name}/src/mixins/${file}`] = `${name}/lib/mixins/${file}`
})

const formatName = name => {
  return name.replace('@', '').replace(/\//g, '-')
}

module.exports = {
  alias,
  externals,
  mixinsList,
  name: formatName(name)
}
