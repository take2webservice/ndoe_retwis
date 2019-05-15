const RedisService = include('Services/RedisService')
const Utility = include('Utils/Utility')

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

  static async isLoggedIn(secret) {
    if (Utility.isBlank(secret)) return null
    const user = await this.currentUser(secret)
    if (user !== null) return true
    return false
  }

  static async getUserById(id) {
    if (Utility.isBlank(id)) throw new Error('userId not found')
    const redis = await RedisService.getConnection()
    const redisUser = await redis.hgetall(`user:${id}`)
    if (redisUser === null) {
      RedisService.relaseConnection(redis)
      return null
    }
    RedisService.relaseConnection(redis)
    return new User(id, redisUser.username, redisUser.password, redisUser.auth)
  }

  static async getIdByName(name) {
    if (Utility.isBlank(name)) throw new Error('name not found')
    const redis = await RedisService.getConnection()
    const id = await redis.hget(`users`, name)
    RedisService.relaseConnection(redis)
    return id
  }

  static async getUserByName(name) {
    if (Utility.isBlank(name)) throw new Error('name not found')
    const id = await this.getIdByName(name)
    const user = await this.getUserById(id)
    return user
  }

  static async getIdBySecret(secret) {
    if (Utility.isBlank(secret)) throw new Error('secret not found')
    const redis = await RedisService.getConnection()
    const id = await redis.hget('auths', secret)
    RedisService.relaseConnection(redis)
    return id
  }

  static async currentUser(secret) {
    if (Utility.isBlank(secret)) return null
    const userId = await this.getIdBySecret(secret)
    const user = await this.getUserById(userId)
    if (secret === user.getAuth()) return user
    return null
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

  static async registUser(userName, userId, currentTime, password, newSecret) {
    const redis = await RedisService.getConnection()
    redis.hset('users', userName, userId)
    redis.zadd('users_by_time', currentTime, userName)
    redis.hmset(`user:${userId}`, {
      userid: userId,
      username: userName,
      password: password,
      auth: newSecret,
    })
    redis.hset('auths', newSecret, userId)
    RedisService.relaseConnection(redis)
  }

  static async getNewUserId() {
    const redis = await RedisService.getConnection()
    const userId = await redis.incr('next_user_id')
    RedisService.relaseConnection(redis)
    return userId
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

  static async userExists(name) {
    if (Utility.isBlank(name)) throw new Error('name not found')
    const id = await this.getIdByName(name)
    return id !== null
  }
}
