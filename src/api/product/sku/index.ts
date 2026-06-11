import request from '@/utils/request'
import type { SkuActionResponseData, SkuForm, SkuListParams, SkuListResponseData } from './type'

const API = {
  LIST_URL: '/product/sku/list',
  ADD_URL: '/product/sku/add',
  UPDATE_URL: '/product/sku/update',
  DELETE_URL: '/product/sku/delete',
  STATUS_URL: '/product/sku/status',
} as const

export const reqSkuList = (params: SkuListParams) =>
  request.get<SkuListResponseData, SkuListResponseData>(API.LIST_URL, { params })

export const reqAddSku = (data: SkuForm) =>
  request.post<SkuActionResponseData, SkuActionResponseData, SkuForm>(API.ADD_URL, data)

export const reqUpdateSku = (id: number, data: SkuForm) =>
  request.put<SkuActionResponseData, SkuActionResponseData, SkuForm>(
    `${API.UPDATE_URL}/${id}`,
    data,
  )

export const reqDeleteSku = (id: number) =>
  request.delete<SkuActionResponseData, SkuActionResponseData>(`${API.DELETE_URL}/${id}`)

export const reqUpdateSkuStatus = (id: number, status: boolean) =>
  request.put<SkuActionResponseData, SkuActionResponseData, { status: boolean }>(
    `${API.STATUS_URL}/${id}`,
    { status },
  )
