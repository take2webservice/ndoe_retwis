var IORedis = require('ioredis');
module.exports = class RedisService {
  static start() {
    return new IORedis({
      port: 16379, // Redis port
      host: '127.0.0.1', // Redis host
      family: 4, // 4 (IPv4) or 6 (IPv6)
      //password: 'auth',
      db: 0,
    });
  }

  static close(redis) {
    redis.disconnect();
  }
};
