<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getBannersApi, addBannerApi, updateBannerApi, deleteBannerApi } from '../api'

const tableData = ref<any[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const defaultForm = { id: 0, image_url: '', link_url: '', title: '', sort: 0, status: 1 }
const form = reactive({ ...defaultForm })

const loadData = async () => {
  loading.value = true
  try {
    const res: any = await getBannersApi()
    if (res.status === 200) tableData.value = res.data
  } finally { loading.value = false }
}

const openAdd = () => { isEdit.value = false; Object.assign(form, { ...defaultForm }); dialogVisible.value = true }
const openEdit = (row: any) => { isEdit.value = true; Object.assign(form, { ...row }); dialogVisible.value = true }

const handleSubmit = async () => {
  if (!form.image_url) { ElMessage.warning('请输入图片地址'); return }
  const api = isEdit.value ? updateBannerApi : addBannerApi
  const res: any = await api({ ...form })
  if (res.status === 200) { ElMessage.success('保存成功'); dialogVisible.value = false; loadData() }
}

const handleDelete = async (row: any) => {
  await ElMessageBox.confirm('确定删除该轮播图？', '提示', { type: 'warning' })
  const res: any = await deleteBannerApi({ id: row.id })
  if (res.status === 200) { ElMessage.success('删除成功'); loadData() }
}

onMounted(loadData)
</script>

<template>
  <el-card shadow="never">
    <div class="admin-toolbar admin-toolbar-actions-only">
      <div class="admin-toolbar-actions">
        <el-button type="primary" @click="openAdd"><el-icon style="margin-right:4px"><Plus /></el-icon>添加轮播图</el-button>
      </div>
    </div>
    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column label="预览" width="140" align="center">
        <template #default="{ row }">
          <el-image v-if="row.image_url" :src="row.image_url" style="width:120px;height:50px;border-radius:4px" fit="cover" :preview-src-list="[row.image_url]" preview-teleported />
          <span v-else style="color:#c0c4cc">-</span>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="标题" min-width="140" show-overflow-tooltip>
        <template #default="{ row }">{{ row.title || '-' }}</template>
      </el-table-column>
      <el-table-column prop="link_url" label="跳转链接" min-width="180" show-overflow-tooltip>
        <template #default="{ row }">{{ row.link_url || '-' }}</template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" width="60" align="center" />
      <el-table-column label="状态" width="80" align="center">
        <template #default="{ row }"><el-tag :type="row.status ? 'success' : 'info'" size="small">{{ row.status ? '显示' : '隐藏' }}</el-tag></template>
      </el-table-column>
      <el-table-column label="操作" width="130" fixed="right" align="center">
        <template #default="{ row }">
          <el-button type="primary" text size="small" @click="openEdit(row)">编辑</el-button>
          <el-button type="danger" text size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑轮播图' : '添加轮播图'" width="560px" destroy-on-close>
      <el-form :model="form" label-width="80px">
        <el-form-item label="图片地址"><el-input v-model="form.image_url" placeholder="输入图片URL" /></el-form-item>
        <el-form-item label="预览" v-if="form.image_url">
          <el-image :src="form.image_url" style="width:100%;max-height:150px;border-radius:6px" fit="cover" />
        </el-form-item>
        <el-form-item label="标题描述"><el-input v-model="form.title" maxlength="200" /></el-form-item>
        <el-form-item label="跳转链接"><el-input v-model="form.link_url" placeholder="点击跳转的URL" /></el-form-item>
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="排序"><el-input-number v-model="form.sort" :min="0" style="width:100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="状态"><el-switch v-model="form.status" :active-value="1" :inactive-value="0" active-text="显示" inactive-text="隐藏" /></el-form-item></el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>
