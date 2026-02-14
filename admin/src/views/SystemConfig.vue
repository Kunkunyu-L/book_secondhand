<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getConfigsApi, saveConfigsApi } from '../api'

const loading = ref(false)
const configs = reactive({
  site_name: '', site_logo: '', service_phone: '',
  icp_number: '', site_description: '',
})

const loadData = async () => {
  loading.value = true
  try {
    const res: any = await getConfigsApi()
    if (res.status === 200) {
      const c = res.data.configs || {}
      Object.assign(configs, {
        site_name: c.site_name || '', site_logo: c.site_logo || '',
        service_phone: c.service_phone || '', icp_number: c.icp_number || '',
        site_description: c.site_description || '',
      })
    }
  } finally { loading.value = false }
}

const handleSave = async () => {
  const res: any = await saveConfigsApi({ configs: { ...configs } })
  if (res.status === 200) ElMessage.success('保存成功')
}

onMounted(loadData)
</script>

<template>
  <el-card shadow="never" v-loading="loading">
    <template #header><span style="font-weight:600">基础设置</span></template>
    <el-form :model="configs" label-width="100px" style="max-width:600px">
      <el-form-item label="网站名称"><el-input v-model="configs.site_name" /></el-form-item>
      <el-form-item label="网站LOGO">
        <el-input v-model="configs.site_logo" placeholder="LOGO图片URL" />
        <el-image v-if="configs.site_logo" :src="configs.site_logo" style="width:120px;margin-top:8px;border-radius:4px" fit="contain" />
      </el-form-item>
      <el-form-item label="客服电话"><el-input v-model="configs.service_phone" /></el-form-item>
      <el-form-item label="ICP备案号"><el-input v-model="configs.icp_number" /></el-form-item>
      <el-form-item label="平台简介"><el-input v-model="configs.site_description" type="textarea" :rows="4" /></el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSave">保存设置</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>
