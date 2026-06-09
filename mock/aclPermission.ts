import type { MockMethod } from 'vite-plugin-mock'
import type { MockMethod } from 'vite-plugin-mock'
import { permissionList } from './data/permission'
import type { PermissionItem } from './data/permission'

const findByPermission = (
  list: PermissionItem[],
  permission: string,
): PermissionItem | undefined => {
  for (const item of list) {
    if (item.permission === permission) {
      return item
    }

    if (item.children) {
      const result = findByPermission(item.children, permission)

      if (result) {
        return result
      }
    }
  }
}
const findPermission = (list: PermissionItem[], id: number): PermissionItem | undefined => {
  for (const item of list) {
    if (item.id === id) {
      return item
    }

    if (item.children) {
      const result = findPermission(item.children, id)

      if (result) {
        return result
      }
    }
  }
}
const canCreateChild = (parent: PermissionItem | undefined, childType: PermissionItem['type']) => {
  if (!parent) {
    return childType === 'directory' || childType === 'menu'
  }

  if (parent.type === 'directory') {
    return childType === 'menu'
  }

  if (parent.type === 'menu') {
    return childType === 'button'
  }

  return false
}

const deletePermission = (list: PermissionItem[], id: number): boolean => {
  const index = list.findIndex((item) => item.id === id)

  if (index !== -1) {
    list.splice(index, 1)
    return true
  }

  return list.some((item) => (item.children ? deletePermission(item.children, id) : false))
}

export default [
  {
    url: '/api/acl/permission/list',
    method: 'get',
    response: () => ({
      code: 200,
      data: permissionList,
      message: 'success',
    }),
  },
  {
    url: '/api/acl/permission/add',
    method: 'post',
    response: ({ body }) => {
      const parent = body.parentId === 0 ? undefined : findPermission(permissionList, body.parentId)

      if (body.parentId !== 0 && !parent) {
        return {
          code: 201,
          data: null,
          message: '父级权限不存在',
        }
      }

      if (!canCreateChild(parent, body.type)) {
        return {
          code: 201,
          data: null,
          message: '权限层级不合法',
        }
      }

      if (findByPermission(permissionList, body.permission)) {
        return {
          code: 201,
          data: null,
          message: '权限标识已存在',
        }
      }

      const newPermission: PermissionItem = {
        id: Date.now(),
        parentId: body.parentId,
        name: body.name,
        permission: body.permission,
        type: body.type,
      }

      if (!parent) {
        permissionList.push(newPermission)
      } else {
        parent.children ||= []
        parent.children.push(newPermission)
      }

      return {
        code: 200,
        data: null,
        message: 'success',
      }
    },
  },
  {
    url: '/api/acl/permission/update/:id',
    method: 'put',
    response: ({ query, body }) => {
      const id = Number(query.id)
      const permission = findPermission(permissionList, id)

      if (!permission) {
        return {
          code: 201,
          data: null,
          message: '权限不存在',
        }
      }

      if (permission.type !== body.type) {
        return {
          code: 201,
          data: null,
          message: '不能修改权限类型',
        }
      }

      const samePermission = findByPermission(permissionList, body.permission)

      if (samePermission && samePermission.id !== id) {
        return {
          code: 201,
          data: null,
          message: '权限标识已存在',
        }
      }

      permission.name = body.name
      permission.permission = body.permission

      return {
        code: 200,
        data: null,
        message: 'success',
      }
    },
  },
  {
    url: '/api/acl/permission/delete/:id',
    method: 'delete',
    response: ({ query }) => {
      const permission = findPermission(permissionList, Number(query.id))

      if (!permission) {
        return {
          code: 201,
          data: null,
          message: '权限不存在',
        }
      }

      if (permission.children?.length) {
        return {
          code: 201,
          data: null,
          message: '请先删除子权限',
        }
      }

      deletePermission(permissionList, permission.id)

      return {
        code: 200,
        data: null,
        message: 'success',
      }
    },
  },
] satisfies MockMethod[]
