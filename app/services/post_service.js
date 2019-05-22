const path = require('path')
const { isBlank } = require(path.resolve('app/utils/utility'))
const Post = require(path.resolve('app/models/post'))
const { getUserById } = require(path.resolve('app/services/user_service'))
const redisConnectionPool = require(path.resolve('app/redis/index'))


const getPosts = async (key, start, count) => {
  return await redisConnectionPool.execute(
    async (redis) => {
      const postIds = await redis.lrange(key, start, count - 1)
      const posts = []
      const users = {} //cache
      for (let id of postIds) {
        const redisPost = await redis.hgetall(`post:${id}`)
        if (redisPost === null) continue
        let user
        const userId = redisPost.userid
        if (isBlank(userId)) continue
        user = users[userId] || await getUserById(userId)
        users[redisPost.userid] = user
        const post = new Post(id, user, redisPost.time, redisPost.body)
        posts.push(post)
      }
      return posts
    }
  )
}

module.exports = {
  getPosts: getPosts,
  getTimeline: (start, count) => {
    const key = 'timeline'
    return getPosts(key, start, count)
  },
  getNewPostId: async () => {
    return await redisConnectionPool.execute(
      (redis) => {
        return redis.incr('next_post_id')
      }
    )
  },
  doPost: async (postId, user, status, currentTime) => {
    await redisConnectionPool.execute(
      async (redis) => {
    //regist post detail
      redis.hmset(`post:${postId}`, {
        postid: postId,
        userid: user.id,
        time: currentTime,
        body: status,
      })

      //add post to "followers and my" timline
      const followers = await redis.zrange(`followers:${user.id}`, 0, -1)
      followers.push(user.id) /* Add the post to our own posts too */

      //posts:1 => user1 and followers timeline
      followers.forEach(fid => {
        redis.lpush(`posts:${fid}`, postId)
      })

      // add post to global timeline
      redis.lpush('timeline', postId)
      redis.ltrim('timeline', 0, 1000) //timeline saves 1000 posts.
      }
    )
  },
}
