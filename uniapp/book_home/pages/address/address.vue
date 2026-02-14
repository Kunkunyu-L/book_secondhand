<template>
  <view class="address-page">
    <!-- 地址列表 -->
    <view v-if="addressList.length === 0 && !loading" class="empty-state">
      <uni-icons type="location" size="80" color="#ccc"></uni-icons>
      <text class="empty-text">暂无收货地址</text>
    </view>

    <view class="address-item" v-for="item in addressList" :key="item.id" @click="selectAddress(item)">
      <view class="address-main">
        <view class="address-header">
          <text class="name">{{ item.name }}</text>
          <text class="phone">{{ item.phone }}</text>
          <uni-tag v-if="item.is_default" text="默认" type="primary" size="mini" />
        </view>
        <text class="detail">{{ item.province }}{{ item.city }}{{ item.district }} {{ item.detail }}</text>
      </view>
      <view class="address-actions">
        <view class="action-item" @click.stop="setDefault(item)" v-if="!item.is_default">
          <uni-icons type="circle" size="16" color="#999"></uni-icons>
          <text class="action-text">设为默认</text>
        </view>
        <view class="action-item" @click.stop="editAddress(item)">
          <uni-icons type="compose" size="16" color="#007AFF"></uni-icons>
          <text class="action-text">编辑</text>
        </view>
        <view class="action-item" @click.stop="deleteAddress(item)">
          <uni-icons type="trash" size="16" color="#ff4d4f"></uni-icons>
          <text class="action-text" style="color:#ff4d4f;">删除</text>
        </view>
      </view>
    </view>

    <!-- 添加按钮 -->
    <button class="add-btn" @click="showForm = true">+ 新增收货地址</button>

    <!-- 添加/编辑表单弹窗 -->
    <uni-popup ref="formPopup" type="bottom" v-if="showForm" :is-mask-click="false">
      <view class="form-popup">
        <view class="form-header">
          <text class="form-title">{{ editingId ? '编辑地址' : '新增地址' }}</text>
          <view @click="closeForm">
            <uni-icons type="closeempty" size="20" color="#999"></uni-icons>
          </view>
        </view>
        <view class="form-item">
          <text class="form-label">收货人</text>
          <input class="form-input" v-model="form.name" placeholder="请输入收货人姓名" />
        </view>
        <view class="form-item">
          <text class="form-label">手机号</text>
          <input class="form-input" v-model="form.phone" placeholder="请输入手机号" type="number" maxlength="11" />
        </view>
        <view class="form-item">
          <text class="form-label">所在地区</text>
          <input class="form-input" v-model="form.province" placeholder="省" style="width:30%;" />
          <input class="form-input" v-model="form.city" placeholder="市" style="width:30%;" />
          <input class="form-input" v-model="form.district" placeholder="区" style="width:30%;" />
        </view>
        <view class="form-item">
          <text class="form-label">详细地址</text>
          <input class="form-input" v-model="form.detail" placeholder="街道、门牌号等" />
        </view>
        <view class="form-item">
          <label class="form-check">
            <checkbox :checked="form.is_default" @click="form.is_default = !form.is_default" />
            <text>设为默认地址</text>
          </label>
        </view>
        <button class="save-btn" @click="saveAddress">保存</button>
      </view>
    </uni-popup>
    
    <!-- 简易表单模式（不依赖popup） -->
    <view class="form-mask" v-if="showForm" @click="closeForm"></view>
    <view class="form-panel" v-if="showForm">
      <view class="form-header">
        <text class="form-title">{{ editingId ? '编辑地址' : '新增地址' }}</text>
        <view @click="closeForm">
          <uni-icons type="closeempty" size="20" color="#999"></uni-icons>
        </view>
      </view>
      <view class="form-item">
        <text class="form-label">收货人</text>
        <input class="form-input" v-model="form.name" placeholder="请输入收货人姓名" />
      </view>
      <view class="form-item">
        <text class="form-label">手机号</text>
        <input class="form-input" v-model="form.phone" placeholder="请输入手机号" type="number" maxlength="11" />
      </view>
      <view class="form-item">
        <text class="form-label">所在地区</text>
        <view style="display:flex;gap:10rpx;flex:1;">
          <input class="form-input" v-model="form.province" placeholder="省" />
          <input class="form-input" v-model="form.city" placeholder="市" />
          <input class="form-input" v-model="form.district" placeholder="区" />
        </view>
      </view>
      <view class="form-item">
        <text class="form-label">详细地址</text>
        <input class="form-input" v-model="form.detail" placeholder="街道、门牌号等" />
      </view>
      <view class="form-switch">
        <text>设为默认地址</text>
        <switch :checked="form.is_default" @change="form.is_default = $event.detail.value" color="#007AFF" />
      </view>
      <button class="save-btn" @click="saveAddress">保存</button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import request from '@/untils/request.js'

