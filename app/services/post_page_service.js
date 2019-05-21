const path = require('path')
const RedisService = require(path.resolve('app/services/redis_service'))
const { getPosts } = require(path.resolve('app/services/post_service'))
const PostPage = require(path.resolve('app/models/post_page'))

const getPostsPage = async (key, start, count) => {
  const redis = await RedisService.getConnection()
  const total = await redis.llen(key)
  const posts = await getPosts(key, start, start + count)
  let next = start + count
  const prev = start < count ? -1 : start - count
  if (posts.length < count || total < next) {
    next = -1
  }
  RedisService.relaseConnection(redis)
  return new PostPage(posts, total, prev, next)
}

module.exports = {
  getTimelinePage: (start, count) => {
    const key = 'timeline'
    return getPostsPage(key, start, count)
  },
  getUserPostsPage: (id, start, count) => {
    const key = `posts:${id}`
    return getPostsPage(key, start, count)
  },
}
