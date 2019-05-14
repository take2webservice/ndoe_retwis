const url_lib = require('url')

module.exports = class HttpService {
  static getPostQuery(req) {
    let data = ''
    return new Promise(function(resolve) {
      req
        .on('data', function(chunk) {
          data += chunk
        })
        .on('end', function() {
          const result = {}
          data.split('&').forEach(function(part) {
            const item = part.split('=')
            result[item[0]] = decodeURIComponent(item[1])
          })
          resolve(result)
        })
    })
  }

  static getRequestParams(req) {
    const query = url_lib.parse(req.url).query
    const result = {}
    if (query === null) return result
    query.split('&').forEach(function(part) {
      const item = part.split('=')
      result[item[0]] = decodeURIComponent(item[1])
    })
    return result
  }

  static redirect(res, url) {
    res.writeHead(302, {
      Location: url,
    })
    res.end()
  }
}
