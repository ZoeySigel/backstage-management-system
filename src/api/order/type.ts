export type OrderStatus =
  | 'pending_payment'
  | 'pending_shipment'
  | 'shipped'
  | 'completed'
  | 'cancelled'

export interface OrderProduct {
  id: number
  skuName: string
  specs: string
  price: number
  quantity: number
  imageUrl: string
}

export interface OrderItem {
  id: number
  orderNo: string
  customerName: string
  phone: string
  address: string
  amount: number
  status: OrderStatus
  products: OrderProduct[]
  createTime: string
  payTime?: string
  shipTime?: string
}

export interface OrderListParams {
  keyword: string
  status: OrderStatus | ''
  page: number
  pageSize: number
}

export interface ResponseData<T = null> {
  code: number
  data: T
  message: string
}

export type OrderListResponseData = ResponseData<{
  records: OrderItem[]
  total: number
}>

export type OrderDetailResponseData = ResponseData<OrderItem>
export type OrderActionResponseData = ResponseData<null>
