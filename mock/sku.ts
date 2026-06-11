import type { MockMethod } from 'vite-plugin-mock'

type SkuItem = {
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

const skuList: SkuItem[] = [
  {
    id: 1,
    spuName: '旗舰智能手机',
    skuName: '旗舰智能手机 黑色 256GB',
    specs: '颜色：黑色；存储：256GB',
    price: 4999,
    stock: 120,
    imageUrl: '/favicon.svg',
    status: true,
    createTime: '2026-06-01 10:00:00',
  },
  {
    id: 2,
    spuName: '旗舰智能手机',
    skuName: '旗舰智能手机 白色 512GB',
    specs: '颜色：白色；存储：512GB',
    price: 5999,
    stock: 36,
    imageUrl: '/favicon.svg',
    status: false,
    createTime: '2026-06-02 11:20:00',
  },
  {
    id: 3,
    spuName: '轻薄笔记本电脑',
    skuName: '轻薄笔记本电脑 银色 16GB+1TB',
    specs: '颜色：银色；内存：16GB；硬盘：1TB',
    price: 6999,
    stock: 58,
    imageUrl: '/favicon.svg',
    status: true,
    createTime: '2026-06-03 14:20:00',
  },
]

export default [
  {
    url: '/api/product/sku/list',
    method: 'get',
    response: ({ query }) => {
      const keyword = String(query.keyword || '').toLowerCase()
      const page = Number(query.page || 1)
      const pageSize = Number(query.pageSize || 10)
      const filteredList = keyword
        ? skuList.filter(
            (item) =>
              item.skuName.toLowerCase().includes(keyword) ||
              item.spuName.toLowerCase().includes(keyword),
          )
        : skuList
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
    url: '/api/product/sku/add',
    method: 'post',
    response: ({ body }) => {
      skuList.unshift({
        id: Date.now(),
        ...body,
        createTime: new Date().toLocaleString(),
      })
      return { code: 200, data: null, message: 'success' }
    },
  },
  {
    url: '/api/product/sku/update/:id',
    method: 'put',
    response: ({ body, query }) => {
      const sku = skuList.find((item) => item.id === Number(query.id))

      if (!sku) {
        return { code: 201, data: null, message: 'SKU not found' }
      }

      Object.assign(sku, body)
      return { code: 200, data: null, message: 'success' }
    },
  },
  {
    url: '/api/product/sku/status/:id',
    method: 'put',
    response: ({ body, query }) => {
      const sku = skuList.find((item) => item.id === Number(query.id))

      if (!sku) {
        return { code: 201, data: null, message: 'SKU not found' }
      }

      sku.status = Boolean(body.status)
      return { code: 200, data: null, message: 'success' }
    },
  },
  {
    url: '/api/product/sku/delete/:id',
    method: 'delete',
    response: ({ query }) => {
      const index = skuList.findIndex((item) => item.id === Number(query.id))

      if (index !== -1) {
        skuList.splice(index, 1)
      }

      return { code: 200, data: null, message: 'success' }
    },
  },
] satisfies MockMethod[]
