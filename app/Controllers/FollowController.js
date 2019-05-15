const HttpService = include('Services/HttpService')
const Utility = include('Utils/Utility')
const User = include('Models/User')

module.exports = class FollowController {
  static async follow(req, res) {
    const secret = HttpService.getCookie(req).auth
    const isLoggedIn = await User.isLoggedIn(secret)
    if (!isLoggedIn) return HttpService.redirect(res, '/')

    const user = User.currentUser(secret)
    const query = await HttpService.getRequestParams(req)
    const followUser = User.getUserById(query.uid)
    if (
      Utility.isBlank(query.uid) ||
      followUser === null ||
      followUser.getId() === user.getId()
    ) {
      return HttpService.redirect(res, '/')
    }
    user.follow(followUser.getId())
    return HttpService.redirect(
      res,
      `/profile?u=${encodeURI(followUser.getName())}`
    )
  }

  static async unfollow(req, res) {
    const secret = HttpService.getCookie(req).auth
    const isLoggedIn = await User.isLoggedIn(secret)
    if (!isLoggedIn) return HttpService.redirect(res, '/')

    const user = User.currentUser(secret)
    const query = await HttpService.getRequestParams(req)
    const followUser = User.getUserById(query.uid)
    if (
      Utility.isBlank(query.uid) ||
      followUser === null ||
      followUser.getId() === user.getId()
    ) {
      return HttpService.redirect(res, '/')
    }
    user.unfollow(followUser.getId())
    return HttpService.redirect(
      res,
      `/profile?u=${encodeURI(followUser.getName())}`
    )
  }
}
