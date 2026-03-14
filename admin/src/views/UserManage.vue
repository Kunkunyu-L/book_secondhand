<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUsersApi, updateUserStatusApi, addViolationApi, updateUserRoleApi, addUserApi } from '../api'
import { useRouter } from 'vue-router'
import { formatTime } from '../utils/formatTime'

const router = useRouter()
const tableData = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const keyword = ref('')
const statusFilter = ref('all')
const roleFilter = ref('all')
const loading = ref(false)

// 违规处理弹窗
const violationDialogVisible = ref(false)
const violationUser = ref<any>(null)
const violationForm = ref({ type: 'warning' as string, reason: '' })

const loadData = async () => {
  loading.value = true
  try {
    const res: any = await getUsersApi({
      page: page.value, pageSize: pageSize.value,
      keyword: keyword.value, status: statusFilter.value, role: roleFilter.value,
    })
    if (res.status === 200) { tableData.value = res.data.list; total.value = res.data.total }
  } finally { loading.value = false }
}

// 角色编辑弹窗
const roleDialogVisible = ref(false)
const roleEditUser = ref<any>(null)
const roleForm = ref({ role: 'user' as string })

// 添加用户弹窗
const addUserDialogVisible = ref(false)
const addUserFormRef = ref()
const addUserForm = ref({
  username: '',
  password: '',
  phone: '',
  nickname: '',
  role: 'user' as string
})
const userFormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const handleStatusToggle = async (row: any) => {
  const action = row.status ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确定要${action}用户「${row.username}」吗？`, '提示', { type: 'warning' })
    const newStatus = row.status ? 0 : 1
    const res: any = await updateUserStatusApi({ id: row.id, status: newStatus })
    if (res.status === 200) { row.status = newStatus; ElMessage.success(`${action}成功`) }
  } catch { /* cancelled */ }
}

const openViolationDialog = (row: any) => {
  violationUser.value = row
  violationForm.value = { type: 'warning', reason: '' }
  violationDialogVisible.value = true
}

const submitViolation = async () => {
  if (!violationForm.value.reason.trim()) { ElMessage.warning('请填写处理原因'); return }
  try {
    const res: any = await addViolationApi({
      user_id: violationUser.value.id,
      type: violationForm.value.type,
      reason: violationForm.value.reason,
    })
    if (res.status === 200) {
      ElMessage.success('处理成功')
      violationDialogVisible.value = false
      loadData()
    }
  } catch { /* error */ }
}

const viewViolationHistory = (row: any) => {
  router.push(`/violations?user_id=${row.id}`)
}

const handleSearch = () => { page.value = 1; loadData() }

const handleRoleChange = () => { page.value = 1; loadData() }

const openRoleDialog = (row: any) => {
  roleEditUser.value = row
  roleForm.value.role = row.role || 'user'
  roleDialogVisible.value = true
}

const submitRoleUpdate = async () => {
  if (!roleEditUser.value) return
  try {
    const res: any = await updateUserRoleApi({ id: roleEditUser.value.id, role: roleForm.value.role })
    if (res.status === 200) {
      ElMessage.success('角色更新成功')
      roleEditUser.value.role = roleForm.value.role
      roleDialogVisible.value = false
      loadData()
    }
  } catch {
    // 错误处理
  }
}

const openAddUserDialog = () => {
  addUserForm.value = {
    username: '',
    password: '',
    phone: '',
    nickname: '',
    role: 'user'
  }
  addUserDialogVisible.value = true
}

const submitAddUser = async () => {
  try {
    const res: any = await addUserApi(addUserForm.value)
    if (res.status === 200) {
      ElMessage.success('添加用户成功')
      addUserDialogVisible.value = false
      loadData()
    }
  } catch {
    // 错误处理
  }
}

const getRoleLabel = (role: string) => {
  const map: Record<string, string> = {
    superAdmin: '超级管理员',
    operationAdmin: '运营管理员',
    customerService: '客服',
    user: '用户',
  }
  return map[role] || role || '用户'
}
const getRoleType = (role: string) => {
  const map: Record<string, string> = { superAdmin: 'danger', operationAdmin: 'warning', customerService: 'success' }
  return map[role] || ''
}

onMounted(loadData)
</script>

<template>
  <el-card shadow="never">
    <div class="admin-toolbar">
      <div class="admin-toolbar-filters">
        <el-select v-model="statusFilter" style="width:110px" @change="handleSearch">
          <el-option label="全部状态" value="all" />
          <el-option label="正常" value="1" />
          <el-option label="禁用" value="0" />
        </el-select>
        <el-select v-model="roleFilter" style="width:120px" @change="handleRoleChange">
          <el-option label="全部角色" value="all" />
          <el-option label="用户" value="user" />
          <el-option label="客服" value="customerService" />
          <el-option label="运营管理员" value="operationAdmin" />
          <el-option label="超级管理员" value="superAdmin" />
        </el-select>
        <el-input v-model="keyword" placeholder="搜索用户名/昵称/手机号" clearable style="width:280px"
          @keyup.enter="handleSearch" @clear="handleSearch" />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </div>
      <div class="admin-toolbar-actions">
        <el-button type="primary" @click="openAddUserDialog">
          <el-icon style="margin-right:4px"><Plus /></el-icon>添加用户
        </el-button>
      </div>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column label="头像" width="60" align="center">
        <template #default="{ row }">
          <el-avatar :size="30" :src="row.avatar"><el-icon><User /></el-icon></el-avatar>
        </template>
      </el-table-column>
      <el-table-column prop="username" label="用户名" width="110" />
      <el-table-column prop="nickname" label="昵称" width="100">
        <template #default="{ row }">{{ row.nickname || '-' }}</template>
      </el-table-column>
      <el-table-column prop="phone" label="手机号" width="120">
        <template #default="{ row }">{{ row.phone || '-' }}</template>
      </el-table-column>
      <el-table-column label="角色" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="getRoleType(row.role) as any" size="small">{{ getRoleLabel(row.role) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="信用分" width="70" align="center">
        <template #default="{ row }">
          <span :style="{ color: (row.credit_score || 100) < 80 ? '#F56C6C' : '#303133' }">{{ row.credit_score ?? 100 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="70" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status ? 'success' : 'danger'" size="small">{{ row.status ? '正常' : '禁用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="学校/专业" min-width="140">
        <template #default="{ row }">
          <span v-if="row.school || row.major" style="font-size:12px;color:#4b5563">
            {{ [row.school, row.major].filter(Boolean).join(' · ') }}
          </span>
          <span v-else style="color:#d1d5db">—</span>
        </template>
      </el-table-column>
      <el-table-column label="余额" width="80" align="center">
        <template #default="{ row }">{{ row.account ?? 0 }}</template>
      </el-table-column>
      <el-table-column label="注册时间" min-width="160">
        <template #default="{ row }">{{ formatTime(row.created_at) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="280" fixed="right" align="center">
        <template #default="{ row }">
          <div style="white-space: nowrap;">
            <el-button :type="row.status ? 'danger' : 'success'" text size="small" @click="handleStatusToggle(row)" style="margin: 0 2px;">
              {{ row.status ? '禁用' : '启用' }}
            </el-button>
            <el-button type="warning" text size="small" @click="openViolationDialog(row)" style="margin: 0 2px;">违规处理</el-button>
            <el-button type="primary" text size="small" @click="viewViolationHistory(row)" style="margin: 0 2px;">记录</el-button>
            <el-button type="info" text size="small" @click="openRoleDialog(row)" style="margin: 0 2px;">修改角色</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination v-model:current-page="page" v-model:page-size="pageSize" :total="total"
        :page-sizes="[10,20,50]" layout="total, sizes, prev, pager, next"
        @size-change="() => { page = 1; loadData() }" @current-change="loadData" />
    </div>

    <!-- 违规处理弹窗 -->
    <el-dialog v-model="violationDialogVisible" title="违规处理" width="500px" destroy-on-close>
      <p style="margin-bottom:12px">
        用户：<strong>{{ violationUser?.nickname || violationUser?.username }}</strong>
        <span style="color:#909399;margin-left:8px">(ID: {{ violationUser?.id }})</span>
      </p>
      <el-form :model="violationForm" label-width="80px">
        <el-form-item label="处理类型">
          <el-radio-group v-model="violationForm.type">
            <el-radio value="warning">警告</el-radio>
            <el-radio value="freeze">冻结账号</el-radio>
            <el-radio value="unfreeze">解封账号</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="处理原因">
          <el-input v-model="violationForm.reason" type="textarea" :rows="4" placeholder="请填写违规原因或处理理由..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="violationDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitViolation">确认处理</el-button>
      </template>
    </el-dialog>

    <!-- 角色编辑弹窗 -->
    <el-dialog v-model="roleDialogVisible" title="修改角色" width="500px" destroy-on-close>
      <p style="margin-bottom:12px">
        用户：<strong>{{ roleEditUser?.nickname || roleEditUser?.username }}</strong>
        <span style="color:#909399;margin-left:8px">(ID: {{ roleEditUser?.id }})</span>
      </p>
      <el-form :model="roleForm" label-width="80px">
        <el-form-item label="用户角色">
          <el-radio-group v-model="roleForm.role">
            <el-radio value="user">用户</el-radio>
            <el-radio value="customerService">客服</el-radio>
            <el-radio value="operationAdmin">运营管理员</el-radio>
            <el-radio value="superAdmin">超级管理员</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitRoleUpdate">确认修改</el-button>
      </template>
    </el-dialog>

    <!-- 添加用户弹窗 -->
    <el-dialog v-model="addUserDialogVisible" title="添加用户" width="500px" destroy-on-close>
      <el-form :model="addUserForm" label-width="80px" :rules="userFormRules" ref="addUserFormRef">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addUserForm.username" placeholder="请输入用户名" maxlength="50" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addUserForm.password" type="password" placeholder="请输入密码" maxlength="50" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="addUserForm.phone" placeholder="请输入手机号" maxlength="20" />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="addUserForm.nickname" placeholder="请输入昵称" maxlength="50" />
        </el-form-item>
        <el-form-item label="用户角色">
          <el-radio-group v-model="addUserForm.role">
            <el-radio value="user">用户</el-radio>
            <el-radio value="customerService">客服</el-radio>
            <el-radio value="operationAdmin">运营管理员</el-radio>
            <el-radio value="superAdmin">超级管理员</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addUserDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAddUser">确认添加</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<style scoped>
.pagination { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
