const RenderService = include('Services/RenderService');
const HttpService = include('Services/HttpService');
const RedisService = include('Services/RedisService');
const Utility = include('Utils/Utility');

module.exports = class ProfileController {
  static async show(req, res) {
    const params = await HttpService.getRequestParams(req);
    const redis = RedisService.start();
    const userName = params.u;
    const userId = await redis.hget('users', userName);
    if (Utility.isBlank(userName) || userId === null) {
      res.writeHead(302, {
        Location: '/',
      });
      res.end();
      return;
    }
    const isLoggedIn = await Utility.isLoggedIn(Utility.parseCookie(req));
    const currentUser = await Utility.userInfo(Utility.parseCookie(req).auth);
    let showFollow = false;
    let showUnFollow = false;

    if (isLoggedIn && currentUser.username !== userName) {
      const isFollowing = await redis.zscore(
        `following:${userId}`,
        currentUser.id
      );
      if (isFollowing) {
        showUnFollow = true;
      } else {
        showFollow = true;
      }
    }

    const followersCount = await Utility.followersCount(userId);
    const followingCount = await Utility.followingCount(userId);
    const start = params.start ? Number(params.start) : 0;
    let next = start + 10;
    let prev = start < 10 ? false : start - 10;
    if (prev < 0) prev = 0;

    const key = `posts:${userId}`;
    const post_ids = await redis.lrange(key, start, next - 1);
    const posts = [];
    for (let id of post_ids) {
      const post = await redis.hgetall(`post:${id}`);
      const userName = await redis.hget(`user:${post.user_id}`, 'username');
      posts.push({
        userName: userName,
        body: post.body,
        userId: post.user_id,
        time: post.time,
        elaspled: 'elasped',
      });
    }
    if (posts.length !== 10) {
      next = false;
    }

    const args = {
      title: 'user top',
      username: userName,
      uid: userId,
      followersCount: followersCount,
      followingCount: followingCount,
      posts: posts,
      prev: prev,
      next: next,
      showUnFollow: showUnFollow,
      showFollow: showFollow,
      filename: './userTop.ejs',
    };

    RenderService.success(res, './app/Views/userTop.ejs', args);
  }
};
