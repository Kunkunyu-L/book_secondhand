<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOrdersApi, updateOrderStatusApi, getOrderDetailApi } from '../api'
import { exportToCSV } from '../utils/export'
import { formatTime } from '../utils/formatTime'
import { getImageUrl } from '../utils/image'

const tableData = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const keyword = ref('')
const statusFilter = ref('all')
const dateRange = ref<string[]>([])
const loading = ref(false)
const detailVisible = ref(false)
const orderDetail = ref<any>(null)

const statusMap: Record<string, { text: string; type: string }> = {
  pending: { text: '待付款', type: 'warning' },
  paid: { text: '已付款', type: 'primary' },
  shipped: { text: '已发货', type: '' },
  completed: { text: '已完成', type: 'success' },
  cancelled: { text: '已取消', type: 'danger' },
}

const loadData = async () => {
  loading.value = true
  try {
    const params: any = {
      page: page.value, pageSize: pageSize.value,
      status: statusFilter.value, keyword: keyword.value,
    }
    if (dateRange.value?.length === 2) {
      params.startDate = dateRange.value[0]
      params.endDate = dateRange.value[1]
    }
    const res: any = await getOrdersApi(params)
    if (res.status === 200) { tableData.value = res.data.list; total.value = res.data.total }
  } finally { loading.value = false }
}

const handleStatusChange = async (row: any, newStatus: string) => {
  const label = statusMap[newStatus]?.text || newStatus
  try {
    await ElMessageBox.confirm(`确定要将订单状态更新为「${label}」吗？`, '提示', { type: 'warning' })
    const res: any = await updateOrderStatusApi({ order_id: row.id, status: newStatus })
    if (res.status === 200) { ElMessage.success('状态更新成功'); loadData() }
  } catch { /* cancelled */ }
}

const viewDetail = async (row: any) => {
  try {
    const res: any = await getOrderDetailApi({ order_id: row.id })
    if (res.status === 200) {
      orderDetail.value = res.data
      if (typeof orderDetail.value.address_snapshot === 'string') {
        try { orderDetail.value.address_snapshot = JSON.parse(orderDetail.value.address_snapshot) } catch { /* */ }
      }
      detailVisible.value = true
    }
  } catch { /* */ }
}

const handleSearch = () => { page.value = 1; loadData() }

const handleExport = () => {
  exportToCSV(tableData.value, [
    { key: 'order_no', title: '订单号' }, { key: 'username', title: '用户' },
    { key: 'total_amount', title: '金额' }, { key: 'status', title: '状态' },
    { key: 'created_at', title: '下单时间' },
  ], '订单列表')
}

const formatAddress = (addr: any) => {
  if (!addr) return '-'
  return `${addr.name} ${addr.phone} - ${addr.province || ''}${addr.city || ''}${addr.district || ''}${addr.detail || ''}`
}

onMounted(loadData)
</script>

