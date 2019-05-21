const RedisService = include('services/redis_service')
const {isBlank} = include('utils/utility')
const User = include('models/user')

const getIdByName = async(name) => {
  if (isBlank(name)) throw new Error('name not found')
  const redis = await RedisService.getConnection()
  const id = await redis.hget(`users`, name)
  RedisService.relaseConnection(redis)
  return id
}

const getUserById = async(id) => {
    if (isBlank(id)) throw new Error('userId not found')
    const redis = await RedisService.getConnection()
    const redisUser = await redis.hgetall(`user:${id}`)
    if (redisUser === null) {
      RedisService.relaseConnection(redis)
      return null
    }
    RedisService.relaseConnection(redis)
    return new User(id, redisUser.username, redisUser.password, redisUser.auth)
}
const getIdBySecret = async(secret) => {
    if (isBlank(secret)) throw new Error('secret not found')
    const redis = await RedisService.getConnection()
    const id = await redis.hget('auths', secret)
    RedisService.relaseConnection(redis)
    return id
}

const getCurrentUser = async(secret) => {
    if (isBlank(secret)) return null
    const userId = await getIdBySecret(secret)
    const user = await getUserById(userId)
    if (secret === user.getAuth()) return user
    return null
}

module.exports = {
  isLoggedIn: async (secret) => {
    if (isBlank(secret)) return null
    const user = await getCurrentUser(secret)
    if (user !== null) return true
    return false
  },
  getUserById: getUserById,
  getIdByName: getIdByName,
  getUserByName: async (name) => {
    if (isBlank(name)) throw new Error('name not found')
    const id = await getIdByName(name)
    const user = await getUserById(id)
    return user
  },
  getIdBySecret: getIdBySecret,
  getCurrentUser: getCurrentUser,
  registUser: async (userName, userId, currentTime, password, newSecret) => {
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
  },
  getNewUserId: async () => {
    const redis = await RedisService.getConnection()
    const userId = await redis.incr('next_user_id')
    RedisService.relaseConnection(redis)
    return userId
  },
  userExists: async (name) => {
    if (isBlank(name)) throw new Error('name not found')
    const id = await getIdByName(name)
    return id !== null
  }
}