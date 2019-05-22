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
    const redis = await redisConnectionPool.connect()
    const followers = await redis.zcard(`followers:${this.id}`)
    redisConnectionPool.relaseConnection(redis)
    return followers || 0
  }

  async followingCount() {
    const redis = await redisConnectionPool.connect()
    const following = await redis.zcard(`folloing:${this.id}`)
    redisConnectionPool.relaseConnection(redis)
    return following || 0
  }

  async follow(id) {
    const redis = await redisConnectionPool.connect()
    const currentTime = new Date().getTime()
    await redis.zadd(`followers:${id}`, currentTime, this.id)
    await redis.zadd(`following:${this.id}`, currentTime, id)
    redisConnectionPool.relaseConnection(redis)
  }

  async unfollow(id) {
    const redis = await redisConnectionPool.connect()
    await redis.zrem(`followers:${id}`, this.id)
    await redis.zrem(`following:${this.id}`, id)
    redisConnectionPool.relaseConnection(redis)
  }

  async isFollowing(id) {
    const redis = await redisConnectionPool.connect()
    const following = await redis.zscore(`folloing:${this.id}`, id)
    redisConnectionPool.relaseConnection(redis)
    return !!following
  }

  async isFollowers(id) {
    const redis = await redisConnectionPool.connect()
    const followers = await redis.zscore(`followers:${this.id}`, id)
    redisConnectionPool.relaseConnection(redis)
    return !!followers
  }

  async doLogin(newSecret) {
    const redis = await redisConnectionPool.connect()
    redis.hdel('auths', this.auth)
    redis.hmset(`user:${this.id}`, {
      userid: this.id,
      username: this.name,
      password: this.password,
      auth: newSecret,
    })
    redis.hset('auths', newSecret, this.id)
    redisConnectionPool.relaseConnection(redis)
  }

  async doLgout() {
    const redis = await redisConnectionPool.connect()
    redis.hdel('auths', this.auth)
    redisConnectionPool.relaseConnection(redis)
  }
}
