module.exports = {
  isBlank: str => {
    return typeof str === 'undefined' || str === null || str.length === 0
  },
  getRandomStr: (bytes = 8) => {
    return require('crypto')
      .randomBytes(bytes)
      .toString('hex')
  },
}
