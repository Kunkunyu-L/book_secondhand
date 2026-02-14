<template>
  <view class="help-detail">
    <view class="article-header">
      <text class="article-title">{{ article.title }}</text>
      <text class="article-meta">{{ article.category }} · {{ article.created_at }}</text>
    </view>
    <view class="article-body">
      <rich-text :nodes="article.content || ''"></rich-text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import request from '@/untils/request.js'

const article = ref({})

onLoad((options) => {
  if (options.id) loadDetail(options.id)
})

const loadDetail = async (id) => {
  try {
    const res = await request({ url: `/home/help-articles/detail?id=${id}`, method: 'GET' })
    article.value = res.data || {}
  } catch (e) {}
}
</script>

<style scoped>
.help-detail { min-height: 100vh; background: #fff; padding: 30rpx; }
.article-header { margin-bottom: 30rpx; border-bottom: 1rpx solid #f0f0f0; padding-bottom: 24rpx; }
.article-title { font-size: 36rpx; font-weight: bold; color: #333; display: block; margin-bottom: 12rpx; }
.article-meta { font-size: 24rpx; color: #999; }
.article-body { font-size: 28rpx; color: #444; line-height: 1.8; }
</style>
