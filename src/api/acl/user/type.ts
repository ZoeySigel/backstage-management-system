export interface UserItem {
  id: number
  username: string
  name: string
  role: string
  status: boolean
  createTime: string
}

export interface UserListParams {
  keyword: string
  page: number
  pageSize: number
}

export interface UserListData {
  records: UserItem[]
  total: number
}

export interface UserForm {
  username: string
  name: string
  role: string
  status: boolean
}

export interface UserResponseData<T = null> {
  code: number
  data: T
  message: string
}

export interface RoleOption {
  id: number
  roleName: string
}

export interface UserRoleData {
  roles: RoleOption[]
  roleId: number
}

export interface AssignUserRoleForm {
  roleId: number
}

export type UserListResponseData = UserResponseData<UserListData>
export type UserActionResponseData = UserResponseData<null>
export type UserRoleResponseData = UserResponseData<UserRoleData>
