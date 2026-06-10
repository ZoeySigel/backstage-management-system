<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  reqAddAttr,
  reqAttrList,
  reqCategoryList,
  reqDeleteAttr,
  reqUpdateAttr,
} from '@/api/product/attr'
import type { AttrForm, AttrItem, CategoryItem } from '@/api/product/attr/type'

const category1List = ref<CategoryItem[]>([])
const category2List = ref<CategoryItem[]>([])
const category3List = ref<CategoryItem[]>([])
const category1Id = ref<number | null>(null)
const category2Id = ref<number | null>(null)
const category3Id = ref<number | null>(null)

const tableData = ref<AttrItem[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const submitLoading = ref(false)
const editingAttrId = ref<number | null>(null)

const attrForm = reactive<AttrForm>({
  categoryId: 0,
  attrName: '',
  values: [],
})

const loadCategories = async (parentId: number) => {
  const result = await reqCategoryList(parentId)
  return result.code === 200 ? result.data : []
}

const handleCategory1Change = async () => {
  category2Id.value = null
  category3Id.value = null
  category3List.value = []
  tableData.value = []
  category2List.value = category1Id.value ? await loadCategories(category1Id.value) : []
}

const handleCategory2Change = async () => {
  category3Id.value = null
  tableData.value = []
  category3List.value = category2Id.value ? await loadCategories(category2Id.value) : []
}

const getAttrList = async () => {
  if (!category3Id.value) {
    tableData.value = []
    return
  }

  loading.value = true

  try {
    const result = await reqAttrList(category3Id.value)
    tableData.value = result.code === 200 ? result.data : []
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  attrForm.categoryId = category3Id.value || 0
  attrForm.attrName = ''
  attrForm.values = []
  editingAttrId.value = null
}

const openAddDialog = () => {
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: AttrItem) => {
  editingAttrId.value = row.id
  attrForm.categoryId = row.categoryId
  attrForm.attrName = row.attrName
  attrForm.values = row.values.map((item) => ({ ...item }))
  dialogVisible.value = true
}

const addValue = () => {
  attrForm.values.push({
    id: Date.now(),
    valueName: '',
  })
}

const removeValue = (index: number) => {
  attrForm.values.splice(index, 1)
}

const handleSubmit = async () => {
  const attrName = attrForm.attrName.trim()
  const values = attrForm.values
    .map((item) => ({ ...item, valueName: item.valueName.trim() }))
    .filter((item) => item.valueName)

  if (!attrName) {
    ElMessage.warning('请输入属性名称')
    return
  }

  if (!values.length) {
    ElMessage.warning('请至少添加一个属性值')
    return
  }

  submitLoading.value = true

  try {
    const data: AttrForm = {
      categoryId: attrForm.categoryId,
      attrName,
      values,
    }
    const result = editingAttrId.value
      ? await reqUpdateAttr(editingAttrId.value, data)
      : await reqAddAttr(data)

    if (result.code !== 200) {
      ElMessage.error(result.message || '保存属性失败')
      return
    }

    ElMessage.success('保存属性成功')
    dialogVisible.value = false
    getAttrList()
  } finally {
    submitLoading.value = false
  }
}

const handleDelete = async (row: AttrItem) => {
  try {
    await ElMessageBox.confirm(`确定要删除属性「${row.attrName}」吗？`, '删除确认', {
      type: 'warning',
    })
  } catch {
    return
  }

  const result = await reqDeleteAttr(row.id)

  if (result.code === 200) {
    ElMessage.success('删除属性成功')
    getAttrList()
  }
}

onMounted(async () => {
  category1List.value = await loadCategories(0)
})
</script>

<template>
  <main class="attr-page">
    <section class="category-bar">
      <el-select
        v-model="category1Id"
        placeholder="一级分类"
        clearable
        @change="handleCategory1Change"
      >
        <el-option
          v-for="item in category1List"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
      <el-select
        v-model="category2Id"
        placeholder="二级分类"
        clearable
        :disabled="!category1Id"
        @change="handleCategory2Change"
      >
        <el-option
          v-for="item in category2List"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
      <el-select
        v-model="category3Id"
        placeholder="三级分类"
        clearable
        :disabled="!category2Id"
        @change="getAttrList"
      >
        <el-option
          v-for="item in category3List"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>

      <el-button v-has="'attr.add'" type="success" :disabled="!category3Id" @click="openAddDialog">
        新增属性
      </el-button>
    </section>

    <section class="table-section">
      <el-table v-loading="loading" :data="tableData" border stripe empty-text="请选择三级分类">
        <el-table-column type="index" label="序号" width="80" />
        <el-table-column prop="attrName" label="属性名称" min-width="160" />
        <el-table-column label="属性值" min-width="320">
          <template #default="{ row }">
            <el-tag v-for="item in row.values" :key="item.id" class="value-tag">
              {{ item.valueName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button v-has="'attr.update'" link type="primary" @click="handleEdit(row)"
              >编辑</el-button
            >
            <el-button v-has="'attr.delete'" link type="danger" @click="handleDelete(row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </section>

    <el-dialog
      v-model="dialogVisible"
      :title="editingAttrId ? '编辑属性' : '新增属性'"
      width="560px"
      align-center
      @closed="resetForm"
    >
      <el-form label-width="90px">
        <el-form-item label="属性名称">
          <el-input v-model.trim="attrForm.attrName" placeholder="例如：颜色" />
        </el-form-item>
        <el-form-item label="属性值">
          <div class="value-editor">
            <div v-for="(item, index) in attrForm.values" :key="item.id" class="value-row">
              <el-input v-model.trim="item.valueName" placeholder="请输入属性值" />
              <el-button type="danger" text @click="removeValue(index)">删除</el-button>
            </div>
            <el-button type="primary" plain @click="addValue">添加属性值</el-button>
          </div>
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
.attr-page {
  padding: 18px;
}

.category-bar,
.table-section {
  padding: 18px;
  background: #fff;
  border-radius: 6px;
}

.category-bar {
  display: flex;
  gap: 12px;
  align-items: center;
}

.category-bar :deep(.el-select) {
  width: 180px;
}

.table-section {
  margin-top: 16px;
}

.value-tag {
  margin: 3px 6px 3px 0;
}

.value-editor {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
}

.value-row {
  display: flex;
  gap: 8px;
}
</style>
