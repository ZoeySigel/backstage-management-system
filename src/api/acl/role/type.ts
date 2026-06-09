import type { PermissionItem } from '@/api/acl/permission/type'
export interface RoleItem {
  id: number
  roleName: string
  remark: string
  createTime: string
}

export interface RoleForm {
  roleName: string
  remark: string
}

export interface RoleListParams {
  keyword: string
  page: number
  pageSize: number
}

export interface RoleListData {
  records: RoleItem[]
  total: number
}

export interface RoleResponseData<T = null> {
  code: number
  data: T
  message: string
}
export interface RolePermissionData {
  permissions: PermissionItem[]
  checkedPermissions: string[]
}

export interface AssignPermissionForm {
  permissions: string[]
}

export type RolePermissionResponseData = RoleResponseData<RolePermissionData>

export type RoleListResponseData = RoleResponseData<RoleListData>
export type RoleActionResponseData = RoleResponseData<null>
