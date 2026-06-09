import request from '@/utils/request'
import type {
  PermissionActionResponseData,
  PermissionForm,
  PermissionListResponseData,
} from './type'

const API = {
  LIST_URL: '/acl/permission/list',
  ADD_URL: '/acl/permission/add',
  UPDATE_URL: '/acl/permission/update',
  DELETE_URL: '/acl/permission/delete',
} as const

export const reqPermissionList = () =>
  request.get<PermissionListResponseData, PermissionListResponseData>(API.LIST_URL)

export const reqAddPermission = (data: PermissionForm) =>
  request.post<PermissionActionResponseData, PermissionActionResponseData, PermissionForm>(
    API.ADD_URL,
    data,
  )

export const reqUpdatePermission = (id: number, data: PermissionForm) =>
  request.put<PermissionActionResponseData, PermissionActionResponseData, PermissionForm>(
    `${API.UPDATE_URL}/${id}`,
    data,
  )

export const reqDeletePermission = (id: number) =>
  request.delete<PermissionActionResponseData, PermissionActionResponseData>(
    `${API.DELETE_URL}/${id}`,
  )
