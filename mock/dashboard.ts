import type { MockMethod } from 'vite-plugin-mock'

export default [
  {
    url: '/api/dashboard/overview',
    method: 'get',
    response: () => ({
      code: 200,
      data: {
        stats: [
          { key: 'users', title: '用户总数', value: 1286, change: 12.5 },
          { key: 'spu', title: 'SPU 数量', value: 368, change: 8.2 },
          { key: 'sku', title: 'SKU 数量', value: 1258, change: 16.8 },
          { key: 'stock', title: '库存总量', value: 28640, change: -3.4 },
        ],
        salesTrend: {
          dates: ['06-05', '06-06', '06-07', '06-08', '06-09', '06-10', '06-11'],
          sales: [18200, 23600, 21900, 28400, 32100, 29800, 35600],
          orders: [128, 156, 142, 186, 208, 193, 235],
        },
        categorySales: [
          { name: '手机数码', value: 42 },
          { name: '电脑办公', value: 28 },
          { name: '家用电器', value: 18 },
          { name: '其他商品', value: 12 },
        ],
        lowStock: [
          { skuName: '旗舰智能手机 白色 512GB', stock: 8 },
          { skuName: '轻薄笔记本电脑 银色 16GB+1TB', stock: 12 },
          { skuName: '无线降噪耳机 黑色', stock: 16 },
          { skuName: '智能手表 运动版', stock: 19 },
        ],
      },
      message: 'success',
    }),
  },
] satisfies MockMethod[]
