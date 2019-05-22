const urlLib = require('url')

module.exports = {
  getPostQuery: req => {
    return new Promise(function(resolve) {  
      let data = ''
      req
        .on('data', function(chunk) {
          data += chunk
        })
        .on('end', function() {
          const result = data.split('&')
            .map(part => part.split('='))
            .reduce((prev, [key, value]) => {
                return { ...prev, [key]: decodeURIComponent(value) }
                // ... is "spread syntax ""
            }, {})
          resolve(result)
        })
    })
  },
  getRequestParams: req => {
    const query = urlLib.parse(req.url).query
    const result = {}
    if (query === null) return result
    query.split('&').forEach(function(part) {
      const item = part.split('=')
      result[item[0]] = decodeURIComponent(item[1])
    })
    return result
  },
  getCookie: req => {
    const result = {}
    const cookieStr = req.headers.cookie
    if (!cookieStr) return result
    return cookieStr.split(' ').map(e => e.split('='))
    .reduce((prev, [key, value]) => {
      return {...prev, [key.trim()]: decodeURI(value.replace(/;\s*$/, ''))}
    }, {})
  },
  redirect: (res, url) => {
    res.writeHead(302, {
      Location: url,
    })
    res.end()
  },
  notAuth: (res, message) => {
    res.writeHead(401, { 'content-type': 'text/html' })
    res.write(message)
    res.end()
  },
}
