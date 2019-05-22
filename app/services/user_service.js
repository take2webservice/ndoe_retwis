const path = require('path')
const { isBlank } = require(path.resolve('app/utils/utility'))
const User = require(path.resolve('app/models/user'))
const redisConnectionPool = require(path.resolve('app/redis/index'))

const getIdByName = async name => {
  if (isBlank(name)) throw new Error('name not found')
  const redis = await redisConnectionPool.connect()
  const id = await redis.hget(`users`, name)
  redisConnectionPool.relaseConnection(redis)
  return id
}

const getUserById = async id => {
  if (isBlank(id)) throw new Error('userId not found')
  const redis = await redisConnectionPool.connect()
  const redisUser = await redis.hgetall(`user:${id}`)
  if (redisUser === null) {
    redisConnectionPool.relaseConnection(redis)
    return null
  }
  redisConnectionPool.relaseConnection(redis)
  return new User(id, redisUser.username, redisUser.password, redisUser.auth)
}
const getIdBySecret = async secret => {
  if (isBlank(secret)) throw new Error('secret not found')
  const redis = await redisConnectionPool.connect()
  const id = await redis.hget('auths', secret)
  redisConnectionPool.relaseConnection(redis)
  return id
}

const getCurrentUser = async secret => {
  if (isBlank(secret)) return null
  const userId = await getIdBySecret(secret)
  const user = await getUserById(userId)
  if (secret === user.auth) return user
  return null
}

module.exports = {
  isLoggedIn: async secret => {
    if (isBlank(secret)) return false
    const user = await getCurrentUser(secret)
    return user !== null
  },
  getUserById: getUserById,
  getIdByName: getIdByName,
  getUserByName: async name => {
    if (isBlank(name)) throw new Error('name not found')
    const id = await getIdByName(name)
    const user = await getUserById(id)
    return user
  },
  getIdBySecret: getIdBySecret,
  getCurrentUser: getCurrentUser,
  registerUser: async (userName, userId, currentTime, password, newSecret) => {
    const redis = await redisConnectionPool.connect()
  
    redis.hset('users', userName, userId)
    redis.zadd('users_by_time', currentTime, userName)
    redis.hmset(`user:${userId}`, {
      userid: userId,
      username: userName,
      password: password,
      auth: newSecret,
    })
    redis.hset('auths', newSecret, userId)
    redisConnectionPool.relaseConnection(redis)
  },
  getNewUserId: async () => {
    const redis = await redisConnectionPool.connect()
    const userId = await redis.incr('next_user_id')
    redisConnectionPool.relaseConnection(redis)
    return userId
  },
  userExists: async name => {
    if (isBlank(name)) throw new Error('name not found')
    const id = await getIdByName(name)
    return id !== null
  },
}
