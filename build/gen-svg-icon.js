const fs = require('fs')
const path = require('path')
const { render } = require('art-template')
const svgTojson = require('./svg-to-json')
const packageName = require('../package.json').name
const {
  travelDirectory,
  Icon,
  getFileName,
  upperCamel,
  stingify,
  writeFile
} = require('./utils')

const setIconName = name => {
  return data => {
    if (data) {
      data.name = upperCamel(name)
    }
    return Promise.resolve(data)
  }
}

const generateJsonFile = (src, dist) => {
  return new Promise((resolve, reject) => {
    const name = getFileName(src)
    new Icon(src, dist)
      .pipe(svgTojson)
      .pipe(setIconName(name))
      .pipe(stingify)
      .done(resolve)
      .catch(reject)
  })
}

const readTemplatesFile = () => {
  const result = {}
  const tempPath = {
    main: path.resolve(__dirname, 'templates/main.temp'),
    index: path.resolve(__dirname, 'templates/index.temp'),
    mixin: path.resolve(__dirname, 'templates/mixin.temp'),
    icons: path.resolve(__dirname, 'templates/icons.temp')
  }
  Object.keys(tempPath).forEach(item => {
    result[item] = fs.readFileSync(tempPath[item], 'utf-8')
  })
  result.main = render(result.main, { packageName })

  return result
}

const generateVueComponent = (src, dist, temps) => {
  return new Promise((resolve, reject) => {
    travelDirectory(src, '.svg').then(files => {
      const icons = {}
      const next = (i = 0) => {
        const file = files[i]
        if (!file) {
          return resolve(icons)
        }
        const basename = getFileName(file)
        const compPath = {
          index: path.join(dist, basename, 'index.js'),
          main: path.join(dist, basename, 'src/main.js'),
          json: path.join(dist, basename, 'src/index.json')
        }

        Promise.all([
          generateJsonFile(file, compPath.json),
          writeFile(compPath.main, temps.main),
          writeFile(compPath.index, temps.index)
        ])
          .then(() => {
            icons[basename] = `./src/${basename}/index.js`
            next(++i)
          })
          .catch(reject)
      }
      next()
    })
  })
}

const main = (src, dist) => {
  const templates = readTemplatesFile()

  generateVueComponent(src, dist, templates).then(components => {
    const icons = Object.keys(components)
    if (icons.length) {
      const mixinPath = path.join(dist, 'mixins/icon.js')
      const indexPath = path.join(dist, 'index.js')
      writeFile(
        path.resolve(__dirname, '../components.json'),
        JSON.stringify(components, null, 2)
      )
      writeFile(mixinPath, templates.mixin)
      writeFile(indexPath, render(templates.icons, { icons, upperCamel }))
    }
  })
}

main(path.resolve(__dirname, '../svg'), path.resolve(__dirname, '../src'))
