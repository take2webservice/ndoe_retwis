module.exports = class Utility {
  static isBlank(str) {
    if (typeof str === 'undefined' || str === null || str.length === 0)
      return true
    return false
  }
  static getRandomStr(bystes = 8) {
    return require('crypto')
      .randomBytes(bystes)
      .toString('hex')
  }

  static isTrue(str) {
    return str === 'true'
  }

  static isFalse(str) {
    return str === 'false'
  }
}
