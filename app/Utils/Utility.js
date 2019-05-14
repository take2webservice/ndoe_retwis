const RedisService = include('Services/RedisService')

module.exports = class Utility {
  static isBlank(str) {
    if (typeof str === 'undefined' || str === null || str.length === 0)
      return true
    return false
  }
  static getRandomStr(bystes = 8) {
    return require('crypto')
      .randomBytes(bystes)
      .toString('hex')
  }

  static parseCookie(req) {
    var result = {},
      cookieStr = req.headers.cookie
    cookieStr &&
      cookieStr.split('').forEach(function(cookie) {
        var parts = cookie.split('=')
        result[parts.shift().trim()] = decodeURI(parts.join('='))
      })
    return result
  }

  static async isLoggedIn(cookies) {
    const secret = cookies['auth']
    const userInfo = await this.userInfo(secret)
    if (userInfo !== null) return true
    return false
  }

  static async userInfo(secret) {
    if (this.isBlank(secret)) return null
    const redis = RedisService.start()
    const userId = await redis.hget('auths', secret)
    const userInfo = await redis.hgetall(`user:${userId}`)
    if (userInfo.auth === secret) return userInfo
    return null
  }

  static async userId(secret) {
    if (this.isBlank(secret)) return null
    const redis = RedisService.start()
    const userId = await redis.hget('auths', secret)
    return userId
  }

  static isTrue(str) {
    return str === 'true'
  }

  static isFalse(str) {
    return str === 'false'
  }

  static strElapsed(time) {
    const diff = new Date() - time
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

  static async followersCount(userId) {
    const redis = RedisService.start()
    const followers = await redis.zcard(`followers:${userId}`)
    return followers === null ? 0 : followers
  }

  static async followingCount(userId) {
    const redis = RedisService.start()
    const following = await redis.zcard(`folloing:${userId}`)
    return following === null ? 0 : following
  }
}
