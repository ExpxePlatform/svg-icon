const fs = require('fs')
const path = require('path')

const isRuleFile = (file, { extname, exclude }) => {
  let result = true
  if (extname && extname.length) {
    result = extname.includes(path.extname(file))
  }
  if (result && exclude && typeof exclude.test === 'function') {
    result = !exclude.test(file)
  }
  return result
}

const travelDirectory = (dir, options = {}, callback) => {
  let pending
  let files = []

  const done = err => {
    err ? callback(err) : callback(null, files)
  }

  const getStatHandler = file => {
    return (err, stat) => {
      if (err) {
        return done(err)
      }

      if (stat.isDirectory() && options.depth) {
        travelDirectory(file, options, (err, result) => {
          if (err) {
            return done(err)
          }
          files = files.concat(result)
          if (!--pending) {
            done()
          }
        })
      } else if (stat.isFile() && isRuleFile(file, options)) {
        files.push(file)
        if (!--pending) {
          done()
        }
      } else {
        if (!--pending) {
          done()
        }
      }
    }
  }

  const onDirRead = (err, list) => {
    if (err) {
      return done(err)
    }

    pending = list.length
    if (!pending) {
      return done()
    }

    list.forEach(filename => {
      const file = path.join(dir, filename)
      fs.stat(file, getStatHandler(file))
    })
  }

  const onStat = (err, stat) => {
    if (err) {
      done(err)
    } else if (stat && stat.mode === 17115) {
      done()
    } else {
      fs.readdir(dir, onDirRead)
    }
  }

  try {
    fs.stat(dir, onStat)
  } catch (err) {
    done(err)
  }
}

const mkdirSync = dirname => {
  if (fs.existsSync(dirname)) {
    return true
  } else {
    if (mkdirSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname)
      return true
    }
  }
}

const readFile = filePath => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf-8', (err, data) =>
      err ? reject(err) : resolve(data)
    )
  })
}

const writeFile = (filePath, data) => {
  return new Promise((resolve, reject) => {
    mkdirSync(path.dirname(filePath))
    fs.writeFile(filePath, data, err => (err ? reject(err) : resolve(data)))
  })
}

module.exports.readFile = readFile

module.exports.writeFile = writeFile

module.exports.upperCamel = str => {
  return str
    .split('-')
    .map(word => word.replace(word[0], word[0].toUpperCase()))
    .join('')
}

module.exports.stingify = json => Promise.resolve(JSON.stringify(json, null, 2))

module.exports.getFileName = filePath =>
  path.basename(filePath).replace(path.extname(filePath), '')

module.exports.travelDirectory = (dir, options = {}) => {
  return new Promise((resolve, reject) => {
    if (typeof options === 'string') {
      options = {
        extname: [options]
      }
    }
    const config = Object.assign(
      {
        extname: [],
        depth: true,
        exclude: null
      },
      options
    )

    travelDirectory(dir, config, (err, files) => {
      err ? reject(err) : resolve(files)
    })
  })
}

const emit = function(data) {
  if (this.events.length) {
    const { event, args } = this.events.shift()
    if (typeof event === 'function') {
      const prams = typeof data === 'undefined' ? [args] : [data, args]
      event(...prams)
        .then(res => {
          emit.call(this, res)
        })
        .catch(this.state.catch)
    }
  } else if (typeof this.state.done === 'function') {
    this.state.done(data)
  }
}

module.exports.Icon = class {
  constructor(src, dist) {
    this.events = []
    this.state = {
      then: null,
      catch: null
    }

    setTimeout(() => {
      if (src) {
        this.pipe(
          readFile,
          src,
          true
        )
      }
      if (dist) {
        this.pipe(
          writeFile,
          dist
        )
      }
      emit.call(this)
    }, 0)
  }

  pipe(event, args, priority) {
    if (typeof event === 'function') {
      const ev = { event, args }
      priority ? this.events.unshift(ev) : this.events.push(ev)
    }
    return this
  }
  on(type, event) {
    if (type in this.state && typeof event === 'function') {
      this.state[type] = event
    }
    return this
  }
}
