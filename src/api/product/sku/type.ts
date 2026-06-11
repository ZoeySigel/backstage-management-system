export interface SkuItem {
  id: number
  spuName: string
  skuName: string
  specs: string
  price: number
  stock: number
  imageUrl: string
  status: boolean
  createTime: string
}

export interface SkuForm {
  spuName: string
  skuName: string
  specs: string
  price: number
  stock: number
  imageUrl: string
  status: boolean
}

export interface SkuListParams {
  keyword: string
  page: number
  pageSize: number
}

export interface ResponseData<T = null> {
  code: number
  data: T
  message: string
}

export type SkuListResponseData = ResponseData<{
  records: SkuItem[]
  total: number
}>

export type SkuActionResponseData = ResponseData<null>
