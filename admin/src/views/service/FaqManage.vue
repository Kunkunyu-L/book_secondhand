<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getFaqsApi, saveFaqApi, deleteFaqApi } from '@/api'

const categories = ref<string[]>([])
const faqs = ref<any[]>([])
const keyword = ref('')
const categoryFilter = ref('')
const loading = ref(false)
const faqDialogVisible = ref(false)
const faqForm = reactive({ id: 0, category: '' as string, question: '', answer: '', sort: 0, status: 1 })

const loadFaqs = async () => {
  loading.value = true
  try {
    const params: any = {}
    if (keyword.value) params.keyword = keyword.value
    if (categoryFilter.value) params.category = categoryFilter.value
    const res: any = await getFaqsApi(params)
    if (res.status === 200) {
      faqs.value = res.data
      const set = new Set<string>()
      faqs.value.forEach((f: any) => { if (f.category_name) set.add(f.category_name) })
      categories.value = Array.from(set)
    }
  } finally { loading.value = false }
}

const openAddFaq = () => { Object.assign(faqForm, { id: 0, category: '', question: '', answer: '', sort: 0, status: 1 }); faqDialogVisible.value = true }
const openEditFaq = (f: any) => { Object.assign(faqForm, { ...f }); faqDialogVisible.value = true }
const saveFaqItem = async () => {
  if (!faqForm.question || !faqForm.answer) { ElMessage.warning('问题和回答不能为空'); return }
  const res: any = await saveFaqApi({ ...faqForm })
  if (res.status === 200) { ElMessage.success('保存成功'); faqDialogVisible.value = false; loadFaqs() }
}
const delFaq = async (f: any) => {
  await ElMessageBox.confirm('确定删除？', '提示', { type: 'warning' })
  const res: any = await deleteFaqApi({ id: f.id })
  if (res.status === 200) { ElMessage.success('删除成功'); loadFaqs() }
}

const handleSearch = () => loadFaqs()
onMounted(() => { loadFaqs() })
</script>

<template>
  <el-row :gutter="20">
    <el-col :span="24">
      <el-card shadow="never">
        <div class="admin-toolbar">
          <div class="admin-toolbar-filters">
            <el-input v-model="keyword" placeholder="搜索问题或回答" clearable style="width:280px" @keyup.enter="handleSearch" @clear="handleSearch" />
            <el-select v-model="categoryFilter" clearable placeholder="按分类筛选" style="width:160px;margin-left:8px" @change="handleSearch">
              <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
            </el-select>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
          </div>
          <div class="admin-toolbar-actions">
            <el-button type="primary" @click="openAddFaq"><el-icon style="margin-right:4px"><Plus /></el-icon>新增FAQ</el-button>
          </div>
        </div>
        <el-table :data="faqs" v-loading="loading" border stripe>
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="question" label="问题" min-width="200" show-overflow-tooltip />
          <el-table-column prop="answer" label="回答" min-width="200" show-overflow-tooltip />
          <el-table-column prop="category_name" label="分类" width="120">
            <template #default="{ row }">{{ row.category_name || '-' }}</template>
          </el-table-column>
          <el-table-column label="状态" width="70" align="center">
            <template #default="{ row }"><el-tag :type="row.status ? 'success' : 'info'" size="small">{{ row.status ? '启用' : '禁用' }}</el-tag></template>
          </el-table-column>
          <el-table-column label="操作" width="140" fixed="right" align="center">
            <template #default="{ row }">
              <div style="white-space:nowrap">
                <el-button type="primary" text size="small" @click="openEditFaq(row)">编辑</el-button>
                <el-button type="danger" text size="small" @click="delFaq(row)">删除</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-col>
  </el-row>

  <el-dialog v-model="faqDialogVisible" :title="faqForm.id ? '编辑FAQ' : '新增FAQ'" width="600px" destroy-on-close>
    <el-form :model="faqForm" label-width="60px">
      <el-form-item label="分类">
        <el-input v-model="faqForm.category" placeholder="如：下单、支付、售后" />
      </el-form-item>
      <el-form-item label="问题"><el-input v-model="faqForm.question" type="textarea" :rows="2" /></el-form-item>
      <el-form-item label="回答"><el-input v-model="faqForm.answer" type="textarea" :rows="5" /></el-form-item>
      <el-row :gutter="16">
        <el-col :span="12"><el-form-item label="排序"><el-input-number v-model="faqForm.sort" :min="0" style="width:100%" /></el-form-item></el-col>
        <el-col :span="12"><el-form-item label="状态"><el-switch v-model="faqForm.status" :active-value="1" :inactive-value="0" /></el-form-item></el-col>
      </el-row>
    </el-form>
    <template #footer><el-button @click="faqDialogVisible=false">取消</el-button><el-button type="primary" @click="saveFaqItem">确定</el-button></template>
  </el-dialog>
</template>

<style scoped>
</style>
