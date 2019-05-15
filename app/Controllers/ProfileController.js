const RenderService = include('Services/RenderService')
const HttpService = include('Services/HttpService')
const Utility = include('Utils/Utility')
const User = include('Models/User')
const PostPage = include('Models/PostPage')

module.exports = class ProfileController {
  static async show(req, res) {
    const params = HttpService.getRequestParams(req)
    const paramUser = await User.getUserByName(params.u)

    if (Utility.isBlank(paramUser)) return HttpService.redirect(res, '/')

    const secret = HttpService.getCookie(req).auth
    const currentUser = await User.currentUser(secret)
    const showFollow = currentUser !== null
    const following = showFollow
      ? await currentUser.isFollowing(paramUser.getId())
      : false

    const start = Number(params.start) ? Number(params.start) : 0
    const count = 10
    const page = await PostPage.getUserPostsPage(
      paramUser.getId(),
      start,
      count
    )
    const args = {
      title: `${paramUser.getName()} page`,
      user: paramUser,
      followersCount: await paramUser.followersCount(),
      followingCount: await paramUser.followingCount(),
      page: page,
      showFollow: showFollow,
      following: following,
      isMyTimeline: false,
      filename: './userTop.ejs',
      isLoggedin: currentUser !== null,
    }
    RenderService.success(res, './app/Views/userTop.ejs', args)
  }
}
