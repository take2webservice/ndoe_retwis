const path = require('path')
const { getRequestParams, getCookie, redirect } = require(path.resolve(
  'app/services/http_service'
))
const { isBlank } = require(path.resolve('app/utils/utility'))
const { isLoggedIn, getUserById, getCurrentUser } = require(path.resolve(
  'app/services/user_service'
))

module.exports = {
  follow: async (req, res) => {
    const secret = getCookie(req).auth
    if (!(await isLoggedIn(secret))) return redirect(res, '/')

    const user = await getCurrentUser(secret)
    const { uid } = await getRequestParams(req)
    const followUser = await getUserById(uid)
    if (isBlank(uid) || followUser === null || followUser.id === user.id) {
      return redirect(res, '/')
    }
    await user.follow(followUser.id)
    return redirect(res, `/profile?u=${encodeURI(followUser.name)}`)
  },
  unfollow: async (req, res) => {
    const secret = getCookie(req).auth
    if (!(await isLoggedIn(secret))) return redirect(res, '/')

    const user = await getCurrentUser(secret)
    const { uid } = await getRequestParams(req)
    const followUser = await getUserById(uid)
    if (isBlank(uid) || followUser === null || followUser.id === user.id) {
      return redirect(res, '/')
    }
    await user.unfollow(followUser.id)
    return redirect(res, `/profile?u=${encodeURI(followUser.name)}`)
  },
}
