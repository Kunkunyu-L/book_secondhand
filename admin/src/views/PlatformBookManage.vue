<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPlatformBooksApi, addPlatformBookApi, updatePlatformBookApi, deletePlatformBookApi, getCategoriesApi } from '../api'
import { exportToCSV } from '../utils/export'

const tableData = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const keyword = ref('')
const statusFilter = ref('all')
const categoryFilter = ref('')
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const categories = ref<any[]>([])

const defaultForm = {
  id: 0, isbn: '', title: '', author: '', publisher: '', publish_date: '',
  category: null as number | null, tags: '', status: 'onsale',
  cover_img: '', detail_imgs: '', description: '',
  condition: 10, condition_desc: '', original_price: 0, price: 0, stock: 1,
}
const form = reactive({ ...defaultForm })

const loadData = async () => {
  loading.value = true
  try {
    const res: any = await getPlatformBooksApi({
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

const openAdd = () => { isEdit.value = false; Object.assign(form, { ...defaultForm }); dialogVisible.value = true }

const openEdit = (row: any) => {
  isEdit.value = true
  Object.assign(form, {
    id: row.id, isbn: row.isbn, title: row.title, author: row.author,
    publisher: row.publisher, publish_date: row.publish_date, category: row.category,
    tags: row.tags, status: row.status, cover_img: row.cover_img,
    detail_imgs: row.detail_imgs, description: row.description,
    condition: row.condition || 10, condition_desc: row.condition_desc || '',
    original_price: Number(row.original_price) || 0, price: Number(row.price) || 0, stock: row.stock || 1,
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!form.title || !form.author || !form.isbn) { ElMessage.warning('请填写必要信息（ISBN、书名、作者）'); return }
  try {
    const api = isEdit.value ? updatePlatformBookApi : addPlatformBookApi
    const res: any = await api({ ...form })
    if (res.status === 200) { ElMessage.success(isEdit.value ? '更新成功' : '添加成功'); dialogVisible.value = false; loadData() }
  } catch { /* */ }
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除《${row.title}》吗？`, '提示', { type: 'warning' })
    const res: any = await deletePlatformBookApi({ id: row.id })
    if (res.status === 200) { ElMessage.success('删除成功'); loadData() }
  } catch { /* */ }
}

const handleSearch = () => { page.value = 1; loadData() }

const handleExport = () => {
  exportToCSV(tableData.value, [
    { key: 'id', title: 'ID' }, { key: 'isbn', title: 'ISBN' }, { key: 'title', title: '书名' },
    { key: 'author', title: '作者' }, { key: 'category_name', title: '分类' },
    { key: 'price', title: '售价' }, { key: 'stock', title: '库存' },
    { key: 'sales_count', title: '销量' }, { key: 'status', title: '状态' },
  ], '平台图书列表')
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
        </el-select>
        <el-select v-model="categoryFilter" clearable placeholder="全部分类" style="width:130px" @change="handleSearch">
          <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
        </el-select>
        <el-input v-model="keyword" placeholder="搜索书名/作者/ISBN" clearable style="width:260px"
          @keyup.enter="handleSearch" @clear="handleSearch" />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </div>
      <div class="admin-toolbar-actions">
        <el-button type="primary" @click="openAdd"><el-icon style="margin-right:4px"><Plus /></el-icon>添加</el-button>
        <el-button @click="handleExport">导出</el-button>
      </div>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column label="封面" width="70" align="center">
        <template #default="{ row }">
          <el-image v-if="row.cover_img" :src="row.cover_img" style="width:36px;height:46px;border-radius:2px" fit="cover" :preview-src-list="[row.cover_img]" preview-teleported />
          <span v-else style="color:#c0c4cc">-</span>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="书名" min-width="140" show-overflow-tooltip />
      <el-table-column prop="author" label="作者" width="100" show-overflow-tooltip />
      <el-table-column prop="isbn" label="ISBN" width="130" show-overflow-tooltip />
      <el-table-column prop="category_name" label="分类" width="90">
        <template #default="{ row }">{{ row.category_name || '-' }}</template>
      </el-table-column>
      <el-table-column label="售价" width="80" align="center">
        <template #default="{ row }"><span style="color:#F56C6C;font-weight:500">{{ row.price ? Number(row.price).toFixed(2) : '-' }}</span></template>
      </el-table-column>
      <el-table-column prop="stock" label="库存" width="60" align="center" />
      <el-table-column prop="sales_count" label="销量" width="60" align="center" />
      <el-table-column label="状态" width="70" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'onsale' ? 'success' : 'info'" size="small">{{ row.status === 'onsale' ? '在售' : '下架' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right" align="center">
        <template #default="{ row }">
          <div style="white-space: nowrap;">
            <el-button type="primary" text size="small" @click="openEdit(row)">编辑</el-button>
            <el-button type="danger" text size="small" @click="handleDelete(row)">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination v-model:current-page="page" v-model:page-size="pageSize" :total="total"
        :page-sizes="[10,20,50]" layout="total, sizes, prev, pager, next"
        @size-change="() => { page = 1; loadData() }" @current-change="loadData" />
    </div>

    <!-- 添加/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑图书' : '添加图书'" width="720px" top="5vh" destroy-on-close>
      <el-form :model="form" label-width="90px" style="max-height:65vh;overflow-y:auto;padding-right:12px">
        <el-divider content-position="left">基本信息</el-divider>
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="ISBN"><el-input v-model="form.isbn" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="书名"><el-input v-model="form.title" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="作者"><el-input v-model="form.author" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="出版社"><el-input v-model="form.publisher" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="出版日期"><el-input v-model="form.publish_date" placeholder="如 2024-01" /></el-form-item></el-col>
          <el-col :span="12">
            <el-form-item label="分类">
              <el-select v-model="form.category" clearable placeholder="选择分类" style="width:100%">
                <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12"><el-form-item label="标签"><el-input v-model="form.tags" placeholder="逗号分隔" /></el-form-item></el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-select v-model="form.status" style="width:100%">
                <el-option label="在售" value="onsale" /><el-option label="下架" value="offline" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider content-position="left">图片与描述</el-divider>
        <el-form-item label="封面图"><el-input v-model="form.cover_img" placeholder="封面图 URL" /></el-form-item>
        <el-form-item label="详情图"><el-input v-model="form.detail_imgs" type="textarea" :rows="2" placeholder="多张URL逗号分隔" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" type="textarea" :rows="3" /></el-form-item>
        <el-divider content-position="left">价格与库存</el-divider>
        <el-row :gutter="16">
          <el-col :span="8"><el-form-item label="成色"><el-input-number v-model="form.condition" :min="7" :max="10" style="width:100%" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="原价"><el-input-number v-model="form.original_price" :min="0" :precision="2" style="width:100%" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="售价"><el-input-number v-model="form.price" :min="0" :precision="2" style="width:100%" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="库存"><el-input-number v-model="form.stock" :min="0" style="width:100%" /></el-form-item></el-col>
          <el-col :span="16"><el-form-item label="成色描述"><el-input v-model="form.condition_desc" /></el-form-item></el-col>
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
.pagination { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
