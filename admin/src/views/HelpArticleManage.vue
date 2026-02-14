<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getHelpArticlesApi, addHelpArticleApi, updateHelpArticleApi, deleteHelpArticleApi } from '../api'

const tableData = ref<any[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const categoryFilter = ref('')
const defaultForm = { id: 0, title: '', content: '', category: 'guide' as string, sort: 0, status: 1 }
const form = reactive({ ...defaultForm })
const categoryMap: Record<string, string> = { guide: '购书流程', refund: '退款规则', faq: '常见问题', rule: '平台规则' }

const loadData = async () => {
  loading.value = true
  try {
    const params: any = {}
    if (categoryFilter.value) params.category = categoryFilter.value
    const res: any = await getHelpArticlesApi(params)
    if (res.status === 200) tableData.value = res.data
  } finally { loading.value = false }
}

const openAdd = () => { isEdit.value = false; Object.assign(form, { ...defaultForm }); dialogVisible.value = true }
const openEdit = (row: any) => { isEdit.value = true; Object.assign(form, { ...row }); dialogVisible.value = true }

const handleSubmit = async () => {
  if (!form.title) { ElMessage.warning('请输入标题'); return }
  const api = isEdit.value ? updateHelpArticleApi : addHelpArticleApi
  const res: any = await api({ ...form })
  if (res.status === 200) { ElMessage.success('保存成功'); dialogVisible.value = false; loadData() }
}

const handleDelete = async (row: any) => {
  await ElMessageBox.confirm(`确定删除「${row.title}」？`, '提示', { type: 'warning' })
  const res: any = await deleteHelpArticleApi({ id: row.id })
  if (res.status === 200) { ElMessage.success('删除成功'); loadData() }
}

onMounted(loadData)
</script>

<template>
  <el-card shadow="never">
    <div class="toolbar">
      <el-select v-model="categoryFilter" clearable placeholder="全部分类" style="width:130px" @change="loadData">
        <el-option label="购书流程" value="guide" /><el-option label="退款规则" value="refund" />
        <el-option label="常见问题" value="faq" /><el-option label="平台规则" value="rule" />
      </el-select>
      <el-button type="primary" @click="openAdd"><el-icon style="margin-right:4px"><Plus /></el-icon>新增文档</el-button>
    </div>
    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="60" align="center" />
      <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
      <el-table-column label="分类" width="100" align="center">
        <template #default="{ row }"><el-tag size="small">{{ categoryMap[row.category] || row.category }}</el-tag></template>
      </el-table-column>
      <el-table-column label="状态" width="80" align="center">
        <template #default="{ row }"><el-tag :type="row.status ? 'success' : 'info'" size="small">{{ row.status ? '已发布' : '草稿' }}</el-tag></template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" width="60" align="center" />
      <el-table-column prop="updated_at" label="更新时间" width="170" />
      <el-table-column label="操作" width="130" fixed="right" align="center">
        <template #default="{ row }">
          <el-button type="primary" text size="small" @click="openEdit(row)">编辑</el-button>
          <el-button type="danger" text size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑文档' : '新增文档'" width="700px" destroy-on-close>
      <el-form :model="form" label-width="70px">
        <el-form-item label="标题"><el-input v-model="form.title" maxlength="200" /></el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.category" style="width:100%">
            <el-option label="购书流程" value="guide" /><el-option label="退款规则" value="refund" />
            <el-option label="常见问题" value="faq" /><el-option label="平台规则" value="rule" />
          </el-select>
        </el-form-item>
        <el-form-item label="正文"><el-input v-model="form.content" type="textarea" :rows="10" placeholder="支持HTML格式" /></el-form-item>
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

<style scoped>.toolbar { display: flex; gap: 12px; margin-bottom: 16px; }</style>
