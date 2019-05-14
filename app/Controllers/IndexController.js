const url = require('url');
const fs = require('fs');
const path = require('path');
const indexService = include('Services/IndexService');
const RenderService = include('Services/RenderService');
const RedisService = include('Services/RedisService');
const HttpService = include('Services/HttpService');
const Utility = include('Utils/Utility');

const statifFileDir = '/public';
const mime = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.txt': 'text/plain',
  '.svg': 'image/svg+xml',
};

module.exports = class IndexController {
  static async index(req, res) {
    const isLoggedIn = await Utility.isLoggedIn(Utility.parseCookie(req));
    if (isLoggedIn) {
      this.userTop(req, res);
    } else {
      RenderService.success(res, './app/Views/index.ejs', {
        title: 'this is title',
        filename: './index.ejs',
      });
    }
  }

  static async userTop(req, res) {
    const userInfo = await Utility.userInfo(Utility.parseCookie(req).auth);
    const username = userInfo.username;
    const redis = RedisService.start();
    const userId = await redis.hget('users', username);
    const followersCount = await Utility.followersCount(userId);
    const followingCount = await Utility.followingCount(userId);

    const params = HttpService.getRequestParams(req);
    const start = Number(params.start) ? Number(params.start) : 0;
    let next = start + 10;
    let prev = start < 10 ? false : start - 10;
    if (prev < 0) prev = 0;

    const key = 'timeline';
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
      username: username,
      uid: 0,
      followersCount: followersCount,
      followingCount: followingCount,
      posts: posts,
      prev: prev,
      next: next,
      showUnFollow: false,
      showFollow: false,
      filename: './userTop.ejs',
    };

    RenderService.success(res, './app/Views/userTop.ejs', args);
  }

  static async staticFile(req, res, uri) {
    //abs_path is defined in /index.js
    const filePath = path.join(abs_path(url.parse(req.url).pathname));
    let is_first = true;
    const stream = fs.createReadStream(filePath);
    stream.on('data', function(chunk) {
      if (is_first) {
        //we can call setHeader once only!
        res.setHeader(
          'content-type',
          mime[path.extname(filePath)] || "text/plain; charset='UTF-8'"
        );
        is_first = false;
      }
      res.write(chunk);
    });
    stream.on('end', function() {
      res.end();
    });
    stream.on('error', function() {
      res.writeHead(404, { 'content-type': 'text/html' });
      res.write(uri + 'does not found!!');
      res.end();
    });
  }
};
