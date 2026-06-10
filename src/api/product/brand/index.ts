import request from '@/utils/request'
import type {
  BrandActionResponseData,
  BrandForm,
  BrandListParams,
  BrandListResponseData,
} from './type'

const API = {
  LIST_URL: '/product/brand/list',
  ADD_URL: '/product/brand/add',
  UPDATE_URL: '/product/brand/update',
  DELETE_URL: '/product/brand/delete',
} as const

export const reqBrandList = (params: BrandListParams) =>
  request.get<BrandListResponseData, BrandListResponseData>(API.LIST_URL, { params })

export const reqAddBrand = (data: BrandForm) =>
  request.post<BrandActionResponseData, BrandActionResponseData, BrandForm>(API.ADD_URL, data)

export const reqUpdateBrand = (id: number, data: BrandForm) =>
  request.put<BrandActionResponseData, BrandActionResponseData, BrandForm>(
    `${API.UPDATE_URL}/${id}`,
    data,
  )

export const reqDeleteBrand = (id: number) =>
  request.delete<BrandActionResponseData, BrandActionResponseData>(`${API.DELETE_URL}/${id}`)
