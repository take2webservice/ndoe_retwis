const RedisService = include('services/redis_service')
const {isBlank} = include('utils/utility')
const Post = include('models/post')
const {getUserById} = include('services/user_service')

const getPosts = async(key, start, count) => {
  const redis = await RedisService.getConnection()
  const postIds = await redis.lrange(key, start, count - 1)
  const posts = []
  const users = {} //cache
  for (let id of postIds) {
    const redisPost = await redis.hgetall(`post:${id}`)
    if (redisPost === null) continue
    let user
    const userId = redisPost.userid
    if (isBlank(userId)) continue
    if (users[userId]) {
      user = users[userId]
    } else {
      user = await getUserById(userId)
      users[redisPost.userid] = user
    }
    const post = new Post(id, user, redisPost.time, redisPost.body)
    posts.push(post)
  }
  RedisService.relaseConnection(redis)
  return posts
}

module.exports = {
  getPosts: getPosts,
  getTimeline: async (start, count) => {
    const key = 'timeline'
    return getPosts(key, start, count)
  },
  getNewPostId: async () => {
    const redis = await RedisService.getConnection()
    const postId = await redis.incr('next_post_id')
    RedisService.relaseConnection(redis)
    return postId
  },
  doPost: async (postId, user, status, currentTime) => {
    const redis = await RedisService.getConnection()
  
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
    RedisService.relaseConnection(redis)
  }
}