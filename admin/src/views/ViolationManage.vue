<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getViolationListApi, addViolationApi, getUsersApi } from '../api'

const tableData = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const keyword = ref('')
const loading = ref(false)

// 新增违规弹窗
const dialogVisible = ref(false)
const violationForm = ref({ user_id: '', type: 'warning' as string, reason: '' })
const userSearchResults = ref<any[]>([])
const userSearchLoading = ref(false)

const typeMap: Record<string, { text: string; type: string }> = {
  warning: { text: '警告', type: 'warning' },
  freeze: { text: '冻结账号', type: 'danger' },
  unfreeze: { text: '解封账号', type: 'success' },
}

const loadData = async () => {
  loading.value = true
  try {
    const res: any = await getViolationListApi({
      page: page.value, pageSize: pageSize.value, keyword: keyword.value,
    })
    if (res.status === 200) { tableData.value = res.data.list; total.value = res.data.total }
  } finally { loading.value = false }
}

const searchUsers = async (q: string) => {
  if (!q || q.length < 1) { userSearchResults.value = []; return }
  userSearchLoading.value = true
  try {
    const res: any = await getUsersApi({ keyword: q, pageSize: 10 })
    if (res.status === 200) userSearchResults.value = res.data.list
  } finally { userSearchLoading.value = false }
}

const openAddDialog = () => {
  violationForm.value = { user_id: '', type: 'warning', reason: '' }
  userSearchResults.value = []
  dialogVisible.value = true
}

const submitViolation = async () => {
  if (!violationForm.value.user_id) { ElMessage.warning('请选择用户'); return }
  if (!violationForm.value.reason.trim()) { ElMessage.warning('请填写原因'); return }
  try {
    const res: any = await addViolationApi(violationForm.value)
    if (res.status === 200) {
      ElMessage.success('处理成功')
      dialogVisible.value = false
      loadData()
    }
  } catch { /* error */ }
}

const handleSearch = () => { page.value = 1; loadData() }

onMounted(loadData)
</script>

<template>
  <el-card shadow="never">
    <div class="toolbar">
      <el-input v-model="keyword" placeholder="搜索用户名/昵称" clearable style="width:280px"
        @keyup.enter="handleSearch" @clear="handleSearch" />
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button type="danger" @click="openAddDialog">
        <el-icon style="margin-right:4px"><Plus /></el-icon>新增违规处理
      </el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="60" align="center" />
      <el-table-column label="用户" width="130">
        <template #default="{ row }">
          <div>{{ row.nickname || row.username }}</div>
          <div style="font-size:11px;color:#909399">ID: {{ row.user_id }}</div>
        </template>
      </el-table-column>
      <el-table-column label="处理类型" width="110" align="center">
        <template #default="{ row }">
          <el-tag :type="(typeMap[row.type]?.type || '') as any" size="small">{{ typeMap[row.type]?.text || row.type }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="reason" label="原因" min-width="200" show-overflow-tooltip />
      <el-table-column label="用户当前状态" width="110" align="center">
        <template #default="{ row }">
          <el-tag :type="row.user_status ? 'success' : 'danger'" size="small">{{ row.user_status ? '正常' : '已冻结' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="admin_name" label="操作人" width="100" />
      <el-table-column prop="created_at" label="处理时间" width="170" />
    </el-table>

    <div class="pagination">
      <el-pagination v-model:current-page="page" v-model:page-size="pageSize" :total="total"
        :page-sizes="[10,20,50]" layout="total, sizes, prev, pager, next"
        @size-change="() => { page = 1; loadData() }" @current-change="loadData" />
    </div>

    <!-- 新增违规处理弹窗 -->
    <el-dialog v-model="dialogVisible" title="新增违规处理" width="520px" destroy-on-close>
      <el-form :model="violationForm" label-width="80px">
        <el-form-item label="选择用户">
          <el-select v-model="violationForm.user_id" filterable remote :remote-method="searchUsers"
            :loading="userSearchLoading" placeholder="输入用户名搜索" style="width:100%" value-key="id">
            <el-option v-for="u in userSearchResults" :key="u.id" :label="`${u.nickname || u.username} (ID:${u.id})`" :value="u.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理类型">
          <el-radio-group v-model="violationForm.type">
            <el-radio value="warning">警告</el-radio>
            <el-radio value="freeze">冻结账号</el-radio>
            <el-radio value="unfreeze">解封账号</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="处理原因">
          <el-input v-model="violationForm.reason" type="textarea" :rows="4" placeholder="请详细描述违规原因或处理理由..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitViolation">确认处理</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<style scoped>
.toolbar { display: flex; gap: 12px; margin-bottom: 16px; }
.pagination { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
