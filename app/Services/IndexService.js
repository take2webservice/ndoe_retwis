var IORedis = require('ioredis');
var RedisService = include('Services/RedisService');

const ping = async function(req, res) {
  const redis = RedisService.start();
  const pong = await redis.ping();
  redis.disconnect();
  return pong;
};

module.exports = {
  ping: ping,
};
