module.exports = class PostPage {
  constructor(posts, total, prev, next) {
    this.posts = posts
    this.total = total
    this.prev = prev
    this.next = next
  }

  get posts() {
    return this._posts
  }
  set posts(posts) {
    this._posts = posts
  }

  get total() {
    return this._total
  }
  set total(total) {
    this._total = total
  }

  get prev() {
    return this._prev
  }
  set prev(prev) {
    this._prev = prev
  }

  get next() {
    return this._next
  }
  set next(next) {
    this._next = next
  }

}
