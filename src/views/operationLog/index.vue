<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { reqOperationLogDetail, reqOperationLogList } from '@/api/system/operationLog'
import type { OperationLogItem, OperationResult } from '@/api/system/operationLog/type'

const moduleOptions = ['订单管理', '用户管理', '权限管理', 'SKU 管理', '品牌管理', '登录管理']

const searchForm = reactive<{ keyword: string; module: string; result: OperationResult | '' }>({
  keyword: '',
  module: '',
  result: '',
})
const tableData = ref<OperationLogItem[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(5)
const total = ref(0)
const detailVisible = ref(false)
const detailLoading = ref(false)
const logDetail = ref<OperationLogItem>()

const getList = async () => {
  loading.value = true

  try {
    const result = await reqOperationLogList({
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
  searchForm.module = ''
  searchForm.result = ''
  currentPage.value = 1
  getList()
}

const handleDetail = async (row: OperationLogItem) => {
  detailVisible.value = true
  detailLoading.value = true
  logDetail.value = undefined

  try {
    const result = await reqOperationLogDetail(row.id)

    if (result.code === 200) {
      logDetail.value = result.data
    }
  } finally {
    detailLoading.value = false
  }
}

onMounted(getList)
</script>

<template>
  <main class="log-page">
    <section class="toolbar">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="关键字">
          <el-input
            v-model.trim="searchForm.keyword"
            placeholder="操作者、操作名称或 IP"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="业务模块">
          <el-select v-model="searchForm.module" placeholder="全部模块" clearable>
            <el-option v-for="item in moduleOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作结果">
          <el-select v-model="searchForm.result" placeholder="全部结果" clearable>
            <el-option label="成功" value="success" />
            <el-option label="失败" value="failure" />
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
        <el-table-column prop="operator" label="操作者" width="100" />
        <el-table-column prop="module" label="业务模块" width="120" />
        <el-table-column prop="action" label="操作名称" min-width="150" />
        <el-table-column label="请求方式" width="100">
          <template #default="{ row }">
            <el-tag effect="plain">{{ row.method }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ip" label="IP 地址" width="130" />
        <el-table-column prop="location" label="操作地点" width="110" />
        <el-table-column label="操作结果" width="100">
          <template #default="{ row }">
            <el-tag :type="row.result === 'success' ? 'success' : 'danger'">
              {{ row.result === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="耗时" width="90" align="right">
          <template #default="{ row }">{{ row.duration }} ms</template>
        </el-table-column>
        <el-table-column prop="createTime" label="操作时间" min-width="170" />
        <el-table-column label="操作" width="90" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleDetail(row)">详情</el-button>
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

    <el-drawer v-model="detailVisible" title="操作日志详情" size="560px">
      <div v-loading="detailLoading">
        <el-descriptions v-if="logDetail" :column="1" border>
          <el-descriptions-item label="操作者">{{ logDetail.operator }}</el-descriptions-item>
          <el-descriptions-item label="业务模块">{{ logDetail.module }}</el-descriptions-item>
          <el-descriptions-item label="操作名称">{{ logDetail.action }}</el-descriptions-item>
          <el-descriptions-item label="请求地址">
            <code>{{ logDetail.method }} {{ logDetail.url }}</code>
          </el-descriptions-item>
          <el-descriptions-item label="IP 与地点">
            {{ logDetail.ip }}（{{ logDetail.location }}）
          </el-descriptions-item>
          <el-descriptions-item label="操作结果">
            <el-tag :type="logDetail.result === 'success' ? 'success' : 'danger'">
              {{ logDetail.result === 'success' ? '成功' : '失败' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="结果信息">{{ logDetail.message }}</el-descriptions-item>
          <el-descriptions-item label="请求耗时">{{ logDetail.duration }} ms</el-descriptions-item>
          <el-descriptions-item label="操作时间">{{ logDetail.createTime }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-drawer>
  </main>
</template>

<style scoped lang="scss">
.log-page {
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

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

code {
  padding: 3px 6px;
  color: #374151;
  background: #f3f4f6;
  border-radius: 3px;
}
</style>
