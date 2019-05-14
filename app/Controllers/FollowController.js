const HttpService = include('Services/HttpService')
const RedisService = include('Services/RedisService')
const Utility = include('Utils/Utility')

module.exports = class FollowController {
  static async follow(req, res) {
    const isLoggedIn = await Utility.isLoggedIn(Utility.parseCookie(req))

    const userId = await Utility.userId(Utility.parseCookie(req).auth)
    const query = await HttpService.getRequestParams(req)
    if (
      !isLoggedIn ||
      Utility.isBlank(query.uid) ||
      Utility.isFalse(query.f) ||
      query.uid === userId
    ) {
      res.writeHead(302, {
        Location: 'http://localhost:8080/',
      })
      res.end()
      return
    }

    const redis = RedisService.start()
    const f = query.f
    const fuid = query.uid
    if (Utility.isTrue(f)) {
      redis.zadd(`followers:${fuid}`, new Date().getTime(), userId)
      redis.zadd(`following:${userId}`, new Date().getTime(), fuid)
    } else {
      redis.zrem(`followers:${fuid}`, userId)
      redis.zrem(`following:${userId}`, fuid)
    }
    const user = await redis.hgetall(`user:${fuid}`)
    res.writeHead(302, {
      //TODO ちゃんとuser_nameを渡すようにする
      Location: `/profile?u=${encodeURI(user.username)}`,
    })
    res.end()
  }
}
