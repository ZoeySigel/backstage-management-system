import type { MockMethod } from 'vite-plugin-mock'

const categories = [
  { id: 1, parentId: 0, name: '电子产品' },
  { id: 2, parentId: 0, name: '服装鞋包' },
  { id: 11, parentId: 1, name: '手机数码' },
  { id: 12, parentId: 1, name: '电脑办公' },
  { id: 21, parentId: 2, name: '男装' },
  { id: 22, parentId: 2, name: '女装' },
  { id: 111, parentId: 11, name: '智能手机' },
  { id: 112, parentId: 11, name: '耳机' },
  { id: 121, parentId: 12, name: '笔记本电脑' },
  { id: 211, parentId: 21, name: 'T 恤' },
  { id: 221, parentId: 22, name: '连衣裙' },
]

const attrList = [
  {
    id: 1,
    categoryId: 111,
    attrName: '颜色',
    values: [
      { id: 11, valueName: '黑色' },
      { id: 12, valueName: '白色' },
      { id: 13, valueName: '蓝色' },
    ],
  },
  {
    id: 2,
    categoryId: 111,
    attrName: '存储容量',
    values: [
      { id: 21, valueName: '128GB' },
      { id: 22, valueName: '256GB' },
      { id: 23, valueName: '512GB' },
    ],
  },
]

export default [
  {
    url: '/api/product/category/:parentId',
    method: 'get',
    response: ({ query }) => ({
      code: 200,
      data: categories.filter((item) => item.parentId === Number(query.parentId)),
      message: 'success',
    }),
  },
  {
    url: '/api/product/attr/list/:categoryId',
    method: 'get',
    response: ({ query }) => ({
      code: 200,
      data: attrList.filter((item) => item.categoryId === Number(query.categoryId)),
      message: 'success',
    }),
  },
  {
    url: '/api/product/attr/add',
    method: 'post',
    response: ({ body }) => {
      attrList.push({
        id: Date.now(),
        categoryId: body.categoryId,
        attrName: body.attrName,
        values: body.values.map((item: { valueName: string }, index: number) => ({
          id: Date.now() + index,
          valueName: item.valueName,
        })),
      })

      return { code: 200, data: null, message: 'success' }
    },
  },
  {
    url: '/api/product/attr/update/:id',
    method: 'put',
    response: ({ body, query }) => {
      const attr = attrList.find((item) => item.id === Number(query.id))

      if (!attr) {
        return { code: 201, data: null, message: 'Attribute not found' }
      }

      attr.attrName = body.attrName
      attr.values = body.values
      return { code: 200, data: null, message: 'success' }
    },
  },
  {
    url: '/api/product/attr/delete/:id',
    method: 'delete',
    response: ({ query }) => {
      const index = attrList.findIndex((item) => item.id === Number(query.id))

      if (index !== -1) {
        attrList.splice(index, 1)
      }

      return { code: 200, data: null, message: 'success' }
    },
  },
] satisfies MockMethod[]
