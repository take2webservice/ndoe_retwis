const fs = require('fs')
const ejs = require('ejs')

module.exports = class RenderService {
  static success(res, ejs_file, args) {
    res.statusCode = 200
    res.setHeader('Content-type', 'text/html')
    const template = fs.readFileSync(ejs_file, 'utf8')
    const html = ejs.render(template, args)
    res.write(html)
    res.end()
  }
}
