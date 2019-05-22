const path = require('path')
const RedisConnectionPool = require(path.resolve('app/redis/redis_connection_pool'))

require('dotenv').config({ path: path.resolve('app/.env') })

const userSetting = {
    REDIS_PORT: process.env.REDIS_PORT ? process.env.REDIS_PORT : 6379, // Redis port
    REDIS_HOST: process.env.REDIS_HOST ? process.env.REDIS_HOST : '127.0.0.1', // Redis host
    REDIS_IP_FAMILY: process.env.REDIS_IP_FAMILY
      ? process.env.REDIS_IP_FAMILY
      : 4, // 4 (IPv4) or 6 (IPv6)
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    
}
module.exports = new RedisConnectionPool(userSetting)