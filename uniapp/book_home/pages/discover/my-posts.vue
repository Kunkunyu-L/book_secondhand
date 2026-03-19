<template>
  <view class="my-posts-page">
    <view v-if="list.length === 0 && !loading" class="empty">
      <uni-icons type="compose" size="80" color="#ccc"></uni-icons>
      <text class="empty-text">还没有发布帖子</text>
      <button class="go-btn" @click="goPublish">去发布</button>
    </view>
    <view class="post-item" v-for="item in list" :key="item.id">
      <view class="post-content">
        <text class="post-text">{{ item.content }}</text>
        <view class="post-imgs" v-if="item.images">
          <image
            v-for="(img, idx) in (item.images || '').split(',').filter(Boolean)"
            :key="idx"
            class="post-img"
            :src="getImageUrl(img)"
            mode="aspectFill"
          ></image>
        </view>
      </view>
      <view class="post-meta">
        <text class="post-time">{{ formatTime(item.create_time) }}</text>
        <text class="post-stats">{{ item.like_count || 0 }} 赞 · {{ item.comment_count || 0 }} 评论</text>
      </view>
    </view>
    <view class="load-more" v-if="loading">
      <uni-icons type="spinner" size="16" color="#999"></uni-icons>
      <text class="load-text">加载中...</text>
    </view>
  </view>
</template>

<script>
import request from '@/untils/request.js';
import { getImageUrl } from '@/untils/config.js';
import { formatTime } from '@/untils/formatTime.js';
export default {
  data() {
    return {
      list: [],
      loading: false
    };
  },
  onShow() {
    this.loadList();
  },
  methods: {
    getImageUrl,
    formatTime,
    async loadList() {
      this.loading = true;
      try {
        const res = await request({ url: '/discover/my-posts', method: 'GET' });
        this.list = res.data || [];
      } catch (e) {
        this.list = [];
      }
      this.loading = false;
    },
    goPublish() {
      uni.navigateTo({ url: '/pages/discover/post-publish' });
    }
  }
};
</script>

<style scoped>
.my-posts-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 24rpx 24rpx 40rpx;
}
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
}
.empty-text {
  color: #999;
  font-size: 28rpx;
  margin-top: 24rpx;
}
.go-btn {
  margin-top: 40rpx;
  padding: 0 48rpx;
  height: 72rpx;
  line-height: 72rpx;
  background: #007AFF;
  color: #fff;
  font-size: 28rpx;
  border-radius: 36rpx;
}
.post-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}
.post-text {
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
  word-break: break-all;
}
.post-imgs {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 16rpx;
}
.post-img {
  width: 160rpx;
  height: 160rpx;
  border-radius: 8rpx;
  background: #f0f0f0;
}
.post-meta {
  margin-top: 20rpx;
  padding-top: 16rpx;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  font-size: 24rpx;
  color: #999;
}
.load-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx 0;
  color: #999;
}
.load-text {
  font-size: 26rpx;
  margin-left: 8rpx;
}
</style>
