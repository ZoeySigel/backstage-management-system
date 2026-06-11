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
    name: '星澜科技',
    logoUrl: 'https://placehold.co/160x80/2563EB/FFFFFF?text=STARLAN',
    description: '专注智能手机、平板电脑与可穿戴设备的消费电子品牌。',
    createTime: '2024-03-18 09:26:41',
  },
  {
    id: 2,
    name: '云栖智造',
    logoUrl: 'https://placehold.co/160x80/0F766E/FFFFFF?text=CLOUDNEST',
    description: '面向年轻家庭提供智能照明、安防和全屋互联设备。',
    createTime: '2024-05-09 14:12:08',
  },
  {
    id: 3,
    name: '森屿生活',
    logoUrl: 'https://placehold.co/160x80/15803D/FFFFFF?text=FOREST+ISLE',
    description: '主打环保材质和简约设计的家居生活用品品牌。',
    createTime: '2024-07-22 11:35:19',
  },
  {
    id: 4,
    name: '北辰数码',
    logoUrl: 'https://placehold.co/160x80/4338CA/FFFFFF?text=NORTHSTAR',
    description: '提供轻薄笔记本、显示器和高性能电脑周边产品。',
    createTime: '2024-09-03 16:48:52',
  },
  {
    id: 5,
    name: '青禾家电',
    logoUrl: 'https://placehold.co/160x80/0891B2/FFFFFF?text=QINGHE',
    description: '聚焦节能、静音和易清洁的小型家用电器品牌。',
    createTime: '2024-11-16 10:05:33',
  },
  {
    id: 6,
    name: '凌越运动',
    logoUrl: 'https://placehold.co/160x80/DC2626/FFFFFF?text=LEAPFIT',
    description: '覆盖跑步、健身和户外训练装备的专业运动品牌。',
    createTime: '2025-01-08 13:42:17',
  },
  {
    id: 7,
    name: '微光影像',
    logoUrl: 'https://placehold.co/160x80/7C3AED/FFFFFF?text=GLIMMER',
    description: '为内容创作者提供相机配件、补光灯和桌面拍摄设备。',
    createTime: '2025-02-27 15:18:06',
  },
  {
    id: 8,
    name: '澄心办公',
    logoUrl: 'https://placehold.co/160x80/475569/FFFFFF?text=CLEARWORK',
    description: '打造高效舒适办公空间的人体工学与文具用品品牌。',
    createTime: '2025-04-12 08:56:44',
  },
  {
    id: 9,
    name: '宿野户外',
    logoUrl: 'https://placehold.co/160x80/A16207/FFFFFF?text=WILDREST',
    description: '提供露营帐篷、折叠家具和便携炊具等户外装备。',
    createTime: '2025-06-21 17:24:39',
  },
  {
    id: 10,
    name: '云朵母婴',
    logoUrl: 'https://placehold.co/160x80/DB2777/FFFFFF?text=CLOUDKIDS',
    description: '专注安全材质与舒适体验的婴幼儿日用品品牌。',
    createTime: '2025-08-05 12:30:25',
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
