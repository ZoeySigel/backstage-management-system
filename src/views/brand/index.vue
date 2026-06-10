<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { reqAddBrand, reqBrandList, reqDeleteBrand, reqUpdateBrand } from '@/api/product/brand'
import type { BrandForm, BrandItem } from '@/api/product/brand/type'

type DialogMode = 'add' | 'edit'

const searchForm = reactive({ keyword: '' })
const tableData = ref<BrandItem[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(5)
const total = ref(0)

const dialogVisible = ref(false)
const dialogMode = ref<DialogMode>('add')
const editingBrandId = ref<number | null>(null)
const submitLoading = ref(false)
const deletingBrandId = ref<number | null>(null)
const formRef = ref<FormInstance>()
const dialogTitle = computed(() => (dialogMode.value === 'add' ? '新增品牌' : '编辑品牌'))

const brandForm = reactive<BrandForm>({
  name: '',
  logoUrl: '/favicon.svg',
  description: '',
})

const rules: FormRules<BrandForm> = {
  name: [{ required: true, message: '请输入品牌名称', trigger: 'blur' }],
  logoUrl: [{ required: true, message: '请输入 Logo 地址', trigger: 'blur' }],
}

const getBrandList = async () => {
  loading.value = true

  try {
    const result = await reqBrandList({
      keyword: searchForm.keyword,
      page: currentPage.value,
      pageSize: pageSize.value,
    })

    if (result.code !== 200) {
      ElMessage.error(result.message || '获取品牌列表失败')
      return
    }

    tableData.value = result.data.records
    total.value = result.data.total
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  getBrandList()
}

const handleReset = () => {
  searchForm.keyword = ''
  currentPage.value = 1
  getBrandList()
}

const resetForm = () => {
  brandForm.name = ''
  brandForm.logoUrl = '/favicon.svg'
  brandForm.description = ''
  editingBrandId.value = null
  formRef.value?.clearValidate()
}

const openAddDialog = () => {
  dialogMode.value = 'add'
  dialogVisible.value = true
}

const handleEdit = (row: BrandItem) => {
  dialogMode.value = 'edit'
  editingBrandId.value = row.id
  brandForm.name = row.name
  brandForm.logoUrl = row.logoUrl
  brandForm.description = row.description
  dialogVisible.value = true
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)

  if (!valid) {
    return
  }

  submitLoading.value = true

  try {
    const result =
      dialogMode.value === 'add'
        ? await reqAddBrand(brandForm)
        : await reqUpdateBrand(editingBrandId.value!, brandForm)

    if (result.code !== 200) {
      ElMessage.error(result.message || '保存品牌失败')
      return
    }

    ElMessage.success('保存品牌成功')
    dialogVisible.value = false
    currentPage.value = 1
    getBrandList()
  } finally {
    submitLoading.value = false
  }
}

const handleDelete = async (row: BrandItem) => {
  try {
    await ElMessageBox.confirm(`确定要删除品牌「${row.name}」吗？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }

  deletingBrandId.value = row.id

  try {
    const result = await reqDeleteBrand(row.id)

    if (result.code !== 200) {
      ElMessage.error(result.message || '删除品牌失败')
      return
    }

    if (tableData.value.length === 1 && currentPage.value > 1) {
      currentPage.value--
    }

    ElMessage.success('删除品牌成功')
    getBrandList()
  } finally {
    deletingBrandId.value = null
  }
}

onMounted(getBrandList)
</script>

<template>
  <main class="brand-page">
    <section class="toolbar">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="品牌名称">
          <el-input
            v-model.trim="searchForm.keyword"
            placeholder="请输入品牌名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button v-has="'brand.add'" type="success" @click="openAddDialog">新增品牌</el-button>
        </el-form-item>
      </el-form>
    </section>

    <section class="table-section">
      <el-table v-loading="loading" :data="tableData" border stripe>
        <el-table-column label="序号" width="80">
          <template #default="{ $index }">
            {{ (currentPage - 1) * pageSize + $index + 1 }}
          </template>
        </el-table-column>
        <el-table-column label="Logo" width="100">
          <template #default="{ row }">
            <el-image class="brand-logo" :src="row.logoUrl" fit="contain" />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="品牌名称" min-width="140" />
        <el-table-column prop="description" label="描述" min-width="220" />
        <el-table-column prop="createTime" label="创建时间" min-width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button v-has="'brand.update'" link type="primary" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button
              v-has="'brand.delete'"
              link
              type="danger"
              :loading="deletingBrandId === row.id"
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
          @size-change="getBrandList"
          @current-change="getBrandList"
        />
      </div>
    </section>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      align-center
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="brandForm" :rules="rules" label-width="90px">
        <el-form-item label="品牌名称" prop="name">
          <el-input v-model.trim="brandForm.name" placeholder="请输入品牌名称" />
        </el-form-item>
        <el-form-item label="品牌 Logo" prop="logoUrl">
          <ImageUpload v-model="brandForm.logoUrl" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model.trim="brandForm.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>
  </main>
</template>

<style scoped lang="scss">
.brand-page {
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

.brand-logo {
  width: 48px;
  height: 48px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
