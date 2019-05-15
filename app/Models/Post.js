const RedisService = include('Services/RedisService')
const User = include('Models/User')
const Utility = include('Utils/Utility')

module.exports = class Post {
  constructor(id, user, time, body) {
    let _id = Number(id)
    let _user = user
    let _time = Number(time)
    let _body = body

    this.setId = function(id) {
      _id = Number(id)
    }
    this.getId = function() {
      return _id
    }

    this.setUser = function(user) {
      _user = user
    }
    this.getUser = function() {
      return _user
    }

    this.setTime = function(time) {
      _time = Number(time)
    }
    this.getTime = function() {
      return _time
    }

    this.setBody = function(body) {
      _body = body
    }
    this.getBody = function() {
      return _body
    }
  }

  static async getTimeline(start, count) {
    const key = 'timeline'
    return this.getPosts(key, start, count)
  }

  static async getUserPosts(id, start, count) {
    const key = `posts:${id}`
    return this.getPosts(key, start, count)
  }

  static async getPosts(key, start, count) {
    const redis = RedisService.start()
    const postIds = await redis.lrange(key, start, count - 1)
    const posts = []
    const users = {} //cache
    for (let id of postIds) {
      const redisPost = await redis.hgetall(`post:${id}`)
      if (redisPost === null) continue
      let user
      const userId = redisPost.userid
      if (Utility.isBlank(userId)) continue
      if (users[userId]) {
        user = users[userId]
      } else {
        user = await User.getUserById(userId)
        users[redisPost.userid] = user
      }
      const post = new Post(id, user, redisPost.time, redisPost.body)
      posts.push(post)
    }
    return posts
  }

  strElapsed(currentTime) {
    const diff = (currentTime - this.getTime()) / 1000
    if (diff < 60) return `${diff} seconds`
    if (diff < 3600) {
      const min = Number.parseInt(diff / 60)
      return `${min} minute${min > 1 ? 's' : ''}`
    }
    if (diff < 3600 * 24) {
      const hour = Number.parseInt(diff / 3600)
      return `${hour} hour${hour > 1 ? 's' : ''}`
    }
    const day = Number.parseInt(diff / (3600 * 24))
    return `${day} hour${day > 1 ? 's' : ''}`
  }

  static async getNewPostId() {
    const redis = RedisService.start()
    const postId = await redis.incr('next_post_id')
    return postId
  }

  static async doPost(postId, user, status, currentTime) {
    const redis = RedisService.start()

    //regist post detail
    redis.hmset(`post:${postId}`, {
      postid: postId,
      userid: user.getId(),
      time: currentTime,
      body: status,
    })

    //add post to "followers and my" timline
    const followers = await redis.zrange(`followers:${user.getId()}`, 0, -1)
    followers.push(user.getId()) /* Add the post to our own posts too */

    //posts:1 => user1 and followers timeline
    followers.forEach(fid => {
      redis.lpush(`posts:${fid}`, postId)
    })

    // add post to global timeline
    redis.lpush('timeline', postId)
    redis.ltrim('timeline', 0, 1000) //timeline saves 1000 posts.
  }
}
