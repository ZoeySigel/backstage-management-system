import request from '@/utils/request'
import type { UserActionResponseData, UserForm, UserListParams, UserListResponseData } from './type'

const API = {
  USER_LIST_URL: '/acl/user/list',
  USER_ADD_URL: '/acl/user/add',
  USER_UPDATE_URL: '/acl/user/update',
  USER_DELETE_URL: '/acl/user/delete',
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
