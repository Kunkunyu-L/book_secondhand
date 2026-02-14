<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useAuthStore } from '../stores/auth'
import { getCaptchaApi } from '../api'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const form = reactive({
  username: '',
  password: '',
  identity: 'admin' as 'admin' | 'service',
  captchaToken: '',
  captchaValue: '',
})
const captchaQuestion = ref('')
const captchaLoading = ref(false)

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
      identity: form.identity,
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

onMounted(fetchCaptcha)
</script>

<template>
  <div class="login-wrap">
    <div class="login-bg">
      <div class="bg-shape shape-1" />
      <div class="bg-shape shape-2" />
      <div class="bg-shape shape-3" />
    </div>

    <div class="login-card">
      <div class="card-inner">
        <div class="logo-area">
          <div class="logo-icon">
            <el-icon :size="40"><Reading /></el-icon>
          </div>
          <h1 class="sys-name">二手书管理后台</h1>
          <p class="sys-desc">安全登录，请选择身份并完成验证</p>
        </div>

        <el-form :model="form" class="login-form" @submit.prevent="handleLogin">
          <el-form-item>
            <el-select
              v-model="form.identity"
              placeholder="选择登录身份"
              size="large"
              class="identity-select"
            >
              <el-option label="管理员" value="admin">
                <span class="option-label">
                  <el-icon><UserFilled /></el-icon>
                  管理员
                </span>
              </el-option>
              <el-option label="客服人员" value="service">
                <span class="option-label">
                  <el-icon><Service /></el-icon>
                  客服人员
                </span>
              </el-option>
            </el-select>
          </el-form-item>

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

        <p class="login-tip">请使用管理员或客服账号登录</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  position: relative;
  overflow: hidden;
  background: #f5f7fa;
}

.login-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.bg-shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.06;
}

.shape-1 {
  width: 600px;
  height: 600px;
  background: #409eff;
  top: -200px;
  right: -100px;
}

.shape-2 {
  width: 400px;
  height: 400px;
  background: #67c23a;
  bottom: -100px;
  left: -80px;
}

.shape-3 {
  width: 280px;
  height: 280px;
  background: #909399;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.login-card {
  width: 100%;
  max-width: 420px;
  position: relative;
  z-index: 1;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.08);
}

.card-inner {
  padding: 48px 40px 40px;
}

.logo-area {
  text-align: center;
  margin-bottom: 36px;
}

.logo-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.sys-name {
  font-size: 22px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px;
  letter-spacing: 0.5px;
}

.sys-desc {
  font-size: 13px;
  color: #909399;
  margin: 0;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 22px;
}

.login-form :deep(.el-input__wrapper),
.identity-select :deep(.el-input__wrapper) {
  border-radius: 10px;
  box-shadow: 0 0 0 1px #dcdfe6;
}

.login-form :deep(.el-input__wrapper:hover),
.identity-select :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #c0c4cc;
}

.login-form :deep(.el-input__wrapper.is-focus),
.identity-select :deep(.el-select .el-input.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.3);
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
  background: #f5f7fa;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  color: #303133;
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
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 10px;
}

.login-tip {
  text-align: center;
  font-size: 12px;
  color: #c0c4cc;
  margin: 24px 0 0;
}
</style>
