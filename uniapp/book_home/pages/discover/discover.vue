<template>
  <view class="discover-page">
    <scroll-view scroll-y class="scroll-wrap" @scrolltolower="loadMore" :lower-threshold="100">
      <view class="post-item" v-for="item in list" :key="item.id">
        <view class="post-header" @click="goUser(item.user_id)">
          <image class="post-avatar" :src="getImageUrl(item.avatar)" mode="aspectFill"></image>
          <view class="post-user">
            <text class="post-nickname">{{ item.nickname || '用户' }}</text>
            <text class="post-time">{{ formatTime(item.create_time) }}</text>
          </view>
        </view>
        <view class="post-content" @click="goToPostDetail(item)">
          <text class="post-text">{{ item.content }}</text>
          <view class="post-imgs" v-if="item.images">
            <image
              v-for="(img, idx) in (item.images || '').split(',').filter(Boolean)"
              :key="idx"
              class="post-img"
              :src="getImageUrl(img)"
              mode="aspectFill"
              @click.stop="previewImg((item.images || '').split(',').filter(Boolean), idx)"
            ></image>
          </view>
        </view>
        <view class="post-actions">
          <view class="action-item" @click="toggleLike(item)">
            <uni-icons :type="item.liked ? 'heart-filled' : 'heart'" size="20" :color="item.liked ? '#ff4d4f' : '#999'"></uni-icons>
            <text class="action-text">{{ item.like_count || 0 }}</text>
          </view>
          <view class="action-item" @click="goToPostDetail(item)">
            <uni-icons type="chatbubble" size="20" color="#999"></uni-icons>
            <text class="action-text">{{ item.comment_count || 0 }}</text>
          </view>
        </view>
      </view>
      <view v-if="list.length === 0 && !loading" class="empty">
        <text class="empty-text">暂无帖子，去发一条吧</text>
      </view>
      <view class="load-more" v-if="loading">
        <uni-icons type="spinner" size="16" color="#999"></uni-icons>
        <text class="load-text">加载中...</text>
      </view>
    </scroll-view>
      </view>
</template>

<script>
import request from '@/untils/request.js';
import { getImageUrl } from '@/untils/config.js';
import { formatTime, formatRelativeTime } from '@/untils/formatTime.js';
export default {
  data() {
    return {
      list: [],
      page: 1,
      pageSize: 10,
      loading: false,
      commentPost: null,
      comments: [],
      commentContent: ''
    };
  },
  onLoad() {},
  onShow() {
    this.list = [];
    this.page = 1;
    this.loadList();
  },
  methods: {
    getImageUrl,
    formatTime,
    formatRelativeTime,
    goToPostDetail(item) {
      uni.navigateTo({
        url: `/pages/discover/post-detail?id=${item.id}`
      });
    },
    async loadList() {
      if (this.loading) return;
      this.loading = true;
      try {
        const res = await request({
          url: `/discover/posts?page=${this.page}&pageSize=${this.pageSize}`,
          method: 'GET'
        });
        const data = res.data || [];
        if (this.page === 1) this.list = [];
        for (const item of data) {
          let liked = false;
          try {
            const token = uni.getStorageSync('token');
            if (token) {
              const r = await request({ url: `/discover/posts/${item.id}/liked`, method: 'GET' });
              liked = r.data?.liked || false;
            }
          } catch (e) {}
          this.list.push({ ...item, liked });
        }
      } catch (e) {
        console.error(e);
      }
      this.loading = false;
    },
    loadMore() {
      this.page++;
      this.loadList();
    },
    async toggleLike(item) {
      const token = uni.getStorageSync('token');
      if (!token) {
        uni.showToast({ title: '请先登录', icon: 'none' });
        setTimeout(() => { uni.navigateTo({ url: '/pages/auth/login' }); }, 500);
        return;
      }
      try {
        const res = await request({ url: `/discover/posts/${item.id}/like`, method: 'POST' });
        item.liked = res.data?.liked ?? !item.liked;
        item.like_count = (item.like_count || 0) + (item.liked ? 1 : -1);
      } catch (e) {
        uni.showToast({ title: '操作失败', icon: 'none' });
      }
    },
    openComment(item) {
      this.commentPost = item;
      this.commentContent = '';
      this.loadComments(item.id);
    },
    async loadComments(postId) {
      try {
        const res = await request({ url: `/discover/posts/${postId}/comments`, method: 'GET' });
        this.comments = res.data || [];
      } catch (e) {
        this.comments = [];
      }
    },
    async sendComment() {
      if (!this.commentPost) return;
      const token = uni.getStorageSync('token');
      if (!token) {
        uni.showToast({ title: '请先登录', icon: 'none' });
        return;
      }
      const content = (this.commentContent || '').trim();
      if (!content) {
        uni.showToast({ title: '请输入评论', icon: 'none' });
        return;
      }
      try {
        await request({
          url: `/discover/posts/${this.commentPost.id}/comments`,
          method: 'POST',
          data: { content }
        });
        this.commentPost.comment_count = (this.commentPost.comment_count || 0) + 1;
        this.commentContent = '';
        this.loadComments(this.commentPost.id);
        uni.showToast({ title: '评论成功', icon: 'success' });
      } catch (e) {
        uni.showToast({ title: '评论失败', icon: 'none' });
      }
    },
    goUser() {},
    previewImg(urls, idx) {
      const list = urls.map(u => getImageUrl(u));
      uni.previewImage({ current: list[idx], urls: list });
    }
  }
};
</script>

<style scoped>
.discover-page {
  height: 100vh;
  background: #f5f5f5;
  padding-bottom: 50px;
}
.scroll-wrap {
  height: 100%;
}
.post-item {
  background: #fff;
  margin-bottom: 20rpx;
  padding: 24rpx;
}
.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}
.post-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}
.post-user {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.post-nickname {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}
.post-time {
  font-size: 24rpx;
  color: #999;
  margin-top: 4rpx;
}
.post-content {
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
  width: 200rpx;
  height: 200rpx;
  border-radius: 8rpx;
  background: #f0f0f0;
}
.post-actions {
  display: flex;
  gap: 48rpx;
}
.action-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}
.action-text {
  font-size: 24rpx;
  color: #999;
}
.empty {
  text-align: center;
  padding: 80rpx 0;
}
.empty-text {
  color: #999;
  font-size: 28rpx;
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
.comment-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 200;
  display: flex;
  align-items: flex-end;
}
.comment-panel {
  width: 100%;
  max-height: 70vh;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  display: flex;
  flex-direction: column;
}
.comment-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 32rpx;
  border-bottom: 1px solid #eee;
  font-size: 32rpx;
  font-weight: 600;
}
.comment-list {
  flex: 1;
  max-height: 400rpx;
  padding: 16rpx;
}
.comment-item {
  display: flex;
  padding: 16rpx 0;
  border-bottom: 1px solid #f5f5f5;
}
.comment-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  margin-right: 20rpx;
  flex-shrink: 0;
}
.comment-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.comment-name {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 4rpx;
}
.comment-content {
  font-size: 28rpx;
  color: #333;
}
.comment-time {
  font-size: 22rpx;
  color: #999;
  margin-top: 4rpx;
}
.comment-input-row {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  border-top: 1px solid #eee;
  gap: 16rpx;
}
.comment-input {
  flex: 1;
  height: 72rpx;
  background: #f5f5f5;
  border-radius: 36rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
}
.comment-send {
  padding: 0 32rpx;
  height: 72rpx;
  line-height: 72rpx;
  font-size: 28rpx;
  background: #007AFF;
  color: #fff;
  border-radius: 36rpx;
}
</style>
