const HttpService = include('Services/HttpService')
const RedisService = include('Services/RedisService')
const Utility = include('Utils/Utility')

module.exports = class LoginController {
  static async doLogin(req, res) {
    const query = await HttpService.getPostQuery(req)
    const userName = query.username
    const password = query.password
    let error = null
    // TODO password must be hashed
    if (Utility.isBlank(userName) || Utility.isBlank(password))
      error = 'username or password not found'

    const redis = RedisService.start()
    const userId = await redis.hget('users', userName)
    if (userId == null) error = 'user does not found'
    const user = await redis.hgetall(`user:${userId}`)
    if (user == null) error = 'user does not found'

    if (user.username === userName && user.password == password) {
      const authSecret = Utility.getRandomStr()
      redis.hdel('auths', user.secret)
      redis.hmset(`user:${userId}`, {
        username: userName,
        password: password,
        auth: authSecret,
      })
      redis.hset('auths', authSecret, userId)
      const currentTime = new Date().getTime()
      redis.zadd('users_by_time', currentTime, userName)

      // User registered! Login her / him.
      res.statusCode = 302
      res.setHeader('Set-Cookie', [
        `auth=${authSecret} expires=${new Date(
          currentTime + 3600 * 24 * 365
        ).toUTCString()}`,
      ])
      res.setHeader('Location', '/')
      res.end()
      return
    }

    res.writeHead(401, { 'content-type': 'text/html' })
    res.write(error)
    res.end()
  }

  static async doLogout(req, res) {
    const userId = await Utility.userId(Utility.parseCookie(req).auth)
    const redis = RedisService.start()
    const user = await redis.hgetall(`user:${userId}`)
    const secret = user.auth
    const currentTime = new Date().getTime()
    redis.hdel('auths', secret)
    res.statusCode = 302
    res.setHeader('Set-Cookie', [
      `auth='' expires=${new Date(
        currentTime - 3600 * 24 * 365
      ).toUTCString()}`,
    ])
    res.setHeader('Location', '/')
    res.end()
  }
}
