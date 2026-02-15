<template>
  <view class="mybooks-page">
    <view v-if="bookList.length === 0 && !loading" class="empty-state">
      <uni-icons type="list" size="80" color="#ccc"></uni-icons>
      <text class="empty-text">您还没有发布图书</text>
      <button class="publish-btn" @click="goPublish">去发布</button>
    </view>

    <view class="book-item" v-for="item in bookList" :key="(item.book_type || 'user') + '_' + item.id">
      <image :src="getImageUrl(item.cover_img)" class="book-img" mode="aspectFill"></image>
      <view class="book-info">
        <text class="book-title">{{ item.title }}</text>
        <text class="book-author">{{ item.author }}</text>
        <view class="book-bottom">
          <text class="book-price">¥{{ Number(item.price || 0).toFixed(2) }}</text>
          <view class="status-tag" :class="'status-' + item.status">{{ statusText(item.status) }}</view>
        </view>
      </view>
      <view class="book-actions">
        <button class="action-btn edit-btn" @click="editBook(item)">编辑</button>
        <button 
          class="action-btn" 
          :class="item.status === 'onsale' ? 'offline-btn' : 'online-btn'"
          @click="toggleStatus(item)"
        >
          {{ item.status === 'onsale' ? '下架' : '上架' }}
        </button>
        <button v-if="item.book_type === 'user'" class="action-btn delete-btn" @click="deleteBook(item)">删除</button>
      </view>
    </view>

    <!-- 悬浮发布按钮 -->
    <view class="fab-btn" @click="goPublish">
      <uni-icons type="plusempty" size="28" color="#fff"></uni-icons>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import request from '@/untils/request.js'
import { getImageUrl } from '@/untils/config.js'

const bookList = ref([])
const loading = ref(false)

onShow(() => { loadBooks() })

const loadBooks = async () => {
  loading.value = true
  try {
    const res = await request({ url: `/publish/mybooks?_t=${Date.now()}`, method: 'GET' })
    bookList.value = res.data || []
  } catch (e) {}
  loading.value = false
}

const statusText = (s) => {
  const map = { onsale: '在售', sold: '已售', offline: '已下架' }
  return map[s] || s
}

const toggleStatus = async (item) => {
  const newStatus = item.status === 'onsale' ? 'offline' : 'onsale'
  const bookType = item.book_type || 'user'
  try {
    await request({ url: '/publish/book/status', method: 'PUT', data: { book_id: item.id, book_type: bookType, status: newStatus } })
    item.status = newStatus
    uni.showToast({ title: '操作成功', icon: 'success' })
  } catch (e) {}
}

const deleteBook = (item) => {
  uni.showModal({
    title: '提示', content: '确定删除该图书？删除后无法恢复。',
    confirmColor: '#ff4d4f',
    success: async (res) => {
      if (res.confirm) {
        try {
          await request({ url: '/publish/book', method: 'DELETE', data: { book_id: item.id } })
          bookList.value = bookList.value.filter(b => b.id !== item.id)
          uni.showToast({ title: '删除成功', icon: 'success' })
        } catch (e) {}
      }
    }
  })
}

const editBook = (item) => {
  const type = item.book_type || 'user'
  uni.navigateTo({ url: `/pages/publish/publish?id=${item.id}&type=${type}` })
}

const goPublish = () => { uni.navigateTo({ url: '/pages/publish/publish' }) }
</script>

<style scoped>
.mybooks-page { height: 100vh; overflow-y: auto; background: #f5f5f5; padding-bottom: 120rpx; box-sizing: border-box; }
.empty-state { display: flex; flex-direction: column; align-items: center; padding: 200rpx 0; }
.empty-text { color: #999; margin-top: 20rpx; font-size: 28rpx; }
.publish-btn { margin-top: 30rpx; background: #007AFF; color: #fff; border-radius: 30rpx; font-size: 26rpx; }
.book-item { display: flex; align-items: center; background: #fff; margin: 16rpx 20rpx; border-radius: 16rpx; padding: 20rpx; }
.book-img { width: 120rpx; height: 120rpx; border-radius: 12rpx; margin-right: 16rpx; flex-shrink: 0; }
.book-info { flex: 1; }
.book-title { font-size: 28rpx; color: #333; display: block; margin-bottom: 6rpx; }
.book-author { font-size: 24rpx; color: #999; display: block; margin-bottom: 6rpx; }
.book-bottom { display: flex; align-items: center; gap: 16rpx; }
.book-price { font-size: 28rpx; color: #ff4d4f; font-weight: bold; }
.status-tag { font-size: 22rpx; padding: 4rpx 12rpx; border-radius: 6rpx; }
.status-onsale { background: #e6ffe6; color: #52c41a; }
.status-sold { background: #fff0e6; color: #faad14; }
.status-offline { background: #f0f0f0; color: #999; }
.book-actions { display: flex; flex-direction: column; gap: 10rpx; flex-shrink: 0; }
.action-btn { font-size: 22rpx; padding: 6rpx 20rpx; border-radius: 20rpx; border: 1rpx solid #ddd; background: #fff; line-height: 1.5; }
.online-btn { color: #52c41a; border-color: #52c41a; }
.edit-btn { color: #007AFF; border-color: #007AFF; }
.offline-btn { color: #faad14; border-color: #faad14; }
.delete-btn { color: #ff4d4f; border-color: #ff4d4f; }
.fab-btn { position: fixed; right: 40rpx; bottom: 100rpx; width: 96rpx; height: 96rpx; border-radius: 50%; background: #007AFF; display: flex; align-items: center; justify-content: center; box-shadow: 0 4rpx 20rpx rgba(0,122,255,0.4); }
</style>
