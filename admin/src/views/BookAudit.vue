<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getBookAuditListApi, auditBookApi } from '../api'
import { formatTime } from '../utils/formatTime'
import { getImageUrl } from '../utils/image'

const activeTab = ref('pending')
const tableData = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const rejectDialogVisible = ref(false)
const currentBook = ref<any>(null)
const rejectReason = ref('')
const rejectAction = ref<'reject' | 'violation'>('reject')

const loadData = async () => {
  loading.value = true
  try {
    const res: any = await getBookAuditListApi({
      tab: activeTab.value, page: page.value, pageSize: pageSize.value,
    })
    if (res.status === 200) {
      tableData.value = res.data.list
      total.value = res.data.total
    }
  } finally { loading.value = false }
}

const handleApprove = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定通过《${row.title}》的审核？图书将上架销售。`, '审核通过', { type: 'success' })
    const res: any = await auditBookApi({ book_id: row.id, book_type: 'user', action: 'approve' })
    if (res.status === 200) { ElMessage.success('审核通过'); loadData() }
  } catch { /* cancelled */ }
}

const openRejectDialog = (row: any, action: 'reject' | 'violation') => {
  currentBook.value = row
  rejectAction.value = action
  rejectReason.value = ''
  rejectDialogVisible.value = true
}

const handleRejectSubmit = async () => {
  if (!rejectReason.value.trim()) { ElMessage.warning('请填写理由'); return }
  try {
    const res: any = await auditBookApi({
      book_id: currentBook.value.id, book_type: 'user',
      action: rejectAction.value, reason: rejectReason.value,
    })
    if (res.status === 200) {
      ElMessage.success(rejectAction.value === 'reject' ? '已驳回' : '已标记违规')
      rejectDialogVisible.value = false
      loadData()
    }
  } catch { /* error */ }
}

const handleTabChange = () => { page.value = 1; loadData() }

const actionLabel: Record<string, string> = { approve: '通过', reject: '驳回', violation: '违规' }
const actionType: Record<string, string> = { approve: 'success', reject: 'warning', violation: 'danger' }

onMounted(loadData)
</script>

<template>
  <el-card shadow="never">
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="待审核" name="pending" />
      <el-tab-pane label="审核记录" name="history" />
    </el-tabs>

    <!-- 待审核列表 -->
    <el-table v-if="activeTab === 'pending'" :data="tableData" v-loading="loading" border stripe>
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column label="封面" width="70" align="center">
        <template #default="{ row }">
          <el-image v-if="row.cover_img" :src="getImageUrl(row.cover_img)" style="width: 36px; height: 46px" fit="cover" :preview-src-list="[getImageUrl(row.cover_img)]" preview-teleported />
          <span v-else style="color:#c0c4cc">-</span>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="书名" min-width="140" show-overflow-tooltip />
      <el-table-column prop="author" label="作者" width="100" show-overflow-tooltip />
      <el-table-column label="卖家" width="100">
        <template #default="{ row }">{{ row.seller_name || row.username }}</template>
      </el-table-column>
      <el-table-column prop="category_name" label="分类" width="90" />
      <el-table-column label="售价" width="80" align="center">
        <template #default="{ row }">{{ row.price ? Number(row.price).toFixed(2) : '-' }}</template>
      </el-table-column>
      <el-table-column prop="create_datetime" label="发布时间" width="170" />
      <el-table-column label="操作" width="220" fixed="right" align="center">
        <template #default="{ row }">
          <div style="white-space: nowrap;">
            <el-button type="success" text size="small" @click="handleApprove(row)">通过</el-button>
            <el-button type="warning" text size="small" @click="openRejectDialog(row, 'reject')">驳回</el-button>
            <el-button type="danger" text size="small" @click="openRejectDialog(row, 'violation')">标记违规</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 审核记录 -->
    <el-table v-else :data="tableData" v-loading="loading" border stripe>
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column prop="title" label="书名" min-width="140" show-overflow-tooltip />
      <el-table-column prop="author" label="作者" width="100" />
      <el-table-column prop="seller_name" label="卖家" width="100" />
      <el-table-column label="操作" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="(actionType[row.action] || '') as any" size="small">{{ actionLabel[row.action] || row.action }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="reason" label="理由" min-width="160" show-overflow-tooltip>
        <template #default="{ row }">{{ row.reason || '-' }}</template>
      </el-table-column>
      <el-table-column prop="admin_name" label="审核人" width="100" />
      <el-table-column label="审核时间" width="170">
        <template #default="{ row }">{{ formatTime(row.created_at) }}</template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination v-model:current-page="page" v-model:page-size="pageSize" :total="total"
        :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next"
        @size-change="() => { page = 1; loadData() }" @current-change="loadData" />
    </div>

    <!-- 驳回/违规理由弹窗 -->
    <el-dialog v-model="rejectDialogVisible"
      :title="rejectAction === 'reject' ? '驳回审核' : '标记违规'" width="500px" destroy-on-close>
      <p style="margin-bottom:12px;color:#606266">
        图书：<strong>{{ currentBook?.title }}</strong>
      </p>
      <el-input v-model="rejectReason" type="textarea" :rows="4"
        :placeholder="rejectAction === 'reject' ? '请填写驳回理由...' : '请填写违规原因...'" />
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button :type="rejectAction === 'reject' ? 'warning' : 'danger'" @click="handleRejectSubmit">确定</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<style scoped>
.pagination { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
