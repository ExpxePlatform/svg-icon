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
  } catch (e) {
    done(e)
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

module.exports.writeFile = (filePath, data) => {
  return new Promise((resolve, reject) => {
    mkdirSync(path.dirname(filePath))
    fs.writeFile(filePath, data, err => (err ? reject(err) : resolve(data)))
  })
}

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

module.exports.Icon = (() => {
  const Icon = function(src, dist) {
    this.events = []
    this.error = function() {}
    this.complete = function() {}

    setTimeout(() => {
      this.pipe(
        src => {
          return new Promise((resolve, reject) => {
            fs.readFile(src, 'utf-8', (err, data) => {
              err ? reject(err) : resolve(data)
            })
          })
        },
        true
      )
      this.pipe(data => {
        return new Promise((resolve, reject) => {
          mkdirSync(path.dirname(dist))
          fs.writeFile(dist, data, err => {
            err ? reject(err) : resolve(data)
          })
        })
      })
      this._emit(src)
    }, 0)
  }

  Icon.prototype = {
    _emit(args) {
      if (this.events.length) {
        const event = this.events.shift()
        if (typeof event === 'function') {
          event(args)
            .then(res => this._emit(res))
            .catch(err => this.error(err))
        }
      } else {
        if (typeof this.complete === 'function') {
          this.complete()
        }
      }
    },
    catch(callback) {
      if (typeof callback === 'function') {
        this.error = callback
      }
      return this
    },
    done(callback) {
      if (typeof callback === 'function') {
        this.complete = callback
      }
      return this
    },
    pipe(event, priority) {
      if (typeof event === 'function') {
        priority ? this.events.unshift(event) : this.events.push(event)
      }
      return this
    }
  }
  return Icon
})()
