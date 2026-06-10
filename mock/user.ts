import type { MockMethod } from 'vite-plugin-mock'
import { rolePermissions } from './data/permission'
import { roleList } from './data/role'
import { userList } from './data/user'

const getUserPermissions = (roleId: number) => {
  const permissions = rolePermissions[roleId] || []

  return {
    routes: permissions.filter((permission) => !permission.includes('.')),
    buttons: permissions.filter((permission) => permission.includes('.')),
  }
}

export default [
  {
    url: '/api/user/login',
    method: 'post',
    response: ({ body }) => {
      const user = userList.find(
        (item) => item.username === body.username && item.password === body.password,
      )

      if (!user || !user.status) {
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
      const user = userList.find((item) => item.token === headers.token)

      if (!user) {
        return {
          code: 201,
          data: null,
          message: 'Invalid token',
        }
      }

      const permissions = getUserPermissions(user.roleId)
      const role = roleList.find((item) => item.id === user.roleId)

      return {
        code: 200,
        data: {
          userId: user.userId,
          username: user.username,
          avatar: user.avatar,
          roles: role ? [role.roleName] : [],
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
