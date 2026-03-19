<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useAuthStore } from '../stores/auth'
import { getCaptchaApi } from '../api'
import { getImageUrl } from '../utils/image'
import axios from 'axios'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const form = reactive({
  username: '',
  password: '',
  captchaToken: '',
  captchaValue: '',
})
const captchaQuestion = ref('')
const captchaLoading = ref(false)

const siteConfig = reactive({
  site_name: 'Book Secondhand',
  site_description: '二手书交易管理平台',
  app_slogan: '让教材与好书，被更多人看到',
  site_logo: '',
  icp_number: '',
})

const loadSiteConfig = async () => {
  try {
    const baseURL = import.meta.env.VITE_API_BASE_URL || ''
    const res = await axios.get(`${baseURL}/home/config`)
    if (res.data?.status === 200 && res.data.data) {
      const c = res.data.data
      if (c.site_name) siteConfig.site_name = c.site_name
      if (c.site_description) siteConfig.site_description = c.site_description
      if (c.app_slogan) siteConfig.app_slogan = c.app_slogan
      if (c.site_logo) siteConfig.site_logo = c.site_logo
      if (c.icp_number) siteConfig.icp_number = c.icp_number
    }
  } catch { /* 使用默认值 */ }
}

const fetchCaptcha = async () => {
  captchaLoading.value = true
  try {
    const res: any = await getCaptchaApi()
    if (res.status === 200 && res.data) {
      form.captchaToken = res.data.token
      captchaQuestion.value = res.data.question
      form.captchaValue = ''
    }
  } catch {
    captchaQuestion.value = ''
  } finally {
    captchaLoading.value = false
  }
}

const handleLogin = async () => {
  if (!form.username || !form.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }
  if (!form.captchaValue?.trim()) {
    ElMessage.warning('请输入验证码')
    return
  }
  loading.value = true
  try {
    await authStore.login({
      username: form.username,
      password: form.password,
      captchaToken: form.captchaToken,
      captchaValue: form.captchaValue.trim(),
    })
    ElMessage.success('登录成功')
    router.push('/dashboard')
  } catch (err: any) {
    ElMessage.error(err.message || '登录失败')
    fetchCaptcha()
  } finally {
    loading.value = false
  }
}

onMounted(() => { fetchCaptcha(); loadSiteConfig() })
</script>

<template>
  <div class="login-page">
    <!-- 左侧视觉区域 -->
    <div class="login-left">
      <div class="left-inner">
        <div class="brand">
          <el-image v-if="siteConfig.site_logo" :src="getImageUrl(siteConfig.site_logo)" class="brand-logo-img" fit="contain" />
          <div v-else class="brand-logo">{{ siteConfig.site_name?.charAt(0) || 'B' }}</div>
          <div class="brand-text">
            <div class="brand-title">{{ siteConfig.site_name }}</div>
            <div class="brand-sub">{{ siteConfig.site_description }}</div>
          </div>
        </div>
        <div class="slogan">
          <h1>{{ siteConfig.app_slogan }}</h1>
          <p>统一管理平台图书、用户闲置、订单与售后，让二手书的流转更高效。</p>
        </div>
        <div class="highlights">
          <div class="highlight-item">
            <span class="dot primary"></span>
            <span>实时订单与资金看板</span>
          </div>
          <div class="highlight-item">
            <span class="dot secondary"></span>
            <span>发布审核与违规处理闭环</span>
          </div>
          <div class="highlight-item">
            <span class="dot tertiary"></span>
            <span>客服会话、工单与 FAQ 统一管理</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧登录区域 -->
    <div class="login-right">
      <div class="login-card">
        <div class="card-inner">
          <div class="logo-area">
            <h1 class="sys-name">登录管理后台</h1>
            <p class="sys-desc">请选择身份并使用管理员 / 客服账号登录</p>
          </div>

          <el-form :model="form" class="login-form" @submit.prevent="handleLogin">
          <el-form-item>
            <el-input
              v-model="form.username"
              placeholder="请输入账号"
              size="large"
              clearable
              :prefix-icon="User as any"
              autocomplete="username"
            />
          </el-form-item>

          <el-form-item>
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              show-password
              clearable
              :prefix-icon="Lock as any"
              autocomplete="current-password"
              @keyup.enter="handleLogin"
            />
          </el-form-item>

          <el-form-item>
            <div class="captcha-row">
              <el-input
                v-model="form.captchaValue"
                placeholder="验证码"
                size="large"
                maxlength="4"
                class="captcha-input"
                @keyup.enter="handleLogin"
              />
              <div class="captcha-box" :class="{ loading: captchaLoading }">
                <template v-if="captchaLoading">加载中</template>
                <template v-else>
                  <span class="captcha-q">{{ captchaQuestion }}</span>
                  <el-button type="primary" link size="small" @click="fetchCaptcha">
                    <el-icon><RefreshRight /></el-icon> 换一题
                  </el-button>
                </template>
              </div>
            </div>
          </el-form-item>

          <el-form-item class="submit-item">
            <el-button
              type="primary"
              size="large"
              :loading="loading"
              class="login-btn"
              @click="handleLogin"
            >
              登 录
            </el-button>
          </el-form-item>
          </el-form>

          <p class="login-tip">登录即代表你同意本系统的管理规范和操作审计。</p>
        </div>
      </div>
    </div>
  </div>
  <p v-if="siteConfig.icp_number" class="icp-number">{{ siteConfig.icp_number }}</p>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  background: radial-gradient(circle at 10% 20%, #e0f2fe 0, #eff6ff 35%, #f9fafb 70%);
}

