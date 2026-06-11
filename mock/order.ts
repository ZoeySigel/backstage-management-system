import type { MockMethod } from 'vite-plugin-mock'

type OrderStatus = 'pending_payment' | 'pending_shipment' | 'shipped' | 'completed' | 'cancelled'

type OrderItem = {
  id: number
  orderNo: string
  customerName: string
  phone: string
  address: string
  amount: number
  status: OrderStatus
  products: {
    id: number
    skuName: string
    specs: string
    price: number
    quantity: number
    imageUrl: string
  }[]
  createTime: string
  payTime?: string
  shipTime?: string
}

const orderList: OrderItem[] = [
  {
    id: 1,
    orderNo: 'ORD202606110001',
    customerName: '张三',
    phone: '13800138001',
    address: '上海市浦东新区世纪大道 100 号',
    amount: 4999,
    status: 'pending_shipment',
    products: [
      {
        id: 1,
        skuName: '旗舰智能手机 黑色 256GB',
        specs: '颜色：黑色；存储：256GB',
        price: 4999,
        quantity: 1,
        imageUrl: '/favicon.svg',
      },
    ],
    createTime: '2026-06-11 09:20:00',
    payTime: '2026-06-11 09:22:00',
  },
  {
    id: 2,
    orderNo: 'ORD202606100008',
    customerName: '李四',
    phone: '13800138002',
    address: '北京市朝阳区建国路 88 号',
    amount: 5999,
    status: 'shipped',
    products: [
      {
        id: 2,
        skuName: '旗舰智能手机 白色 512GB',
        specs: '颜色：白色；存储：512GB',
        price: 5999,
        quantity: 1,
        imageUrl: '/favicon.svg',
      },
    ],
    createTime: '2026-06-10 13:10:00',
    payTime: '2026-06-10 13:12:00',
    shipTime: '2026-06-10 17:30:00',
  },
  {
    id: 3,
    orderNo: 'ORD202606090016',
    customerName: '王五',
    phone: '13800138003',
    address: '广东省深圳市南山区科技园 6 号',
    amount: 13998,
    status: 'completed',
    products: [
      {
        id: 3,
        skuName: '轻薄笔记本电脑 银色 16GB+1TB',
        specs: '颜色：银色；内存：16GB；硬盘：1TB',
        price: 6999,
        quantity: 2,
        imageUrl: '/favicon.svg',
      },
    ],
    createTime: '2026-06-09 10:35:00',
    payTime: '2026-06-09 10:38:00',
    shipTime: '2026-06-09 15:20:00',
  },
  {
    id: 4,
    orderNo: 'ORD202606080021',
    customerName: '赵六',
    phone: '13800138004',
    address: '浙江省杭州市西湖区文三路 20 号',
    amount: 6999,
    status: 'pending_payment',
    products: [
      {
        id: 4,
        skuName: '轻薄笔记本电脑 银色 16GB+1TB',
        specs: '颜色：银色；内存：16GB；硬盘：1TB',
        price: 6999,
        quantity: 1,
        imageUrl: '/favicon.svg',
      },
    ],
    createTime: '2026-06-08 16:05:00',
  },
  {
    id: 5,
    orderNo: 'ORD202606070013',
    customerName: '陈七',
    phone: '13800138005',
    address: '江苏省南京市鼓楼区中山路 18 号',
    amount: 4999,
    status: 'cancelled',
    products: [
      {
        id: 5,
        skuName: '旗舰智能手机 黑色 256GB',
        specs: '颜色：黑色；存储：256GB',
        price: 4999,
        quantity: 1,
        imageUrl: '/favicon.svg',
      },
    ],
    createTime: '2026-06-07 11:40:00',
  },
]

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ['cancelled'],
  pending_shipment: ['shipped', 'cancelled'],
  shipped: ['completed'],
  completed: [],
  cancelled: [],
}

export default [
  {
    url: '/api/order/list',
    method: 'get',
    response: ({ query }) => {
      const keyword = String(query.keyword || '').toLowerCase()
      const status = String(query.status || '')
      const page = Number(query.page || 1)
      const pageSize = Number(query.pageSize || 10)
      const filteredList = orderList.filter((item) => {
        const matchesKeyword =
          !keyword ||
          item.orderNo.toLowerCase().includes(keyword) ||
          item.customerName.toLowerCase().includes(keyword) ||
          item.phone.includes(keyword)
        const matchesStatus = !status || item.status === status
        return matchesKeyword && matchesStatus
      })
      const start = (page - 1) * pageSize

      return {
        code: 200,
        data: {
          records: filteredList.slice(start, start + pageSize),
          total: filteredList.length,
        },
        message: 'success',
      }
    },
  },
  {
    url: '/api/order/detail/:id',
    method: 'get',
    response: ({ query }) => {
      const order = orderList.find((item) => item.id === Number(query.id))
      return order
        ? { code: 200, data: order, message: 'success' }
        : { code: 201, data: null, message: 'Order not found' }
    },
  },
  {
    url: '/api/order/status/:id',
    method: 'put',
    response: ({ body, query }) => {
      const order = orderList.find((item) => item.id === Number(query.id))
      const nextStatus = body.status as OrderStatus

      if (!order) {
        return { code: 201, data: null, message: 'Order not found' }
      }

      if (!allowedTransitions[order.status].includes(nextStatus)) {
        return { code: 201, data: null, message: '不允许进行此状态变更' }
      }

      order.status = nextStatus

      if (nextStatus === 'shipped') {
        order.shipTime = new Date().toLocaleString()
      }

      return { code: 200, data: null, message: 'success' }
    },
  },
] satisfies MockMethod[]
