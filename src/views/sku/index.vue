<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  reqAddSku,
  reqDeleteSku,
  reqSkuList,
  reqUpdateSku,
  reqUpdateSkuStatus,
} from '@/api/product/sku'
import type { SkuForm, SkuItem } from '@/api/product/sku/type'

const searchForm = reactive({ keyword: '' })
const tableData = ref<SkuItem[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(5)
const total = ref(0)

const drawerVisible = ref(false)
const editingId = ref<number | null>(null)
const submitLoading = ref(false)
const statusLoadingId = ref<number | null>(null)
const deletingId = ref<number | null>(null)
const formRef = ref<FormInstance>()
const drawerTitle = computed(() => (editingId.value ? '编辑 SKU' : '新增 SKU'))

const skuForm = reactive<SkuForm>({
  spuName: '',
  skuName: '',
  specs: '',
  price: 0,
  stock: 0,
  imageUrl: '/favicon.svg',
  status: true,
})

const rules: FormRules<SkuForm> = {
  spuName: [{ required: true, message: '请输入所属 SPU', trigger: 'blur' }],
  skuName: [{ required: true, message: '请输入 SKU 名称', trigger: 'blur' }],
  specs: [{ required: true, message: '请输入规格信息', trigger: 'blur' }],
  price: [{ required: true, message: '请输入销售价格', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存数量', trigger: 'blur' }],
  imageUrl: [{ required: true, message: '请上传 SKU 图片', trigger: 'change' }],
}

const getList = async () => {
  loading.value = true

  try {
    const result = await reqSkuList({
      keyword: searchForm.keyword,
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
  currentPage.value = 1
  getList()
}

const resetForm = () => {
  editingId.value = null
  Object.assign(skuForm, {
    spuName: '',
    skuName: '',
    specs: '',
    price: 0,
    stock: 0,
    imageUrl: '/favicon.svg',
    status: true,
  })
  formRef.value?.clearValidate()
}

const openAddDrawer = () => {
  resetForm()
  drawerVisible.value = true
}

const handleEdit = (row: SkuItem) => {
  editingId.value = row.id
  Object.assign(skuForm, row)
  drawerVisible.value = true
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)

  if (!valid) {
    return
  }

  submitLoading.value = true

  try {
    const result = editingId.value
      ? await reqUpdateSku(editingId.value, skuForm)
      : await reqAddSku(skuForm)

    if (result.code !== 200) {
      ElMessage.error(result.message || '保存 SKU 失败')
      return
    }

    ElMessage.success('保存 SKU 成功')
    drawerVisible.value = false
    currentPage.value = 1
    getList()
  } finally {
    submitLoading.value = false
  }
}

const handleStatusChange = async (row: SkuItem) => {
  statusLoadingId.value = row.id

  try {
    const result = await reqUpdateSkuStatus(row.id, row.status)

    if (result.code !== 200) {
      row.status = !row.status
      ElMessage.error(result.message || '更新上下架状态失败')
      return
    }

    ElMessage.success(row.status ? 'SKU 已上架' : 'SKU 已下架')
  } catch {
    row.status = !row.status
  } finally {
    statusLoadingId.value = null
  }
}

const handleDelete = async (row: SkuItem) => {
  try {
    await ElMessageBox.confirm(`确定要删除 SKU「${row.skuName}」吗？`, '删除确认', {
      type: 'warning',
    })
  } catch {
    return
  }

  deletingId.value = row.id

  try {
    const result = await reqDeleteSku(row.id)

    if (result.code === 200) {
      if (tableData.value.length === 1 && currentPage.value > 1) {
        currentPage.value--
      }
      ElMessage.success('删除 SKU 成功')
      getList()
    }
  } finally {
    deletingId.value = null
  }
}

onMounted(getList)
</script>

<template>
  <main class="sku-page">
    <section class="toolbar">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="商品名称">
          <el-input
            v-model.trim="searchForm.keyword"
            placeholder="搜索 SPU 或 SKU 名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button v-has="'sku.add'" type="success" @click="openAddDrawer">新增 SKU</el-button>
        </el-form-item>
      </el-form>
    </section>

    <section class="table-section">
      <el-table v-loading="loading" :data="tableData" border stripe>
        <el-table-column label="图片" width="90">
          <template #default="{ row }">
            <el-image class="product-image" :src="row.imageUrl" fit="contain" />
          </template>
        </el-table-column>
        <el-table-column prop="skuName" label="SKU 名称" min-width="220" />
        <el-table-column prop="spuName" label="所属 SPU" min-width="160" />
        <el-table-column prop="specs" label="规格" min-width="220" />
        <el-table-column label="售价" width="110">
          <template #default="{ row }">￥{{ Number(row.price).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="90" />
        <el-table-column label="上下架" width="130">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :loading="statusLoadingId === row.id"
              active-text="上架"
              inactive-text="下架"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button v-has="'sku.update'" link type="primary" @click="handleEdit(row)"
              >编辑</el-button
            >
            <el-button
              v-has="'sku.delete'"
              link
              type="danger"
              :loading="deletingId === row.id"
              @click="handleDelete(row)"
            >
              删除
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

    <el-drawer v-model="drawerVisible" :title="drawerTitle" size="520px" @closed="resetForm">
      <el-form ref="formRef" :model="skuForm" :rules="rules" label-width="90px">
        <el-form-item label="所属 SPU" prop="spuName">
          <el-input v-model.trim="skuForm.spuName" placeholder="例如：旗舰智能手机" />
        </el-form-item>
        <el-form-item label="SKU 名称" prop="skuName">
          <el-input v-model.trim="skuForm.skuName" placeholder="例如：旗舰智能手机 黑色 256GB" />
        </el-form-item>
        <el-form-item label="规格信息" prop="specs">
          <el-input v-model.trim="skuForm.specs" placeholder="例如：颜色：黑色；存储：256GB" />
        </el-form-item>
        <el-form-item label="销售价格" prop="price">
          <el-input-number v-model="skuForm.price" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="库存数量" prop="stock">
          <el-input-number v-model="skuForm.stock" :min="0" :precision="0" />
        </el-form-item>
        <el-form-item label="SKU 图片" prop="imageUrl">
          <ImageUpload v-model="skuForm.imageUrl" />
        </el-form-item>
        <el-form-item label="初始状态" prop="status">
          <el-switch v-model="skuForm.status" active-text="上架" inactive-text="下架" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="drawerVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">保存</el-button>
      </template>
    </el-drawer>
  </main>
</template>

<style scoped lang="scss">
.sku-page {
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

.product-image {
  width: 52px;
  height: 52px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
