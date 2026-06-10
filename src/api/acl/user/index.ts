import request from '@/utils/request'
import type {
  AssignUserRoleForm,
  UserActionResponseData,
  UserForm,
  UserListParams,
  UserListResponseData,
  UserRoleResponseData,
} from './type'

const API = {
  USER_LIST_URL: '/acl/user/list',
  USER_ADD_URL: '/acl/user/add',
  USER_UPDATE_URL: '/acl/user/update',
  USER_DELETE_URL: '/acl/user/delete',
  USER_ROLE_URL: '/acl/user/role',
  USER_ASSIGN_ROLE_URL: '/acl/user/assign-role',
} as const

export const reqUserList = (params: UserListParams) =>
  request.get<UserListResponseData, UserListResponseData>(API.USER_LIST_URL, { params })

export const reqAddUser = (data: UserForm) =>
  request.post<UserActionResponseData, UserActionResponseData, UserForm>(API.USER_ADD_URL, data)

export const reqUpdateUser = (id: number, data: UserForm) =>
  request.put<UserActionResponseData, UserActionResponseData, UserForm>(
    `${API.USER_UPDATE_URL}/${id}`,
    data,
  )

export const reqDeleteUser = (id: number) =>
  request.delete<UserActionResponseData, UserActionResponseData>(`${API.USER_DELETE_URL}/${id}`)

export const reqUserRole = (id: number) =>
  request.get<UserRoleResponseData, UserRoleResponseData>(`${API.USER_ROLE_URL}/${id}`)

export const reqAssignUserRole = (id: number, data: AssignUserRoleForm) =>
  request.post<UserActionResponseData, UserActionResponseData, AssignUserRoleForm>(
    `${API.USER_ASSIGN_ROLE_URL}/${id}`,
    data,
  )
