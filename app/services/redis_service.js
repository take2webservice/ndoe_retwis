var IORedis = require('ioredis')
const genericPool = require("generic-pool");
require('dotenv').config({ path: abs_path('/.env') })

let myPool = undefined
module.exports = {
  getConnection: async () => {
    if (myPool === undefined) {
      const factory = {
        create: function() {
            const args = {
              port: process.env.REDIS_PORT ? process.env.REDIS_PORT : 6379, // Redis port
              host: process.env.REDIS_HOST ? process.env.REDIS_HOST :'127.0.0.1', // Redis host
              family: process.env.REDIS_IP_FAMILY ? process.env.REDIS_IP_FAMILY : 4, // 4 (IPv4) or 6 (IPv6)
              db: 0,
        
            }
            if (process.env.REDIS_PASSWORD) {
              args.password = process.env.REDIS_PASSWORD //RedisPassword
            }
            return new IORedis(args)
        },
        destroy: function(redis) {
            redis.disconnect()
        }
      }
      const opts = {
          max: Number(process.env.REDIS_MAX_CON_POOL) ? Number(process.env.REDIS_MAX_CON_POOL) :  10, // maximum size of the pool
          min: Number(process.env.REDIS_MIN_CON_POOL) ? Number(process.env.REDIS_MIN_CON_POOL) : 2 // minimum size of the pool
      }
      myPool = genericPool.createPool(factory, opts)
    }
    return await myPool.acquire()
  },
  relaseConnection: (redis) => {
    if (myPool === undefined) return
    myPool.release(redis) 
  },
  closeConnection: async () => {
    if (myPool === undefined) return
    await myPool.drain()
    await myPool.clear()
  }
}