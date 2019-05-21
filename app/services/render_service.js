const fs = require('fs')
const ejs = require('ejs')

module.exports = {
  success: (res, ejsFile, args) => {
    res.statusCode = 200
    res.setHeader('Content-type', 'text/html')
    const template = fs.readFileSync(ejsFile, 'utf8')
    const html = ejs.render(template, args)
    res.write(html)
    res.end()
  },
}
