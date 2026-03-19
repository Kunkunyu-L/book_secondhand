<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCategoriesApi, addCategoryApi, updateCategoryApi, deleteCategoryApi } from '../api'
import { formatTime } from '../utils/formatTime'
import { uploadImage } from '../utils/upload'
import { getImageUrl } from '../utils/image'

const tableData = ref<any[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const uploadLoading = ref(false)

const defaultForm = { id: 0, name: '', img: '', sort: 0, status: 1 }
const form = reactive({ ...defaultForm })

const handleCategoryImgUpload = async (options: { file: File }) => {
  uploadLoading.value = true
  try {
    const { url } = await uploadImage(options.file, 'category')
    form.img = url
    ElMessage.success('图片上传成功')
  } catch (e: any) {
    ElMessage.error(e.message || '上传失败')
  } finally {
    uploadLoading.value = false
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const res: any = await getCategoriesApi()
    if (res.status === 200) {
      tableData.value = res.data
    }
  } finally {
    loading.value = false
  }
}

const openAdd = () => {
  isEdit.value = false
  Object.assign(form, { ...defaultForm })
  dialogVisible.value = true
}

const openEdit = (row: any) => {
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    name: row.name,
    img: row.img,
    sort: row.sort,
    status: row.status,
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!form.name) {
    ElMessage.warning('请输入分类名称')
    return
  }
  try {
    const api = isEdit.value ? updateCategoryApi : addCategoryApi
    const res: any = await api({ ...form })
    if (res.status === 200) {
      ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
      dialogVisible.value = false
      loadData()
    }
  } catch {
    // 由拦截器处理
  }
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除分类「${row.name}」吗？删除后不可恢复！`,
      '提示',
      { type: 'warning' }
    )
    const res: any = await deleteCategoryApi({ id: row.id })
    if (res.status === 200) {
      ElMessage.success('删除成功')
      loadData()
    }
  } catch {
    // 用户取消
  }
}

onMounted(loadData)
</script>

<template>
  <el-card shadow="never">
    <div class="admin-toolbar admin-toolbar-actions-only">
      <div class="admin-toolbar-actions">
        <el-button type="primary" @click="openAdd">
          <el-icon style="margin-right: 4px"><Plus /></el-icon>
          添加分类
        </el-button>
      </div>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column prop="img" label="图片" width="90" align="center">
        <template #default="{ row }">
          <el-image
            v-if="row.img"
            :src="getImageUrl(row.img)"
            style="width: 40px; height: 40px; border-radius: 4px"
            fit="cover"
            :preview-src-list="[getImageUrl(row.img)]"
            preview-teleported
          />
          <span v-else style="color: #c0c4cc">暂无</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="分类名称" min-width="150" />
      <el-table-column prop="sort" label="排序权重" width="100" align="center" />
      <el-table-column prop="status" label="状态" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status ? 'success' : 'info'" size="small">
            {{ row.status ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="170">
        <template #default="{ row }">{{ formatTime(row.created_at) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right" align="center">
        <template #default="{ row }">
          <el-button type="primary" text size="small" @click="openEdit(row)">
            编辑
          </el-button>
          <el-button type="danger" text size="small" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑分类' : '添加分类'"
      width="500px"
      destroy-on-close
    >
      <el-form :model="form" label-width="90px">
        <el-form-item label="分类名称">
          <el-input v-model="form.name" placeholder="请输入分类名称" maxlength="50" />
        </el-form-item>
        <el-form-item label="分类图片">
          <el-upload
            :show-file-list="false"
            :http-request="handleCategoryImgUpload"
            accept="image/jpeg,image/png,image/gif,image/webp"
          >
            <template #tip><span class="el-upload__tip">支持 jpg/png/gif/webp，单张不超过 5MB</span></template>
            <div v-if="form.img" class="upload-preview">
              <el-image :src="getImageUrl(form.img)" style="width:80px;height:80px;border-radius:6px" fit="cover" />
              <span class="upload-tip">点击更换</span>
            </div>
            <el-button v-else type="primary" :loading="uploadLoading">上传图片</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="排序权重">
          <el-input-number v-model="form.sort" :min="0" :max="999" />
          <span style="margin-left: 8px; color: #909399; font-size: 12px">数字越大越靠前</span>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="form.status"
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<style scoped>
.upload-preview { cursor: pointer; }
.upload-tip { font-size: 12px; color: #909399; display: block; margin-top: 4px; }
</style>
