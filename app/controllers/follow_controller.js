const {getRequestParams, getCookie, redirect} = include('services/http_service')
const {isBlank} = include('utils/utility')
const {isLoggedIn, getUserById, getCurrentUser} = include('services/user_service')

module.exports = {
  follow: async (req, res) => {
    const secret = getCookie(req).auth
    if (!(await isLoggedIn(secret))) return redirect(res, '/')

    const user = await getCurrentUser(secret)
    const query = await getRequestParams(req)
    const followUser = await getUserById(query.uid)
    if (
      isBlank(query.uid) ||
      followUser === null ||
      followUser.getId() === user.getId()
    ) {
      return redirect(res, '/')
    }
    await user.follow(followUser.getId())
    return redirect(
      res,
      `/profile?u=${encodeURI(followUser.getName())}`
    )
  },
  unfollow: async (req, res) => {
    const secret = getCookie(req).auth
    if (!(await isLoggedIn(secret))) return redirect(res, '/')

    const user = await getCurrentUser(secret)
    const query = getRequestParams(req)
    const followUser = await getUserById(query.uid)
    if (
      isBlank(query.uid) ||
      followUser === null ||
      followUser.getId() === user.getId()
    ) {
      return redirect(res, '/')
    }
    await user.unfollow(followUser.getId())
    return redirect(
      res,
      `/profile?u=${encodeURI(followUser.getName())}`
    )
  }
}
