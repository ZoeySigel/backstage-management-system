export interface DashboardStat {
  key: 'users' | 'spu' | 'sku' | 'stock'
  title: string
  value: number
  change: number
}

export interface SalesTrend {
  dates: string[]
  sales: number[]
  orders: number[]
}

export interface CategorySale {
  name: string
  value: number
}

export interface DashboardData {
  stats: DashboardStat[]
  salesTrend: SalesTrend
  categorySales: CategorySale[]
  lowStock: {
    skuName: string
    stock: number
  }[]
}

export interface DashboardResponseData {
  code: number
  data: DashboardData
  message: string
}
