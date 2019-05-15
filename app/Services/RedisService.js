var IORedis = require('ioredis')
// load connection
require('dotenv').config({ path: abs_path('/.env') })

module.exports = class RedisService {
  static start() {
    const args = {
      port: process.env.REDIS_PORT ? process.env.REDIS_PORT : 6379, // Redis port
      host: process.env.REDIS_HOST ? process.env.REDIS_HOST :'127.0.0.1', // Redis host
      family: process.env.REDIS_IP_FAMILY ? process.env.REDIS_IP_FAMILY : 4, // 4 (IPv4) or 6 (IPv6)
      db: 0,
    }
    if (process.env.REDIS_PASSWORD) {
      args.password = process.env.REDIS_PASSWORD
    }
    return new IORedis(args)
  }

  static close(redis) {
    redis.disconnect()
  }
}
