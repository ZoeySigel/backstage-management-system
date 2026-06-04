import type { MockMethod } from 'vite-plugin-mock'
import Mock from 'mockjs'

const userList = [
  {
    userId: 1,
    username: 'admin',
    password: '111111',
    token: 'Admin Token',
    avatar: Mock.Random.image('100x100', '#409eff', '#ffffff', 'Admin'),
    roles: ['admin'],
    buttons: ['cuser.detail'],
    routes: ['home', 'about', 'acl', 'user', 'role', 'permission', 'product'],
  },
  {
    userId: 2,
    username: 'system',
    password: '111111',
    token: 'System Token',
    avatar: Mock.Random.image('100x100', '#67c23a', '#ffffff', 'User'),
    roles: ['system'],
    buttons: ['cuser.detail'],
    routes: ['home', 'about', 'user'],
  },
]

export default [
  {
    url: '/api/user/login',
    method: 'post',
    response: ({ body }) => {
      const user = userList.find(
        (item) => item.username === body.username && item.password === body.password,
      )

      if (!user) {
        return {
          code: 201,
          data: null,
          message: 'Incorrect username or password',
        }
      }

      return {
        code: 200,
        data: {
          token: user.token,
        },
        message: 'success',
      }
    },
  },
  {
    url: '/api/user/info',
    method: 'get',
    response: ({ headers }) => {
      const token = headers.token
      const user = userList.find((item) => item.token === token)

      if (!user) {
        return {
          code: 201,
          data: null,
          message: 'Invalid token',
        }
      }

      return {
        code: 200,
        data: {
          userId: user.userId,
          username: user.username,
          avatar: user.avatar,
          roles: user.roles,
          buttons: user.buttons,
          routes: user.routes,
        },
        message: 'success',
      }
    },
  },
  {
    url: '/api/user/logout',
    method: 'post',
    response: () => ({
      code: 200,
      data: null,
      message: 'success',
    }),
  },
] satisfies MockMethod[]
