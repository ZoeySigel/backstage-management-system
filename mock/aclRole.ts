import type { MockMethod } from 'vite-plugin-mock'
import { permissionList, rolePermissions } from './data/permission'
type RoleItem = {
  id: number
  roleName: string
  remark: string
  createTime: string
}

let roleList: RoleItem[] = [
  {
    id: 1,
    roleName: '超级管理员',
    remark: '拥有系统全部权限',
    createTime: '2026-06-01 10:00:00',
  },
  {
    id: 2,
    roleName: '系统管理员',
    remark: '负责系统日常管理',
    createTime: '2026-06-02 11:30:00',
  },
  {
    id: 3,
    roleName: '运营人员',
    remark: '负责商品和内容运营',
    createTime: '2026-06-03 15:20:00',
  },
]

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

      return {
        code: 200,
        data: null,
        message: 'success',
      }
    },
  },
  {
    url: '/api/acl/role/update/:id',
    method: 'put',
    response: ({ body, query }) => {
      const role = roleList.find((item) => item.id === Number(query.id))

      if (!role) {
        return {
          code: 201,
          data: null,
          message: '角色不存在',
        }
      }

      role.roleName = body.roleName
      role.remark = body.remark

      return {
        code: 200,
        data: null,
        message: 'success',
      }
    },
  },
  {
    url: '/api/acl/role/delete/:id',
    method: 'delete',
    response: ({ query }) => {
      roleList = roleList.filter((item) => item.id !== Number(query.id))

      return {
        code: 200,
        data: null,
        message: 'success',
      }
    },
  },
  {
    url: '/api/acl/role/permission/:id',
    method: 'get',
    response: ({ query }) => {
      const id = Number(query.id)

      return {
        code: 200,
        data: {
          permissions: permissionList,
          checkedPermissions: rolePermissions[id] || [],
        },
        message: 'success',
      }
    },
  },
  {
    url: '/api/acl/role/assign-permission/:id',
    method: 'post',
    response: ({ query, body }) => {
      const id = Number(query.id)
      rolePermissions[id] = body.permissions

      return {
        code: 200,
        data: null,
        message: 'success',
      }
    },
  },
] satisfies MockMethod[]
