module.exports = {
  isBlank: (str) => {
    return (typeof str === 'undefined' || str === null || str.length === 0)
  },
  getRandomStr: (bystes = 8) => {
    return require('crypto')
      .randomBytes(bystes)
      .toString('hex')
  }
}