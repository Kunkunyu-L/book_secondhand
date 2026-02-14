<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUsersApi, updateUserStatusApi, addViolationApi } from '../api'
import { useRouter } from 'vue-router'

const router = useRouter()
const tableData = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const keyword = ref('')
const statusFilter = ref('all')
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
      keyword: keyword.value, status: statusFilter.value,
    })
    if (res.status === 200) { tableData.value = res.data.list; total.value = res.data.total }
  } finally { loading.value = false }
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

const getRoleLabel = (role: string) => {
  const map: Record<string, string> = { admin: '管理员', user: '普通用户', customer_service: '客服' }
  return map[role] || role || '普通用户'
}
const getRoleType = (role: string) => {
  const map: Record<string, string> = { admin: 'danger', customer_service: 'warning' }
  return map[role] || ''
}

onMounted(loadData)
</script>

<template>
  <el-card shadow="never">
    <div class="toolbar">
      <el-select v-model="statusFilter" style="width:110px" @change="handleSearch">
        <el-option label="全部状态" value="all" />
        <el-option label="正常" value="1" />
        <el-option label="禁用" value="0" />
      </el-select>
      <el-input v-model="keyword" placeholder="搜索用户名/昵称/手机号" clearable style="width:280px"
        @keyup.enter="handleSearch" @clear="handleSearch" />
      <el-button type="primary" @click="handleSearch">搜索</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="60" align="center" />
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
      <el-table-column label="余额" width="80" align="center">
        <template #default="{ row }">{{ row.account ?? 0 }}</template>
      </el-table-column>
      <el-table-column prop="created_at" label="注册时间" min-width="160" />
      <el-table-column label="操作" width="210" fixed="right" align="center">
        <template #default="{ row }">
          <el-button :type="row.status ? 'danger' : 'success'" text size="small" @click="handleStatusToggle(row)">
            {{ row.status ? '禁用' : '启用' }}
          </el-button>
          <el-button type="warning" text size="small" @click="openViolationDialog(row)">违规处理</el-button>
          <el-button type="primary" text size="small" @click="viewViolationHistory(row)">记录</el-button>
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
  </el-card>
</template>

<style scoped>
.toolbar { display: flex; gap: 12px; margin-bottom: 16px; }
.pagination { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