.login-left {
  flex: 1.2;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 48px;
}

.left-inner {
  max-width: 520px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 32px;
}

.brand-logo {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #fff;
  font-weight: 700;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.brand-title {
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
}

.brand-sub {
  font-size: 13px;
  color: #6b7280;
}

.slogan h1 {
  font-size: 30px;
  line-height: 1.3;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 12px;
}

.slogan p {
  margin: 0;
  font-size: 14px;
  color: #4b5563;
}

.highlights {
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.highlight-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #374151;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
}
.dot.primary {
  background: #2563eb;
}
.dot.secondary {
  background: #22c55e;
}
.dot.tertiary {
  background: #f97316;
}

.login-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow:
    0 18px 45px rgba(15, 23, 42, 0.08),
    0 1px 2px rgba(15, 23, 42, 0.06);
  border: 1px solid #e5e7eb;
}

.card-inner {
  padding: 32px 34px 28px;
}

.logo-area {
  margin-bottom: 26px;
}

.sys-name {
  font-size: 22px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 8px;
}

.sys-desc {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.login-form :deep(.el-input__wrapper),
.identity-select :deep(.el-input__wrapper) {
  border-radius: 6px;
  box-shadow: 0 0 0 1px #e5e7eb;
}

.login-form :deep(.el-input__wrapper:hover),
.identity-select :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #d1d5db;
}

.login-form :deep(.el-input__wrapper.is-focus),
.identity-select :deep(.el-select .el-input.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 2px rgba(55, 65, 81, 0.15);
}

.identity-select {
  width: 100%;
}

.option-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.captcha-row {
  display: flex;
  gap: 12px;
  width: 100%;
}

.captcha-input {
  flex: 1;
  min-width: 0;
}

.captcha-box {
  width: 140px;
  flex-shrink: 0;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: #f8f9fa;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.captcha-box.loading {
  font-size: 12px;
  color: #909399;
}

.captcha-q {
  letter-spacing: 1px;
}

.submit-item {
  margin-bottom: 0;
  margin-top: 8px;
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 15px;
  font-weight: 500;
  border-radius: 6px;
  background: #374151;
  border-color: #374151;
}

.login-tip {
  text-align: center;
  font-size: 12px;
  color: #9ca3af;
  margin: 18px 0 0;
}

.icp-number {
  position: fixed;
  bottom: 16px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 11px;
  color: #c0c4cc;
  margin: 0;
  z-index: 10;
}

.brand-logo-img {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  flex-shrink: 0;
}

@media (max-width: 960px) {
  .login-page {
    flex-direction: column;
  }
  .login-left {
    display: none;
  }
  .login-right {
    flex: none;
    padding: 32px 20px;
  }
}
</style>
