const {success} = include('services/render_service')
const {getRequestParams, getCookie, redirect} = include('services/http_service')
const {isBlank} = include('utils/utility')
const {getCurrentUser, getUserByName} = include('services/user_service')
const {getUserPostsPage} = include('services/post_page_service')

module.exports = {
  show: async (req, res) => {
    const params = getRequestParams(req)
    const paramUser = await getUserByName(params.u)

    if (isBlank(paramUser)) return redirect(res, '/')

    const secret = getCookie(req).auth
    const currentUser = await getCurrentUser(secret)
    const showFollow = currentUser !== null
    const following = showFollow
      ? await currentUser.isFollowing(paramUser.id)
      : false

    const start = Number(params.start) ? Number(params.start) : 0
    const count = 10
    const page = await getUserPostsPage(
      paramUser.id,
      start,
      count
    )
    const args = {
      title: `${paramUser.name} page`,
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
    success(res, './app/views/userTop.ejs', args)
  }
}
