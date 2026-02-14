<template>
  <view class="publish-page">
    <view class="form-card">
      <view class="card-title">基本信息</view>
      <view class="form-item">
        <text class="form-label required">书名</text>
        <input class="form-input" v-model="form.title" placeholder="请输入书名" />
      </view>
      <view class="form-item">
        <text class="form-label required">作者</text>
        <input class="form-input" v-model="form.author" placeholder="请输入作者" />
      </view>
      <view class="form-item">
        <text class="form-label">ISBN</text>
        <input class="form-input" v-model="form.isbn" placeholder="可选，输入ISBN号" />
      </view>
      <view class="form-item">
        <text class="form-label">出版社</text>
        <input class="form-input" v-model="form.publisher" placeholder="请输入出版社" />
      </view>
      <view class="form-item">
        <text class="form-label">出版日期</text>
        <input class="form-input" v-model="form.publish_date" placeholder="如：2024-01" />
      </view>
      <view class="form-item">
        <text class="form-label">分类</text>
        <picker :range="categories" range-key="name" @change="onCategoryChange">
          <text class="picker-text">{{ selectedCategoryName || '请选择分类' }}</text>
        </picker>
      </view>
      <view class="form-item">
        <text class="form-label">标签</text>
        <input class="form-input" v-model="form.tags" placeholder="用逗号分隔，如：计算机,编程" />
      </view>
    </view>

    <view class="form-card">
      <view class="card-title">价格与成色</view>
      <view class="form-item">
        <text class="form-label required">售价(元)</text>
        <input class="form-input" v-model="form.price" placeholder="请输入售价" type="digit" />
      </view>
      <view class="form-item">
        <text class="form-label">原价(元)</text>
        <input class="form-input" v-model="form.original_price" placeholder="选填，图书原价" type="digit" />
      </view>
      <view class="form-item">
        <text class="form-label">成色</text>
        <view class="condition-options">
          <view 
            class="condition-item" 
            :class="{ active: form.condition === c.value }" 
            v-for="c in conditionOptions" 
            :key="c.value"
            @click="form.condition = c.value"
          >
            {{ c.label }}
          </view>
        </view>
      </view>
      <view class="form-item">
        <text class="form-label">成色描述</text>
        <input class="form-input" v-model="form.condition_desc" placeholder="如：首页有轻微折痕" />
      </view>
    </view>

    <view class="form-card">
      <view class="card-title">图片与描述</view>
      <view class="form-item-col">
        <text class="form-label">封面图片</text>
        <view class="img-list">
          <image v-if="form.cover_img" :src="form.cover_img" class="preview-img" mode="aspectFill" @click="chooseCover"></image>
          <view v-else class="add-img" @click="chooseCover">
            <uni-icons type="plusempty" size="30" color="#ccc"></uni-icons>
            <text class="add-text">添加封面</text>
          </view>
        </view>
      </view>
      <view class="form-item-col">
        <text class="form-label">卖书故事</text>
        <textarea class="form-textarea" v-model="form.book_story" placeholder="描述一下这本书的故事，让买家更了解它..." :maxlength="500"></textarea>
      </view>
    </view>

    <button class="publish-btn" @click="submitPublish" :disabled="publishing">
      {{ publishing ? '发布中...' : '发布图书' }}
    </button>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import request from '@/untils/request.js'

const categories = ref([])
const publishing = ref(false)

const conditionOptions = [
  { label: '全新', value: 10 },
  { label: '九成新', value: 9 },
  { label: '八成新', value: 8 },
  { label: '七成新', value: 7 }
]

const form = ref({
  title: '', author: '', isbn: '', publisher: '', publish_date: '',
  category: null, tags: '', price: '', original_price: '',
  condition: 8, condition_desc: '', cover_img: '', book_story: ''
})

const selectedCategoryName = computed(() => {
  if (!form.value.category) return ''
  const cat = categories.value.find(c => c.id === form.value.category)
  return cat ? cat.name : ''
})

onLoad(() => { loadCategories() })

const loadCategories = async () => {
  try {
    const res = await request({ url: '/home/categories/level1', method: 'GET' })
    categories.value = res.data || []
  } catch (e) {}
}

const onCategoryChange = (e) => {
  const idx = e.detail.value
  form.value.category = categories.value[idx]?.id || null
}

const chooseCover = () => {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      form.value.cover_img = res.tempFilePaths[0]
    }
  })
}

const submitPublish = async () => {
  if (!form.value.title) return uni.showToast({ title: '请输入书名', icon: 'none' })
  if (!form.value.author) return uni.showToast({ title: '请输入作者', icon: 'none' })
  if (!form.value.price) return uni.showToast({ title: '请输入售价', icon: 'none' })

  publishing.value = true
  try {
    await request({ url: '/publish/book', method: 'POST', data: {
      ...form.value,
      price: Number(form.value.price),
      original_price: Number(form.value.original_price) || Number(form.value.price)
    }})
    uni.showToast({ title: '发布成功', icon: 'success' })
    setTimeout(() => { uni.navigateBack() }, 1000)
  } catch (e) {
    console.error('发布失败', e)
  }
  publishing.value = false
}
</script>

<style scoped>
.publish-page { min-height: 100vh; background: #f5f5f5; padding: 20rpx; padding-bottom: 120rpx; }
.form-card { background: #fff; border-radius: 16rpx; padding: 10rpx 24rpx; margin-bottom: 20rpx; }
.card-title { font-size: 30rpx; font-weight: bold; padding: 16rpx 0; border-bottom: 1rpx solid #f5f5f5; }
.form-item { display: flex; align-items: center; padding: 20rpx 0; border-bottom: 1rpx solid #f5f5f5; }
.form-item:last-child { border-bottom: none; }
.form-item-col { padding: 20rpx 0; border-bottom: 1rpx solid #f5f5f5; }
.form-label { font-size: 28rpx; color: #333; width: 160rpx; flex-shrink: 0; }
.form-label.required::before { content: '*'; color: #ff4d4f; margin-right: 4rpx; }
.form-input { flex: 1; font-size: 28rpx; text-align: right; }
.form-textarea { width: 100%; height: 200rpx; font-size: 26rpx; margin-top: 16rpx; padding: 16rpx; background: #f8f8f8; border-radius: 12rpx; }
.picker-text { font-size: 28rpx; color: #007AFF; }
.condition-options { display: flex; gap: 16rpx; flex: 1; justify-content: flex-end; }
.condition-item { padding: 8rpx 24rpx; border: 1rpx solid #ddd; border-radius: 30rpx; font-size: 24rpx; color: #666; }
.condition-item.active { border-color: #007AFF; color: #007AFF; background: #e6f3ff; }
.img-list { display: flex; gap: 16rpx; margin-top: 16rpx; }
.preview-img { width: 160rpx; height: 160rpx; border-radius: 12rpx; }
.add-img { width: 160rpx; height: 160rpx; border: 2rpx dashed #ddd; border-radius: 12rpx; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.add-text { font-size: 22rpx; color: #ccc; margin-top: 8rpx; }
.publish-btn { background: #007AFF; color: #fff; border-radius: 40rpx; margin-top: 40rpx; font-size: 32rpx; }
.publish-btn[disabled] { opacity: 0.6; }
</style>
