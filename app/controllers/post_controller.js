const {getPostQuery, getCookie, redirect} = include('services/http_service')
const {isBlank} = include('utils/utility')
const {getCurrentUser} = include('services/user_service')
const {getNewPostId, doPost} = include('services/post_service')

module.exports = {
  post: async (req, res) => {
    const query = await getPostQuery(req)
    if (isBlank(query.status)) {
      throw new Error('message not found')
    }
    const paramSecret = getCookie(req).auth
    const user = await getCurrentUser(paramSecret)
    const postId = await getNewPostId()
    const status = query.status
    const currentTime = new Date().getTime()
    await doPost(postId, user, status, currentTime)
    return redirect(res, '/')
  }
}
