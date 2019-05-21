const url = require('url')
const fs = require('fs')
const path = require('path')
const {success} = include('services/render_service')
const {getRequestParams, getCookie} = include('services/http_service')
const {isLoggedIn, getCurrentUser} = include('services/user_service')
const {getUserPostsPage, getTimelinePage} = include('services/post_page_service')

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

const userTimeline = async (req, res) => {
  const secret = getCookie(req).auth
  const currentUser = await getCurrentUser(secret)
  if (currentUser === null)
    throw new Error('redis secret and cookie secret not matched')

  const params = getRequestParams(req)
  const start = Number(params.start) ? Number(params.start) : 0
  const count = 10
  const page = await getUserPostsPage(
    currentUser.id,
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
  success(res, './app/views/userTop.ejs', args)
}

module.exports = {
  index: async (req, res) => {
    const secret = getCookie(req).auth
    if (await isLoggedIn(secret)) {
      return userTimeline(req, res)
    }
    success(res, './app/views/index.ejs', {
      title: 'this is title',
      filename: './index.ejs',
      isLoggedin: false,
    })
  },
  generalTimeline: async (req, res) => {
    const secret = getCookie(req).auth

    const params = getRequestParams(req)
    const start = Number(params.start) ? Number(params.start) : 0
    const count = 10
    const page = await getTimelinePage(start, count)

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
      isLoggedin: await isLoggedIn(secret),
    }
    success(res, './app/views/userTop.ejs', args)
  },
  staticFile: async (req, res, uri) => {
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
