const RedisService = include('services/redis_service')

module.exports = class User {
  constructor(id, name, password, auth) {
    let _id = Number(id)
    let _name = name
    let _password = password
    let _auth = auth

    this.setId = function(id) {
      _id = Number(id)
    }
    this.getId = function() {
      return _id
    }

    this.setName = function(name) {
      _name = name
    }
    this.getName = function() {
      return _name
    }

    this.setPassword = function(password) {
      _password = password
    }
    this.getPassword = function() {
      return _password
    }

    this.setAuth = function(auth) {
      _auth = auth
    }
    this.getAuth = function() {
      return _auth
    }
  }


  async followersCount() {
    const redis = await RedisService.getConnection()
    const followers = await redis.zcard(`followers:${this.getId()}`)
    RedisService.relaseConnection(redis)
    return followers === null ? 0 : followers
  }

  async followingCount() {
    const redis = await RedisService.getConnection()
    const following = await redis.zcard(`folloing:${this.getId()}`)
    RedisService.relaseConnection(redis)
    return following === null ? 0 : following
  }

  async follow(id) {
    const redis = await RedisService.getConnection()
    const currentTime = new Date().getTime()
    redis.zadd(`followers:${id}`, currentTime, this.getId())
    redis.zadd(`following:${this.getId()}`, currentTime, id)
    RedisService.relaseConnection(redis)
  }

  async unfollow(id) {
    const redis = await RedisService.getConnection()
    redis.zrem(`followers:${id}`, this.getId())
    redis.zrem(`following:${this.getId()}`, id)
    RedisService.relaseConnection(redis)
  }

  async isFollowing(id) {
    const redis = await RedisService.getConnection()
    const following = await redis.zscore(`folloing:${this.getId()}`, id)
    RedisService.relaseConnection(redis)
    return following === null ? false : true
  }

  async isFollowers(id) {
    const redis = await RedisService.getConnection()
    const followers = await redis.zscore(`followers:${this.getId()}`, id)
    RedisService.relaseConnection(redis)
    return followers === null ? false : true
  }

  async doLogin(newSecret) {
    const redis = await RedisService.getConnection()
    redis.hdel('auths', this.getAuth())
    redis.hmset(`user:${this.getId()}`, {
      userid: this.getId(),
      username: this.getName(),
      password: this.getPassword(),
      auth: newSecret,
    })
    redis.hset('auths', newSecret, this.getId())
    RedisService.relaseConnection(redis)
  }

  async doLgout() {
    const redis = await RedisService.getConnection()
    redis.hdel('auths', this.getAuth())
    RedisService.relaseConnection(redis)
  }
}
