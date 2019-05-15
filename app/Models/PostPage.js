const RedisService = include('Services/RedisService')
const Post = include('Models/Post')

module.exports = class PostPage {
  constructor(posts, total, prev, next) {
    let _posts = posts
    let _total = total
    let _prev = prev
    let _next = next

    this.setPosts = function(posts) {
      _posts = posts
    }
    this.getPosts = function() {
      return _posts
    }

    this.setTotla = function(total) {
      _total = total
    }
    this.getTotal = function() {
      return _total
    }

    this.setPrev = function(prev) {
      _prev = prev
    }
    this.getPrev = function() {
      return _prev
    }

    this.setNext = function(next) {
      _next = next
    }
    this.getNext = function() {
      return _next
    }
  }

  static async getTimelinePage(start, count) {
    const key = 'timeline'
    return await this.getPostsPage(key, start, count)
  }

  static async getUserPostsPage(id, start, count) {
    const key = `posts:${id}`
    return await this.getPostsPage(key, start, count)
  }

  static async getPostsPage(key, start, count) {
    const redis = RedisService.start()
    const total = await redis.llen(key)
    const posts = await Post.getPosts(key, start, count)
    let next = start + count
    let prev = start < count ? false : start - count
    if (posts.length < count || total < next) {
      next = false
    }
    return new PostPage(posts, total, prev, next)
  }
}
