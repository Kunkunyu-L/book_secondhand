<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getDashboardApi } from '../api'

const stats = ref({
  userCount: 0,
  platformBookCount: 0,
  userBookCount: 0,
  orderCount: 0,
  revenue: 0,
  todayOrderCount: 0,
  pendingOrderCount: 0,
  reviewingBookCount: 0,
})
const recentOrders = ref<any[]>([])
const loading = ref(false)

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
    const res: any = await getDashboardApi()
    if (res.status === 200) {
      stats.value = res.data
      recentOrders.value = res.data.recentOrders || []
    }
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <div v-loading="loading">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :xs="12" :sm="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-icon">
            <el-icon :size="24"><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.userCount }}</div>
            <div class="stat-label">用户总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-icon">
            <el-icon :size="24"><Reading /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.platformBookCount + stats.userBookCount }}</div>
            <div class="stat-label">图书总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-icon">
            <el-icon :size="24"><Document /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.orderCount }}</div>
            <div class="stat-label">订单总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-icon">
            <el-icon :size="24"><Money /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ Number(stats.revenue).toFixed(2) }}</div>
            <div class="stat-label">总收入 (元)</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 概览区域 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :xs="24" :sm="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>今日概览</span>
            </div>
          </template>
          <div class="today-stats">
            <div class="today-item">
              <div class="today-value">{{ stats.todayOrderCount }}</div>
              <div class="today-label">今日订单</div>
            </div>
            <div class="today-item">
              <div class="today-value">{{ stats.pendingOrderCount }}</div>
              <div class="today-label">待处理订单</div>
            </div>
            <div class="today-item">
              <div class="today-value">{{ stats.platformBookCount }}</div>
              <div class="today-label">平台图书</div>
            </div>
            <div class="today-item">
              <div class="today-value">{{ stats.userBookCount }}</div>
              <div class="today-label">用户图书</div>
            </div>
            <div class="today-item">
              <div class="today-value">{{ stats.reviewingBookCount }}</div>
              <div class="today-label">待审核图书</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>最近订单</span>
            </div>
          </template>
          <el-table :data="recentOrders" size="small" max-height="280">
            <el-table-column prop="order_no" label="订单号" min-width="160" show-overflow-tooltip />
            <el-table-column label="买家" width="90">
              <template #default="{ row }">{{ row.nickname || row.username }}</template>
            </el-table-column>
            <el-table-column label="金额" width="90">
              <template #default="{ row }">{{ Number(row.total_amount).toFixed(2) }}</template>
            </el-table-column>
            <el-table-column label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="(statusMap[row.status]?.type || '') as any" size="small">
                  {{ statusMap[row.status]?.text || row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.stat-card :deep(.el-card__body) {
  display: flex;
  align-items: center;
  padding: 18px 20px;
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  color: #374151;
  margin-right: 14px;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 22px;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
}

.card-header {
  font-weight: 600;
  font-size: 14px;
  color: #1f2937;
}

.today-stats {
  display: flex;
  justify-content: space-around;
  text-align: center;
  padding: 10px 0;
}

.today-item {
  padding: 10px 0;
}

.today-value {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
}

.today-label {
  font-size: 12px;
  color: #6b7280;
  margin-top: 6px;
}
</style>
