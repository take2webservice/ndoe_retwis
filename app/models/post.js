module.exports = class Post {
  constructor(id, user, time, body) {
    this.id = Number(id)
    this.user = user
    this.time = Number(time)
    this.body = body
  }

  get id() {
    return this._id
  }
  set id(id) {
    this._id = id
  }

  get user() {
    return this._user
  }
  set user(user) {
    this._user = user
  }

  get time() {
    return this._time
  }
  set time(time) {
    this._time = time
  }

  get body() {
    return this._body
  }
  set body(body) {
    this._body = body
  }
}
