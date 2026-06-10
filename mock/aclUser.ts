import type { MockMethod } from 'vite-plugin-mock'
import Mock from 'mockjs'
import { roleList } from './data/role'
import { userList } from './data/user'

const toUserItem = (user: (typeof userList)[number]) => ({
  id: user.userId,
  username: user.username,
  name: user.name,
  role: roleList.find((item) => item.id === user.roleId)?.roleName || '未分配角色',
  status: user.status,
  createTime: user.createTime,
})

export default [
  {
    url: '/api/acl/user/list',
    method: 'get',
    response: ({ query }) => {
      const keyword = String(query.keyword || '').toLowerCase()
      const page = Number(query.page || 1)
      const pageSize = Number(query.pageSize || 10)
      const records = userList.map(toUserItem)
      const filteredList = keyword
        ? records.filter((item) => item.username.toLowerCase().includes(keyword))
        : records
      const start = (page - 1) * pageSize

      return {
        code: 200,
        data: {
          records: filteredList.slice(start, start + pageSize),
          total: filteredList.length,
        },
        message: 'success',
      }
    },
  },
  {
    url: '/api/acl/user/add',
    method: 'post',
    response: ({ body }) => {
      const defaultRole = roleList.find((item) => item.roleName === body.role)

      userList.unshift({
        userId: Date.now(),
        username: body.username,
        password: '111111',
        token: Mock.Random.guid(),
        roleId: defaultRole?.id || 3,
        avatar: Mock.Random.image('100x100', '#909399', '#ffffff', body.username),
        name: body.name,
        status: body.status,
        createTime: new Date().toLocaleString(),
      })

      return { code: 200, data: null, message: 'success' }
    },
  },
  {
    url: '/api/acl/user/update/:id',
    method: 'put',
    response: ({ body, query }) => {
      const user = userList.find((item) => item.userId === Number(query.id))

      if (!user) {
        return { code: 201, data: null, message: 'User not found' }
      }

      const role = roleList.find((item) => item.roleName === body.role)
      user.username = body.username
      user.name = body.name
      user.status = body.status

      if (role) {
        user.roleId = role.id
      }

      return { code: 200, data: null, message: 'success' }
    },
  },
  {
    url: '/api/acl/user/delete/:id',
    method: 'delete',
    response: ({ query }) => {
      const index = userList.findIndex((item) => item.userId === Number(query.id))

      if (index !== -1) {
        userList.splice(index, 1)
      }

      return { code: 200, data: null, message: 'success' }
    },
  },
  {
    url: '/api/acl/user/role/:id',
    method: 'get',
    response: ({ query }) => {
      const user = userList.find((item) => item.userId === Number(query.id))

      if (!user) {
        return { code: 201, data: null, message: 'User not found' }
      }

      return {
        code: 200,
        data: {
          roles: roleList.map((item) => ({ id: item.id, roleName: item.roleName })),
          roleId: user.roleId,
        },
        message: 'success',
      }
    },
  },
  {
    url: '/api/acl/user/assign-role/:id',
    method: 'post',
    response: ({ body, query }) => {
      const user = userList.find((item) => item.userId === Number(query.id))
      const role = roleList.find((item) => item.id === Number(body.roleId))

      if (!user || !role) {
        return { code: 201, data: null, message: 'User or role not found' }
      }

      user.roleId = role.id
      return { code: 200, data: null, message: 'success' }
    },
  },
] satisfies MockMethod[]
