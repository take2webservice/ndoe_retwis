'use strict'
const http = require('http')
const urlLib = require('url')
const path = require('path')
const { staticFile } = require(path.resolve('app/controllers/index_controller'))
const routes = require(path.resolve('app/routes.js'))
const RedisService = require(path.resolve('app/services/redis_service'))

const server = http.createServer()
server.on('request', async function(req, res) {
  const method = req.method
  const uri = urlLib.parse(req.url).pathname
  try {
    if (routes[uri] && routes[uri][method]) {
      routes[uri][method](req, res)
    } else {
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
  RedisService.closeConnection()
  console.log(error)
})

server.listen(8080)
