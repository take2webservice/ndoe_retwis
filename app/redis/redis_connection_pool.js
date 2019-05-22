var IORedis = require('ioredis')
const genericPool = require('generic-pool')

const createPoolFactory = (config) => {
  return {
      create: function() {
          const args = {
            port: config.REDIS_PORT,
            host: config.REDIS_HOST,
            family: config.REDIS_IP_FAMILY,
            db: 0,
          }
          if (config.REDIS_PASSWORD) {
            args.password = config.REDIS_PASSWORD //RedisPassword
          }
          console.log("create_new connection")
          return new IORedis(args)
      },
      destroy: function(redis) {
          redis.disconnect()
      }
  }
}

const DEFAULT_POOL_CONFIG = {
  REDIS_PORT: 6379,
  REDIS_HOST: '127.0.0.1',
  REDIS_IP_FAMILY: 4,
  REDIS_MAX_CON_POOL: 10,
  REDIS_MIN_CON_POOL: 2
}
 

class RedisConnectionPool {
  constructor(config = {}) {
      const {
          REDIS_PORT,
          REDIS_HOST,
          REDIS_IP_FAMILY,
          REDIS_MAX_CON_POOL,
          REDIS_MIN_CON_POOL
      } = { ...DEFAULT_POOL_CONFIG, ...config }

      const poolFactory = createPoolFactory({ REDIS_PORT, REDIS_HOST, REDIS_IP_FAMILY })
      const opts = {
          max: Number(REDIS_MAX_CON_POOL) || DEFAULT_POOL_CONFIG.REDIS_MAX_CON_POOL,
          min: Number(REDIS_MIN_CON_POOL) || DEFAULT_POOL_CONFIG.REDIS_MIN_CON_POOL,
      }

    this.myPool = genericPool.createPool(poolFactory, opts)
  }

  async connect() {
      return await this.myPool.acquire()
  }

  async execute(f) {
    const redis = await this.connect()
    try {
      return await f(redis)
    } finally {
      this.relaseConnection(redis)
    }
  }

  relaseConnection(connection) {
      if (this.myPool === undefined) return
      this.myPool.release(connection) 
  }

  async closeConnection() {
      if (this.myPool === undefined) return
      await this.myPool.drain()
      await this.myPool.clear()
  }
}
module.exports = RedisConnectionPool