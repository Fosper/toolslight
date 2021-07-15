const toolslight = require('../index.js')
const { createHash } = require('crypto')
const { Readable } = require('stream')

/*
    Example-1:
    let hash
    hash = await toolslight.getHash('Hi')
    console.log(hash.data) // Returns string: 3639efcd08abb273b1619e82e78c29a7df02c1051b1820e99fc395dcaa3326b8
    hash = await toolslight.getHash({data: 'Hi', type: 'sha256', format: 'hex'})
    console.log(hash.data) // Returns string: 3639efcd08abb273b1619e82e78c29a7df02c1051b1820e99fc395dcaa3326b8
    hash = await toolslight.getHash({data: fs.createReadStream('/srv/project/file.txt'), type: 'sha256', format: 'base64'})
    console.log(hash.data) // Returns string: base64 encoded file hash

    Example-2:
    toolslight.getHash('Hi').then((data) => {console.log(data.data)}) // Returns string: 3639efcd08abb273b1619e82e78c29a7df02c1051b1820e99fc395dcaa3326b8
    toolslight.getHash({data: 'Hi', type: 'sha256', format: 'hex'}).then((data) => {console.log(data.data)}) // Returns string: 3639efcd08abb273b1619e82e78c29a7df02c1051b1820e99fc395dcaa3326b8
    toolslight.getHash({data: fs.createReadStream('/srv/project/file.txt'), type: 'sha256', format: 'base64'}).then((data) => {console.log(data.data)}) // Returns string: base64 encoded file hash
*/

toolslight.getHash = async function(customOptions = {}) {
    let me = 'toolslight.getHash'

    /*
        PREPARE:
    */

    let result = {
        data: null,
        error: null, // Codes: INCORRECT_OPTIONS
        stackTrace: []
    }

    let defaultOptions = {
      initiator: '',
      type: 'sha256',
      data: '',
      format: 'hex'
    }

    let defaultOptionsAvailableTypes = {
        initiator: ['[object String]'],
        type: ['[object String]'],
        data: ['[object Boolean]', '[object Number]', '[object String]', 'instanceof Readable'],
        format: ['[object String]']
    }

    let defaultOptionsAvailableValues = {}

    let defaultValue = {
        name: 'data',
        position: 1
    }

    let options = this.getOptions(me, customOptions, defaultOptions, defaultOptionsAvailableTypes, defaultOptionsAvailableValues, defaultValue, result.stackTrace)

    if (!options) {
        result.error = {
            code: 'INCORRECT_OPTIONS',
            message: result.stackTrace[result.stackTrace.length - 1]
        }
        return result
    }

    /*
        LOGIC:
    */

    let hash = createHash(options.type)
    return new Promise((resolve) => {
      if (options.data instanceof Readable) {
        options.data.on('readable', () => {
          let data = options.data.read()
          if (data)
            hash.update(data)
          else {
            result.data = hash.digest(options.format)
            resolve(result)
            return
          }
        })
      } else {
        result.data = hash.update(options.data.toString()).digest(options.format)
        resolve(result)
        return
      }
    })
}