<template>
  <view class="edit-page">
    <view class="form-card">
      <!-- 头像 -->
      <view class="form-item avatar-item" @click="chooseAvatar">
        <text class="form-label">头像</text>
        <view class="avatar-wrap">
          <image :src="form.avatar || '/static/common.jpg'" class="avatar-img" mode="aspectFill"></image>
          <uni-icons type="right" size="16" color="#ccc"></uni-icons>
        </view>
      </view>

      <!-- 昵称 -->
      <view class="form-item">
        <text class="form-label">昵称</text>
        <input class="form-input" v-model="form.nickname" placeholder="请输入昵称" />
      </view>

      <!-- 手机号 -->
      <view class="form-item">
        <text class="form-label">手机号</text>
        <input class="form-input" v-model="form.phone" placeholder="请输入手机号" type="number" maxlength="11" />
      </view>

      <!-- 用户名（不可修改） -->
      <view class="form-item">
        <text class="form-label">用户名</text>
        <text class="form-value">{{ form.username }}</text>
      </view>
    </view>

    <!-- 修改密码 -->
    <view class="form-card">
      <view class="card-title">修改密码</view>
      <view class="form-item">
        <text class="form-label">原密码</text>
        <input class="form-input" v-model="pwd.oldPassword" placeholder="请输入原密码" type="password" />
      </view>
      <view class="form-item">
        <text class="form-label">新密码</text>
        <input class="form-input" v-model="pwd.newPassword" placeholder="请输入新密码（6-12位）" type="password" />
      </view>
      <button class="pwd-btn" @click="changePassword">修改密码</button>
    </view>

    <!-- 保存按钮 -->
    <button class="save-btn" @click="saveProfile">保存资料</button>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import request from '@/untils/request.js'

const form = ref({ nickname: '', phone: '', avatar: '', username: '' })
const pwd = ref({ oldPassword: '', newPassword: '' })

onShow(() => { loadProfile() })

const loadProfile = async () => {
  try {
    const res = await request({ url: '/my/getUserInfo', method: 'GET' })
    const u = res.data || {}
    form.value = { nickname: u.nickname || '', phone: u.phone || '', avatar: u.avatar || '', username: u.username || '' }
  } catch (e) {}
}

const chooseAvatar = () => {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      // 实际项目需上传到服务器，这里暂用本地路径
      form.value.avatar = res.tempFilePaths[0]
    }
  })
}

const saveProfile = async () => {
  if (!form.value.nickname) {
    uni.showToast({ title: '请输入昵称', icon: 'none' })
    return
  }
  try {
    await request({
      url: '/my/updateProfile',
      method: 'PUT',
      data: { nickname: form.value.nickname, phone: form.value.phone, avatar: form.value.avatar }
    })
    uni.showToast({ title: '保存成功', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 1000)
  } catch (e) {}
}

const changePassword = async () => {
  if (!pwd.value.oldPassword || !pwd.value.newPassword) {
    uni.showToast({ title: '请填写密码', icon: 'none' })
    return
  }
  if (pwd.value.newPassword.length < 6 || pwd.value.newPassword.length > 12) {
    uni.showToast({ title: '新密码需6-12位', icon: 'none' })
    return
  }
  try {
    await request({ url: '/my/updatePassword', method: 'PUT', data: pwd.value })
    uni.showToast({ title: '密码修改成功', icon: 'success' })
    pwd.value = { oldPassword: '', newPassword: '' }
  } catch (e) {}
}
</script>

<style scoped>
.edit-page { min-height: 100vh; background: #f5f5f5; padding: 20rpx; }
.form-card { background: #fff; border-radius: 16rpx; padding: 10rpx 24rpx; margin-bottom: 20rpx; }
.card-title { font-size: 30rpx; font-weight: bold; padding: 16rpx 0; }
.form-item { display: flex; align-items: center; padding: 24rpx 0; border-bottom: 1rpx solid #f5f5f5; }
.form-item:last-child { border-bottom: none; }
.form-label { font-size: 28rpx; color: #333; width: 140rpx; flex-shrink: 0; }
.form-input { flex: 1; font-size: 28rpx; text-align: right; }
.form-value { flex: 1; font-size: 28rpx; text-align: right; color: #999; }
.avatar-item { justify-content: space-between; }
.avatar-wrap { display: flex; align-items: center; gap: 10rpx; }
.avatar-img { width: 80rpx; height: 80rpx; border-radius: 50%; }
.save-btn { background: #007AFF; color: #fff; border-radius: 40rpx; margin-top: 40rpx; font-size: 32rpx; }
.pwd-btn { background: #fff; color: #007AFF; border: 1rpx solid #007AFF; border-radius: 40rpx; margin: 20rpx 0; font-size: 28rpx; }
</style>
