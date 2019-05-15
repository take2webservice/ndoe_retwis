const HttpService = include('Services/HttpService')
const Utility = include('Utils/Utility')
const RenderService = include('Services/RenderService')
const User = include('Models/User')

module.exports = class UserController {
  static async login(req, res) {
    const query = await HttpService.getPostQuery(req)
    const userName = query.username
    const password = query.password
    if (Utility.isBlank(userName) || Utility.isBlank(password)) {
      return HttpService.notAuth('username or password not found')
    }
    const user = await User.getUserByName(userName)
    if (user == null) return HttpService.notAuth('user does not found')
    // TODO password must be hashed
    if (user.getName() === userName && user.getPassword() == password) {
      const authSecret = Utility.getRandomStr()
      user.doLogin(authSecret)
      const exppire = new Date(
        new Date().getTime() + 3600 * 24 * 31 * 1000
      ).toUTCString()
      res.setHeader('Set-Cookie', [`auth=${authSecret};  expires=${exppire}`])
      return HttpService.redirect(res, '/')
    }
    HttpService.notAuth(res, 'Not authenticated')
  }

  static async logout(req, res) {
    const paramSecret = HttpService.getCookie(req).auth
    console.log(paramSecret)
    const user = await User.currentUser(paramSecret)
    await user.doLgout()
    const expire = new Date(
      new Date().getTime() - 3600 * 24 * 31 * 1000
    ).toUTCString()
    res.setHeader('Set-Cookie', [`auth=${paramSecret};  expires=${expire}`])
    return HttpService.redirect(res, '/')
  }

  static async regist(req, res) {
    const query = await HttpService.getPostQuery(req)

    const userName = query.username
    const password = query.password
    const password2 = query.password2
    if (
      Utility.isBlank(userName) ||
      Utility.isBlank(password) ||
      Utility.isBlank(password2)
    ) {
      throw new Error('input error')
    }

    if (password !== password2) {
      throw new Error('password error')
    }

    if (await User.userExists(userName)) {
      throw new Error('this user already exists')
    }
    const authSecret = Utility.getRandomStr()
    const currentTime = new Date().getTime()
    const userId = await User.getNewUserId()
    await User.registUser(userName, userId, currentTime, password, authSecret)
    const expire = new Date(currentTime + 3600 * 31 * 1000).toUTCString()
    res.setHeader('Set-Cookie', [`auth=${authSecret};  expires=${expire}`])

    RenderService.success(res, './app/Views/registed.ejs', {
      title: 'registet was successed',
      userName: userName,
      filename: './registed.ejs',
      isLoggedin: true,
    })
  }
}
