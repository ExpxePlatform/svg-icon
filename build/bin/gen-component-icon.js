const fs = require('fs')
const path = require('path')
const { render } = require('art-template')
const svgTojson = require('./svg-to-json')
const pkg = require('../../package.json')
const {
  travelDirectory,
  Icon,
  getFileName,
  upperCamel,
  stingify,
  writeFile,
  readFile
} = require('./utils')

/**
 * 设置 ICON 名称
 *
 * @param {String} name - icon name
 * @returns {Function}
 */
const setIconName = name => {
  return data => {
    if (data) {
      data.name = upperCamel(name)
    }
    return Promise.resolve(data)
  }
}

/**
 * 读取 SVG 生成 JSON 文件
 *
 * @param {Sting} src - svg 文件路径
 * @param {Sting} dist - json 文件存储路径
 * @returns {Promise}
 */
const generateJsonFile = (src, dist) => {
  return new Promise((resolve, reject) => {
    const name = getFileName(src)

    // 模拟 gulp,rx.js 流
    new Icon()
      .pipe(
        readFile,
        src
      )
      .pipe(svgTojson)
      .pipe(setIconName(name))
      .pipe(stingify)
      .pipe(
        (data, dist) => writeFile(dist, data),
        dist
      )
      .on('then', resolve)
      .on('catch', reject)
  })
}

/**
 * 读取模版文件
 * @param {Object} tempsPath - 模版路径
 * @returns {Object}
 * @example
 * readTemplatesFile({main:'./main.ejs'})
 */
const readTemplatesFile = tempsPath => {
  const result = {}
  Object.keys(tempsPath).forEach(item => {
    result[item] = fs.readFileSync(tempsPath[item], 'utf-8')
  })
  return result
}

/**
 * 将 svg 生成 vue component
 *
 * @param {Sting} dist -目标目录
 * @param {Array} files - 文个列表
 * @param {Object} temps - 模版文件
 * @returns {Promise}
 */
const generateVueComponent = (dist, files, temps) => {
  return new Promise((resolve, reject) => {
    // 使用递归遍历文件，以免占用过太内存
    // files.map 可能会过度消耗性能
    const next = (i = 0) => {
      const file = files[i]
      if (!file) {
        return resolve()
      }
      const basename = getFileName(file)
      const compPath = {
        index: path.join(dist, basename, 'index.js'),
        main: path.join(dist, basename, 'src/main.js'),
        json: path.join(dist, basename, 'src/index.json')
      }

      // 写入组件
      Promise.all([
        generateJsonFile(file, compPath.json), // svg json文件
        writeFile(compPath.main, temps.main), // 组件文件
        writeFile(compPath.index, temps.index) // 组件注册文件
      ])
        .then(() => {
          next(++i)
        })
        .catch(reject)
    }
    next()
  })
}

/**
 * 渲染模版文件（此函数需要优化，参数不合理）
 *
 * @param {Sting} dist - 目标地址
 * @param {Object} components  - 组件列表
 * @param {Object} templates - 模版列表
 * @returns {Promise}
 */
const renderTemplates = (dist, components, templates) => {
  const icons = Object.keys(components)
  if (icons.length) {
    const mixinPath = path.join(dist, 'mixins/icon.js')
    const indexPath = path.join(dist, 'index.js')
    const componentsPath = path.resolve(__dirname, '../../components.json')
    const exampleApp = path.resolve(__dirname, '../../examples/App.vue')
    const exampleIndex = path.resolve(__dirname, '../../examples/index.html')
    const exampleMain = path.resolve(__dirname, '../../examples/main.js')
    const renderData = {
      icons,
      upperCamel,
      name: pkg.name,
      version: pkg.version
    }

    return Promise.all([
      writeFile(componentsPath, JSON.stringify(components, null, 2)),
      writeFile(mixinPath, templates.mixin),
      writeFile(indexPath, render(templates.icons, renderData)),
      writeFile(exampleApp, render(templates.exampleApp, renderData)),
      writeFile(exampleIndex, render(templates.exampleIndex, renderData)),
      writeFile(exampleMain, render(templates.exampleMain, renderData))
    ])
  }
  return Promise.resolve()
}

const main = (src, dist) => {
  return new Promise((resolve, reject) => {
    const tempsPath = {
      main: path.resolve(__dirname, 'templates/main.ejs'),
      index: path.resolve(__dirname, 'templates/index.ejs'),
      mixin: path.resolve(__dirname, 'templates/mixin.ejs'),
      icons: path.resolve(__dirname, 'templates/icons.ejs'),
      exampleApp: path.resolve(__dirname, 'templates/examples/app.ejs'),
      exampleIndex: path.resolve(__dirname, 'templates/examples/index.ejs'),
      exampleMain: path.resolve(__dirname, 'templates/examples/main.ejs')
    }

    const templates = readTemplatesFile(tempsPath)
    templates.main = render(templates.main, { name: pkg.name })

    travelDirectory(src, '.svg')
      .then(files => {
        const components = {}
        files.forEach(file => {
          const basename = getFileName(file)
          components[basename] = `./src/${basename}/index.js`
        })

        Promise.all([
          generateVueComponent(dist, files, templates),
          renderTemplates(dist, components, templates)
        ])
          .then(resolve)
          .catch(reject)
      })
      .catch(reject)
  })
}

main(path.resolve(process.cwd(), 'svg'), path.resolve(process.cwd(), 'src'))
