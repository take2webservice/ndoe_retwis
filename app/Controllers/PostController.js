const RenderService = include('Services/RenderService');
const HttpService = include('Services/HttpService');
const RedisService = include('Services/RedisService');
const Utility = include('Utils/Utility');

module.exports = class PostController {
  static async save(req, res) {
    const query = await HttpService.getPostQuery(req);

    if (Utility.isBlank(query.status)) {
      throw new Error('message not found');
    }
    const userId = await Utility.userId(Utility.parseCookie(req).auth);
    const redis = RedisService.start();

    const postId = await redis.incr('next_post_id');
    const status = query.status;
    const currentTime = new Date().getTime();
    redis.hmset(`post:${postId}`, {
      user_id: userId,
      time: currentTime,
      body: status,
    });

    const followers = await redis.zrange(`followers:${userId}`, 0, -1);
    followers.push(userId); /* Add the post to our own posts too */

    followers.forEach(fid => {
      redis.lpush(`posts:${fid}`, postId);
    });

    redis.lpush('timeline', postId);
    redis.ltrim('timeline', 0, 1000); //timeline saves 1000 posts.

    res.writeHead(302, {
      Location: 'http://localhost:8080/',
    });
    res.end();
  }
};