<template>
  <el-card shadow="never">
    <div class="admin-toolbar">
      <div class="admin-toolbar-filters">
        <el-select v-model="statusFilter" style="width:120px" @change="handleSearch">
          <el-option label="全部状态" value="all" />
          <el-option label="待付款" value="pending" />
          <el-option label="已付款" value="paid" />
          <el-option label="已发货" value="shipped" />
          <el-option label="已完成" value="completed" />
          <el-option label="已取消" value="cancelled" />
        </el-select>
        <el-date-picker v-model="dateRange" type="daterange" range-separator="至"
          start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD"
          style="width:300px" @change="handleSearch" />
        <el-input v-model="keyword" placeholder="搜索订单号/用户名" clearable style="width:220px"
          @keyup.enter="handleSearch" @clear="handleSearch" />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </div>
      <div class="admin-toolbar-actions">
        <el-button @click="handleExport">导出</el-button>
      </div>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="order_no" label="订单号" width="180" show-overflow-tooltip />
      <el-table-column label="买家" width="100">
        <template #default="{ row }">{{ row.nickname || row.username }}</template>
      </el-table-column>
      <el-table-column label="商品" min-width="180" show-overflow-tooltip>
        <template #default="{ row }">
          <template v-if="row.items?.length">
            <span v-for="(item, i) in row.items.slice(0, 2)" :key="i">
              {{ item.title }} x{{ item.quantity }}{{ i < Math.min(row.items.length, 2) - 1 ? '、' : '' }}
            </span>
            <span v-if="row.items.length > 2" style="color:#909399"> 等{{ row.items.length }}件</span>
          </template>
          <span v-else style="color:#c0c4cc">-</span>
        </template>
      </el-table-column>
      <el-table-column label="金额" width="90" align="center">
        <template #default="{ row }"><span style="color:#F56C6C;font-weight:500">{{ Number(row.total_amount).toFixed(2) }}</span></template>
      </el-table-column>
      <el-table-column label="状态" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="(statusMap[row.status]?.type || '') as any" size="small">{{ statusMap[row.status]?.text || row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="下单时间" width="160">
        <template #default="{ row }">{{ formatTime(row.created_at) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="210" fixed="right" align="center">
        <template #default="{ row }">
          <el-button type="primary" text size="small" @click="viewDetail(row)">详情</el-button>
          <el-button v-if="row.status === 'paid'" type="success" text size="small" @click="handleStatusChange(row, 'shipped')">发货</el-button>
          <el-button v-if="row.status === 'shipped'" type="success" text size="small" @click="handleStatusChange(row, 'completed')">完成</el-button>
          <el-button v-if="['pending','paid'].includes(row.status)" type="danger" text size="small" @click="handleStatusChange(row, 'cancelled')">取消</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination v-model:current-page="page" v-model:page-size="pageSize" :total="total"
        :page-sizes="[10,20,50]" layout="total, sizes, prev, pager, next"
        @size-change="() => { page = 1; loadData() }" @current-change="loadData" />
    </div>

    <!-- 订单详情 -->
    <el-dialog v-model="detailVisible" title="订单详情" width="680px" destroy-on-close>
      <template v-if="orderDetail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">{{ orderDetail.order_no }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="(statusMap[orderDetail.status]?.type || '') as any" size="small">{{ statusMap[orderDetail.status]?.text }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="买家">{{ orderDetail.nickname || orderDetail.username }}</el-descriptions-item>
          <el-descriptions-item label="金额"><span style="color:#F56C6C;font-weight:600">{{ Number(orderDetail.total_amount).toFixed(2) }} 元</span></el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ formatTime(orderDetail.created_at) }}</el-descriptions-item>
          <el-descriptions-item label="备注">{{ orderDetail.remark || '无' }}</el-descriptions-item>
          <el-descriptions-item label="收货地址" :span="2">{{ formatAddress(orderDetail.address_snapshot) }}</el-descriptions-item>
          <el-descriptions-item v-if="orderDetail.pay_time" label="付款时间">{{ formatTime(orderDetail.pay_time) }}</el-descriptions-item>
          <el-descriptions-item v-if="orderDetail.ship_time" label="发货时间">{{ formatTime(orderDetail.ship_time) }}</el-descriptions-item>
        </el-descriptions>
        <h4 style="margin:16px 0 8px;color:#303133">商品明细</h4>
        <el-table :data="orderDetail.items" border size="small">
          <el-table-column label="封面" width="50" align="center">
            <template #default="{ row }"><el-image v-if="row.cover_img" :src="getImageUrl(row.cover_img)" style="width:28px;height:36px" fit="cover" /></template>
          </el-table-column>
          <el-table-column prop="title" label="商品" min-width="150" show-overflow-tooltip />
          <el-table-column label="类型" width="70" align="center">
            <template #default="{ row }">{{ row.book_type === 'platform' ? '平台' : '用户' }}</template>
          </el-table-column>
          <el-table-column label="单价" width="80" align="center">
            <template #default="{ row }">{{ Number(row.price).toFixed(2) }}</template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="50" align="center" />
          <el-table-column label="小计" width="80" align="center">
            <template #default="{ row }"><span style="color:#F56C6C">{{ (Number(row.price) * row.quantity).toFixed(2) }}</span></template>
          </el-table-column>
        </el-table>
      </template>
    </el-dialog>
  </el-card>
</template>

<style scoped>
.pagination { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
