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
          {
            id: 15,
            parentId: 3,
            name: '分配角色',
            permission: 'user.assignRole',
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
  {
    id: 20,
    parentId: 0,
    name: '商品管理',
    permission: 'product',
    type: 'directory',
    children: [
      {
        id: 21,
        parentId: 20,
        name: '品牌管理',
        permission: 'brand',
        type: 'menu',
        children: [
          {
            id: 22,
            parentId: 21,
            name: '新增品牌',
            permission: 'brand.add',
            type: 'button',
          },
          {
            id: 23,
            parentId: 21,
            name: '编辑品牌',
            permission: 'brand.update',
            type: 'button',
          },
          {
            id: 24,
            parentId: 21,
            name: '删除品牌',
            permission: 'brand.delete',
            type: 'button',
          },
        ],
      },
      {
        id: 25,
        parentId: 20,
        name: '平台属性',
        permission: 'attr',
        type: 'menu',
        children: [
          {
            id: 26,
            parentId: 25,
            name: '新增属性',
            permission: 'attr.add',
            type: 'button',
          },
          {
            id: 27,
            parentId: 25,
            name: '编辑属性',
            permission: 'attr.update',
            type: 'button',
          },
          {
            id: 28,
            parentId: 25,
            name: '删除属性',
            permission: 'attr.delete',
            type: 'button',
          },
        ],
      },
      {
        id: 29,
        parentId: 20,
        name: 'SPU 管理',
        permission: 'spu',
        type: 'menu',
        children: [
          {
            id: 30,
            parentId: 29,
            name: '新增 SPU',
            permission: 'spu.add',
            type: 'button',
          },
          {
            id: 31,
            parentId: 29,
            name: '编辑 SPU',
            permission: 'spu.update',
            type: 'button',
          },
          {
            id: 32,
            parentId: 29,
            name: '删除 SPU',
            permission: 'spu.delete',
            type: 'button',
          },
        ],
      },
      {
        id: 33,
        parentId: 20,
        name: 'SKU 管理',
        permission: 'sku',
        type: 'menu',
        children: [
          {
            id: 34,
            parentId: 33,
            name: '新增 SKU',
            permission: 'sku.add',
            type: 'button',
          },
          {
            id: 35,
            parentId: 33,
            name: '编辑 SKU',
            permission: 'sku.update',
            type: 'button',
          },
          {
            id: 36,
            parentId: 33,
            name: '删除 SKU',
            permission: 'sku.delete',
            type: 'button',
          },
        ],
      },
    ],
  },
  {
    id: 40,
    parentId: 0,
    name: '订单管理',
    permission: 'order',
    type: 'menu',
    children: [
      {
        id: 41,
        parentId: 40,
        name: '修改订单状态',
        permission: 'order.updateStatus',
        type: 'button',
      },
    ],
  },
  {
    id: 42,
    parentId: 0,
    name: '操作日志',
    permission: 'operationLog',
    type: 'menu',
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
    'user.assignRole',
    'role',
    'role.add',
    'role.update',
    'role.delete',
    'role.assignPermission',
    'permission',
    'permission.add',
    'permission.update',
    'permission.delete',
    'product',
    'brand',
    'brand.add',
    'brand.update',
    'brand.delete',
    'attr',
    'attr.add',
    'attr.update',
    'attr.delete',
    'spu',
    'spu.add',
    'spu.update',
    'spu.delete',
    'sku',
    'sku.add',
    'sku.update',
    'sku.delete',
    'order',
    'order.updateStatus',
    'operationLog',
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
