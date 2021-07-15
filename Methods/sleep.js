const toolslight = require('../index.js')

/*
    Example-1:
    const toolslight = require('toolslight')
    await toolslight.sleep(2000)
    console.log('Message after 2 second.')

    Example-2:
    const toolslight = require('toolslight')
    toolslight.sleep(2000).then(() => {console.log('Message after 2 second.')})
*/

toolslight.sleep = function(customOptions = {}) {
    let me = 'toolslight.sleep'

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
        time: ''
    }

    let defaultOptionsAvailableTypes = {
        initiator: ['[object String]'],
        time: ['[object Number]']
    }

    let defaultOptionsAvailableValues = {}

    let defaultValue = {
        name: 'time',
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

    return new Promise(resolve => {
        if (!options) {
            result.error = {
                code: 'INCORRECT_OPTIONS',
                message: result.stackTrace[result.stackTrace.length - 1]
            }
            resolve(result)
        }

        /*
            LOGIC:
        */

        setTimeout(resolve, options.time)
    })
}