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
}
