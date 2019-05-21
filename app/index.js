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

const {index, generalTimeline, staticFile} = include('controllers/index_controller.js')
const {post} = include('controllers/post_controller.js')
const {follow, unfollow} = include('controllers/follow_controller.js')
const {show} = include('controllers/profile_controller.js')
const {login, logout, regist} = include('controllers/user_controller.js')

const server = http.createServer()
server.on('request', async function(req, res) {
  const method = req.method
  const uri = url_lib.parse(req.url).pathname
  try {
    switch (uri) {
      case '/':
      case '/index':
        await index(req, res)
        break
      case '/profile':
        switch (method) {
          case 'GET':
            await show(req, res)
            break
        }
        break
      case '/register':
        switch (method) {
          case 'POST':
            await regist(req, res)
            break
        }
        break
      case '/post':
        switch (method) {
          case 'POST':
            await post(req, res)
            break
        }
        break
      case '/login':
        switch (method) {
          case 'POST':
            await login(req, res)
            break
        }
        break
      case '/logout':
        switch (method) {
          case 'GET':
          case 'POST':
            await logout(req, res)
            break
        }
        break
      case '/follow':
        switch (method) {
          case 'GET':
            await follow(req, res)
            break
        }
        break
      case '/unfollow':
        switch (method) {
          case 'GET':
            await unfollow(req, res)
            break
          }
        break
      case '/timeline':
        switch (method) {
          case 'GET':
            await generalTimeline(req, res)
            break
        }
        break
      default:
        staticFile(req, res, uri)
    }
  } catch (e) {
    console.log(e)
    res.writeHead(500, { 'content-type': 'text/html' })
    res.write(`Internal ServerError: ${e.message}`)
    res.end()
  }
  return
})
server.on('error', function(error) {
  console.log(error)
})

server.listen(8080)
