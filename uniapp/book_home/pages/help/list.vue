<template>
  <view class="help-page">
    <!-- 分类过滤 -->
    <view class="category-bar">
      <scroll-view scroll-x class="category-scroll">
        <view class="cat-item" :class="{ active: currentCat === '' }" @click="currentCat = ''; loadData()">全部</view>
        <view class="cat-item" :class="{ active: currentCat === 'purchase' }" @click="currentCat = 'purchase'; loadData()">购书流程</view>
        <view class="cat-item" :class="{ active: currentCat === 'refund' }" @click="currentCat = 'refund'; loadData()">退款规则</view>
        <view class="cat-item" :class="{ active: currentCat === 'faq' }" @click="currentCat = 'faq'; loadData()">常见问题</view>
        <view class="cat-item" :class="{ active: currentCat === 'rule' }" @click="currentCat = 'rule'; loadData()">平台规则</view>
      </scroll-view>
    </view>
    <!-- 文章列表 -->
    <view class="article-list">
      <view class="article-item" v-for="item in list" :key="item.id" @click="goDetail(item.id)">
        <text class="article-title">{{ item.title }}</text>
        <view class="article-footer">
          <text class="article-cat">{{ item.category }}</text>
          <text class="article-time">{{ item.created_at }}</text>
        </view>
      </view>
      <view class="empty" v-if="list.length === 0"><text>暂无帮助文章</text></view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import request from '@/untils/request.js'

const list = ref([])
const currentCat = ref('')

onShow(() => { loadData() })

const loadData = async () => {
  try {
    const url = currentCat.value ? `/home/help-articles?category=${currentCat.value}` : '/home/help-articles'
    const res = await request({ url, method: 'GET' })
    list.value = res.data || []
  } catch (e) {}
}

const goDetail = (id) => {
  uni.navigateTo({ url: `/pages/help/detail?id=${id}` })
}
</script>

<style scoped>
.help-page { min-height: 100vh; background: #f5f5f5; }
.category-bar { background: #fff; padding: 20rpx; }
.category-scroll { white-space: nowrap; }
.cat-item { display: inline-block; padding: 12rpx 28rpx; font-size: 26rpx; color: #666; background: #f5f5f5; border-radius: 30rpx; margin-right: 16rpx; }
.cat-item.active { background: #007AFF; color: #fff; }
.article-list { padding: 20rpx; }
.article-item { background: #fff; padding: 28rpx 24rpx; margin-bottom: 16rpx; border-radius: 12rpx; }
.article-title { font-size: 30rpx; color: #333; font-weight: 500; display: block; margin-bottom: 12rpx; }
.article-footer { display: flex; justify-content: space-between; }
.article-cat { font-size: 24rpx; color: #007AFF; background: #EBF5FF; padding: 4rpx 16rpx; border-radius: 6rpx; }
.article-time { font-size: 24rpx; color: #999; }
.empty { text-align: center; padding: 60rpx 0; color: #999; }
</style>