const isSelectMode = ref(false)
const addressList = ref([])
const loading = ref(false)
const showForm = ref(false)
const editingId = ref(null)
const form = ref({ name: '', phone: '', province: '', city: '', district: '', detail: '', is_default: false })

onLoad((options) => {
  if (options.select === '1') isSelectMode.value = true
})

onShow(() => { loadList() })

const loadList = async () => {
  loading.value = true
  try {
    const res = await request({ url: '/address/list', method: 'GET' })
    addressList.value = res.data || []
  } catch (e) {}
  loading.value = false
}

const selectAddress = (item) => {
  if (isSelectMode.value) {
    uni.setStorageSync('selectedAddress', JSON.stringify(item))
    uni.navigateBack()
  }
}

const editAddress = (item) => {
  editingId.value = item.id
  form.value = { name: item.name, phone: item.phone, province: item.province, city: item.city, district: item.district, detail: item.detail, is_default: !!item.is_default }
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
  editingId.value = null
  form.value = { name: '', phone: '', province: '', city: '', district: '', detail: '', is_default: false }
}

const saveAddress = async () => {
  const { name, phone, province, city, district, detail } = form.value
  if (!name || !phone || !province || !city || !district || !detail) {
    uni.showToast({ title: '请填写完整信息', icon: 'none' })
    return
  }
  try {
    if (editingId.value) {
      await request({ url: '/address/update', method: 'PUT', data: { id: editingId.value, ...form.value } })
    } else {
      await request({ url: '/address/add', method: 'POST', data: form.value })
    }
    uni.showToast({ title: '保存成功', icon: 'success' })
    closeForm()
    loadList()
  } catch (e) {}
}

const setDefault = async (item) => {
  try {
    await request({ url: '/address/setDefault', method: 'PUT', data: { id: item.id } })
    loadList()
  } catch (e) {}
}

const deleteAddress = (item) => {
  uni.showModal({
    title: '提示', content: '确定删除该地址？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await request({ url: '/address/remove', method: 'DELETE', data: { id: item.id } })
          uni.showToast({ title: '删除成功', icon: 'success' })
          loadList()
        } catch (e) {}
      }
    }
  })
}
</script>

<style scoped>
.address-page { min-height: 100vh; background: #f5f5f5; padding-bottom: 120rpx; }
.empty-state { display: flex; flex-direction: column; align-items: center; padding: 200rpx 0; }
.empty-text { color: #999; margin-top: 20rpx; }
.address-item { background: #fff; margin: 20rpx; border-radius: 16rpx; padding: 24rpx; }
.address-main { margin-bottom: 16rpx; }
.address-header { display: flex; align-items: center; gap: 16rpx; margin-bottom: 8rpx; }
.name { font-size: 30rpx; font-weight: bold; }
.phone { font-size: 28rpx; color: #666; }
.detail { font-size: 26rpx; color: #999; }
.address-actions { display: flex; gap: 30rpx; border-top: 1rpx solid #f0f0f0; padding-top: 16rpx; }
.action-item { display: flex; align-items: center; gap: 6rpx; }
.action-text { font-size: 24rpx; color: #666; }
.add-btn { margin: 30rpx; background: #007AFF; color: #fff; border-radius: 40rpx; font-size: 30rpx; }
.form-mask { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 100; }
.form-panel { position: fixed; bottom: 0; left: 0; right: 0; background: #fff; border-radius: 24rpx 24rpx 0 0; padding: 30rpx; z-index: 101; max-height: 80vh; overflow-y: auto; }
.form-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30rpx; }
.form-title { font-size: 32rpx; font-weight: bold; }
.form-item { display: flex; align-items: center; padding: 16rpx 0; border-bottom: 1rpx solid #f0f0f0; }
.form-label { font-size: 28rpx; color: #333; width: 140rpx; flex-shrink: 0; }
.form-input { flex: 1; font-size: 28rpx; height: 60rpx; }
.form-switch { display: flex; justify-content: space-between; align-items: center; padding: 20rpx 0; font-size: 28rpx; }
.save-btn { margin-top: 30rpx; background: #007AFF; color: #fff; border-radius: 40rpx; }
</style>
