const RedisService = include('services/redis_service')
const {isBlank} = include('utils/utility')
const {getUserById} = include('services/user_service')

module.exports = class Post {
  constructor(id, user, time, body) {
    let _id = Number(id)
    let _user = user
    let _time = Number(time)
    let _body = body

    this.setId = function(id) {
      _id = Number(id)
    }
    this.getId = function() {
      return _id
    }

    this.setUser = function(user) {
      _user = user
    }
    this.getUser = function() {
      return _user
    }

    this.setTime = function(time) {
      _time = Number(time)
    }
    this.getTime = function() {
      return _time
    }

    this.setBody = function(body) {
      _body = body
    }
    this.getBody = function() {
      return _body
    }
  }

  strElapsed(currentTime) {
    const diff = (currentTime - this.getTime()) / 1000
    if (diff < 60) return `${diff} seconds`
    if (diff < 3600) {
      const min = Number.parseInt(diff / 60)
      return `${min} minute${min > 1 ? 's' : ''}`
    }
    if (diff < 3600 * 24) {
      const hour = Number.parseInt(diff / 3600)
      return `${hour} hour${hour > 1 ? 's' : ''}`
    }
    const day = Number.parseInt(diff / (3600 * 24))
    return `${day} hour${day > 1 ? 's' : ''}`
  }
}
