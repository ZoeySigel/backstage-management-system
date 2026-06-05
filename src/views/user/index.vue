<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { UserForm, UserItem } from '@/api/acl/user/type'
import { reqAddUser, reqDeleteUser, reqUpdateUser, reqUserList } from '@/api/acl/user'

const searchForm = reactive({
  keyword: '',
})

const tableData = ref<UserItem[]>([])
const loading = ref(false)
const total = ref(0)

const currentPage = ref(1)
const pageSize = ref(2)

const dialogVisible = ref(false)
const submitLoading = ref(false)
const dialogMode = ref<'edit' | 'add'>('add')
const editingUserId = ref<number | null>(null)
const dialogTitle = computed(() => (dialogMode.value === 'add' ? '新增用户' : '编辑用户'))
const userFormRef = ref<FormInstance>()

const selectedRows = ref<UserItem[]>([])
const batchDeleting = ref(false)

const deletingUserId = ref<number | null>(null)
const switchingUserId = ref<number | null>(null)

const userForm = reactive<UserForm>({
  username: '',
  name: '',
  role: '',
  status: true,
})
const userRules: FormRules<UserForm> = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应为 3 到 20 位', trigger: 'blur' },
  ],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  role: [{ required: true, message: '请输入角色', trigger: 'blur' }],
}

const getUserList = async () => {
  loading.value = true

  try {
    const result = await reqUserList({
      keyword: searchForm.keyword,
      page: currentPage.value,
      pageSize: pageSize.value,
    })

    if (result.code !== 200) {
      ElMessage.error(result.message || '获取用户列表失败')
      return
    }

    tableData.value = result.data.records
    total.value = result.data.total
  } finally {
    loading.value = false
  }
}
const openAddDialog = () => {
  dialogMode.value = 'add'
  editingUserId.value = null
  dialogVisible.value = true
}
const resetUserForm = () => {
  userForm.username = ''
  userForm.name = ''
  userForm.role = ''
  userForm.status = true
  editingUserId.value = null
  userFormRef.value?.clearValidate()
}
const handleDialogClosed = () => {
  submitLoading.value = false
  resetUserForm()
}
const handleSubmit = async () => {
  const valid = await userFormRef.value?.validate().catch(() => false)

  if (!valid) {
    return
  }

  submitLoading.value = true

  try {
    if (dialogMode.value === 'add') {
      const result = await reqAddUser(userForm)

      if (result.code !== 200) {
        ElMessage.error(result.message || '新增用户失败')
        return
      }

      ElMessage.success('新增用户成功')
    } else {
      if (editingUserId.value === null) {
        return
      }

      const result = await reqUpdateUser(editingUserId.value, userForm)

      if (result.code !== 200) {
        ElMessage.error(result.message || '编辑用户失败')
        return
      }

      ElMessage.success('编辑用户成功')
    }

    dialogVisible.value = false
    currentPage.value = 1
    getUserList()
  } finally {
    submitLoading.value = false
  }
}
const handleSearch = () => {
  currentPage.value = 1
  getUserList()
}

const handleReset = () => {
  searchForm.keyword = ''
  currentPage.value = 1
  getUserList()
}

const handleEdit = (row: UserItem) => {
  dialogMode.value = 'edit'
  editingUserId.value = row.id

  userForm.username = row.username
  userForm.name = row.name
  userForm.role = row.role
  userForm.status = row.status

  dialogVisible.value = true
}

const handleDelete = async (row: UserItem) => {
  try {
    await ElMessageBox.confirm(`确定要删除用户「${row.username}」吗？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }

  deletingUserId.value = row.id

  try {
    const result = await reqDeleteUser(row.id)

    if (result.code !== 200) {
      ElMessage.error(result.message || '删除用户失败')
      return
    }

    ElMessage.success('删除用户成功')

    if (tableData.value.length === 1 && currentPage.value > 1) {
      currentPage.value--
    }

    getUserList()
  } finally {
    deletingUserId.value = null
  }
}
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  getUserList()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  getUserList()
}
const handleStatusChange = async (row: UserItem) => {
  switchingUserId.value = row.id

  try {
    const result = await reqUpdateUser(row.id, {
      username: row.username,
      name: row.name,
      role: row.role,
      status: row.status,
    })

    if (result.code !== 200) {
      ElMessage.error(result.message || '状态更新失败')
      row.status = !row.status
      return
    }

    ElMessage.success(row.status ? '已启用用户' : '已禁用用户')
  } catch {
    row.status = !row.status
  } finally {
    switchingUserId.value = null
  }
}
const handleSelectionChange = (rows: UserItem[]) => {
  selectedRows.value = rows
}
const handleBatchDelete = async () => {
  if (!selectedRows.value.length) {
    ElMessage.warning('请先选择要删除的用户')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 个用户吗？`,
      '批量删除确认',
      {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      },
    )
  } catch {
    return
  }

  batchDeleting.value = true

  try {
    await Promise.all(selectedRows.value.map((item) => reqDeleteUser(item.id)))

    ElMessage.success('批量删除成功')

    if (selectedRows.value.length === tableData.value.length && currentPage.value > 1) {
      currentPage.value--
    }

    selectedRows.value = []
    getUserList()
  } finally {
    batchDeleting.value = false
  }
}

onMounted(() => {
  getUserList()
})
</script>

<template>
  <main class="user-page">
    <section class="toolbar">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="用户名">
          <el-input v-model.trim="searchForm.keyword" placeholder="请输入用户名" clearable />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button v-has="'user.add'" type="success" @click="openAddDialog"> 新增用户 </el-button>
          <el-button
            v-has="'user.batchDelete'"
            type="danger"
            :disabled="!selectedRows.length"
            :loading="batchDeleting"
            @click="handleBatchDelete"
          >
            批量删除
          </el-button>
        </el-form-item>
      </el-form>
    </section>

    <section class="table-section">
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        empty-text="暂无匹配用户"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="序号" width="80">
          <template #default="{ $index }">
            {{ (currentPage - 1) * pageSize + $index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="name" label="姓名" min-width="120" />
        <el-table-column prop="role" label="角色" min-width="140" />

        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :loading="switchingUserId === row.id"
              active-text="启用"
              inactive-text="禁用"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="创建时间" min-width="180" />

        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button
              v-has="'user.update'"
              link
              type="primary"
              :disabled="deletingUserId === row.id"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              v-has="'user.delete'"
              link
              type="danger"
              :loading="deletingUserId === row.id"
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
          :page-sizes="[2, 5, 10]"
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
      @closed="handleDialogClosed"
    >
      <el-form ref="userFormRef" :model="userForm" :rules="userRules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model.trim="userForm.username" placeholder="请输入用户名" />
        </el-form-item>

        <el-form-item label="姓名" prop="name">
          <el-input v-model.trim="userForm.name" placeholder="请输入姓名" />
        </el-form-item>

        <el-form-item label="角色" prop="role">
          <el-input v-model.trim="userForm.role" placeholder="请输入角色" />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-switch v-model="userForm.status" active-text="启用" inactive-text="禁用" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </main>
</template>

<style scoped lang="scss">
.user-page {
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
