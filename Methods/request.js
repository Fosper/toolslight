const fs = require('fs')
const toolslight = require('../index.js')

toolslight.request = function(customOptions = {}) {

  /*

    Returns object:
    {
      request: {
        headers: (string)
        headersSize: (number)
        body: (string)
        bodySize: (number)
      },
      response: {
        headers: (string)
        headersSize: (number)
        body: (string)
        bodySize: (number)
      }
    }

    OR
    
    WebSocket connect (object)

    Example:
    let options = {
      method: 'GET', // Can be 'GET', 'POST', 'PUT', 'DELETE', 'CONNECT'.
      protocol: 'https', // Can be 'http', 'https', 'ws', 'wss'.
      host: 'google.com',
      port: 443,
      path: '/',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({field: '123'}),
      timeout: 5000, // In milliseconds (1000 = 1 second).
      max_body_size_bytes: 10240,
      saveTo: '', // If set full file path - create/replace file, and save body response to this file.
      errorPrefix: '' // Custom prefix for errors (can use project unique identifier).
    }

    let err, data
    [err, data] = await toolslight.request(options)
    if (err) {
      console.log(err)
      return
    }
    console.log(data)
  */

  return this.to(new Promise((resolve, reject) => {

    let result = {
      request: {
        headers: '',
        headersSize: 0,
        body: '',
        bodySize: 0
      },
      response: {
        headers: '',
        headersSize: 0,
        body: '',
        bodySize: 0
      }
    }

    let defaultOptions = {
      method: 'GET',
      protocol: 'https',
      host: 'google.com',
      port: 443,
      path: '/',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({field: '123'}),
      timeout: 5000,
      max_body_size_bytes: 10240,
      saveTo: '',
      errorPrefix: '' 
    }

    let options = {}

    for (let option of Object.keys(defaultOptions)) {
      if (!this.isEmpty(customOptions[option])) {
        options[option] = customOptions[option]
        continue
      }
      options[option] = defaultOptions[option]
    }

    console.log(JSON.stringify(options.headers))

    result.request.headers = options.headers
    result.request.headersSize = JSON.stringify(options.headers).length - 2
    result.request.body = options.body
    result.request.bodySize = options.body.length

    let library = false
    if (options.protocol === 'https') {
      library = require('https')
    } else if (options.protocol === 'http') {
      library = require('http')
    } else if (options.protocol === 'ws' || options.protocol === 'wss') {
      const WebSocket = require('ws')

      const ws = new WebSocket(options.protocol + '://' + options.host + options.path)

      resolve(ws)
      
      // ws.on('open', function open() {
      //   ws.send(options.body);
      // })
      
      // ws.on('message', function incoming(data) {
      //   result.response.body = data
      //   resolve(result)
      // })
    }

    if (!library) {
      result.response.body = options.errorPrefix + 'Toolslight (request): Incorrect protocol.'
      reject(result)
    }

    let file = {}
    if (!this.isEmpty(options.saveTo)) {
      file = fs.createWriteStream(options.saveTo);
    }

    let req = library.request({
      method: options.method,
      host: options.host,
      port: options.port,
      path: options.path,
      headers: options.headers,
      timeout: options.timeout,
      rejectUnauthorized: false,
      requestCert: true
    }, res => {
      res.on('data', (chunk) => {
          result.response.bodySize += chunk.length

          if (result.response.bodySize > options.max_body_size_bytes) {
              res.destroy()
              result.response.body = options.errorPrefix + 'Toolslight: Response body size more than ' + options.max_body_size_bytes + ' bytes.'
              reject(result)
          } else {
            result.response.body += chunk.toString()
          }
      })

      res.on('end', () => {
          resolve(result);
      })

      if (!this.isEmpty(options.saveTo)) {
        res.pipe(file)
      }
    })

    req.on('timeout', () => {
      result.response.body = options.errorPrefix + 'Toolslight: Post request timeout.'
      request.abort()
      resolve(result)
    })

    req.on('error', err => {
      if (!this.isEmpty(options.saveTo)) {
        fs.unlink(options.saveTo)
      }
      result.response.body = options.errorPrefix + err
      reject(result)
    })

    if (!this.isEmpty(options.saveTo)) {
      file.on('finish', () => {
        result.response.body = options.saveTo
        resolve(result)
      })

      file.on('error', err => {
        fs.unlink(options.saveTo)
        result.response.body = options.errorPrefix + err
        reject(result)
      })
    }

    req.write(options.body)

    req.end()
  }))
}