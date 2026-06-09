export type PermissionType = 'directory' | 'menu' | 'button'

export type PermissionItem = {
  id: number
  parentId: number
  name: string
  permission: string
  type: PermissionType
  children?: PermissionItem[]
}

const initialPermissionList: PermissionItem[] = [
  {
    id: 1,
    parentId: 0,
    name: '首页',
    permission: 'home',
    type: 'menu',
  },
  {
    id: 2,
    parentId: 0,
    name: '权限管理',
    permission: 'acl',
    type: 'directory',
    children: [
      {
        id: 3,
        parentId: 2,
        name: '用户管理',
        permission: 'user',
        type: 'menu',
        children: [
          {
            id: 4,
            parentId: 3,
            name: '新增用户',
            permission: 'user.add',
            type: 'button',
          },
          {
            id: 5,
            parentId: 3,
            name: '编辑用户',
            permission: 'user.update',
            type: 'button',
          },
          {
            id: 6,
            parentId: 3,
            name: '删除用户',
            permission: 'user.delete',
            type: 'button',
          },
        ],
      },
      {
        id: 7,
        parentId: 2,
        name: '角色管理',
        permission: 'role',
        type: 'menu',
        children: [
          {
            id: 8,
            parentId: 7,
            name: '新增角色',
            permission: 'role.add',
            type: 'button',
          },
          {
            id: 9,
            parentId: 7,
            name: '编辑角色',
            permission: 'role.update',
            type: 'button',
          },
          {
            id: 10,
            parentId: 7,
            name: '删除角色',
            permission: 'role.delete',
            type: 'button',
          },
        ],
      },
      {
        id: 11,
        parentId: 2,
        name: '权限管理',
        permission: 'permission',
        type: 'menu',
        children: [
          {
            id: 12,
            parentId: 11,
            name: '新增权限',
            permission: 'permission.add',
            type: 'button',
          },
          {
            id: 13,
            parentId: 11,
            name: '编辑权限',
            permission: 'permission.update',
            type: 'button',
          },
          {
            id: 14,
            parentId: 11,
            name: '删除权限',
            permission: 'permission.delete',
            type: 'button',
          },
        ],
      },
    ],
  },
]

const initialRolePermissions: Record<number, string[]> = {
  1: [
    'home',
    'acl',
    'user',
    'user.add',
    'user.update',
    'user.delete',
    'role',
    'role.add',
    'role.update',
    'role.delete',
    'role.assignPermission',
    'permission',
    'permission.add',
    'permission.update',
    'permission.delete',
  ],
  2: ['home', 'acl', 'user', 'user.update', 'role'],
  3: ['home'],
}

type PermissionState = {
  permissionList: PermissionItem[]
  rolePermissions: Record<number, string[]>
}

const globalStore = globalThis as typeof globalThis & {
  __BACKSTAGE_PERMISSION_STATE__?: PermissionState
}

globalStore.__BACKSTAGE_PERMISSION_STATE__ ||= {
  permissionList: initialPermissionList,
  rolePermissions: initialRolePermissions,
}

export const permissionList = globalStore.__BACKSTAGE_PERMISSION_STATE__.permissionList
export const rolePermissions = globalStore.__BACKSTAGE_PERMISSION_STATE__.rolePermissions
