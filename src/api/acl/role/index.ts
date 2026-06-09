import request from '@/utils/request'

import type {
  RoleActionResponseData,
  RoleForm,
  RoleListParams,
  RoleListResponseData,
  AssignPermissionForm,
  RolePermissionResponseData,
} from './type'

const API = {
  ROLE_LIST_URL: '/acl/role/list',
  ROLE_ADD_URL: '/acl/role/add',
  ROLE_UPDATE_URL: '/acl/role/update',
  ROLE_DELETE_URL: '/acl/role/delete',
  ROLE_PERMISSION_URL: '/acl/role/permission',
  ROLE_ASSIGN_PERMISSION_URL: '/acl/role/assign-permission',
} as const

export const reqRoleList = (params: RoleListParams) =>
  request.get<RoleListResponseData, RoleListResponseData>(API.ROLE_LIST_URL, {
    params,
  })

export const reqAddRole = (data: RoleForm) =>
  request.post<RoleActionResponseData, RoleActionResponseData, RoleForm>(API.ROLE_ADD_URL, data)

export const reqUpdateRole = (id: number, data: RoleForm) =>
  request.put<RoleActionResponseData, RoleActionResponseData, RoleForm>(
    `${API.ROLE_UPDATE_URL}/${id}`,
    data,
  )

export const reqDeleteRole = (id: number) =>
  request.delete<RoleActionResponseData, RoleActionResponseData>(`${API.ROLE_DELETE_URL}/${id}`)

export const reqRolePermission = (id: number) =>
  request.get<RolePermissionResponseData, RolePermissionResponseData>(
    `${API.ROLE_PERMISSION_URL}/${id}`,
  )

export const reqAssignPermission = (id: number, data: AssignPermissionForm) =>
  request.post<RoleActionResponseData, RoleActionResponseData, AssignPermissionForm>(
    `${API.ROLE_ASSIGN_PERMISSION_URL}/${id}`,
    data,
  )
