<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getPaymentListApi } from '../api'
import { formatTime } from '../utils/formatTime'
import { exportToCSV } from '../utils/export'

const tableData = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const statusFilter = ref('all')
const keyword = ref('')
const loading = ref(false)
const summary = ref<any>({})

const statusMap: Record<string, { text: string; type: string }> = {
  pending: { text: '待支付', type: 'warning' },
  success: { text: '支付成功', type: 'success' },
  failed: { text: '支付失败', type: 'danger' },
  refunded: { text: '已退款', type: 'info' },
}
const methodMap: Record<string, string> = {
  wechat: '微信支付', alipay: '支付宝', balance: '余额支付',
}

const loadData = async () => {
  loading.value = true
  try {
    const res: any = await getPaymentListApi({
      page: page.value, pageSize: pageSize.value,
      status: statusFilter.value, keyword: keyword.value,
    })
    if (res.status === 200) {
      tableData.value = res.data.list
      total.value = res.data.total
      summary.value = res.data.summary || {}
    }
  } finally { loading.value = false }
}

const handleSearch = () => { page.value = 1; loadData() }

const handleExport = () => {
  exportToCSV(tableData.value, [
    { key: 'id', title: 'ID' },
    { key: 'order_no', title: '订单号' },
    { key: 'username', title: '用户' },
    { key: 'amount', title: '金额' },
    { key: 'payment_method', title: '支付方式' },
    { key: 'status', title: '状态' },
    { key: 'transaction_no', title: '交易流水号' },
    { key: 'created_at', title: '支付时间' },
  ], '支付记录')
}

onMounted(loadData)
</script>

<template>
  <div>
    <!-- 汇总卡片 -->
    <el-row :gutter="16" style="margin-bottom:20px">
      <el-col :span="8">
        <el-card shadow="hover">
          <el-statistic title="总记录数" :value="summary.total_count || 0" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <el-statistic title="成功支付金额" :value="Number(summary.success_amount || 0)" :precision="2" prefix="¥" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <el-statistic title="已退款金额" :value="Number(summary.refunded_amount || 0)" :precision="2" prefix="¥" />
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never">
      <div class="admin-toolbar">
        <div class="admin-toolbar-filters">
          <el-select v-model="statusFilter" style="width:130px" @change="handleSearch">
            <el-option label="全部状态" value="all" />
            <el-option label="待支付" value="pending" />
            <el-option label="支付成功" value="success" />
            <el-option label="支付失败" value="failed" />
            <el-option label="已退款" value="refunded" />
          </el-select>
          <el-input v-model="keyword" placeholder="搜索订单号/流水号/用户名" clearable style="width:280px"
            @keyup.enter="handleSearch" @clear="handleSearch" />
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </div>
        <div class="admin-toolbar-actions">
          <el-button @click="handleExport">导出CSV</el-button>
        </div>
      </div>

      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="order_no" label="订单号" width="180" show-overflow-tooltip />
        <el-table-column label="用户" width="110">
          <template #default="{ row }">{{ row.nickname || row.username }}</template>
        </el-table-column>
        <el-table-column label="金额" width="100" align="center">
          <template #default="{ row }">
            <span style="color:#F56C6C;font-weight:500">{{ Number(row.amount).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="支付方式" width="100" align="center">
          <template #default="{ row }">{{ methodMap[row.payment_method] || row.payment_method }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="(statusMap[row.status]?.type || '') as any" size="small">{{ statusMap[row.status]?.text }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="transaction_no" label="交易流水号" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">{{ row.transaction_no || '-' }}</template>
        </el-table-column>
        <el-table-column label="支付时间" width="170">
          <template #default="{ row }">{{ formatTime(row.created_at) }}</template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination v-model:current-page="page" v-model:page-size="pageSize" :total="total"
          :page-sizes="[10,20,50]" layout="total, sizes, prev, pager, next"
          @size-change="() => { page = 1; loadData() }" @current-change="loadData" />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.pagination { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
