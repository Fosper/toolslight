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
      bodySizeLimit: 10240,
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
      bodySizeLimit: 10240,
      proxyHost: '',
      proxyPort: 8080,
      proxyUsername: '',
      proxyPassword: '',
      proxyTimeout: 5000,
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
    
    result.request.headers = options.headers
    result.request.headersSize = JSON.stringify(options.headers).length - 2
    result.request.body = options.body
    result.request.bodySize = options.body.length

    let library
    if (options.protocol === 'https') {
      library = require('https')
    } else if (options.protocol === 'http') {
      library = require('http')
    } else if (options.protocol === 'ws' || options.protocol === 'wss') {
      const WebSocket = require('ws')
      let wsUrl = options.protocol + '://' + options.host + ':' + options.port + options.path
      let wsOptions = {
        timeout: options.timeout,
        rejectUnauthorized: false
      }

      if (!this.isEmpty(options.proxyHost)) {
        const url = require('url')
        const HttpsProxyAgent = require('https-proxy-agent')

        let proxyUrl = 'http://' + options.proxyHost + ':' + options.proxyPort
        let agentOptions = url.parse(proxyUrl)
        agentOptions.timeout = options.timeout

        if (!this.isEmpty(options.proxyUsername) || !this.isEmpty(options.proxyPassword)) {
          agentOptions.headers = {}
          agentOptions.headers['Proxy-Authorization'] = 'Basic ' + Buffer.from(options.proxyUsername + ':' + options.proxyPassword).toString('base64')
        }

        let agent = new HttpsProxyAgent(agentOptions)
        wsOptions.agent = agent
      }
      let ws = new WebSocket(wsUrl, wsOptions)

      resolve(ws)

      // ws.on('open', function open() {
      //   ws.send(options.body);
      // })
      // ws.on('message', function incoming(data) {
      //   result.response.body = data
      //   resolve(result)
      // })
      return
    }

    if (this.isEmpty(library)) {
      reject(options.errorPrefix + 'Toolslight (request): Incorrect protocol.')
    }

    let file = {}
    if (!this.isEmpty(options.saveTo)) {
      file = fs.createWriteStream(options.saveTo);
    }

    let start = (requestOptions, connect = {}) => {
      var req = library.request(requestOptions, res => {
        res.setEncoding('utf8')
  
        res.on('data', (chunk) => {
            result.response.bodySize += chunk.length
  
            if (result.response.bodySize > options.bodySizeLimit) {
                res.destroy()
                reject(options.errorPrefix + 'Toolslight (request): Response body size more than ' + options.bodySizeLimit + ' bytes.')
            } else {
              result.response.body += chunk.toString()
            }
        })
  
        res.on('end', () => {
            if (!this.isEmpty(connect)) {
              connect.abort()
            }
            resolve(result);
        })
  
        if (!this.isEmpty(options.saveTo)) {
          res.pipe(file)
        }
      })
  
      req.on('timeout', () => {
        req.abort()
        if (!this.isEmpty(connect)) {
          connect.abort()
        }
        reject(options.errorPrefix + 'Toolslight (request): Post request timeout.')
      })
  
      req.on('error', err => {
        if (!this.isEmpty(options.saveTo)) {
          fs.unlink(options.saveTo)
        }
        if (!this.isEmpty(connect)) {
          connect.abort()
        }
        reject(options.errorPrefix + err)
      })
  
      if (!this.isEmpty(options.saveTo)) {
        file.on('finish', () => {
          if (!this.isEmpty(connect)) {
            connect.abort()
          }
          resolve(result)
        })
  
        file.on('error', err => {
          fs.unlink(options.saveTo)
          if (!this.isEmpty(connect)) {
            connect.abort()
          }
          reject(options.errorPrefix + err)
        })
      }
  
      req.write(options.body)
  
      req.end()
    }

    let requestOptions = {
      method: options.method,
      host: options.host,
      port: options.port,
      path: options.path,
      headers: options.headers,
      timeout: options.timeout,
      rejectUnauthorized: false
      // requestCert: true
    }

    if (!this.isEmpty(options.proxyHost)) {
      const http = require('http')

      let proxyRequestOptions = {
        host: options.proxyHost,
        port: options.proxyPort,
        method: 'CONNECT',
        path: options.host + ':' + options.port,
        timeout: options.proxyTimeout
      }

      if (!this.isEmpty(options.proxyUsername) || !this.isEmpty(options.proxyPassword)) {
        proxyRequestOptions.headers = {}
        proxyRequestOptions.headers['Proxy-Authorization'] = 'Basic ' + Buffer.from(options.proxyUsername + ':' + options.proxyPassword).toString('base64')
      }

      let connect = http.request(proxyRequestOptions).on('connect', function(res, socket, head) {
        requestOptions.socket = socket
        start(requestOptions, connect)
      }).on('timeout', () => {
        connect.abort()
        reject(options.errorPrefix + 'Toolslight (request): Proxy host timeout.')
      }).on('error', err => {
        connect.abort()
        reject(options.errorPrefix + err)
      }).end()
    } else {
      start(requestOptions)
    }
  }))
}