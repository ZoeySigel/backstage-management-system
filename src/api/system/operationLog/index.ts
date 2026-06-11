import request from '@/utils/request'
import type {
  OperationLogDetailResponseData,
  OperationLogListParams,
  OperationLogListResponseData,
} from './type'

const API = {
  LIST_URL: '/system/operation-log/list',
  DETAIL_URL: '/system/operation-log/detail',
} as const

export const reqOperationLogList = (params: OperationLogListParams) =>
  request.get<OperationLogListResponseData, OperationLogListResponseData>(API.LIST_URL, { params })

export const reqOperationLogDetail = (id: number) =>
  request.get<OperationLogDetailResponseData, OperationLogDetailResponseData>(
    `${API.DETAIL_URL}/${id}`,
  )
