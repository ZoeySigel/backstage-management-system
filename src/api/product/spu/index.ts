import request from '@/utils/request'
import type { SpuActionResponseData, SpuForm, SpuListParams, SpuListResponseData } from './type'

const API = {
  LIST_URL: '/product/spu/list',
  ADD_URL: '/product/spu/add',
  UPDATE_URL: '/product/spu/update',
  DELETE_URL: '/product/spu/delete',
  STATUS_URL: '/product/spu/status',
} as const

export const reqSpuList = (params: SpuListParams) =>
  request.get<SpuListResponseData, SpuListResponseData>(API.LIST_URL, { params })

export const reqAddSpu = (data: SpuForm) =>
  request.post<SpuActionResponseData, SpuActionResponseData, SpuForm>(API.ADD_URL, data)

export const reqUpdateSpu = (id: number, data: SpuForm) =>
  request.put<SpuActionResponseData, SpuActionResponseData, SpuForm>(
    `${API.UPDATE_URL}/${id}`,
    data,
  )

export const reqDeleteSpu = (id: number) =>
  request.delete<SpuActionResponseData, SpuActionResponseData>(`${API.DELETE_URL}/${id}`)

export const reqUpdateSpuStatus = (id: number, status: boolean) =>
  request.put<SpuActionResponseData, SpuActionResponseData, { status: boolean }>(
    `${API.STATUS_URL}/${id}`,
    { status },
  )
