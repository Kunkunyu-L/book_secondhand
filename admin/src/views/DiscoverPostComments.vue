<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getDiscoverCommentsApi, deleteDiscoverCommentApi } from '../api'
import { formatTime } from '../utils/formatTime'

const route = useRoute()
const router = useRouter()

const postId = ref<number | null>(
  route.params.id ? Number(route.params.id) : route.query.postId ? Number(route.query.postId) : null
)
const postContent = ref<string>((route.query.content as string) || '')
const postNickname = ref<string>((route.query.nickname as string) || '')
const postUsername = ref<string>((route.query.username as string) || '')

const commentData = ref<any[]>([])
const loading = ref(false)

const loadComments = async () => {
  if (!postId.value) return
  loading.value = true
  try {
    const res: any = await getDiscoverCommentsApi({
      post_id: postId.value,
      page: 1,
      pageSize: 100
    })
    if (res.status === 200) {
      commentData.value = res.data.list || []
    }
  } finally {
    loading.value = false
  }
}

const handleDeleteComment = async (commentId: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该评论吗？', '提示', {
      type: 'warning'
    })
    const res: any = await deleteDiscoverCommentApi({ id: commentId })
    if (res.status === 200) {
      ElMessage.success('删除成功')
      loadComments()
    }
  } catch {
    // 取消删除
  }
}

const handleBack = () => {
  router.push({ name: 'DiscoverPosts' })
}

onMounted(loadComments)
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <div class="header">
        <div class="title">
          <el-button link type="primary" @click="handleBack">返回帖子列表</el-button>
          <span class="title-text"> / 帖子评论</span>
        </div>
        <div class="post-brief">
          <div class="post-meta">
            <span class="label">作者：</span>
            <span>{{ postNickname || postUsername || '-' }}</span>
          </div>
          <div class="post-content">
            <span class="label">内容：</span>
            <span class="content-text">{{ postContent || '（无正文）' }}</span>
          </div>
        </div>
      </div>
    </template>

    <el-table :data="commentData" v-loading="loading" border stripe max-height="520">
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column label="评论用户" width="140">
        <template #default="{ row }">
          {{ row.nickname || row.username || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="评论内容" min-width="240">
        <template #default="{ row }">
          <div class="comment-content">
            <span>{{ row.content }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="时间" width="160">
        <template #default="{ row }">
          {{ formatTime(row.create_time) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" align="center">
        <template #default="{ row }">
          <el-button type="danger" text size="small" @click="handleDeleteComment(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<style scoped>
.header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.title {
  font-size: 14px;
  display: flex;
  align-items: center;
}

.title-text {
  margin-left: 4px;
  color: #6b7280;
}

.post-brief {
  padding: 8px 12px;
  border-radius: 6px;
  background: #f9fafb;
  font-size: 13px;
  color: #4b5563;
}

.post-meta {
  margin-bottom: 4px;
}

.label {
  color: #9ca3af;
}

.post-content .content-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.comment-content {
  font-size: 13px;
  line-height: 1.4;
}
</style>

