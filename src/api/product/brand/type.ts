export interface BrandItem {
  id: number
  name: string
  logoUrl: string
  description: string
  createTime: string
}

export interface BrandForm {
  name: string
  logoUrl: string
  description: string
}

export interface BrandListParams {
  keyword: string
  page: number
  pageSize: number
}

export interface BrandListData {
  records: BrandItem[]
  total: number
}

export interface BrandResponseData<T = null> {
  code: number
  data: T
  message: string
}

export type BrandListResponseData = BrandResponseData<BrandListData>
export type BrandActionResponseData = BrandResponseData<null>
