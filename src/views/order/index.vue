<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { reqOrderDetail, reqOrderList, reqUpdateOrderStatus } from '@/api/order'
import type { OrderItem, OrderStatus } from '@/api/order/type'

const statusOptions: { label: string; value: OrderStatus }[] = [
  { label: '待付款', value: 'pending_payment' },
  { label: '待发货', value: 'pending_shipment' },
  { label: '已发货', value: 'shipped' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' },
]

const statusMap: Record<
  OrderStatus,
  { label: string; type: 'warning' | 'primary' | 'success' | 'info' | 'danger' }
> = {
  pending_payment: { label: '待付款', type: 'warning' },
  pending_shipment: { label: '待发货', type: 'primary' },
  shipped: { label: '已发货', type: 'success' },
  completed: { label: '已完成', type: 'info' },
  cancelled: { label: '已取消', type: 'danger' },
}

const searchForm = reactive<{ keyword: string; status: OrderStatus | '' }>({
  keyword: '',
  status: '',
})
const tableData = ref<OrderItem[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(5)
const total = ref(0)
const actionLoadingId = ref<number | null>(null)
const detailVisible = ref(false)
const detailLoading = ref(false)
const orderDetail = ref<OrderItem>()

const getList = async () => {
  loading.value = true

  try {
    const result = await reqOrderList({
      ...searchForm,
      page: currentPage.value,
      pageSize: pageSize.value,
    })

    if (result.code === 200) {
      tableData.value = result.data.records
      total.value = result.data.total
    }
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  getList()
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.status = ''
  currentPage.value = 1
  getList()
}

const handleDetail = async (row: OrderItem) => {
  detailVisible.value = true
  detailLoading.value = true
  orderDetail.value = undefined

  try {
    const result = await reqOrderDetail(row.id)

    if (result.code === 200) {
      orderDetail.value = result.data
    }
  } finally {
    detailLoading.value = false
  }
}

const updateStatus = async (row: OrderItem, status: OrderStatus, actionName: string) => {
  try {
    await ElMessageBox.confirm(`确定要将订单 ${row.orderNo} ${actionName}吗？`, '订单状态确认', {
      type: 'warning',
    })
  } catch {
    return
  }

  actionLoadingId.value = row.id

  try {
    const result = await reqUpdateOrderStatus(row.id, status)

    if (result.code !== 200) {
      ElMessage.error(result.message || '修改订单状态失败')
      return
    }

    ElMessage.success(`订单已${actionName}`)
    getList()
  } finally {
    actionLoadingId.value = null
  }
}

const formatAmount = (amount: number) => `￥${amount.toFixed(2)}`

onMounted(getList)
</script>

<template>
  <main class="order-page">
    <section class="toolbar">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="订单搜索">
          <el-input
            v-model.trim="searchForm.keyword"
            placeholder="订单号、客户名或手机号"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable>
            <el-option
              v-for="option in statusOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </section>

    <section class="table-section">
      <el-table v-loading="loading" :data="tableData" border stripe>
        <el-table-column prop="orderNo" label="订单号" min-width="180" />
        <el-table-column prop="customerName" label="客户" width="100" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column label="商品数量" width="100" align="center">
          <template #default="{ row }">
            {{
              row.products.reduce(
                (total: number, item: { quantity: number }) => total + item.quantity,
                0,
              )
            }}
          </template>
        </el-table-column>
        <el-table-column label="订单金额" width="130" align="right">
          <template #default="{ row }">
            <strong class="amount">{{ formatAmount(row.amount) }}</strong>
          </template>
        </el-table-column>
        <el-table-column label="订单状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusMap[row.status as OrderStatus].type">
              {{ statusMap[row.status as OrderStatus].label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="170" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleDetail(row)">详情</el-button>
            <el-button
              v-if="row.status === 'pending_shipment'"
              v-has="'order.updateStatus'"
              link
              type="success"
              :loading="actionLoadingId === row.id"
              @click="updateStatus(row, 'shipped', '发货')"
            >
              发货
            </el-button>
            <el-button
              v-if="row.status === 'shipped'"
              v-has="'order.updateStatus'"
              link
              type="success"
              :loading="actionLoadingId === row.id"
              @click="updateStatus(row, 'completed', '完成')"
            >
              完成
            </el-button>
            <el-button
              v-if="['pending_payment', 'pending_shipment'].includes(row.status)"
              v-has="'order.updateStatus'"
              link
              type="danger"
              :loading="actionLoadingId === row.id"
              @click="updateStatus(row, 'cancelled', '取消')"
            >
              取消
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="getList"
          @current-change="getList"
        />
      </div>
    </section>

    <el-drawer v-model="detailVisible" title="订单详情" size="620px">
      <div v-loading="detailLoading">
        <template v-if="orderDetail">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="订单号">{{ orderDetail.orderNo }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="statusMap[orderDetail.status].type">
                {{ statusMap[orderDetail.status].label }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="收货人">{{
              orderDetail.customerName
            }}</el-descriptions-item>
            <el-descriptions-item label="手机号">{{ orderDetail.phone }}</el-descriptions-item>
            <el-descriptions-item label="收货地址" :span="2">
              {{ orderDetail.address }}
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{
              orderDetail.createTime
            }}</el-descriptions-item>
            <el-descriptions-item label="支付时间">{{
              orderDetail.payTime || '-'
            }}</el-descriptions-item>
            <el-descriptions-item label="发货时间">{{
              orderDetail.shipTime || '-'
            }}</el-descriptions-item>
            <el-descriptions-item label="订单金额">
              <strong class="amount">{{ formatAmount(orderDetail.amount) }}</strong>
            </el-descriptions-item>
          </el-descriptions>

          <h3>商品明细</h3>
          <el-table :data="orderDetail.products" border>
            <el-table-column label="商品" min-width="220">
              <template #default="{ row }">
                <div class="product">
                  <el-image class="product-image" :src="row.imageUrl" fit="contain" />
                  <div>
                    <strong>{{ row.skuName }}</strong>
                    <p>{{ row.specs }}</p>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="单价" width="110" align="right">
              <template #default="{ row }">{{ formatAmount(row.price) }}</template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" width="70" align="center" />
          </el-table>
        </template>
      </div>
    </el-drawer>
  </main>
</template>

<style scoped lang="scss">
.order-page {
  padding: 18px;
}

.toolbar,
.table-section {
  padding: 18px;
  background: #fff;
  border-radius: 6px;
}

.table-section {
  margin-top: 16px;
}

.amount {
  color: #dc2626;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

h3 {
  margin: 24px 0 12px;
  color: #303133;
  font-size: 16px;
}

.product {
  display: flex;
  gap: 10px;
  align-items: center;

  p {
    margin: 5px 0 0;
    color: #909399;
    font-size: 12px;
  }
}

.product-image {
  flex: 0 0 48px;
  width: 48px;
  height: 48px;
}
</style>
