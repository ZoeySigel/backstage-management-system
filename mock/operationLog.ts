import type { MockMethod } from 'vite-plugin-mock'

type OperationResult = 'success' | 'failure'

type OperationLogItem = {
  id: number
  operator: string
  module: string
  action: string
  method: string
  url: string
  ip: string
  location: string
  result: OperationResult
  message: string
  duration: number
  createTime: string
}

const operationLogList: OperationLogItem[] = [
  {
    id: 1,
    operator: 'admin',
    module: '订单管理',
    action: '订单发货',
    method: 'PUT',
    url: '/api/order/status/1',
    ip: '192.168.1.12',
    location: '上海市',
    result: 'success',
    message: '订单 ORD202606110001 已发货',
    duration: 86,
    createTime: '2026-06-11 10:28:16',
  },
  {
    id: 2,
    operator: 'admin',
    module: '用户管理',
    action: '新增用户',
    method: 'POST',
    url: '/api/acl/user/add',
    ip: '192.168.1.12',
    location: '上海市',
    result: 'success',
    message: '新增用户 zhangsan',
    duration: 124,
    createTime: '2026-06-11 09:42:08',
  },
  {
    id: 3,
    operator: 'system',
    module: '权限管理',
    action: '分配角色权限',
    method: 'POST',
    url: '/api/acl/role/2/permission',
    ip: '192.168.1.26',
    location: '北京市',
    result: 'success',
    message: '更新角色 system 的权限',
    duration: 152,
    createTime: '2026-06-10 17:35:42',
  },
  {
    id: 4,
    operator: 'admin',
    module: 'SKU 管理',
    action: '修改 SKU',
    method: 'PUT',
    url: '/api/product/sku/update/2',
    ip: '192.168.1.12',
    location: '上海市',
    result: 'failure',
    message: 'SKU 库存不能小于 0',
    duration: 65,
    createTime: '2026-06-10 16:18:30',
  },
  {
    id: 5,
    operator: 'admin',
    module: '品牌管理',
    action: '删除品牌',
    method: 'DELETE',
    url: '/api/product/brand/delete/4',
    ip: '192.168.1.12',
    location: '上海市',
    result: 'success',
    message: '删除品牌 Demo',
    duration: 73,
    createTime: '2026-06-10 14:06:19',
  },
  {
    id: 6,
    operator: 'system',
    module: '登录管理',
    action: '用户登录',
    method: 'POST',
    url: '/api/user/login',
    ip: '192.168.1.26',
    location: '北京市',
    result: 'failure',
    message: '用户名或密码错误',
    duration: 48,
    createTime: '2026-06-10 08:52:11',
  },
]

export default [
  {
    url: '/api/system/operation-log/list',
    method: 'get',
    response: ({ query }) => {
      const keyword = String(query.keyword || '').toLowerCase()
      const module = String(query.module || '')
      const result = String(query.result || '')
      const page = Number(query.page || 1)
      const pageSize = Number(query.pageSize || 10)
      const filteredList = operationLogList.filter((item) => {
        const matchesKeyword =
          !keyword ||
          item.operator.toLowerCase().includes(keyword) ||
          item.action.toLowerCase().includes(keyword) ||
          item.ip.includes(keyword)
        const matchesModule = !module || item.module === module
        const matchesResult = !result || item.result === result
        return matchesKeyword && matchesModule && matchesResult
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
    url: '/api/system/operation-log/detail/:id',
    method: 'get',
    response: ({ query }) => {
      const log = operationLogList.find((item) => item.id === Number(query.id))
      return log
        ? { code: 200, data: log, message: 'success' }
        : { code: 201, data: null, message: 'Operation log not found' }
    },
  },
] satisfies MockMethod[]
