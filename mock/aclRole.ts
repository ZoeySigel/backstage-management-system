import type { MockMethod } from 'vite-plugin-mock'
import { permissionList, rolePermissions } from './data/permission'
import { roleList } from './data/role'

export default [
  {
    url: '/api/acl/role/list',
    method: 'get',
    response: ({ query }) => {
      const keyword = String(query.keyword || '').toLowerCase()
      const page = Number(query.page || 1)
      const pageSize = Number(query.pageSize || 10)
      const filteredList = keyword
        ? roleList.filter((item) => item.roleName.toLowerCase().includes(keyword))
        : roleList
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
    url: '/api/acl/role/add',
    method: 'post',
    response: ({ body }) => {
      roleList.unshift({
        id: Date.now(),
        roleName: body.roleName,
        remark: body.remark,
        createTime: new Date().toLocaleString(),
      })

      return { code: 200, data: null, message: 'success' }
    },
  },
  {
    url: '/api/acl/role/update/:id',
    method: 'put',
    response: ({ body, query }) => {
      const role = roleList.find((item) => item.id === Number(query.id))

      if (!role) {
        return { code: 201, data: null, message: 'Role not found' }
      }

      role.roleName = body.roleName
      role.remark = body.remark
      return { code: 200, data: null, message: 'success' }
    },
  },
  {
    url: '/api/acl/role/delete/:id',
    method: 'delete',
    response: ({ query }) => {
      const index = roleList.findIndex((item) => item.id === Number(query.id))

      if (index !== -1) {
        roleList.splice(index, 1)
      }

      return { code: 200, data: null, message: 'success' }
    },
  },
  {
    url: '/api/acl/role/permission/:id',
    method: 'get',
    response: ({ query }) => ({
      code: 200,
      data: {
        permissions: permissionList,
        checkedPermissions: rolePermissions[Number(query.id)] || [],
      },
      message: 'success',
    }),
  },
  {
    url: '/api/acl/role/assign-permission/:id',
    method: 'post',
    response: ({ query, body }) => {
      rolePermissions[Number(query.id)] = body.permissions
      return { code: 200, data: null, message: 'success' }
    },
  },
] satisfies MockMethod[]
