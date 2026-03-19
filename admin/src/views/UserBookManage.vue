<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserBooksApi, updateUserBookStatusApi, getCategoriesApi } from '../api'
import { exportToCSV } from '../utils/export'
import { getImageUrl } from '../utils/image'

const tableData = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const keyword = ref('')
const statusFilter = ref('all')
const categoryFilter = ref('')
const loading = ref(false)
const categories = ref<any[]>([])

const statusMap: Record<string, { text: string; type: string }> = {
  onsale: { text: '在售', type: 'success' },
  offline: { text: '下架', type: 'info' },
  sold: { text: '已售', type: 'warning' },
  reviewing: { text: '审核中', type: '' },
  violation: { text: '违规', type: 'danger' },
}

const loadData = async () => {
  loading.value = true
  try {
    const res: any = await getUserBooksApi({
      page: page.value, pageSize: pageSize.value, keyword: keyword.value,
      status: statusFilter.value, category: categoryFilter.value,
    })
    if (res.status === 200) { tableData.value = res.data.list; total.value = res.data.total }
  } finally { loading.value = false }
}

const loadCategories = async () => {
  try {
    const res: any = await getCategoriesApi()
    if (res.status === 200) categories.value = res.data
  } catch { /* */ }
}

const handleStatusChange = async (row: any, newStatus: string) => {
  const label = statusMap[newStatus]?.text || newStatus
  try {
    await ElMessageBox.confirm(`确定要将《${row.title}》状态改为「${label}」吗？`, '提示', { type: 'warning' })
    const res: any = await updateUserBookStatusApi({ id: row.id, status: newStatus })
    if (res.status === 200) { row.status = newStatus; ElMessage.success('操作成功') }
  } catch { /* cancelled */ }
}

const handleSearch = () => { page.value = 1; loadData() }

const handleExport = () => {
  exportToCSV(tableData.value, [
    { key: 'id', title: 'ID' }, { key: 'title', title: '书名' }, { key: 'author', title: '作者' },
    { key: 'isbn', title: 'ISBN' }, { key: 'seller_name', title: '卖家' },
    { key: 'category_name', title: '分类' }, { key: 'price', title: '售价' },
    { key: 'condition', title: '成色' }, { key: 'status', title: '状态' },
  ], '用户图书列表')
}

onMounted(() => { loadData(); loadCategories() })
</script>

<template>
  <el-card shadow="never">
    <div class="admin-toolbar">
      <div class="admin-toolbar-filters">
        <el-select v-model="statusFilter" style="width:110px" @change="handleSearch">
          <el-option label="全部状态" value="all" />
          <el-option label="在售" value="onsale" />
          <el-option label="下架" value="offline" />
          <el-option label="审核中" value="reviewing" />
          <el-option label="违规" value="violation" />
          <el-option label="已售" value="sold" />
        </el-select>
        <el-select v-model="categoryFilter" clearable placeholder="全部分类" style="width:130px" @change="handleSearch">
          <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
        </el-select>
        <el-input v-model="keyword" placeholder="搜索书名/作者/ISBN" clearable style="width:260px"
          @keyup.enter="handleSearch" @clear="handleSearch" />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </div>
      <div class="admin-toolbar-actions">
        <el-button @click="handleExport">导出</el-button>
      </div>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column label="封面" width="70" align="center">
        <template #default="{ row }">
          <el-image v-if="row.cover_img" :src="getImageUrl(row.cover_img)" style="width:36px;height:46px;border-radius:2px" fit="cover" :preview-src-list="[getImageUrl(row.cover_img)]" preview-teleported />
          <span v-else style="color:#c0c4cc">-</span>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="书名" min-width="130" show-overflow-tooltip />
      <el-table-column prop="author" label="作者" width="90" show-overflow-tooltip />
      <el-table-column label="卖家" width="90">
        <template #default="{ row }">{{ row.seller_name || row.username || '-' }}</template>
      </el-table-column>
      <el-table-column prop="category_name" label="分类" width="80">
        <template #default="{ row }">{{ row.category_name || '-' }}</template>
      </el-table-column>
      <el-table-column label="售价" width="70" align="center">
        <template #default="{ row }"><span style="color:#F56C6C;font-weight:500">{{ row.price ? Number(row.price).toFixed(2) : '-' }}</span></template>
      </el-table-column>
      <el-table-column label="成色" width="70" align="center">
        <template #default="{ row }">{{ row.condition ? row.condition + '新' : '-' }}</template>
      </el-table-column>
      <el-table-column label="状态" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="(statusMap[row.status]?.type || '') as any" size="small">{{ statusMap[row.status]?.text || row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="create_datetime" label="发布时间" width="160" />
      <el-table-column label="操作" width="180" fixed="right" align="center">
        <template #default="{ row }">
          <el-dropdown v-if="row.status !== 'sold'" trigger="click" @command="(cmd: string) => handleStatusChange(row, cmd)">
            <el-button type="primary" text size="small">
              更改状态<el-icon style="margin-left:4px"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-if="row.status !== 'onsale'" command="onsale">上架</el-dropdown-item>
                <el-dropdown-item v-if="row.status !== 'offline'" command="offline">下架</el-dropdown-item>
                <el-dropdown-item v-if="row.status !== 'reviewing'" command="reviewing">转审核</el-dropdown-item>
                <el-dropdown-item v-if="row.status !== 'violation'" command="violation" divided>
                  <span style="color:#F56C6C">标记违规</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <span v-else style="color:#909399;font-size:12px">已售出</span>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination v-model:current-page="page" v-model:page-size="pageSize" :total="total"
        :page-sizes="[10,20,50]" layout="total, sizes, prev, pager, next"
        @size-change="() => { page = 1; loadData() }" @current-change="loadData" />
    </div>
  </el-card>
</template>

<style scoped>
.pagination { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
