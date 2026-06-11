<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  reqAddSpu,
  reqDeleteSpu,
  reqSpuList,
  reqUpdateSpu,
  reqUpdateSpuStatus,
} from '@/api/product/spu'
import type { SpuForm, SpuItem } from '@/api/product/spu/type'

const searchForm = reactive({ keyword: '' })
const tableData = ref<SpuItem[]>([])
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
const drawerTitle = computed(() => (editingId.value ? '编辑 SPU' : '新增 SPU'))

const spuForm = reactive<SpuForm>({
  name: '',
  brand: '',
  category: '',
  price: 0,
  imageUrl: '/favicon.svg',
  description: '',
  status: true,
})

const rules: FormRules<SpuForm> = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  brand: [{ required: true, message: '请输入品牌', trigger: 'blur' }],
  category: [{ required: true, message: '请输入分类', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  imageUrl: [{ required: true, message: '请上传商品图片', trigger: 'change' }],
}

const getList = async () => {
  loading.value = true

  try {
    const result = await reqSpuList({
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
  Object.assign(spuForm, {
    name: '',
    brand: '',
    category: '',
    price: 0,
    imageUrl: '/favicon.svg',
    description: '',
    status: true,
  })
  formRef.value?.clearValidate()
}

const openAddDrawer = () => {
  resetForm()
  drawerVisible.value = true
}

const handleEdit = (row: SpuItem) => {
  editingId.value = row.id
  Object.assign(spuForm, row)
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
      ? await reqUpdateSpu(editingId.value, spuForm)
      : await reqAddSpu(spuForm)

    if (result.code !== 200) {
      ElMessage.error(result.message || '保存商品失败')
      return
    }

    ElMessage.success('保存商品成功')
    drawerVisible.value = false
    currentPage.value = 1
    getList()
  } finally {
    submitLoading.value = false
  }
}

const handleStatusChange = async (row: SpuItem) => {
  statusLoadingId.value = row.id

  try {
    const result = await reqUpdateSpuStatus(row.id, row.status)

    if (result.code !== 200) {
      row.status = !row.status
      ElMessage.error(result.message || '更新上下架状态失败')
      return
    }

    ElMessage.success(row.status ? '商品已上架' : '商品已下架')
  } catch {
    row.status = !row.status
  } finally {
    statusLoadingId.value = null
  }
}

const handleDelete = async (row: SpuItem) => {
  try {
    await ElMessageBox.confirm(`确定要删除商品「${row.name}」吗？`, '删除确认', {
      type: 'warning',
    })
  } catch {
    return
  }

  deletingId.value = row.id

  try {
    const result = await reqDeleteSpu(row.id)

    if (result.code === 200) {
      if (tableData.value.length === 1 && currentPage.value > 1) {
        currentPage.value--
      }
      ElMessage.success('删除商品成功')
      getList()
    }
  } finally {
    deletingId.value = null
  }
}

onMounted(getList)
</script>

<template>
  <main class="spu-page">
    <section class="toolbar">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="商品名称">
          <el-input
            v-model.trim="searchForm.keyword"
            placeholder="请输入商品名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button v-has="'spu.add'" type="success" @click="openAddDrawer">新增 SPU</el-button>
        </el-form-item>
      </el-form>
    </section>

    <section class="table-section">
      <el-table v-loading="loading" :data="tableData" border stripe>
        <el-table-column label="商品图" width="90">
          <template #default="{ row }">
            <el-image class="product-image" :src="row.imageUrl" fit="contain" />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="商品名称" min-width="180" />
        <el-table-column prop="brand" label="品牌" min-width="120" />
        <el-table-column prop="category" label="分类" min-width="140" />
        <el-table-column label="价格" width="110">
          <template #default="{ row }">¥{{ Number(row.price).toFixed(2) }}</template>
        </el-table-column>
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
            <el-button v-has="'spu.update'" link type="primary" @click="handleEdit(row)"
              >编辑</el-button
            >
            <el-button
              v-has="'spu.delete'"
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
      <el-form ref="formRef" :model="spuForm" :rules="rules" label-width="90px">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model.trim="spuForm.name" />
        </el-form-item>
        <el-form-item label="品牌" prop="brand">
          <el-input v-model.trim="spuForm.brand" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-input v-model.trim="spuForm.category" />
        </el-form-item>
        <el-form-item label="参考价格" prop="price">
          <el-input-number v-model="spuForm.price" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="商品图片" prop="imageUrl">
          <ImageUpload v-model="spuForm.imageUrl" />
        </el-form-item>
        <el-form-item label="商品描述" prop="description">
          <el-input v-model.trim="spuForm.description" type="textarea" :rows="5" />
        </el-form-item>
        <el-form-item label="初始状态" prop="status">
          <el-switch v-model="spuForm.status" active-text="上架" inactive-text="下架" />
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
.spu-page {
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
