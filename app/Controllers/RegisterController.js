const RenderService = include('Services/RenderService');
const HttpService = include('Services/HttpService');
const RedisService = include('Services/RedisService');
const Utility = include('Utils/Utility');

module.exports = class RegisterController {
  static async save(req, res) {
    //const url_parse = url.parse(req.url, true);
    const query = await HttpService.getPostQuery(req);

    if (
      Utility.isBlank(query.username) ||
      Utility.isBlank(query.password) ||
      Utility.isBlank(query.password2)
    ) {
      throw new Error('input error');
    }
    if (query.password !== query.password2) {
      throw new Error('password error');
    }

    const password = query.password;
    const userName = query.username;
    const redis = RedisService.start();
    if (await redis.hget('users', userName)) {
      throw new Error('this user already exists');
    }
    const userId = await redis.incr('next_user_id');
    const authSecret = Utility.getRandomStr();

    redis.hset('users', userName, userId);
    redis.hmset(`user:${userId}`, {
      username: userName,
      password: password,
      auth: authSecret,
    });
    redis.hset('auths', authSecret, userId);
    const currentTime = new Date().getTime();
    redis.zadd('users_by_time', currentTime, userName);

    // User registered! Login her / him.
    res.setHeader('Set-Cookie', [
      `auth=${authSecret}; expires=${new Date(
        currentTime + 3600 * 24 * 365
      ).toUTCString()}`,
    ]);
    RenderService.success(res, './app/Views/registed.ejs', {
      title: 'this is registed',
      userName: userName,
      filename: './registed.ejs',
    });
  }
};
