<template>
  <view class="container">
    <scroll-view scroll-y class="scroll-wrap">
      <!-- Post content -->
      <view class="post-item">
        <view class="post-header" @click="goUser(postInfo.user_id)">
          <image class="post-avatar" :src="getImageUrl(postInfo.avatar)" mode="aspectFill"></image>
          <view class="post-user">
            <text class="post-nickname">{{ postInfo.nickname || '用户' }}</text>
            <text class="post-time">{{ formatTime(postInfo.create_time) }}</text>
          </view>
        </view>
        <view class="post-content">
          <text class="post-text">{{ postInfo.content }}</text>
          <view class="post-imgs" v-if="postInfo.images">
            <image
              v-for="(img, idx) in (postInfo.images || '').split(',').filter(Boolean)"
              :key="idx"
              class="post-img"
              :src="getImageUrl(img)"
              mode="aspectFill"
              @click.stop="previewImg((postInfo.images || '').split(',').filter(Boolean), idx)"
            ></image>
          </view>
        </view>
        <view class="post-actions">
          <view class="action-item" @click="toggleLike">
            <uni-icons :type="postInfo.liked ? 'heart-filled' : 'heart'" size="20" :color="postInfo.liked ? '#ff4d4f' : '#999'"></uni-icons>
            <text class="action-text">{{ postInfo.like_count || 0 }}</text>
          </view>
          <view class="action-item">
            <uni-icons type="chatbubble" size="20" color="#999"></uni-icons>
            <text class="action-text">{{ postInfo.comment_count || 0 }}</text>
          </view>
        </view>
      </view>

      <!-- Comment list -->
      <view class="comment-section">
        <view class="comment-header">
          <text class="comment-title">评论</text>
        </view>
        <scroll-view scroll-y class="comment-list" v-if="comments.length > 0">
          <view class="comment-item" v-for="c in comments" :key="c.id">
            <image class="comment-avatar" :src="getImageUrl(c.avatar)" mode="aspectFill"></image>
            <view class="comment-body">
              <text class="comment-name">{{ c.nickname || '用户' }}</text>
              <text class="comment-content">{{ c.content }}</text>
              <text class="comment-time">{{ formatTime(c.create_time) }}</text>
            </view>
          </view>
        </scroll-view>
        <view class="empty-comments" v-else>
          <text class="empty-text">暂无评论，来抢沙发吧！</text>
        </view>
      </view>

      <!-- Bottom padding for input -->
      <view style="height: 120rpx;"></view>
    </scroll-view>

    <!-- Comment input bar -->
    <view class="comment-input-bar">
      <input class="comment-input" v-model="commentContent" placeholder="写评论..." />
      <button class="comment-send" @click="sendComment">发送</button>
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
      postId: null,
      postInfo: {},
      comments: [],
      commentContent: ''
    };
  },
  onLoad(options) {
    this.postId = options.id;
    this.loadPostDetail();
    this.loadComments();
  },
  methods: {
    getImageUrl,
    formatTime,
    async loadPostDetail() {
      try {
        // Get a specific post by filtering the first page (API doesn't have single post endpoint)
        const res = await request({
          url: `/discover/posts?page=1&pageSize=100`,
          method: 'GET'
        });
        const posts = res.data || [];
        const post = posts.find(p => p.id == this.postId);
        if (post) {
          let liked = false;
          try {
            const token = uni.getStorageSync('token');
            if (token) {
              const r = await request({ url: `/discover/posts/${post.id}/liked`, method: 'GET' });
              liked = r.data?.liked || false;
            }
          } catch (e) {}
          this.postInfo = { ...post, liked };
        } else {
          // If post not found in first page, try to get from localStorage or show error
          uni.showToast({ title: '帖子不存在', icon: 'none' });
          setTimeout(() => {
            uni.navigateBack();
          }, 1000);
        }
      } catch (e) {
        console.error(e);
        uni.showToast({ title: '加载失败', icon: 'none' });
      }
    },
    async loadComments() {
      try {
        const res = await request({ url: `/discover/posts/${this.postId}/comments`, method: 'GET' });
        this.comments = res.data || [];
      } catch (e) {
        this.comments = [];
      }
    },
    async sendComment() {
      const token = uni.getStorageSync('token');
      if (!token) {
        uni.showToast({ title: '请先登录', icon: 'none' });
        setTimeout(() => { uni.navigateTo({ url: '/pages/auth/login' }); }, 500);
        return;
      }
      const content = (this.commentContent || '').trim();
      if (!content) {
        uni.showToast({ title: '请输入评论', icon: 'none' });
        return;
      }
      try {
        await request({
          url: `/discover/posts/${this.postId}/comments`,
          method: 'POST',
          data: { content }
        });
        this.postInfo.comment_count = (this.postInfo.comment_count || 0) + 1;
        this.commentContent = '';
        this.loadComments();
        uni.showToast({ title: '评论成功', icon: 'success' });
      } catch (e) {
        uni.showToast({ title: '评论失败', icon: 'none' });
      }
    },
    async toggleLike() {
      const token = uni.getStorageSync('token');
      if (!token) {
        uni.showToast({ title: '请先登录', icon: 'none' });
        setTimeout(() => { uni.navigateTo({ url: '/pages/auth/login' }); }, 500);
        return;
      }
      try {
        const res = await request({ url: `/discover/posts/${this.postId}/like`, method: 'POST' });
        this.postInfo.liked = res.data?.liked ?? !this.postInfo.liked;
        this.postInfo.like_count = (this.postInfo.like_count || 0) + (this.postInfo.liked ? 1 : -1);
      } catch (e) {
        uni.showToast({ title: '操作失败', icon: 'none' });
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
.container {
  height: 100vh;
  background: #f5f5f5;
  position: relative;
}

.scroll-wrap {
  height: 100%;
  padding-bottom: 100rpx;
}

.post-item {
  background: #fff;
  padding: 24rpx;
  margin-bottom: 20rpx;
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

.comment-section {
  background: #fff;
  padding: 24rpx;
}

.comment-header {
  margin-bottom: 20rpx;
}

.comment-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.comment-list {
  max-height: 600rpx;
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

.empty-comments {
  text-align: center;
  padding: 40rpx 0;
}

.empty-text {
  color: #999;
  font-size: 28rpx;
}

.comment-input-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  border-top: 1px solid #eee;
  background: #fff;
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