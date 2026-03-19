<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { getDiscoverPostsApi, deleteDiscoverPostApi } from '../api'
import { formatTime } from '../utils/formatTime'

const router = useRouter()

const tableData = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const keyword = ref('')
const statusFilter = ref('all')
const loading = ref(false)

const loadData = async () => {
  loading.value = true
  try {
    const res: any = await getDiscoverPostsApi({
      page: page.value,
      pageSize: pageSize.value,
      keyword: keyword.value,
      status: statusFilter.value,
    })
    if (res.status === 200) {
      tableData.value = res.data.list
      total.value = res.data.total
    }
  } finally {
    loading.value = false
  }
}

const handleDeletePost = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除帖子吗？删除后该帖子的所有点赞和评论都会被删除`, '提示', {
      type: 'warning'
    })
    const res: any = await deleteDiscoverPostApi({ id: row.id })
    if (res.status === 200) {
      ElMessage.success('删除成功')
      loadData()
    }
  } catch {
    // 取消删除
  }
}

const handleViewComments = (row: any) => {
  router.push({
    name: 'DiscoverPostComments',
    params: { id: row.id },
    query: {
      content: row.content,
      nickname: row.nickname || row.username || '',
      username: row.username || ''
    }
  })
}

const handleSearch = () => {
  page.value = 1
  loadData()
}

const getStatusLabel = (status: number) => {
  return status === 1 ? '正常' : '已删除'
}

const getStatusType = (status: number) => {
  return status === 1 ? 'success' : 'info'
}

onMounted(loadData)
</script>

<template>
  <el-card shadow="never">
    <div class="admin-toolbar">
      <div class="admin-toolbar-filters">
        <el-select v-model="statusFilter" style="width:110px" @change="handleSearch">
          <el-option label="全部状态" value="all" />
          <el-option label="正常" value="1" />
          <el-option label="已删除" value="0" />
        </el-select>
        <el-input v-model="keyword" placeholder="搜索帖子内容/用户名" clearable style="width:280px"
          @keyup.enter="handleSearch" @clear="handleSearch" />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </div>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column label="内容" min-width="200">
        <template #default="{ row }">
          <div class="post-content-preview">
            <text class="content-text">{{ row.content }}</text>
            <el-image v-if="row.images" :src="row.images.split(',')[0]" class="post-thumb" fit="cover" />
          </div>
        </template>
      </el-table-column>
      <el-table-column label="作者" width="120">
        <template #default="{ row }">
          <div>
            <div class="username">{{ row.nickname || row.username }}</div>
            <div class="user-id">{{ row.username || '-' }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="点赞数" width="80" align="center">
        <template #default="{ row }">{{ row.like_count || 0 }}</template>
      </el-table-column>
      <el-table-column label="评论数" width="80" align="center">
        <template #default="{ row }">{{ row.comment_count || 0 }}</template>
      </el-table-column>
      <el-table-column label="状态" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="发布时间" width="160">
        <template #default="{ row }">{{ formatTime(row.create_time) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right" align="center">
        <template #default="{ row }">
          <div style="white-space:nowrap">
            <el-button type="primary" text size="small" @click="handleViewComments(row)">评论详情</el-button>
            <el-button type="danger" text size="small" @click="handleDeletePost(row)">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @size-change="() => { page = 1; loadData() }"
        @current-change="loadData"
      />
    </div>
  </el-card>
</template>

<style scoped>
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.post-content-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.content-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 14px;
  line-height: 1.4;
}

.post-thumb {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  object-fit: cover;
}

.username {
  font-weight: 600;
  font-size: 14px;
}

.user-id {
  font-size: 12px;
  color: #909399;
}

.comment-content {
  font-size: 13px;
  line-height: 1.4;
}
</style>