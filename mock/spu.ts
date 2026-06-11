import type { MockMethod } from 'vite-plugin-mock'

type SpuItem = {
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

const spuList: SpuItem[] = [
  {
    id: 1,
    name: '旗舰智能手机',
    brand: 'Vue',
    category: '智能手机',
    price: 4999,
    imageUrl: '/favicon.svg',
    description: '高性能智能手机系列',
    status: true,
    createTime: '2026-06-01 10:00:00',
  },
  {
    id: 2,
    name: '轻薄笔记本电脑',
    brand: 'Vite',
    category: '笔记本电脑',
    price: 6999,
    imageUrl: '/favicon.svg',
    description: '适合移动办公的轻薄本',
    status: false,
    createTime: '2026-06-03 14:20:00',
  },
]

export default [
  {
    url: '/api/product/spu/list',
    method: 'get',
    response: ({ query }) => {
      const keyword = String(query.keyword || '').toLowerCase()
      const page = Number(query.page || 1)
      const pageSize = Number(query.pageSize || 10)
      const filteredList = keyword
        ? spuList.filter((item) => item.name.toLowerCase().includes(keyword))
        : spuList
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
    url: '/api/product/spu/add',
    method: 'post',
    response: ({ body }) => {
      spuList.unshift({
        id: Date.now(),
        ...body,
        createTime: new Date().toLocaleString(),
      })
      return { code: 200, data: null, message: 'success' }
    },
  },
  {
    url: '/api/product/spu/update/:id',
    method: 'put',
    response: ({ body, query }) => {
      const spu = spuList.find((item) => item.id === Number(query.id))

      if (!spu) {
        return { code: 201, data: null, message: 'SPU not found' }
      }

      Object.assign(spu, body)
      return { code: 200, data: null, message: 'success' }
    },
  },
  {
    url: '/api/product/spu/status/:id',
    method: 'put',
    response: ({ body, query }) => {
      const spu = spuList.find((item) => item.id === Number(query.id))

      if (!spu) {
        return { code: 201, data: null, message: 'SPU not found' }
      }

      spu.status = Boolean(body.status)
      return { code: 200, data: null, message: 'success' }
    },
  },
  {
    url: '/api/product/spu/delete/:id',
    method: 'delete',
    response: ({ query }) => {
      const index = spuList.findIndex((item) => item.id === Number(query.id))

      if (index !== -1) {
        spuList.splice(index, 1)
      }

      return { code: 200, data: null, message: 'success' }
    },
  },
] satisfies MockMethod[]
