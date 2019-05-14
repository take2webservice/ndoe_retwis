'use strict'

global.base_dir = __dirname
global.abs_path = function(path) {
  return base_dir + path
}
global.include = function(file) {
  return require(abs_path('/' + file))
}

const http = require('http')
const url_lib = require('url')

const IndexController = include('Controllers/IndexController.js')
const RegisterController = include('Controllers/RegisterController.js')
const PostController = include('Controllers/PostController.js')
const LoginController = include('Controllers/LoginController.js')
const FollowController = include('Controllers/FollowController.js')
const ProfileController = include('Controllers/ProfileController.js')

const server = http.createServer()
server.on('request', async function (req, res) {
  const method = req.method
  const uri = url_lib.parse(req.url).pathname
  try {
    switch (uri) {
      case '/':
      case '/index':
        await IndexController.index(req, res)
        break
      case '/register':
        switch (method) {
          case 'POST':
          case 'GET':
            await RegisterController.save(req, res)
            break
        }
        break
      case '/post':
        switch (method) {
          case 'POST':
            await PostController.save(req, res)
            break
        }
        break
      case '/login':
        switch (method) {
          case 'POST':
            await LoginController.doLogin(req, res)
            break
        }
        break
      case '/logout':
        switch (method) {
          case 'GET':
          case 'POST':
            await LoginController.doLogout(req, res)
            break
        }
        break
      case '/follow':
        switch (method) {
          case 'GET':
          case 'POST':
            await FollowController.follow(req, res)
            break
        }
        break
      case '/profile':
        switch (method) {
          case 'GET':
            await ProfileController.show(req, res)
            break
        }
        break
      default:
        IndexController.staticFile(req, res, uri)
    }
  } catch (e) {
    console.log(e)
    res.writeHead(500, { 'content-type': 'text/html' })
    res.write('Internal ServerError')
    res.end()
  }
  return
})
server.on('error', function(error) {
  console.log(error)
})

server.listen(8080)