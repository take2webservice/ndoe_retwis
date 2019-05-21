module.exports = class Post {
  constructor(id, user, time, body) {
    this.id = Number(id)
    this.user =user
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
  set  user(user) {
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

  strElapsed(currentTime) {
    const diff = (currentTime - this.time) / 1000
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
}
