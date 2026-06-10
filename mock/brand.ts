import type { MockMethod } from 'vite-plugin-mock'

type BrandItem = {
  id: number
  name: string
  logoUrl: string
  description: string
  createTime: string
}

const brandList: BrandItem[] = [
  {
    id: 1,
    name: 'Vue',
    logoUrl: '/favicon.svg',
    description: '渐进式 JavaScript 框架',
    createTime: '2026-06-01 09:00:00',
  },
  {
    id: 2,
    name: 'Element Plus',
    logoUrl: '/favicon.svg',
    description: 'Vue 3 组件库',
    createTime: '2026-06-02 10:30:00',
  },
  {
    id: 3,
    name: 'Vite',
    logoUrl: '/favicon.svg',
    description: '现代前端构建工具',
    createTime: '2026-06-03 14:20:00',
  },
]

export default [
  {
    url: '/api/product/brand/list',
    method: 'get',
    response: ({ query }) => {
      const keyword = String(query.keyword || '').toLowerCase()
      const page = Number(query.page || 1)
      const pageSize = Number(query.pageSize || 10)
      const filteredList = keyword
        ? brandList.filter((item) => item.name.toLowerCase().includes(keyword))
        : brandList
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
    url: '/api/product/brand/add',
    method: 'post',
    response: ({ body }) => {
      brandList.unshift({
        id: Date.now(),
        name: body.name,
        logoUrl: body.logoUrl,
        description: body.description,
        createTime: new Date().toLocaleString(),
      })

      return { code: 200, data: null, message: 'success' }
    },
  },
  {
    url: '/api/product/brand/update/:id',
    method: 'put',
    response: ({ body, query }) => {
      const brand = brandList.find((item) => item.id === Number(query.id))

      if (!brand) {
        return { code: 201, data: null, message: 'Brand not found' }
      }

      brand.name = body.name
      brand.logoUrl = body.logoUrl
      brand.description = body.description
      return { code: 200, data: null, message: 'success' }
    },
  },
  {
    url: '/api/product/brand/delete/:id',
    method: 'delete',
    response: ({ query }) => {
      const index = brandList.findIndex((item) => item.id === Number(query.id))

      if (index !== -1) {
        brandList.splice(index, 1)
      }

      return { code: 200, data: null, message: 'success' }
    },
  },
] satisfies MockMethod[]
