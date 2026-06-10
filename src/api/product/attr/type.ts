export interface CategoryItem {
  id: number
  name: string
}

export interface AttrValue {
  id: number
  valueName: string
}

export interface AttrItem {
  id: number
  categoryId: number
  attrName: string
  values: AttrValue[]
}

export interface AttrForm {
  categoryId: number
  attrName: string
  values: AttrValue[]
}

export interface ResponseData<T = null> {
  code: number
  data: T
  message: string
}

export type CategoryResponseData = ResponseData<CategoryItem[]>
export type AttrListResponseData = ResponseData<AttrItem[]>
export type AttrActionResponseData = ResponseData<null>
