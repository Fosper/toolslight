
const toolslight = require('../index.js')

toolslight.prototype.jsonToObject = function(value) {
    
    /*
        Returns object.

        Example:
        .jsonToObject({Name: 'Jack'})
    */

    try {
        return JSON.parse(value)
    } catch (e) {
        return {}
    }
}


