const {getPostQuery, getCookie, redirect, notAuth} = include('services/http_service')
const {isBlank, getRandomStr} = include('utils/utility')
const {success} = include('services/render_service')
const {getCurrentUser, getNewUserId, getUserByName, userExists, registUser} = include('services/user_service')

module.exports = {
  login: async  (req, res) => {
    const query = await getPostQuery(req)
    const userName = query.username
    const password = query.password
    if (isBlank(userName) || isBlank(password)) {
      return notAuth('username or password not found')
    }
    const user = await getUserByName(userName)
    if (user == null) return notAuth('user does not found')
    // TODO password must be hashed
    if (user.name === userName && user.password == password) {
      const authSecret = getRandomStr()
      user.doLogin(authSecret)
      const exppire = new Date(
        new Date().getTime() + 3600 * 24 * 31 * 1000
      ).toUTCString()
      res.setHeader('Set-Cookie', [`auth=${authSecret};  expires=${exppire}`])
      return redirect(res, '/')
    }
    notAuth(res, 'Not authenticated')
  },
  logout: async  (req, res) => {
    const paramSecret = getCookie(req).auth
    const user = await getCurrentUser(paramSecret)
    await user.doLgout()
    const expire = new Date(
      new Date().getTime() - 3600 * 24 * 31 * 1000
    ).toUTCString()
    res.setHeader('Set-Cookie', [`auth=${paramSecret};  expires=${expire}`])
    return redirect(res, '/')
  },
  regist: async  (req, res) => {
    const query = await getPostQuery(req)

    const userName = query.username
    const password = query.password
    const password2 = query.password2
    if (
      isBlank(userName) ||
      isBlank(password) ||
      isBlank(password2)
    ) {
      throw new Error('input error')
    }

    if (password !== password2) {
      throw new Error('password error')
    }

    if (await userExists(userName)) {
      throw new Error('this user already exists')
    }
    const authSecret = getRandomStr()
    const currentTime = new Date().getTime()
    const userId = await getNewUserId()
    await registUser(userName, userId, currentTime, password, authSecret)
    const expire = new Date(currentTime + 3600 * 31 * 1000).toUTCString()
    res.setHeader('Set-Cookie', [`auth=${authSecret};  expires=${expire}`])

    success(res, './app/views/registed.ejs', {
      title: 'registet was successed',
      userName: userName,
      filename: './registed.ejs',
      isLoggedin: true,
    })
  }
}