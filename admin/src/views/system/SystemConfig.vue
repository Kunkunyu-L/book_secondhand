<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getConfigsApi, saveConfigsApi } from '@/api'
import { uploadImage } from '@/utils/network'
import { getImageUrl } from '@/utils/helpers'

const loading = ref(false)
const logoUploading = ref(false)

const handleLogoUpload = async (options: { file: File }) => {
  logoUploading.value = true
  try {
    const { url } = await uploadImage(options.file, 'logo')
    configs.site_logo = url
    ElMessage.success('LOGO 上传成功')
  } catch (e: any) {
    ElMessage.error(e.message || '上传失败')
  } finally {
    logoUploading.value = false
  }
}
const activeTab = ref('basic')
const configs = reactive({
  site_name: '',
  site_logo: '',
  service_phone: '',
  icp_number: '',
  site_description: '',
  app_name: '',
  app_slogan: '',
  contact_email: '',
  withdraw_min: '',
  withdraw_fee_rate: '',
  order_auto_confirm_days: '',
  book_audit_enabled: '0',
  recommend_enabled: '1',
})

const loadData = async () => {
  loading.value = true
  try {
    const res: any = await getConfigsApi()
    if (res.status === 200) {
      const c = res.data.configs || {}
      Object.assign(configs, {
        site_name: c.site_name || '',
        site_logo: c.site_logo || '',
        service_phone: c.service_phone || '',
        icp_number: c.icp_number || '',
        site_description: c.site_description || '',
        app_name: c.app_name || '',
        app_slogan: c.app_slogan || '',
        contact_email: c.contact_email || '',
        withdraw_min: c.withdraw_min || '',
        withdraw_fee_rate: c.withdraw_fee_rate || '',
        order_auto_confirm_days: c.order_auto_confirm_days || '7',
        book_audit_enabled: c.book_audit_enabled || '0',
        recommend_enabled: c.recommend_enabled ?? '1',
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
    <template #header>
      <span style="font-weight:600;font-size:15px">全局设置</span>
      <span style="font-size:12px;color:#6b7280;margin-left:10px">以下设置同步作用于 Admin 后台与 App 前台</span>
    </template>

    <el-form :model="configs" label-width="120px" style="max-width:760px">
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="基础信息" name="basic">
          <el-divider content-position="left">平台基础信息</el-divider>
          <el-form-item label="平台名称">
            <el-input v-model="configs.site_name" placeholder="如：二手书平台" />
            <div class="field-hint">同时用于 Admin 侧栏标题 和 App 首页展示名称</div>
          </el-form-item>
          <el-form-item label="App 名称">
            <el-input v-model="configs.app_name" placeholder="如：书淘" />
            <div class="field-hint">App 导航栏、关于页显示的应用名</div>
          </el-form-item>
          <el-form-item label="平台 Slogan">
            <el-input v-model="configs.app_slogan" placeholder="如：让知识流动起来" />
          </el-form-item>
          <el-form-item label="平台 LOGO">
            <el-upload
              :show-file-list="false"
              :http-request="handleLogoUpload"
              accept="image/jpeg,image/png,image/gif,image/webp"
            >
              <template #tip><span class="el-upload__tip">支持 jpg/png/gif/webp，单张不超过 5MB</span></template>
              <div v-if="configs.site_logo" class="upload-preview">
                <el-image :src="getImageUrl(configs.site_logo)" style="width:100px;height:100px;border-radius:6px" fit="contain" />
                <span class="upload-tip">点击更换</span>
              </div>
              <el-button v-else type="primary" :loading="logoUploading">上传 LOGO</el-button>
            </el-upload>
          </el-form-item>
          <el-form-item label="平台简介">
            <el-input
              v-model="configs.site_description"
              type="textarea"
              :rows="3"
              placeholder="平台介绍，显示在 App「关于」页"
            />
          </el-form-item>

          <el-divider content-position="left">联系与备案</el-divider>
          <el-form-item label="客服电话">
            <el-input v-model="configs.service_phone" placeholder="客服热线，App 联系客服页展示" />
          </el-form-item>
          <el-form-item label="联系邮箱">
            <el-input v-model="configs.contact_email" placeholder="官方联系邮箱" />
          </el-form-item>
          <el-form-item label="ICP 备案号">
            <el-input v-model="configs.icp_number" placeholder="如：京ICP备xxxxxxxx号" />
          </el-form-item>
        </el-tab-pane>

        <el-tab-pane label="交易规则" name="trade">
          <el-divider content-position="left">交易规则</el-divider>
          <el-form-item label="最低提现金额">
            <el-input v-model="configs.withdraw_min" placeholder="单位：元，如 10">
              <template #append>元</template>
            </el-input>
          </el-form-item>
          <el-form-item label="提现手续费率">
            <el-input v-model="configs.withdraw_fee_rate" placeholder="如 0.01 表示 1%">
              <template #append>（小数）</template>
            </el-input>
          </el-form-item>
          <el-form-item label="自动确收天数">
            <el-input v-model="configs.order_auto_confirm_days" placeholder="超时后自动确认收货，单位：天">
              <template #append>天</template>
            </el-input>
          </el-form-item>
        </el-tab-pane>

        <el-tab-pane label="功能开关" name="feature">
          <el-divider content-position="left">功能开关</el-divider>
          <el-form-item label="智能推荐">
            <el-switch
              v-model="configs.recommend_enabled"
              active-value="1"
              inactive-value="0"
              active-text="开启"
              inactive-text="关闭"
            />
            <div class="field-hint">开启后根据用户学校/专业为其推荐图书</div>
          </el-form-item>
        </el-tab-pane>
      </el-tabs>

      <el-form-item style="margin-top:24px">
        <el-button type="primary" @click="handleSave">保存全局设置</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<style scoped>
.field-hint { font-size: 12px; color: #9ca3af; margin-top: 4px; }
.upload-preview { cursor: pointer; }
.upload-tip { font-size: 12px; color: #909399; display: block; margin-top: 4px; }
</style>
