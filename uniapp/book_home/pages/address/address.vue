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
        <view class="region-row" @click="openRegionPickerByState">
          <text class="region-item" :class="{ placeholder: !form.province }">{{ form.province || '请选择省' }}</text>
          <text class="region-item" :class="{ placeholder: !form.city }">{{ form.city || '请选择市' }}</text>
          <text class="region-item" :class="{ placeholder: !form.district }">{{ form.district || '请选择区' }}</text>
          <uni-icons type="right" size="14" color="#999"></uni-icons>
        </view>
      </view>
      <!-- 地区选择弹窗 -->
      <uni-popup ref="regionPopup" type="bottom" background-color="#fff">
        <view class="region-popup">
          <view class="region-popup-title">{{ regionStepText }}</view>
          <scroll-view scroll-y class="region-list" v-if="regionOptions.length">
            <view class="region-opt" v-for="opt in regionOptions" :key="opt.id" @click="onRegionSelect(opt)">
              {{ opt.name }}
            </view>
          </scroll-view>
          <view v-else class="region-loading">{{ regionLoading ? '加载中...' : '暂无数据' }}</view>
        </view>
      </uni-popup>
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
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import request from '@/untils/request.js'

const isSelectMode = ref(false)
const addressList = ref([])
const loading = ref(false)
const showForm = ref(false)
const editingId = ref(null)
const form = ref({ name: '', phone: '', province: '', city: '', district: '', detail: '', is_default: false })
// 地区选择：存储 id 用于 getchildren
const provinceId = ref('')
const cityId = ref('')
const regionStep = ref('province') // province | city | district
const regionOptions = ref([])
const regionLoading = ref(false)
const regionPopup = ref(null)
const regionStepText = computed(() => {
  const m = { province: '选择省份', city: '选择城市', district: '选择区县' }
  return m[regionStep.value] || ''
})

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
  provinceId.value = ''
  cityId.value = ''
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
  editingId.value = null
  form.value = { name: '', phone: '', province: '', city: '', district: '', detail: '', is_default: false }
  provinceId.value = ''
  cityId.value = ''
}

// 省市区走后端代理，避免腾讯地图 CORS
const loadProvinces = async () => {
  regionLoading.value = true
  regionOptions.value = []
  try {
    const res = await request({ url: '/region/list', method: 'GET' })
    if (res?.data) regionOptions.value = res.data
  } catch (e) {}
  regionLoading.value = false
}

const loadChildren = async (parentId) => {
  regionLoading.value = true
  regionOptions.value = []
  try {
    const res = await request({ url: `/region/children?id=${encodeURIComponent(parentId)}`, method: 'GET' })
    if (res?.data) regionOptions.value = res.data
  } catch (e) {}
  regionLoading.value = false
}

// 根据当前已选状态决定打开省/市/区（选完省后点“所在地区”打开市，再选市后打开区）
const openRegionPickerByState = async () => {
  if (!form.value.province) {
    await openRegionPicker('province')
    return
  }
  if (!form.value.city) {
    if (!provinceId.value) {
      uni.showToast({ title: '请先选择省份', icon: 'none' })
      return
    }
    await openRegionPicker('city')
    return
  }
  if (!form.value.district) {
    if (!cityId.value) {
      uni.showToast({ title: '请先选择城市', icon: 'none' })
      return
    }
    await openRegionPicker('district')
    return
  }
  await openRegionPicker('district')
}

const openRegionPicker = async (step) => {
  regionStep.value = step
  regionOptions.value = []
  if (step === 'province') {
    form.value.province = ''
    form.value.city = ''
    form.value.district = ''
    provinceId.value = ''
    cityId.value = ''
    await loadProvinces()
  } else if (step === 'city') {
    if (!provinceId.value) {
      uni.showToast({ title: '请先选择省份', icon: 'none' })
      return
    }
    form.value.city = ''
    form.value.district = ''
    cityId.value = ''
    await loadChildren(provinceId.value)
  } else if (step === 'district') {
    if (!cityId.value) {
      uni.showToast({ title: '请先选择城市', icon: 'none' })
      return
    }
    form.value.district = ''
    await loadChildren(cityId.value)
  }
  regionPopup.value?.open()
}

const onRegionSelect = (opt) => {
  if (regionStep.value === 'province') {
    form.value.province = opt.name
    provinceId.value = opt.id
    regionPopup.value?.close()
    openRegionPicker('city')
  } else if (regionStep.value === 'city') {
    form.value.city = opt.name
    cityId.value = opt.id
    regionPopup.value?.close()
    openRegionPicker('district')
  } else if (regionStep.value === 'district') {
    form.value.district = opt.name
    regionPopup.value?.close()
  }
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
.address-page { height: 100vh; overflow-y: auto; background: #f5f5f5; padding-bottom: 120rpx; box-sizing: border-box; }
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
.region-row { flex: 1; display: flex; align-items: center; gap: 16rpx; padding: 10rpx 0; }
.region-item { font-size: 28rpx; color: #333; }
.region-item.placeholder { color: #999; }
.region-popup { padding: 30rpx; max-height: 60vh; }
.region-popup-title { font-size: 30rpx; font-weight: bold; margin-bottom: 24rpx; }
.region-list { max-height: 50vh; }
.region-opt { padding: 24rpx; font-size: 28rpx; border-bottom: 1rpx solid #f0f0f0; }
.region-loading { padding: 40rpx; text-align: center; color: #999; font-size: 28rpx; }
</style>
