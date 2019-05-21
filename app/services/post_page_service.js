const RedisService = include('services/redis_service')
const {getPosts} = include('services/post_service')
const PostPage = include('models/post_page')

const getPostsPage = async(key, start, count) => {
  const redis = await RedisService.getConnection()
  const total = await redis.llen(key)
  const posts = await getPosts(key, start, start + count)
  let next = start + count
  let prev = start < count ? false : start - count
  if (posts.length < count || total < next) {
    next = false
  }
  RedisService.relaseConnection(redis)
  return new PostPage(posts, total, prev, next)
}

module.exports = {
  getTimelinePage: async (start, count) => {
    const key = 'timeline'
    return await getPostsPage(key, start, count)
  },
  getUserPostsPage: async (id, start, count) => {
    const key = `posts:${id}`
    return await getPostsPage(key, start, count)
  }
}