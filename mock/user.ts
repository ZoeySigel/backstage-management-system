import type { MockMethod } from 'vite-plugin-mock'
import Mock from 'mockjs'
import { rolePermissions } from './data/permission'
const getUserPermissions = (roleId: number) => {
  const permissions = rolePermissions[roleId] || []

  return {
    routes: permissions.filter((permission) => !permission.includes('.')),
    buttons: permissions.filter((permission) => permission.includes('.')),
  }
}
const userList = [
  {
    userId: 1,
    username: 'admin',
    password: '111111',
    token: 'Admin Token',
    roleId: 1,
    roles: ['超级管理员'],
    avatar: Mock.Random.image('100x100', '#409eff', '#ffffff', 'Admin'),
  },
  {
    userId: 2,
    username: 'system',
    password: '111111',
    token: 'System Token',
    roleId: 2,
    roles: ['系统管理员'],
    avatar: Mock.Random.image('100x100', '#67c23a', '#ffffff', 'User'),
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

      const permissions = getUserPermissions(user.roleId)

      return {
        code: 200,
        data: {
          userId: user.userId,
          username: user.username,
          avatar: user.avatar,
          roles: user.roles,
          routes: permissions.routes,
          buttons: permissions.buttons,
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
