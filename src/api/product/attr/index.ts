import request from '@/utils/request'
import type {
  AttrActionResponseData,
  AttrForm,
  AttrListResponseData,
  CategoryResponseData,
} from './type'

const API = {
  CATEGORY_URL: '/product/category',
  ATTR_LIST_URL: '/product/attr/list',
  ATTR_ADD_URL: '/product/attr/add',
  ATTR_UPDATE_URL: '/product/attr/update',
  ATTR_DELETE_URL: '/product/attr/delete',
} as const

export const reqCategoryList = (parentId: number) =>
  request.get<CategoryResponseData, CategoryResponseData>(`${API.CATEGORY_URL}/${parentId}`)

export const reqAttrList = (categoryId: number) =>
  request.get<AttrListResponseData, AttrListResponseData>(`${API.ATTR_LIST_URL}/${categoryId}`)

export const reqAddAttr = (data: AttrForm) =>
  request.post<AttrActionResponseData, AttrActionResponseData, AttrForm>(API.ATTR_ADD_URL, data)

export const reqUpdateAttr = (id: number, data: AttrForm) =>
  request.put<AttrActionResponseData, AttrActionResponseData, AttrForm>(
    `${API.ATTR_UPDATE_URL}/${id}`,
    data,
  )

export const reqDeleteAttr = (id: number) =>
  request.delete<AttrActionResponseData, AttrActionResponseData>(`${API.ATTR_DELETE_URL}/${id}`)
