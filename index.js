class Toolslight {
    static UTC = 0

    static setUTC(data = 0) {
        this.UTC = data
    }
}

module.exports = Toolslight

require('./Methods/arraysMerge.js')
require('./Methods/getDate.js')
require('./Methods/getDay.js')
require('./Methods/getDayOfWeek.js')
require('./Methods/getHash.js')
require('./Methods/getHour.js')
require('./Methods/getMinute.js')
require('./Methods/getMonth.js')
require('./Methods/getSecond.js')
require('./Methods/getTs.js')
require('./Methods/getYear.js')
require('./Methods/isEmpty.js')
require('./Methods/jsonToObject.js')
require('./Methods/randInt.js')
require('./Methods/request.js')
require('./Methods/sleep.js')
require('./Methods/to.js')
require('./Methods/uniqid.js')