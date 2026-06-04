import type { MockMethod } from 'vite-plugin-mock'

type UserItem = {
  id: number
  username: string
  name: string
  role: string
  status: boolean
  createTime: string
}

let userList: UserItem[] = [
  {
    id: 1,
    username: 'admin',
    name: '管理员',
    role: '超级管理员',
    status: true,
    createTime: '2026-06-01 10:30:00',
  },
  {
    id: 2,
    username: 'system',
    name: '系统用户',
    role: '系统管理员',
    status: true,
    createTime: '2026-06-02 14:20:00',
  },
  {
    id: 3,
    username: 'editor',
    name: '运营编辑',
    role: '运营人员',
    status: false,
    createTime: '2026-06-03 09:15:00',
  },
]

export default [
  {
    url: '/api/acl/user/list',
    method: 'get',
    response: ({ query }) => {
      const keyword = String(query.keyword || '').toLowerCase()
      const page = Number(query.page || 1)
      const pageSize = Number(query.pageSize || 10)

      const filteredList = keyword
        ? userList.filter((item) => item.username.toLowerCase().includes(keyword))
        : userList

      const start = (page - 1) * pageSize
      const end = start + pageSize

      return {
        code: 200,
        data: {
          records: filteredList.slice(start, end),
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
      userList.unshift({
        id: Date.now(),
        username: body.username,
        name: body.name,
        role: body.role,
        status: body.status,
        createTime: new Date().toLocaleString(),
      })

      return {
        code: 200,
        data: null,
        message: 'success',
      }
    },
  },
  {
    url: '/api/acl/user/update/:id',
    method: 'put',
    response: ({ body, query }) => {
      const id = Number(query.id)
      const user = userList.find((item) => item.id === id)

      if (!user) {
        return {
          code: 201,
          data: null,
          message: 'User not found',
        }
      }

      user.username = body.username
      user.name = body.name
      user.role = body.role
      user.status = body.status

      return {
        code: 200,
        data: null,
        message: 'success',
      }
    },
  },
  {
    url: '/api/acl/user/delete/:id',
    method: 'delete',
    response: ({ query }) => {
      const id = Number(query.id)
      userList = userList.filter((item) => item.id !== id)

      return {
        code: 200,
        data: null,
        message: 'success',
      }
    },
  },
] satisfies MockMethod[]
