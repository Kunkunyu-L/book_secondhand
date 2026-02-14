<template>
  <view class="collection-page">
    <view v-if="list.length === 0 && !loading" class="empty-state">
      <uni-icons type="heart" size="80" color="#ccc"></uni-icons>
      <text class="empty-text">暂无收藏</text>
      <button class="go-btn" @click="goMarket">去书市逛逛</button>
    </view>

    <view class="book-item" v-for="item in list" :key="item.fav_id" @click="goDetail(item)">
      <image :src="item.cover_img || '/static/common.jpg'" class="book-img" mode="aspectFill"></image>
      <view class="book-info">
        <text class="book-title">{{ item.title }}</text>
        <text class="book-author">{{ item.author }}</text>
        <view class="book-bottom">
          <text class="book-price">¥{{ Number(item.price || 0).toFixed(2) }}</text>
          <text class="book-status" v-if="item.book_status !== 'onsale'" style="color:#ff4d4f;">已下架</text>
        </view>
      </view>
      <view class="fav-btn" @click.stop="removeFav(item)">
        <uni-icons type="heart-filled" size="22" color="#ff4d4f"></uni-icons>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import request from '@/untils/request.js'

const list = ref([])
const loading = ref(false)

onShow(() => { loadList() })

const loadList = async () => {
  loading.value = true
  try {
    const res = await request({ url: '/favorite/list', method: 'GET' })
    list.value = res.data || []
  } catch (e) {}
  loading.value = false
}

const goDetail = (item) => {
  uni.navigateTo({ url: `/components/detail?bookId=${item.book_id}&bookType=${item.book_type}` })
}

const removeFav = async (item) => {
  try {
    await request({ url: '/favorite/remove', method: 'DELETE', data: { book_id: item.book_id, book_type: item.book_type } })
    list.value = list.value.filter(i => i.fav_id !== item.fav_id)
    uni.showToast({ title: '已取消收藏', icon: 'none' })
  } catch (e) {}
}

const goMarket = () => { uni.switchTab({ url: '/pages/market/market' }) }
</script>

<style scoped>
.collection-page { min-height: 100vh; background: #f5f5f5; }
.empty-state { display: flex; flex-direction: column; align-items: center; padding: 200rpx 0; }
.empty-text { color: #999; margin-top: 20rpx; font-size: 28rpx; }
.go-btn { margin-top: 30rpx; background: #007AFF; color: #fff; border-radius: 30rpx; font-size: 26rpx; padding: 10rpx 40rpx; }
.book-item { display: flex; align-items: center; background: #fff; margin: 16rpx 20rpx; border-radius: 16rpx; padding: 20rpx; }
.book-img { width: 140rpx; height: 140rpx; border-radius: 12rpx; margin-right: 20rpx; flex-shrink: 0; }
.book-info { flex: 1; }
.book-title { font-size: 28rpx; color: #333; display: block; margin-bottom: 8rpx; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.book-author { font-size: 24rpx; color: #999; display: block; margin-bottom: 8rpx; }
.book-bottom { display: flex; justify-content: space-between; align-items: center; }
.book-price { font-size: 30rpx; color: #ff4d4f; font-weight: bold; }
.fav-btn { padding: 10rpx; flex-shrink: 0; }
</style>
