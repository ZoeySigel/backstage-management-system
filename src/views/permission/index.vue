<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  reqAddPermission,
  reqDeletePermission,
  reqPermissionList,
  reqUpdatePermission,
} from '@/api/acl/permission'
import type { PermissionForm, PermissionItem, PermissionType } from '@/api/acl/permission/type'

const tableData = ref<PermissionItem[]>([])
const loading = ref(false)
type DialogMode = 'add' | 'edit'
const parentType = ref<PermissionType | null>(null)
const permissionTypeOptions = computed(() => {
  if (dialogMode.value === 'edit') {
    return [
      {
        label: getPermissionTypeLabel(permissionForm.type),
        value: permissionForm.type,
      },
    ]
  }

  if (parentType.value === 'directory') {
    return [{ label: '菜单', value: 'menu' as PermissionType }]
  }

  if (parentType.value === 'menu') {
    return [{ label: '按钮', value: 'button' as PermissionType }]
  }

  return [
    { label: '目录', value: 'directory' as PermissionType },
    { label: '菜单', value: 'menu' as PermissionType },
  ]
})
const getPermissionTypeLabel = (type: PermissionType) => {
  const labelMap: Record<PermissionType, string> = {
    directory: '目录',
    menu: '菜单',
    button: '按钮',
  }

  return labelMap[type]
}

const dialogVisible = ref(false)
const dialogMode = ref<DialogMode>('add')
const editingPermissionId = ref<number | null>(null)
const formRef = ref<FormInstance>()
const submitLoading = ref(false)

const dialogTitle = computed(() => (dialogMode.value === 'add' ? '新增权限' : '编辑权限'))

const permissionForm = reactive<PermissionForm>({
  parentId: 0,
  name: '',
  permission: '',
  type: 'menu',
})

const permissionRules: FormRules<PermissionForm> = {
  name: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
  permission: [{ required: true, message: '请输入权限标识', trigger: 'blur' }],
  type: [{ required: true, message: '请选择权限类型', trigger: 'change' }],
}
const resetForm = () => {
  permissionForm.parentId = 0
  permissionForm.name = ''
  permissionForm.permission = ''
  permissionForm.type = 'menu'
  editingPermissionId.value = null
  formRef.value?.clearValidate()
  parentType.value = null
}

const openAddDialog = (parent?: PermissionItem) => {
  dialogMode.value = 'add'
  permissionForm.parentId = parent?.id || 0
  parentType.value = parent?.type || null

  if (parent?.type === 'directory') {
    permissionForm.type = 'menu'
  } else if (parent?.type === 'menu') {
    permissionForm.type = 'button'
  } else {
    permissionForm.type = 'directory'
  }

  dialogVisible.value = true
}
const handleEdit = (row: PermissionItem) => {
  dialogMode.value = 'edit'
  editingPermissionId.value = row.id
  permissionForm.parentId = row.parentId
  permissionForm.name = row.name
  permissionForm.permission = row.permission
  permissionForm.type = row.type
  dialogVisible.value = true
  parentType.value = null
}

const handleDialogClosed = () => {
  submitLoading.value = false
  resetForm()
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
        ? await reqAddPermission(permissionForm)
        : await reqUpdatePermission(editingPermissionId.value!, permissionForm)

    if (result.code !== 200) {
      ElMessage.error(result.message || '保存权限失败')
      return
    }

    ElMessage.success('保存权限成功')
    dialogVisible.value = false
    getPermissionList()
  } finally {
    submitLoading.value = false
  }
}

const handleDelete = async (row: PermissionItem) => {
  try {
    await ElMessageBox.confirm(`确定要删除权限「${row.name}」吗？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }

  const result = await reqDeletePermission(row.id)

  if (result.code !== 200) {
    ElMessage.error(result.message || '删除权限失败')
    return
  }

  ElMessage.success('删除权限成功')
  getPermissionList()
}

const getPermissionList = async () => {
  loading.value = true

  try {
    const result = await reqPermissionList()

    if (result.code !== 200) {
      ElMessage.error(result.message || '获取权限列表失败')
      return
    }

    tableData.value = result.data
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getPermissionList()
})
</script>

<template>
  <main class="permission-page">
    <section class="toolbar">
      <el-button v-has="'permission.add'" type="success" @click="openAddDialog()">
        新增顶级权限
      </el-button>
    </section>
    <section class="table-section">
      <el-table v-loading="loading" :data="tableData" row-key="id" border default-expand-all>
        <el-table-column prop="name" label="权限名称" min-width="220" />

        <el-table-column prop="permission" label="权限标识" min-width="180" />

        <el-table-column label="权限类型" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.type === 'directory'" type="warning"> 目录 </el-tag>
            <el-tag v-else-if="row.type === 'menu'" type="primary"> 菜单 </el-tag>
            <el-tag v-else type="success"> 按钮 </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.type !== 'button'"
              v-has="'permission.add'"
              link
              type="success"
              @click="openAddDialog(row)"
            >
              新增子权限
            </el-button>

            <el-button v-has="'permission.update'" link type="primary" @click="handleEdit(row)">
              编辑
            </el-button>

            <el-button v-has="'permission.delete'" link type="danger" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="480px"
      align-center
      @closed="handleDialogClosed"
    >
      <el-form ref="formRef" :model="permissionForm" :rules="permissionRules" label-width="90px">
        <el-form-item label="父级 ID">
          <el-input :model-value="permissionForm.parentId" disabled />
        </el-form-item>

        <el-form-item label="权限名称" prop="name">
          <el-input v-model.trim="permissionForm.name" placeholder="例如：用户管理" />
        </el-form-item>

        <el-form-item label="权限标识" prop="permission">
          <el-input v-model.trim="permissionForm.permission" placeholder="例如：user.add" />
        </el-form-item>

        <el-form-item label="权限类型" prop="type">
          <el-radio-group v-model="permissionForm.type" :disabled="dialogMode === 'edit'">
            <el-radio-button
              v-for="item in permissionTypeOptions"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit"> 确定 </el-button>
      </template>
    </el-dialog>
  </main>
</template>

<style scoped lang="scss">
.permission-page {
  padding: 18px;
}

.table-section {
  padding: 18px;
  background: #fff;
  border-radius: 6px;
}
.permission-page {
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
</style>
