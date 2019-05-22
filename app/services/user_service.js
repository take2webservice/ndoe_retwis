const path = require('path')
const { isBlank } = require(path.resolve('app/utils/utility'))
const User = require(path.resolve('app/models/user'))
const redisConnectionPool = require(path.resolve('app/redis/index'))

const getIdByName = async name => {
  const id = await redisConnectionPool.execute(
    (redis) => {
      if (isBlank(name)) throw new Error('name not found')
      return redis.hget(`users`, name)
    }
  )
  return id
}

const getUserById = async id => {
  if (isBlank(id)) throw new Error('userId not found')
  const redisUser = await redisConnectionPool.execute(
    async (redis) => {
      const redisUser = await redis.hgetall(`user:${id}`)
      if (redisUser === null) return null
      return redisUser
    }
  )
  return new User(id, redisUser.username, redisUser.password, redisUser.auth)
}
const getIdBySecret = async secret => {
  if (isBlank(secret)) throw new Error('secret not found')
  return await redisConnectionPool.execute(
    (redis) => {
      return redis.hget('auths', secret)
    }
  )
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
    await redisConnectionPool.execute(
      async (redis) => {
        await redis.hset('users', userName, userId)
        await redis.zadd('users_by_time', currentTime, userName)
        await redis.hmset(`user:${userId}`, {
          userid: userId,
          username: userName,
          password: password,
          auth: newSecret,
        })
        await redis.hset('auths', newSecret, userId)
      }
    )
  },
  getNewUserId: async () => {
    return await redisConnectionPool.execute(
      (redis) => {
        return redis.incr('next_user_id')
      }
    )
  },
  userExists: async name => {
    if (isBlank(name)) throw new Error('name not found')
    const id = await getIdByName(name)
    return id !== null
  },
}
