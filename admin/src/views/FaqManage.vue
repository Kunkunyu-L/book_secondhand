<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getFaqCategoriesApi, saveFaqCategoryApi, deleteFaqCategoryApi, getFaqsApi, saveFaqApi, deleteFaqApi } from '../api'

const categories = ref<any[]>([])
const faqs = ref<any[]>([])
const keyword = ref('')
const categoryFilter = ref('')
const loading = ref(false)
const catDialogVisible = ref(false)
const faqDialogVisible = ref(false)
const catForm = reactive({ id: 0, name: '', sort: 0, status: 1 })
const faqForm = reactive({ id: 0, category_id: null as number | null, question: '', answer: '', sort: 0, status: 1 })

const loadCategories = async () => {
  try { const res: any = await getFaqCategoriesApi(); if (res.status === 200) categories.value = res.data } catch {}
}

const loadFaqs = async () => {
  loading.value = true
  try {
    const params: any = {}
    if (keyword.value) params.keyword = keyword.value
    if (categoryFilter.value) params.category_id = categoryFilter.value
    const res: any = await getFaqsApi(params)
    if (res.status === 200) faqs.value = res.data
  } finally { loading.value = false }
}

const openAddCat = () => { Object.assign(catForm, { id: 0, name: '', sort: 0, status: 1 }); catDialogVisible.value = true }
const openEditCat = (c: any) => { Object.assign(catForm, { ...c }); catDialogVisible.value = true }
const saveCat = async () => {
  if (!catForm.name) { ElMessage.warning('请输入名称'); return }
  const res: any = await saveFaqCategoryApi({ ...catForm })
  if (res.status === 200) { ElMessage.success('保存成功'); catDialogVisible.value = false; loadCategories() }
}
const delCat = async (c: any) => {
  await ElMessageBox.confirm(`删除分类「${c.name}」及其下所有问题？`, '提示', { type: 'warning' })
  const res: any = await deleteFaqCategoryApi({ id: c.id })
  if (res.status === 200) { ElMessage.success('删除成功'); loadCategories(); loadFaqs() }
}

const openAddFaq = () => { Object.assign(faqForm, { id: 0, category_id: null, question: '', answer: '', sort: 0, status: 1 }); faqDialogVisible.value = true }
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
onMounted(() => { loadCategories(); loadFaqs() })
</script>

<template>
  <el-row :gutter="20">
    <!-- 左侧分类 -->
    <el-col :span="6">
      <el-card shadow="never">
        <template #header>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-weight:600">FAQ 分类</span>
            <el-button type="primary" text size="small" @click="openAddCat"><el-icon><Plus /></el-icon></el-button>
          </div>
        </template>
        <div v-for="c in categories" :key="c.id" class="cat-item" :class="{ active: categoryFilter === c.id }"
          @click="categoryFilter = categoryFilter === c.id ? '' : c.id; loadFaqs()">
          <span>{{ c.name }}</span>
          <span>
            <el-button type="primary" text size="small" @click.stop="openEditCat(c)">编辑</el-button>
            <el-button type="danger" text size="small" @click.stop="delCat(c)">删</el-button>
          </span>
        </div>
        <div v-if="categories.length===0" style="text-align:center;padding:20px;color:#909399">暂无分类</div>
      </el-card>
    </el-col>

    <!-- 右侧FAQ列表 -->
    <el-col :span="18">
      <el-card shadow="never">
        <div class="toolbar">
          <el-input v-model="keyword" placeholder="搜索问题或回答" clearable style="width:280px" @keyup.enter="handleSearch" @clear="handleSearch" />
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button type="success" @click="openAddFaq"><el-icon style="margin-right:4px"><Plus /></el-icon>新增FAQ</el-button>
        </div>
        <el-table :data="faqs" v-loading="loading" border stripe>
          <el-table-column prop="id" label="ID" width="60" align="center" />
          <el-table-column prop="question" label="问题" min-width="200" show-overflow-tooltip />
          <el-table-column prop="answer" label="回答" min-width="200" show-overflow-tooltip />
          <el-table-column prop="category_name" label="分类" width="90"><template #default="{ row }">{{ row.category_name || '-' }}</template></el-table-column>
          <el-table-column label="状态" width="70" align="center">
            <template #default="{ row }"><el-tag :type="row.status ? 'success' : 'info'" size="small">{{ row.status ? '启用' : '禁用' }}</el-tag></template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right" align="center">
            <template #default="{ row }">
              <el-button type="primary" text size="small" @click="openEditFaq(row)">编辑</el-button>
              <el-button type="danger" text size="small" @click="delFaq(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-col>
  </el-row>

  <!-- 分类编辑弹窗 -->
  <el-dialog v-model="catDialogVisible" :title="catForm.id ? '编辑分类' : '新增分类'" width="400px" destroy-on-close>
    <el-form :model="catForm" label-width="60px">
      <el-form-item label="名称"><el-input v-model="catForm.name" /></el-form-item>
      <el-form-item label="排序"><el-input-number v-model="catForm.sort" :min="0" style="width:100%" /></el-form-item>
    </el-form>
    <template #footer><el-button @click="catDialogVisible=false">取消</el-button><el-button type="primary" @click="saveCat">确定</el-button></template>
  </el-dialog>

  <!-- FAQ编辑弹窗 -->
  <el-dialog v-model="faqDialogVisible" :title="faqForm.id ? '编辑FAQ' : '新增FAQ'" width="600px" destroy-on-close>
    <el-form :model="faqForm" label-width="60px">
      <el-form-item label="分类">
        <el-select v-model="faqForm.category_id" clearable placeholder="选择分类" style="width:100%">
          <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
        </el-select>
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
.toolbar { display: flex; gap: 12px; margin-bottom: 16px; }
.cat-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; border-radius: 4px; cursor: pointer; transition: background 0.2s; }
.cat-item:hover { background: #f5f7fa; }
.cat-item.active { background: #ecf5ff; color: #409EFF; }
</style>
