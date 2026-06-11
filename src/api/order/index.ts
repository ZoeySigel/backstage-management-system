import request from '@/utils/request'
import type {
  OrderActionResponseData,
  OrderDetailResponseData,
  OrderListParams,
  OrderListResponseData,
  OrderStatus,
} from './type'

const API = {
  LIST_URL: '/order/list',
  DETAIL_URL: '/order/detail',
  STATUS_URL: '/order/status',
} as const

export const reqOrderList = (params: OrderListParams) =>
  request.get<OrderListResponseData, OrderListResponseData>(API.LIST_URL, { params })

export const reqOrderDetail = (id: number) =>
  request.get<OrderDetailResponseData, OrderDetailResponseData>(`${API.DETAIL_URL}/${id}`)

export const reqUpdateOrderStatus = (id: number, status: OrderStatus) =>
  request.put<OrderActionResponseData, OrderActionResponseData, { status: OrderStatus }>(
    `${API.STATUS_URL}/${id}`,
    { status },
  )
