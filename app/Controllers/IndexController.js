const url = require('url')
const fs = require('fs')
const path = require('path')
const RenderService = include('Services/RenderService')
const HttpService = include('Services/HttpService')
const User = include('Models/User')
const PostPage = include('Models/PostPage')

const mime = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.txt': 'text/plain',
  '.svg': 'image/svg+xml',
}

module.exports = class IndexController {
  static async index(req, res) {
    const secret = HttpService.getCookie(req).auth
    const isLoggedIn = await User.isLoggedIn(secret)
    if (isLoggedIn) {
      return this.userTimeline(req, res)
    }
    RenderService.success(res, './app/Views/index.ejs', {
      title: 'this is title',
      filename: './index.ejs',
      isLoggedin: false,
    })
  }

  static async userTimeline(req, res) {
    const secret = HttpService.getCookie(req).auth
    const currentUser = await User.currentUser(secret)
    if (currentUser === null)
      throw new Error('redis secret and cookie secret not matched')

    const params = HttpService.getRequestParams(req)
    const start = Number(params.start) ? Number(params.start) : 0
    const count = 10
    const page = await PostPage.getUserPostsPage(
      currentUser.getId(),
      start,
      count
    )
    const args = {
      title: 'user top',
      user: currentUser,
      followersCount: await currentUser.followersCount(),
      followingCount: await currentUser.followingCount(),
      page: page,
      showFollow: false,
      following: false,
      isMyTimeline: true,
      filename: './userTop.ejs',
      isLoggedin: true,
    }
    RenderService.success(res, './app/Views/userTop.ejs', args)
  }

  static async generalTimeline(req, res) {
    const secret = HttpService.getCookie(req).auth

    const params = HttpService.getRequestParams(req)
    const start = Number(params.start) ? Number(params.start) : 0
    const count = 10
    const page = await PostPage.getTimelinePage(start, count)

    const args = {
      title: 'user top',
      user: null,
      followersCount: null,
      followingCount: null,
      page: page,
      showFollow: false,
      following: false,
      isMyTimeline: false,
      filename: './userTop.ejs',
      isLoggedin: await User.isLoggedIn(secret),
    }
    RenderService.success(res, './app/Views/userTop.ejs', args)
  }

  static async staticFile(req, res, uri) {
    //abs_path is defined in /index.js
    const filePath = path.join(abs_path(url.parse(req.url).pathname))
    let is_first = true
    const stream = fs.createReadStream(filePath)
    stream.on('data', function(chunk) {
      if (is_first) {
        //we can call setHeader once only!
        res.setHeader(
          'content-type',
          mime[path.extname(filePath)] || "text/plain charset='UTF-8'"
        )
        is_first = false
      }
      res.write(chunk)
    })
    stream.on('end', function() {
      res.end()
    })
    stream.on('error', function() {
      res.writeHead(404, { 'content-type': 'text/html' })
      res.write(uri + 'does not found!!')
      res.end()
    })
  }
}
