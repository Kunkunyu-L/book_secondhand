<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAnnouncementsApi, addAnnouncementApi, updateAnnouncementApi, deleteAnnouncementApi } from '../api'
import { formatTime } from '../utils/formatTime'

const tableData = ref<any[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const defaultForm = { id: 0, title: '', content: '', type: 'notice' as string, status: 1, sort: 0 }
const form = reactive({ ...defaultForm })
const typeMap: Record<string, string> = { notice: '通知公告', system_notice: '系统公告', system_message: '系统消息' }
const typeTagMap: Record<string, string> = { notice: '', system_notice: 'warning', system_message: 'danger' }

const loadData = async () => {
  loading.value = true
  try {
    const res: any = await getAnnouncementsApi()
    if (res.status === 200) tableData.value = res.data
  } finally { loading.value = false }
}

const openAdd = () => { isEdit.value = false; Object.assign(form, { ...defaultForm }); dialogVisible.value = true }
const openEdit = (row: any) => { isEdit.value = true; Object.assign(form, { ...row }); dialogVisible.value = true }

const handleSubmit = async () => {
  if (!form.title) { ElMessage.warning('请输入标题'); return }
  const api = isEdit.value ? updateAnnouncementApi : addAnnouncementApi
  const res: any = await api({ ...form })
  if (res.status === 200) { ElMessage.success('保存成功'); dialogVisible.value = false; loadData() }
}

const handleDelete = async (row: any) => {
  await ElMessageBox.confirm(`确定删除「${row.title}」？`, '提示', { type: 'warning' })
  const res: any = await deleteAnnouncementApi({ id: row.id })
  if (res.status === 200) { ElMessage.success('删除成功'); loadData() }
}

onMounted(loadData)
</script>

<template>
  <el-card shadow="never">
    <div class="admin-toolbar admin-toolbar-actions-only">
      <div class="admin-toolbar-actions">
        <el-button type="primary" @click="openAdd"><el-icon style="margin-right:4px"><Plus /></el-icon>发布公告</el-button>
      </div>
    </div>
    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
      <el-table-column label="类型" width="110" align="center">
        <template #default="{ row }">
          <el-tag :type="(typeTagMap[row.type] || '') as any" size="small">{{ typeMap[row.type] || row.type }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="80" align="center">
        <template #default="{ row }"><el-tag :type="row.status ? 'success' : 'info'" size="small">{{ row.status ? '已发布' : '草稿' }}</el-tag></template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" width="60" align="center" />
      <el-table-column label="创建时间" width="170">
        <template #default="{ row }">{{ formatTime(row.created_at) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="130" fixed="right" align="center">
        <template #default="{ row }">
          <el-button type="primary" text size="small" @click="openEdit(row)">编辑</el-button>
          <el-button type="danger" text size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑公告' : '发布公告'" width="640px" destroy-on-close>
      <el-form :model="form" label-width="70px">
        <el-form-item label="标题"><el-input v-model="form.title" maxlength="200" /></el-form-item>
        <el-form-item label="类型">
          <el-radio-group v-model="form.type">
            <el-radio value="notice">通知公告</el-radio>
            <el-radio value="system_notice">系统公告</el-radio>
            <el-radio value="system_message">系统消息</el-radio>
          </el-radio-group>
          <div class="type-hint">
            <span v-if="form.type==='notice'">在 App 首页轮播图下方展示</span>
            <span v-else-if="form.type==='system_notice'">在 Admin 仪表盘展示</span>
            <span v-else-if="form.type==='system_message'">在 App 消息页「系统通知」中展示</span>
          </div>
        </el-form-item>
        <el-form-item label="内容"><el-input v-model="form.content" type="textarea" :rows="6" /></el-form-item>
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="排序"><el-input-number v-model="form.sort" :min="0" style="width:100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="状态"><el-switch v-model="form.status" :active-value="1" :inactive-value="0" active-text="发布" inactive-text="草稿" /></el-form-item></el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<style scoped>
.type-hint { font-size: 12px; color: #9ca3af; margin-top: 4px; }
</style>
