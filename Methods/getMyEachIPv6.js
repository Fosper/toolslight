const toolslight = require('../index.js')
const os = require('os')

/*
    Example:
    const toolslight = require('toolslight')
    console.log(toolslight.getMyEachIPv6().data) // Returns array: array of strings IPv6 for all network interfaces
    console.log(toolslight.getMyEachIPv6('ens3').data) // Returns array: array of strings IPv6 for network interface 'ens3'
    console.log(toolslight.getMyEachIPv6(['ens3', 'lo']).data) // Returns array: array of strings IPv6 for network interface 'ens3' and 'lo'
*/

toolslight.getMyEachIPv6 = function(customOptions = {}) {
    let me = 'toolslight.getMyEachIPv6'

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
        interfaces: []
    }

    let defaultOptionsAvailableTypes = {
        initiator: ['[object String]'],
        interfaces: ['[object String]', '[object Array]']
    }

    let defaultOptionsAvailableValues = {}

    let defaultValue = {
        name: 'interfaces',
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

    result.data = []
    let networkInterfaces = os.networkInterfaces()

    for (const networkInterface in networkInterfaces) {
        if (options.interfaces.length) {
            if (!options.interfaces.includes(networkInterface)) {
                continue
            }
        }

        for (let network of networkInterfaces[networkInterface]) {
            if (network.family === 'IPv6' && network.address) {
                result.data.push(network.address)
            }
        }
    }

   return result
}