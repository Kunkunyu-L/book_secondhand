<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getRefundListApi, updateRefundStatusApi } from '../api'
import { formatTime } from '../utils/formatTime'

const tableData = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const statusFilter = ref('all')
const keyword = ref('')
const loading = ref(false)
const dialogVisible = ref(false)
const currentRefund = ref<any>(null)
const handleAction = ref('')
const adminNote = ref('')

const statusMap: Record<string, { text: string; type: string }> = {
  pending: { text: '待处理', type: 'warning' },
  approved: { text: '已通过', type: 'success' },
  rejected: { text: '已驳回', type: 'danger' },
  negotiating: { text: '协商中', type: '' },
}
const typeMap: Record<string, string> = { refund: '退款申请', complaint: '售后投诉' }

const loadData = async () => {
  loading.value = true
  try {
    const res: any = await getRefundListApi({
      page: page.value, pageSize: pageSize.value,
      status: statusFilter.value, keyword: keyword.value,
    })
    if (res.status === 200) { tableData.value = res.data.list; total.value = res.data.total }
  } finally { loading.value = false }
}

const openAction = (row: any, action: string) => {
  currentRefund.value = row
  handleAction.value = action
  adminNote.value = ''
  dialogVisible.value = true
}

const submitAction = async () => {
  try {
    const res: any = await updateRefundStatusApi({
      id: currentRefund.value.id, status: handleAction.value, admin_note: adminNote.value,
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
          <el-option label="待处理" value="pending" />
          <el-option label="已通过" value="approved" />
          <el-option label="已驳回" value="rejected" />
          <el-option label="协商中" value="negotiating" />
        </el-select>
        <el-input v-model="keyword" placeholder="搜索订单号/用户名" clearable style="width:250px"
          @keyup.enter="handleSearch" @clear="handleSearch" />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </div>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column prop="order_no" label="订单号" width="180" show-overflow-tooltip />
      <el-table-column label="申请人" width="100">
        <template #default="{ row }">{{ row.nickname || row.username }}</template>
      </el-table-column>
      <el-table-column label="类型" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="row.type === 'refund' ? 'warning' : 'danger'" size="small">{{ typeMap[row.type] || row.type }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="reason" label="申请理由" min-width="160" show-overflow-tooltip />
      <el-table-column label="金额" width="90" align="center">
        <template #default="{ row }">
          <span style="color:#F56C6C;font-weight:500">{{ Number(row.amount).toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="(statusMap[row.status]?.type || '') as any" size="small">{{ statusMap[row.status]?.text }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="admin_note" label="处理备注" min-width="120" show-overflow-tooltip>
        <template #default="{ row }">{{ row.admin_note || '-' }}</template>
      </el-table-column>
      <el-table-column label="申请时间" width="170">
        <template #default="{ row }">{{ formatTime(row.created_at) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right" align="center">
        <template #default="{ row }">
          <template v-if="row.status === 'pending' || row.status === 'negotiating'">
            <el-button type="success" text size="small" @click="openAction(row, 'approved')">通过</el-button>
            <el-button type="danger" text size="small" @click="openAction(row, 'rejected')">驳回</el-button>
            <el-button v-if="row.status === 'pending'" text size="small" @click="openAction(row, 'negotiating')">协商</el-button>
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

    <el-dialog v-model="dialogVisible" title="处理退款/售后" width="500px" destroy-on-close>
      <p style="margin-bottom:8px">订单号：<strong>{{ currentRefund?.order_no }}</strong></p>
      <p style="margin-bottom:8px">退款金额：<strong style="color:#F56C6C">{{ Number(currentRefund?.amount || 0).toFixed(2) }} 元</strong></p>
      <p style="margin-bottom:12px">
        操作：
        <el-tag :type="handleAction === 'approved' ? 'success' : handleAction === 'rejected' ? 'danger' : ''" size="small">
          {{ handleAction === 'approved' ? '审核通过' : handleAction === 'rejected' ? '驳回退款' : '协商处理' }}
        </el-tag>
      </p>
      <el-input v-model="adminNote" type="textarea" :rows="3" placeholder="请输入处理备注..." />
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAction">确定</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<style scoped>
.pagination { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
