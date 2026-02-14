<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getChatSessionsApi, assignSessionApi, closeSessionApi, getChatMessagesApi, getServiceStaffApi } from '../api'

const tableData = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const statusFilter = ref('all')
const keyword = ref('')
const loading = ref(false)
const chatVisible = ref(false)
const messages = ref<any[]>([])
const currentSession = ref<any>(null)
const assignVisible = ref(false)
const assignTarget = ref<any>(null)
const serviceList = ref<any[]>([])
const selectedService = ref('')

const targetTypeMap: Record<string, string> = { seller: '买家-卖家', platform: '平台', service: '客服咨询' }
const statusMap: Record<string, { text: string; type: string }> = {
  active: { text: '进行中', type: 'success' }, closed: { text: '已关闭', type: 'info' },
}

const loadData = async () => {
  loading.value = true
  try {
    const res: any = await getChatSessionsApi({
      page: page.value, pageSize: pageSize.value, status: statusFilter.value, keyword: keyword.value,
    })
    if (res.status === 200) { tableData.value = res.data.list; total.value = res.data.total }
  } finally { loading.value = false }
}

const viewChat = async (row: any) => {
  currentSession.value = row
  try {
    const res: any = await getChatMessagesApi({ session_id: row.id, pageSize: 50 })
    if (res.status === 200) messages.value = res.data.list || []
  } catch { messages.value = [] }
  chatVisible.value = true
}

const openAssign = async (row: any) => {
  assignTarget.value = row
  selectedService.value = ''
  try {
    const res: any = await getServiceStaffApi()
    if (res.status === 200) serviceList.value = res.data
  } catch { serviceList.value = [] }
  assignVisible.value = true
}

const handleAssign = async () => {
  if (!selectedService.value) { ElMessage.warning('请选择客服'); return }
  const res: any = await assignSessionApi({ session_id: assignTarget.value.id, service_id: selectedService.value })
  if (res.status === 200) { ElMessage.success('分配成功'); assignVisible.value = false; loadData() }
}

const handleClose = async (row: any) => {
  const res: any = await closeSessionApi({ session_id: row.id })
  if (res.status === 200) { ElMessage.success('已关闭'); loadData() }
}

const handleSearch = () => { page.value = 1; loadData() }

onMounted(loadData)
</script>

<template>
  <el-card shadow="never">
    <div class="toolbar">
      <el-select v-model="statusFilter" style="width:120px" @change="handleSearch">
        <el-option label="全部" value="all" /><el-option label="进行中" value="active" /><el-option label="已关闭" value="closed" />
      </el-select>
      <el-input v-model="keyword" placeholder="搜索用户名" clearable style="width:220px" @keyup.enter="handleSearch" @clear="handleSearch" />
      <el-button type="primary" @click="handleSearch">搜索</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="60" align="center" />
      <el-table-column label="发起用户" width="120">
        <template #default="{ row }">{{ row.nickname || row.username }}</template>
      </el-table-column>
      <el-table-column label="对话方" width="120">
        <template #default="{ row }">{{ row.target_nickname || row.target_username || '平台客服' }}</template>
      </el-table-column>
      <el-table-column label="类型" width="100" align="center">
        <template #default="{ row }"><el-tag size="small">{{ targetTypeMap[row.target_type] || row.target_type }}</el-tag></template>
      </el-table-column>
      <el-table-column prop="last_message" label="最后消息" min-width="180" show-overflow-tooltip />
      <el-table-column label="分配客服" width="100">
        <template #default="{ row }">{{ row.service_name || '-' }}</template>
      </el-table-column>
      <el-table-column label="状态" width="80" align="center">
        <template #default="{ row }"><el-tag :type="(statusMap[row.status]?.type || '') as any" size="small">{{ statusMap[row.status]?.text }}</el-tag></template>
      </el-table-column>
      <el-table-column prop="last_message_time" label="最后活跃" width="160" />
      <el-table-column label="操作" width="200" fixed="right" align="center">
        <template #default="{ row }">
          <el-button type="primary" text size="small" @click="viewChat(row)">查看</el-button>
          <el-button v-if="row.status==='active'" type="warning" text size="small" @click="openAssign(row)">分配</el-button>
          <el-button v-if="row.status==='active'" type="danger" text size="small" @click="handleClose(row)">关闭</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination v-model:current-page="page" v-model:page-size="pageSize" :total="total" :page-sizes="[20,50]"
        layout="total, sizes, prev, pager, next" @size-change="() => { page=1; loadData() }" @current-change="loadData" />
    </div>

    <!-- 聊天记录弹窗 -->
    <el-dialog v-model="chatVisible" title="聊天记录" width="600px" destroy-on-close>
      <el-scrollbar max-height="400px">
        <div v-if="messages.length === 0" style="text-align:center;padding:30px;color:#909399">暂无消息</div>
        <div v-for="m in messages" :key="m.id" class="msg-item" :class="{ 'msg-right': m.sender_role !== 'user' }">
          <div class="msg-name">{{ m.sender_name || m.sender_role }} <span class="msg-time">{{ m.created_at }}</span></div>
          <div class="msg-bubble" :class="{ 'bubble-blue': m.sender_role !== 'user' }">
            <el-image v-if="m.msg_type === 'image'" :src="m.content" style="max-width:200px;border-radius:4px" :preview-src-list="[m.content]" preview-teleported />
            <template v-else>{{ m.content }}</template>
          </div>
        </div>
      </el-scrollbar>
    </el-dialog>

    <!-- 分配客服弹窗 -->
    <el-dialog v-model="assignVisible" title="分配客服" width="420px" destroy-on-close>
      <el-select v-model="selectedService" filterable placeholder="选择客服" style="width:100%">
        <el-option v-for="s in serviceList" :key="s.id" :label="`${s.nickname || s.username} (接待:${s.active_sessions}/${s.service_max_sessions})`" :value="s.id" />
      </el-select>
      <template #footer>
        <el-button @click="assignVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAssign">确认分配</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<style scoped>
.toolbar { display: flex; gap: 12px; margin-bottom: 16px; }
.pagination { display: flex; justify-content: flex-end; margin-top: 16px; }
.msg-item { margin-bottom: 12px; }
.msg-right { text-align: right; }
.msg-name { font-size: 12px; color: #909399; margin-bottom: 4px; }
.msg-time { margin-left: 8px; }
.msg-bubble { display: inline-block; padding: 8px 12px; border-radius: 8px; background: #f4f4f5; max-width: 80%; text-align: left; font-size: 13px; word-break: break-all; }
.bubble-blue { background: #ecf5ff; color: #409EFF; }
</style>
