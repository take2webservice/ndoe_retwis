const path = require('path')
const redisConnectionPool = require(path.resolve('app/redis/index'))


module.exports = class User {
  constructor(id, name, password, auth) {
    this.id = Number(id)
    this.name = name
    this.password = password
    this.auth = auth
  }
  get id() {
    return this._id
  }
  set id(id) {
    return (this._id = Number(id))
  }

  get name() {
    return this._name
  }
  set name(name) {
    return (this._name = name)
  }

  get password() {
    return this._password
  }
  set password(password) {
    return (this._password = password)
  }

  get auth() {
    return this._auth
  }
  set auth(auth) {
    return (this._auth = auth)
  }

  async followersCount() {
    const self = this
    const followers = await redisConnectionPool.execute(
      (redis) => {
        return redis.zcard(`followers:${self.id}`)
      }
    )
    return followers || 0
  }

  async followingCount() {
    const self = this
    const following = await redisConnectionPool.execute(
      (redis) => {
        return redis.zcard(`folloing:${self.id}`)
      }
    )
    return following || 0
  }

  async follow(id) {
    const self = this
    await redisConnectionPool.execute(
      (redis) => {
        const currentTime = new Date().getTime()
        redis.zadd(`followers:${id}`, currentTime, self.id)
        redis.zadd(`following:${self.id}`, currentTime, id)
      }
    )
  }

  async unfollow(id) {
    const self = this
    await redisConnectionPool.execute(
      (redis) => {
        redis.zrem(`followers:${id}`, self.id)
        redis.zrem(`following:${self.id}`, id)
      }
    )
  }

  async isFollowing(id) {
    const self = this
    const following = await redisConnectionPool.execute(
      (redis) => {
        return redis.zscore(`folloing:${self.id}`, id)
      }
    )
    return !!following
  }

  async isFollowers(id) {
    const self = this
    const followers = await redisConnectionPool.execute(
      (redis) => {
        return redis.zscore(`followers:${self.id}`, id)
      }
    )
    return !!followers
  }

  async doLogin(newSecret) {
    const self = this
    await redisConnectionPool.execute(
      (redis) => {
        redis.hdel('auths', self.auth)
        redis.hmset(`user:${self.id}`, {
          userid: self.id,
          username: self.name,
          password: self.password,
          auth: newSecret,
        })
        redis.hset('auths', newSecret, self.id)
      }
    )
  }

  async doLgout() {
    const self = this
    await redisConnectionPool.execute(
      (redis) => {
        redis.hdel('auths', self.auth)
      }
    )
  }
}
