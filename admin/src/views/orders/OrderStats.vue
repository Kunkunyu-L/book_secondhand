<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getOrderStatsApi } from '@/api'
import { exportToCSV } from '@/utils/helpers'

const loading = ref(false)
const statsType = ref('daily')
const dateRange = ref<string[]>([])
const summary = ref<any>({})
const timeStats = ref<any[]>([])
const categoryStats = ref<any[]>([])
const regionStats = ref<any[]>([])

const loadData = async () => {
  loading.value = true
  try {
    const params: any = { type: statsType.value }
    if (dateRange.value?.length === 2) {
      params.startDate = dateRange.value[0]
      params.endDate = dateRange.value[1]
    }
    const res: any = await getOrderStatsApi(params)
    if (res.status === 200) {
      summary.value = res.data.summary || {}
      timeStats.value = (res.data.timeStats || []).sort((a: any, b: any) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
      categoryStats.value = (res.data.categoryStats || []).sort((a: any, b: any) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
      regionStats.value = (res.data.regionStats || []).sort((a: any, b: any) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
    }
  } finally { loading.value = false }
}

const typeLabel: Record<string, string> = { daily: '日', weekly: '周', monthly: '月' }

const handleExportTime = () => {
  exportToCSV(timeStats.value, [
    { key: 'period', title: '时间段' },
    { key: 'order_count', title: '订单数' },
    { key: 'total_amount', title: '总金额' },
    { key: 'completed_amount', title: '已完成金额' },
  ], `订单统计_按${typeLabel[statsType.value]}`)
}

const handleExportCategory = () => {
  exportToCSV(categoryStats.value, [
    { key: 'category_name', title: '分类' },
    { key: 'order_count', title: '订单数' },
    { key: 'total_amount', title: '总金额' },
  ], '订单统计_按分类')
}

const handleExportRegion = () => {
  exportToCSV(regionStats.value, [
    { key: 'province', title: '省份' },
    { key: 'order_count', title: '订单数' },
    { key: 'total_amount', title: '总金额' },
  ], '订单统计_按地区')
}

onMounted(loadData)
</script>

<template>
  <div v-loading="loading">
    <el-card shadow="never" style="margin-bottom:20px">
      <div class="filter-bar">
        <el-radio-group v-model="statsType" @change="loadData">
          <el-radio-button value="daily">按日</el-radio-button>
          <el-radio-button value="weekly">按周</el-radio-button>
          <el-radio-button value="monthly">按月</el-radio-button>
        </el-radio-group>
        <el-date-picker v-model="dateRange" type="daterange" range-separator="至"
          start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD"
          style="width:340px" @change="loadData" />
      </div>
    </el-card>

    <el-row :gutter="16" style="margin-bottom:20px">
      <el-col :span="6">
        <el-card shadow="hover"><el-statistic title="总订单数" :value="summary.total_orders || 0" /></el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover"><el-statistic title="总金额" :value="Number(summary.total_amount || 0)" :precision="2" prefix="¥" /></el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover"><el-statistic title="已完成金额" :value="Number(summary.completed_amount || 0)" :precision="2" prefix="¥" /></el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover"><el-statistic title="平均客单价" :value="Number(summary.avg_amount || 0)" :precision="2" prefix="¥" /></el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <!-- 时间维度 -->
      <el-col :span="24" style="margin-bottom:20px">
        <el-card shadow="never">
          <template #header>
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span>按{{ typeLabel[statsType] }}统计</span>
              <el-button type="primary" text size="small" @click="handleExportTime">导出CSV</el-button>
            </div>
          </template>
          <el-table :data="timeStats" border stripe size="small" max-height="360">
            <el-table-column prop="period" label="时间段" width="150" />
            <el-table-column prop="order_count" label="订单数" width="100" align="center" />
            <el-table-column label="总金额" width="130" align="center">
              <template #default="{ row }">{{ Number(row.total_amount || 0).toFixed(2) }}</template>
            </el-table-column>
            <el-table-column label="已完成金额" min-width="130" align="center">
              <template #default="{ row }">{{ Number(row.completed_amount || 0).toFixed(2) }}</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 分类维度 -->
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span>按分类统计</span>
              <el-button type="primary" text size="small" @click="handleExportCategory">导出CSV</el-button>
            </div>
          </template>
          <el-table :data="categoryStats" border stripe size="small" max-height="300">
            <el-table-column prop="category_name" label="分类" min-width="100" />
            <el-table-column prop="order_count" label="订单数" width="80" align="center" />
            <el-table-column label="金额" width="110" align="center">
              <template #default="{ row }">{{ Number(row.total_amount || 0).toFixed(2) }}</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 地区维度 -->
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span>按地区统计</span>
              <el-button type="primary" text size="small" @click="handleExportRegion">导出CSV</el-button>
            </div>
          </template>
          <el-table :data="regionStats" border stripe size="small" max-height="300">
            <el-table-column prop="province" label="省份" min-width="100" />
            <el-table-column prop="order_count" label="订单数" width="80" align="center" />
            <el-table-column label="金额" width="110" align="center">
              <template #default="{ row }">{{ Number(row.total_amount || 0).toFixed(2) }}</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.filter-bar { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
</style>
