export type OperationResult = 'success' | 'failure'

export interface OperationLogItem {
  id: number
  operator: string
  module: string
  action: string
  method: string
  url: string
  ip: string
  location: string
  result: OperationResult
  message: string
  duration: number
  createTime: string
}

export interface OperationLogListParams {
  keyword: string
  module: string
  result: OperationResult | ''
  page: number
  pageSize: number
}

export interface ResponseData<T = null> {
  code: number
  data: T
  message: string
}

export type OperationLogListResponseData = ResponseData<{
  records: OperationLogItem[]
  total: number
}>

export type OperationLogDetailResponseData = ResponseData<OperationLogItem>
