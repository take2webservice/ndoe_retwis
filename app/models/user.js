const RedisService = include('services/redis_service')

module.exports = class User {
  constructor(id, name, password, auth) {
    this.id =  Number(id)
    this.name = name
    this.password = password
    this.auth = auth
  }
  get id(){
    return this._id
  }
  set id(id){
    return this._id = Number(id)
  }

  get name(){
    return this._name
  }
  set name(name){
    return this._name = name
  }

  get password(){
    return this._password
  }
  set password(password){
    return this._password = password
  }

  get auth(){
    return this._auth
  }
  set auth(auth){
    return this._auth = auth
  }

  async followersCount() {
    const redis = await RedisService.getConnection()
    const followers = await redis.zcard(`followers:${this.id}`)
    RedisService.relaseConnection(redis)
    return followers === null ? 0 : followers
  }

  async followingCount() {
    const redis = await RedisService.getConnection()
    const following = await redis.zcard(`folloing:${this.id}`)
    RedisService.relaseConnection(redis)
    return following === null ? 0 : following
  }

  async follow(id) {
    const redis = await RedisService.getConnection()
    const currentTime = new Date().getTime()
    await redis.zadd(`followers:${id}`, currentTime, this.id)
    await redis.zadd(`following:${this.id}`, currentTime, id)
    RedisService.relaseConnection(redis)
  }

  async unfollow(id) {
    const redis = await RedisService.getConnection()
    await redis.zrem(`followers:${id}`, this.id)
    await redis.zrem(`following:${this.id}`, id)
    RedisService.relaseConnection(redis)
  }

  async isFollowing(id) {
    const redis = await RedisService.getConnection()
    const following = await redis.zscore(`folloing:${this.id}`, id)
    RedisService.relaseConnection(redis)
    return following === null ? false : true
  }

  async isFollowers(id) {
    const redis = await RedisService.getConnection()
    const followers = await redis.zscore(`followers:${this.id}`, id)
    RedisService.relaseConnection(redis)
    return followers === null ? false : true
  }

  async doLogin(newSecret) {
    const redis = await RedisService.getConnection()
    redis.hdel('auths', this.auth)
    redis.hmset(`user:${this.id}`, {
      userid: this.id,
      username: this.name,
      password: this.password,
      auth: newSecret,
    })
    redis.hset('auths', newSecret, this.id)
    RedisService.relaseConnection(redis)
  }

  async doLgout() {
    const redis = await RedisService.getConnection()
    redis.hdel('auths', this.auth)
    RedisService.relaseConnection(redis)
  }
}
