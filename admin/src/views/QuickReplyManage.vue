<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getQuickReplyCategoriesApi, saveQuickReplyCategoryApi, deleteQuickReplyCategoryApi,
  getQuickRepliesApi, saveQuickReplyApi, deleteQuickReplyApi } from '../api'

const categories = ref<any[]>([])
const replies = ref<any[]>([])
const keyword = ref('')
const categoryFilter = ref('')
const loading = ref(false)
const catDialogVisible = ref(false)
const replyDialogVisible = ref(false)
const catForm = reactive({ id: 0, name: '', sort: 0 })
const replyForm = reactive({ id: 0, category_id: null as number | null, title: '', content: '', sort: 0 })

const loadCategories = async () => {
  try { const res: any = await getQuickReplyCategoriesApi(); if (res.status === 200) categories.value = res.data } catch {}
}

const loadReplies = async () => {
  loading.value = true
  try {
    const params: any = {}
    if (keyword.value) params.keyword = keyword.value
    if (categoryFilter.value) params.category_id = categoryFilter.value
    const res: any = await getQuickRepliesApi(params)
    if (res.status === 200) replies.value = res.data
  } finally { loading.value = false }
}

const openAddCat = () => { Object.assign(catForm, { id: 0, name: '', sort: 0 }); catDialogVisible.value = true }
const openEditCat = (c: any) => { Object.assign(catForm, { ...c }); catDialogVisible.value = true }
const saveCat = async () => {
  if (!catForm.name) { ElMessage.warning('请输入名称'); return }
  const res: any = await saveQuickReplyCategoryApi({ ...catForm })
  if (res.status === 200) { ElMessage.success('保存成功'); catDialogVisible.value = false; loadCategories() }
}
const delCat = async (c: any) => {
  await ElMessageBox.confirm(`删除「${c.name}」及其下话术？`, '提示', { type: 'warning' })
  const res: any = await deleteQuickReplyCategoryApi({ id: c.id })
  if (res.status === 200) { ElMessage.success('已删除'); loadCategories(); loadReplies() }
}

const openAddReply = () => { Object.assign(replyForm, { id: 0, category_id: null, title: '', content: '', sort: 0 }); replyDialogVisible.value = true }
const openEditReply = (r: any) => { Object.assign(replyForm, { ...r }); replyDialogVisible.value = true }
const saveReplyItem = async () => {
  if (!replyForm.title || !replyForm.content) { ElMessage.warning('标题和内容不能为空'); return }
  const res: any = await saveQuickReplyApi({ ...replyForm })
  if (res.status === 200) { ElMessage.success('保存成功'); replyDialogVisible.value = false; loadReplies() }
}
const delReply = async (r: any) => {
  await ElMessageBox.confirm('确定删除？', '提示', { type: 'warning' })
  const res: any = await deleteQuickReplyApi({ id: r.id })
  if (res.status === 200) { ElMessage.success('已删除'); loadReplies() }
}

const handleSearch = () => loadReplies()
onMounted(() => { loadCategories(); loadReplies() })
</script>

<template>
  <el-row :gutter="20">
    <el-col :span="6">
      <el-card shadow="never">
        <template #header>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-weight:600">话术分类</span>
            <el-button type="primary" text size="small" @click="openAddCat"><el-icon><Plus /></el-icon></el-button>
          </div>
        </template>
        <div v-for="c in categories" :key="c.id" class="cat-item" :class="{ active: categoryFilter === c.id }"
          @click="categoryFilter = categoryFilter === c.id ? '' : c.id; loadReplies()">
          <span>{{ c.name }}</span>
          <span>
            <el-button type="primary" text size="small" @click.stop="openEditCat(c)">编辑</el-button>
            <el-button type="danger" text size="small" @click.stop="delCat(c)">删</el-button>
          </span>
        </div>
        <div v-if="categories.length===0" style="text-align:center;padding:20px;color:#909399">暂无分类</div>
      </el-card>
    </el-col>

    <el-col :span="18">
      <el-card shadow="never">
        <div class="toolbar">
          <el-input v-model="keyword" placeholder="搜索标题/内容" clearable style="width:250px" @keyup.enter="handleSearch" @clear="handleSearch" />
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button type="success" @click="openAddReply"><el-icon style="margin-right:4px"><Plus /></el-icon>新增话术</el-button>
        </div>
        <el-table :data="replies" v-loading="loading" border stripe>
          <el-table-column prop="id" label="ID" width="60" align="center" />
          <el-table-column prop="title" label="标题" width="160" show-overflow-tooltip />
          <el-table-column prop="content" label="话术内容" min-width="300" show-overflow-tooltip />
          <el-table-column prop="category_name" label="分类" width="90"><template #default="{ row }">{{ row.category_name || '-' }}</template></el-table-column>
          <el-table-column label="操作" width="120" fixed="right" align="center">
            <template #default="{ row }">
              <el-button type="primary" text size="small" @click="openEditReply(row)">编辑</el-button>
              <el-button type="danger" text size="small" @click="delReply(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-col>
  </el-row>

  <el-dialog v-model="catDialogVisible" :title="catForm.id ? '编辑分类' : '新增分类'" width="400px" destroy-on-close>
    <el-form :model="catForm" label-width="60px">
      <el-form-item label="名称"><el-input v-model="catForm.name" /></el-form-item>
      <el-form-item label="排序"><el-input-number v-model="catForm.sort" :min="0" style="width:100%" /></el-form-item>
    </el-form>
    <template #footer><el-button @click="catDialogVisible=false">取消</el-button><el-button type="primary" @click="saveCat">确定</el-button></template>
  </el-dialog>

  <el-dialog v-model="replyDialogVisible" :title="replyForm.id ? '编辑话术' : '新增话术'" width="560px" destroy-on-close>
    <el-form :model="replyForm" label-width="60px">
      <el-form-item label="分类">
        <el-select v-model="replyForm.category_id" clearable placeholder="选择分类" style="width:100%">
          <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="标题"><el-input v-model="replyForm.title" /></el-form-item>
      <el-form-item label="内容"><el-input v-model="replyForm.content" type="textarea" :rows="5" /></el-form-item>
    </el-form>
    <template #footer><el-button @click="replyDialogVisible=false">取消</el-button><el-button type="primary" @click="saveReplyItem">确定</el-button></template>
  </el-dialog>
</template>

<style scoped>
.toolbar { display: flex; gap: 12px; margin-bottom: 16px; }
.cat-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; border-radius: 4px; cursor: pointer; transition: background 0.2s; }
.cat-item:hover { background: #f5f7fa; }
.cat-item.active { background: #ecf5ff; color: #409EFF; }
</style>
