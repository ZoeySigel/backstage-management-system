<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import type { PermissionItem } from '@/api/acl/permission/type'
import type { FormInstance, FormRules, TreeInstance } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  reqAddRole,
  reqDeleteRole,
  reqRoleList,
  reqUpdateRole,
  reqAssignPermission,
  reqRolePermission,
} from '@/api/acl/role'
import type { RoleForm, RoleItem } from '@/api/acl/role/type'
const searchForm = reactive({
  keyword: '',
})

const tableData = ref<RoleItem[]>([])
const loading = ref(false)

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

type DialogMode = 'add' | 'edit'

const dialogVisible = ref(false)
const dialogMode = ref<DialogMode>('add')
const editingRoleId = ref<number | null>(null)
const submitLoading = ref(false)
const deletingRoleId = ref<number | null>(null)

const roleFormRef = ref<FormInstance>()

const dialogTitle = computed(() => (dialogMode.value === 'add' ? '新增角色' : '编辑角色'))

const permissionVisible = ref(false)
const permissionLoading = ref(false)
const permissionTree = ref<PermissionItem[]>([])
const currentRole = ref<RoleItem | null>(null)
const treeRef = ref<TreeInstance>()

const getLeafPermissionKeys = (list: PermissionItem[]): string[] =>
  list.flatMap((item) =>
    item.children?.length ? getLeafPermissionKeys(item.children) : [item.permission],
  )

const roleForm = reactive<RoleForm>({
  roleName: '',
  remark: '',
})
const roleRules: FormRules<RoleForm> = {
  roleName: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 20, message: '角色名称长度应为 2 到 20 位', trigger: 'blur' },
  ],
}
const resetRoleForm = () => {
  roleForm.roleName = ''
  roleForm.remark = ''
  editingRoleId.value = null
  roleFormRef.value?.clearValidate()
}

const openAddDialog = () => {
  dialogMode.value = 'add'
  editingRoleId.value = null
  dialogVisible.value = true
}

const handleEdit = (row: RoleItem) => {
  dialogMode.value = 'edit'
  editingRoleId.value = row.id
  roleForm.roleName = row.roleName
  roleForm.remark = row.remark
  dialogVisible.value = true
}

const handleDialogClosed = () => {
  submitLoading.value = false
  resetRoleForm()
}
const handleSubmit = async () => {
  const valid = await roleFormRef.value?.validate().catch(() => false)

  if (!valid) {
    return
  }

  submitLoading.value = true

  try {
    if (dialogMode.value === 'add') {
      const result = await reqAddRole(roleForm)

      if (result.code !== 200) {
        ElMessage.error(result.message || '新增角色失败')
        return
      }

      ElMessage.success('新增角色成功')
    } else {
      if (editingRoleId.value === null) {
        return
      }

      const result = await reqUpdateRole(editingRoleId.value, roleForm)

      if (result.code !== 200) {
        ElMessage.error(result.message || '编辑角色失败')
        return
      }

      ElMessage.success('编辑角色成功')
    }

    dialogVisible.value = false
    currentPage.value = 1
    getRoleList()
  } finally {
    submitLoading.value = false
  }
}
const handleDelete = async (row: RoleItem) => {
  try {
    await ElMessageBox.confirm(`确定要删除角色「${row.roleName}」吗？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }

  deletingRoleId.value = row.id

  try {
    const result = await reqDeleteRole(row.id)

    if (result.code !== 200) {
      ElMessage.error(result.message || '删除角色失败')
      return
    }

    ElMessage.success('删除角色成功')

    if (tableData.value.length === 1 && currentPage.value > 1) {
      currentPage.value--
    }

    getRoleList()
  } finally {
    deletingRoleId.value = null
  }
}

const handleSearch = () => {
  currentPage.value = 1
  getRoleList()
}

const handleReset = () => {
  searchForm.keyword = ''
  currentPage.value = 1
  getRoleList()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  getRoleList()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  getRoleList()
}
const getRoleList = async () => {
  loading.value = true

  try {
    const result = await reqRoleList({
      keyword: searchForm.keyword,
      page: currentPage.value,
      pageSize: pageSize.value,
    })

    if (result.code !== 200) {
      ElMessage.error(result.message || '获取角色列表失败')
      return
    }

    tableData.value = result.data.records
    total.value = result.data.total
  } finally {
    loading.value = false
  }
}
const handleAssignPermission = async (row: RoleItem) => {
  currentRole.value = row
  permissionVisible.value = true
  permissionLoading.value = true

  try {
    const result = await reqRolePermission(row.id)

    if (result.code !== 200) {
      ElMessage.error(result.message || '获取角色权限失败')
      return
    }

    permissionTree.value = result.data.permissions
    await nextTick()
    treeRef.value?.setCheckedKeys([])
    const leafKeys = getLeafPermissionKeys(permissionTree.value)
    const checkedLeafKeys = result.data.checkedPermissions.filter((item) => leafKeys.includes(item))
    treeRef.value?.setCheckedKeys(checkedLeafKeys)
  } finally {
    permissionLoading.value = false
  }
}
const handleSavePermission = async () => {
  if (!currentRole.value) {
    return
  }

  const checkedKeys = treeRef.value?.getCheckedKeys(false) || []
  const halfCheckedKeys = treeRef.value?.getHalfCheckedKeys() || []

  permissionLoading.value = true

  try {
    const result = await reqAssignPermission(currentRole.value.id, {
      permissions: [...checkedKeys, ...halfCheckedKeys].map(String),
    })

    if (result.code !== 200) {
      ElMessage.error(result.message || '保存权限失败')
      return
    }

    ElMessage.success('保存权限成功')
    permissionVisible.value = false
  } finally {
    permissionLoading.value = false
  }
}
onMounted(() => {
  getRoleList()
})
</script>

<template>
  <main class="role-page">
    <section class="toolbar">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="角色名称">
          <el-input
            v-model.trim="searchForm.keyword"
            placeholder="请输入角色名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="openAddDialog"> 新增角色 </el-button>
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
        <el-table-column prop="roleName" label="角色名称" min-width="160" />
        <el-table-column prop="remark" label="备注" min-width="220" />
        <el-table-column prop="createTime" label="创建时间" min-width="180" />

        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button
              v-has="'role.update'"
              link
              type="primary"
              :disabled="deletingRoleId === row.id"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>

            <el-button
              v-has="'role.assignPermission'"
              link
              type="warning"
              @click="handleAssignPermission(row)"
            >
              分配权限
            </el-button>

            <el-button
              v-has="'role.delete'"
              link
              type="danger"
              :loading="deletingRoleId === row.id"
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
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </section>
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="460px"
      align-center
      @closed="handleDialogClosed"
    >
      <el-form ref="roleFormRef" :model="roleForm" :rules="roleRules" label-width="90px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model.trim="roleForm.roleName" placeholder="请输入角色名称" />
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input
            v-model.trim="roleForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit"> 确定 </el-button>
      </template>
    </el-dialog>
    <el-dialog
      v-model="permissionVisible"
      :title="`分配权限：${currentRole?.roleName || ''}`"
      width="520px"
      align-center
    >
      <el-tree
        ref="treeRef"
        v-loading="permissionLoading"
        :data="permissionTree"
        node-key="permission"
        show-checkbox
        default-expand-all
        :props="{ label: 'name', children: 'children' }"
      />

      <template #footer>
        <el-button @click="permissionVisible = false">取消</el-button>
        <el-button type="primary" :loading="permissionLoading" @click="handleSavePermission">
          保存
        </el-button>
      </template>
    </el-dialog>
  </main>
</template>

<style scoped lang="scss">
.role-page {
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
</style>
