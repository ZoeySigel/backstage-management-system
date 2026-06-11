export interface SpuItem {
  id: number
  name: string
  brand: string
  category: string
  price: number
  imageUrl: string
  description: string
  status: boolean
  createTime: string
}

export interface SpuForm {
  name: string
  brand: string
  category: string
  price: number
  imageUrl: string
  description: string
  status: boolean
}

export interface SpuListParams {
  keyword: string
  page: number
  pageSize: number
}

export interface SpuListData {
  records: SpuItem[]
  total: number
}

export interface ResponseData<T = null> {
  code: number
  data: T
  message: string
}

export type SpuListResponseData = ResponseData<SpuListData>
export type SpuActionResponseData = ResponseData<null>
