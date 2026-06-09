export type PermissionType = 'directory' | 'menu' | 'button'

export interface PermissionItem {
  id: number
  parentId: number
  name: string
  permission: string
  type: PermissionType
  children?: PermissionItem[]
}

export interface PermissionForm {
  parentId: number
  name: string
  permission: string
  type: PermissionType
}

export interface PermissionResponseData<T = null> {
  code: number
  data: T
  message: string
}

export type PermissionListResponseData = PermissionResponseData<PermissionItem[]>
export type PermissionActionResponseData = PermissionResponseData<null>
