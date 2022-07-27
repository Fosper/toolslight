
const toolslight = require('../index.js')
const { readFileSync } = require('fs')

/*
    Example:
    console.log(toolslight.readFileSync('/srv/project/file.txt').data) // Returns string: data of file
    console.log(toolslight.readFileSync({initiator: 'Parent', file: '/srv/project/file.txt', encode: 'utf-8'}).data) // Returns string: data of file
*/

toolslight.readFileSync = function(customOptions = {}) {
    let me = 'toolslight.readFileSync'

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
        file: '',
        encode: 'utf-8',
    }

    let defaultOptionsAvailableTypes = {
        initiator: ['[object String]'],
        file: ['[object String]'],
        encode: ['[object String]']
    }

    let defaultOptionsAvailableValues = {}

    let defaultValue = {
        name: 'file',
        position: 1
    }

    me = (customOptions.initiator && Object.prototype.toString.call(customOptions.initiator) === '[object String]') ? customOptions.initiator + '->' + me : me

    let options = this.getOptions(me, customOptions, defaultOptions, defaultOptionsAvailableTypes, defaultOptionsAvailableValues, defaultValue, result.stackTrace)

    if (customOptions.initiator && Object.prototype.toString.call(customOptions.initiator) !== '[object String]') {
        result.error = {
            code: 'INCORRECT_OPTIONS',
            message: me + 'Error: custom option \'initiator\' can\'t be type of ' + Object.prototype.toString.call(customOptions.initiator) + '\'. Available types for this variable: \'[object String]\'.'
        }
        return result
    }
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

    try {
        let fileData = readFileSync(options.file, options.encode)
        resolve(fileData)
    } catch (e) {
        result.error = {
            code: 'INCORRECT_FILE_PATH',
            message: `File not exists by path: ${options.file}`
        }
        resolve(result)
    }
    return
}