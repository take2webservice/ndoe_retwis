const HttpService = include('Services/HttpService')
const Utility = include('Utils/Utility')
const User = include('Models/User')
const Post = include('Models/Post')

module.exports = class PostController {
  static async post(req, res) {
    const query = await HttpService.getPostQuery(req)
    if (Utility.isBlank(query.status)) {
      throw new Error('message not found')
    }
    const paramSecret = HttpService.getCookie(req).auth
    const user = await User.currentUser(paramSecret)
    const postId = await Post.getNewPostId()
    const status = query.status
    const currentTime = new Date().getTime()
    await Post.doPost(postId, user, status, currentTime)
    return HttpService.redirect(res, '/')
  }
}
