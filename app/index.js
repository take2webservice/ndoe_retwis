'use strict'
const http = require('http')
const urlLib = require('url')
const path = require('path')
const {index, generalTimeline, staticFile} = require(path.resolve('app/controllers/index_controller.js'))
const {post} = require(path.resolve('app/controllers/post_controller'))
const {follow, unfollow} = require(path.resolve('app/controllers/follow_controller'))
const {show} = require(path.resolve('app/controllers/profile_controller'))
const {login, logout, regist} = require(path.resolve('app/controllers/user_controller'))

const server = http.createServer()
server.on('request', async function(req, res) {
  const method = req.method
  const uri = urlLib.parse(req.url).pathname
  try {
    switch (uri) {
      case '/':
      case '/index':
        index(req, res)
        break
      case '/profile':
        switch (method) {
          case 'GET':
            show(req, res)
            break
        }
        break
      case '/register':
        switch (method) {
          case 'POST':
            regist(req, res)
            break
        }
        break
      case '/post':
        switch (method) {
          case 'POST':
            post(req, res)
            break
        }
        break
      case '/login':
        switch (method) {
          case 'POST':
            login(req, res)
            break
        }
        break
      case '/logout':
        switch (method) {
          case 'GET':
          case 'POST':
            logout(req, res)
            break
        }
        break
      case '/follow':
        switch (method) {
          case 'GET':
            follow(req, res)
            break
        }
        break
      case '/unfollow':
        switch (method) {
          case 'GET':
            unfollow(req, res)
            break
          }
        break
      case '/timeline':
        switch (method) {
          case 'GET':
            generalTimeline(req, res)
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
