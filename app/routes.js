const path = require('path')
const { index, generalTimeline } = require(path.resolve(
  'app/controllers/index_controller.js'
))
const { show } = require(path.resolve('app/controllers/profile_controller'))
const { post } = require(path.resolve('app/controllers/post_controller'))
const { follow, unfollow } = require(path.resolve(
  'app/controllers/follow_controller'
))
const { login, logout, register } = require(path.resolve(
  'app/controllers/user_controller'
))

module.exports = {
  '/': { GET: index },
  '/index': { GET: index },
  '/profile': { GET: show },
  '/register': { POST: register },
  '/post': { POST: post },
  '/login': { POST: login },
  '/logout': { GET: logout },
  '/follow': { GET: follow },
  '/unfollow': { GET: unfollow },
  '/timeline': { GET: generalTimeline },
}
