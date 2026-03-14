<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getWithdrawalListApi, updateWithdrawalStatusApi } from '../api'

const tableData = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const statusFilter = ref('all')
const loading = ref(false)
const dialogVisible = ref(false)
const currentRow = ref<any>(null)
const handleAction = ref('approved')
const adminNote = ref('')

const statusMap: Record<string, { text: string; type: string }> = {
  pending: { text: '待审核', type: 'warning' },
  approved: { text: '已通过', type: 'success' },
  rejected: { text: '已驳回', type: 'danger' },
}

const loadData = async () => {
  loading.value = true
  try {
    const res: any = await getWithdrawalListApi({
      page: page.value, pageSize: pageSize.value, status: statusFilter.value,
    })
    if (res.status === 200) { tableData.value = res.data.list; total.value = res.data.total }
  } finally { loading.value = false }
}

const openAction = (row: any, action: string) => {
  currentRow.value = row
  handleAction.value = action
  adminNote.value = ''
  dialogVisible.value = true
}

const submitAction = async () => {
  try {
    const res: any = await updateWithdrawalStatusApi({
      id: currentRow.value.id, status: handleAction.value, admin_note: adminNote.value,
    })
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
    <div class="admin-toolbar">
      <div class="admin-toolbar-filters">
        <el-select v-model="statusFilter" style="width:130px" @change="handleSearch">
          <el-option label="全部状态" value="all" />
          <el-option label="待审核" value="pending" />
          <el-option label="已通过" value="approved" />
          <el-option label="已驳回" value="rejected" />
        </el-select>
        <el-button type="primary" @click="handleSearch">筛选</el-button>
      </div>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column label="用户" width="130">
        <template #default="{ row }">
          <div>{{ row.nickname || row.username }}</div>
          <div style="font-size:11px;color:#909399">余额: {{ row.user_balance ?? 0 }}</div>
        </template>
      </el-table-column>
      <el-table-column label="提现金额" width="110" align="center">
        <template #default="{ row }">
          <span style="color:#F56C6C;font-weight:500">{{ Number(row.amount).toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="account_info" label="提现账户" min-width="180" show-overflow-tooltip>
        <template #default="{ row }">{{ row.account_info || '-' }}</template>
      </el-table-column>
      <el-table-column label="状态" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="(statusMap[row.status]?.type || '') as any" size="small">{{ statusMap[row.status]?.text }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="admin_note" label="备注" min-width="120" show-overflow-tooltip>
        <template #default="{ row }">{{ row.admin_note || '-' }}</template>
      </el-table-column>
      <el-table-column prop="created_at" label="申请时间" width="170" />
      <el-table-column label="操作" width="160" fixed="right" align="center">
        <template #default="{ row }">
          <template v-if="row.status === 'pending'">
            <el-button type="success" text size="small" @click="openAction(row, 'approved')">通过</el-button>
            <el-button type="danger" text size="small" @click="openAction(row, 'rejected')">驳回</el-button>
          </template>
          <span v-else style="color:#909399;font-size:12px">已处理</span>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination v-model:current-page="page" v-model:page-size="pageSize" :total="total"
        :page-sizes="[10,20,50]" layout="total, sizes, prev, pager, next"
        @size-change="() => { page = 1; loadData() }" @current-change="loadData" />
    </div>

    <el-dialog v-model="dialogVisible" title="处理提现申请" width="480px" destroy-on-close>
      <p style="margin-bottom:8px">用户：<strong>{{ currentRow?.nickname || currentRow?.username }}</strong></p>
      <p style="margin-bottom:12px">提现金额：<strong style="color:#F56C6C">{{ Number(currentRow?.amount || 0).toFixed(2) }} 元</strong></p>
      <p style="margin-bottom:12px">
        操作：<el-tag :type="handleAction === 'approved' ? 'success' : 'danger'" size="small">
          {{ handleAction === 'approved' ? '审核通过' : '驳回提现' }}
        </el-tag>
      </p>
      <el-input v-model="adminNote" type="textarea" :rows="3" placeholder="处理备注（可选）" />
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAction">确认</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<style scoped>
.pagination { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
