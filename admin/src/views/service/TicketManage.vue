<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getTicketsApi, updateTicketApi } from '@/api'
import { formatTime } from '@/utils/format'

const tableData = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const statusFilter = ref('all')
const keyword = ref('')
const loading = ref(false)
const dialogVisible = ref(false)
const currentTicket = ref<any>(null)
const replyForm = reactive({ status: '', reply: '', priority: '' })

const statusMap: Record<string, { text: string; type: string }> = {
  pending: { text: '待处理', type: 'danger' }, processing: { text: '处理中', type: 'warning' },
  resolved: { text: '已解决', type: 'success' }, closed: { text: '已关闭', type: 'info' },
}
const typeMap: Record<string, string> = { consultation: '咨询', complaint: '投诉', suggestion: '建议', other: '其他' }
const priorityMap: Record<string, { text: string; type: string }> = {
  low: { text: '低', type: 'info' }, normal: { text: '普通', type: '' },
  high: { text: '高', type: 'warning' }, urgent: { text: '紧急', type: 'danger' },
}

const loadData = async () => {
  loading.value = true
  try {
    const res: any = await getTicketsApi({ page: page.value, pageSize: pageSize.value, status: statusFilter.value, keyword: keyword.value })
    if (res.status === 200) {
      tableData.value = res.data.list.sort((a: any, b: any) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
      total.value = res.data.total
    }
  } finally { loading.value = false }
}

const openReply = (row: any) => {
  currentTicket.value = row
  replyForm.status = row.status === 'pending' ? 'processing' : 'resolved'
  replyForm.reply = row.reply || ''
  replyForm.priority = row.priority
  dialogVisible.value = true
}

const handleSubmit = async () => {
  const res: any = await updateTicketApi({ id: currentTicket.value.id, ...replyForm })
  if (res.status === 200) { ElMessage.success('处理成功'); dialogVisible.value = false; loadData() }
}

const handleSearch = () => { page.value = 1; loadData() }
onMounted(loadData)
</script>

<template>
  <el-card shadow="never">
    <div class="admin-toolbar">
      <div class="admin-toolbar-filters">
        <el-select v-model="statusFilter" style="width:120px" @change="handleSearch">
          <el-option label="全部" value="all" /><el-option label="待处理" value="pending" />
          <el-option label="处理中" value="processing" /><el-option label="已解决" value="resolved" /><el-option label="已关闭" value="closed" />
        </el-select>
        <el-input v-model="keyword" placeholder="搜索工单号/标题/用户" clearable style="width:250px" @keyup.enter="handleSearch" @clear="handleSearch" />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </div>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="ticket_no" label="工单号" width="170" show-overflow-tooltip />
      <el-table-column label="用户" width="110"><template #default="{ row }">{{ row.nickname || row.username }}</template></el-table-column>
      <el-table-column label="类型" width="80" align="center">
        <template #default="{ row }"><el-tag size="small">{{ typeMap[row.type] || row.type }}</el-tag></template>
      </el-table-column>
      <el-table-column prop="title" label="标题" min-width="240" show-overflow-tooltip />
      <el-table-column label="优先级" width="90" align="center">
        <template #default="{ row }"><el-tag :type="(priorityMap[row.priority]?.type || '') as any" size="small">{{ priorityMap[row.priority]?.text }}</el-tag></template>
      </el-table-column>
      <el-table-column label="状态" width="90" align="center">
        <template #default="{ row }"><el-tag :type="(statusMap[row.status]?.type || '') as any" size="small">{{ statusMap[row.status]?.text }}</el-tag></template>
      </el-table-column>
      <el-table-column label="分配给" width="120"><template #default="{ row }">{{ row.assigned_name || row.admin_name || '-' }}</template></el-table-column>
      <el-table-column label="创建时间" width="190">
        <template #default="{ row }">{{ formatTime(row.created_at || row.updated_at) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="90" fixed="right" align="center">
        <template #default="{ row }"><el-button type="primary" text size="small" @click="openReply(row)">处理</el-button></template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination v-model:current-page="page" v-model:page-size="pageSize" :total="total" :page-sizes="[10,20,50]"
        layout="total, sizes, prev, pager, next" @size-change="() => { page=1; loadData() }" @current-change="loadData" />
    </div>

    <el-dialog v-model="dialogVisible" title="处理工单" width="580px" destroy-on-close>
      <el-descriptions :column="2" border size="small" style="margin-bottom:16px">
        <el-descriptions-item label="标题" :span="2">{{ currentTicket?.title }}</el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">{{ currentTicket?.content || '-' }}</el-descriptions-item>
        <el-descriptions-item label="用户">{{ currentTicket?.nickname || currentTicket?.username }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ typeMap[currentTicket?.type] }}</el-descriptions-item>
      </el-descriptions>
      <el-form :model="replyForm" label-width="70px">
        <el-form-item label="优先级">
          <el-select v-model="replyForm.priority" style="width:100%">
            <el-option label="低" value="low" /><el-option label="普通" value="normal" />
            <el-option label="高" value="high" /><el-option label="紧急" value="urgent" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="replyForm.status" style="width:100%">
            <el-option label="处理中" value="processing" /><el-option label="已解决" value="resolved" /><el-option label="已关闭" value="closed" />
          </el-select>
        </el-form-item>
        <el-form-item label="回复"><el-input v-model="replyForm.reply" type="textarea" :rows="4" placeholder="填写回复内容..." /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确认</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<style scoped>
.pagination { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
