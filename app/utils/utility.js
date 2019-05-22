module.exports = {
  isBlank: str => {
    return typeof str === 'undefined' || str === null || str.length === 0
  },
  getRandomStr: (bytes = 8) => {
    return require('crypto')
      .randomBytes(bytes)
      .toString('hex')
  },
  strElapsed: (currentTime, postTime) =>{
    const diff = (currentTime - postTime) / 1000
    if (diff < 60) return `${Math.floor(diff)} seconds`
    if (diff < 3600) {
      const min = Math.floor(Number.parseInt(diff / 60))
      return `${min} minute${min > 1 ? 's' : ''}`
    }
    if (diff < 3600 * 24) {
      const hour = Math.floor(Number.parseInt(diff / 3600))
      return `${hour} hour${hour > 1 ? 's' : ''}`
    }
    const day = Math.floor(Number.parseInt(diff / (3600 * 24)))
    return `${day} hour${day > 1 ? 's' : ''}`
  }

}
