const toolslight = require('../index.js')
const { createConnection } = require('net')

/*
    Example-1:
    let isInternetAvailable = await toolslight.isInternetAvailable()
    console.log(isInternetAvailable.data) // Returns boolean: is have internet connection

    Example-2:
    toolslight.isInternetAvailable().then((result) => {console.log(result.data)}) // Returns boolean: is have internet connection
*/

toolslight.isInternetAvailable = function(customOptions = {}) {
    let me = 'toolslight.isInternetAvailable'

    /*
        PREPARE:
    */

    let result = {
        data: null,
        error: null, // Codes: INCORRECT_OPTIONS
        stackTrace: []
    }

    let defaultOptions = {
        initiator: ''
    }

    let defaultOptionsAvailableTypes = {
        initiator: ['[object String]']
    }

    let defaultOptionsAvailableValues = {}

    let defaultValue = {
        name: '',
        position: 1
    }

    let options = this.getOptions(me, customOptions, defaultOptions, defaultOptionsAvailableTypes, defaultOptionsAvailableValues, defaultValue, result.stackTrace)

    return new Promise(async (resolve) => {
        if (!options) {
            result.error = {
                code: 'INCORRECT_OPTIONS',
                message: result.stackTrace[result.stackTrace.length - 1]
            }
            resolve(result)
            return
        }

        /*
            LOGIC:
        */

        let dnsHosts = [
            '8.8.8.8', // Google
            '1.1.1.1', // CloudFlare
            '208.67.222.222', // Cisco
            '9.9.9.9', // Quad9
            '8.8.4.4', // Google
            '1.0.0.1', // CloudFlare
            '208.67.220.220', // Cisco
            '149.112.112.112' // Quad9
        ]

        let isDnsServerAvailable = (host) => {
            return new Promise((resolve) => {
                const client = createConnection({ host, port: 53 }, () => {
                    client.end()
                    resolve(true)
                    return
                })

                client.setTimeout(2000)
        
                client.on('timeout', err => {
                    client.destroy()
                    resolve(false)
                    return
                })
        
                client.on('error', err => {
                    resolve(false)
                    return
                })
            })
        }

        for (let dnsHost of dnsHosts) {
            if (await isDnsServerAvailable(dnsHost)) {
                result.data = true
                resolve(result)
                return
            }
        }
        result.data = false
        resolve(result)
        return
    })
}