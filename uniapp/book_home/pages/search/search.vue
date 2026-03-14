<template>
  <view class="search-page">
    <view class="search-bar">
      <input
        class="search-input"
        type="text"
        v-model="keyword"
        placeholder="搜索书名、作者"
        confirm-type="search"
        focus
        @confirm="doSearch"
      />
      <button class="search-btn" @click="doSearch">搜索</button>
    </view>
    <view class="book-list" v-if="list.length > 0">
      <view class="book-card" v-for="(book, index) in list" :key="book.id + '_' + (book.source || book.bcp_type)">
        <view @click="detailBtn(book.id, book.bcp_type || book.source)">
          <view class="book-img-wrap">
            <image :src="getImageUrl(book.cover_img)" mode="aspectFill" class="book-img"></image>
            <view class="book-condition-tag1">{{ book.bcp_condition_desc || getConditionText(book.bcp_condition) }}</view>
            <view class="book-condition-tag2" v-if="!book.nickname">官方自营</view>
          </view>
          <view class="book-info">
            <text class="book-title">{{ book.title }}</text>
            <text class="book-author">{{ book.author }}</text>
            <view class="book-meta">
              <view class="seller-info" v-if="book.nickname">
                <image :src="book.avatar || '/static/common.jpg'" mode="aspectFill" class="seller-avatar"></image>
                <text class="seller-name">{{ book.nickname }}</text>
              </view>
              <view class="seller-info" v-else>
                <image src="/static/common.jpg" mode="aspectFill" class="seller-avatar"></image>
                <text class="seller-name">官方自营</text>
              </view>
              <text class="book-price">¥{{ Number(book.bcp_price || book.price || 0).toFixed(2) }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    <view v-else-if="searched && !loading" class="empty">
      <uni-icons type="search" size="60" color="#ccc"></uni-icons>
      <text class="empty-text">暂无相关图书</text>
    </view>
    <view v-else-if="!searched" class="empty">
      <text class="empty-text">输入关键词搜索</text>
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
export default {
  data() {
    return {
      keyword: '',
      list: [],
      loading: false,
      searched: false
    };
  },
  methods: {
    getImageUrl,
    async doSearch() {
      const kw = (this.keyword || '').trim();
      if (!kw) {
        uni.showToast({ title: '请输入关键词', icon: 'none' });
        return;
      }
      this.loading = true;
      this.searched = true;
      try {
        const res = await request({
          url: `/home/books/search?keyword=${encodeURIComponent(kw)}`,
          method: 'GET'
        });
        this.list = res.data || [];
      } catch (err) {
        console.error(err);
        this.list = [];
      }
      this.loading = false;
    },
    getConditionText(condition) {
      if (!condition) return '';
      if (condition >= 10) return '全新';
      if (condition >= 9) return '九成新';
      if (condition >= 8) return '八成新';
      if (condition >= 7) return '七成新';
      return '六成新以下';
    },
    detailBtn(bookId, bookType) {
      uni.navigateTo({
        url: `/components/detail?bookType=${bookType || 'user'}&bookId=${bookId}`
      });
    }
  }
};
</script>

<style scoped>
.search-page {
  min-height: 100vh;
  background: #fafafa;
  padding-bottom: 40rpx;
}
.search-bar {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  background: #fff;
  gap: 16rpx;
}
.search-input {
  flex: 1;
  height: 64rpx;
  padding: 0 24rpx;
  background: #f5f5f5;
  border-radius: 32rpx;
  font-size: 28rpx;
}
.search-btn {
  flex-shrink: 0;
  padding: 0 32rpx;
  height: 64rpx;
  line-height: 64rpx;
  font-size: 28rpx;
  background: #007AFF;
  color: #fff;
  border-radius: 32rpx;
}
.book-list {
  display: flex;
  flex-wrap: wrap;
  padding: 20rpx 10rpx;
}
.book-card {
  width: calc(50% - 10px);
  margin: 5px;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.book-img-wrap {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
}
.book-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.book-condition-tag1, .book-condition-tag2 {
  position: absolute;
  top: 8px;
  background: #ff4d4f;
  color: #fff;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
}
.book-condition-tag1 { left: 8px; }
.book-condition-tag2 { left: 46px; }
.book-info { padding: 10px; }
.book-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 4px;
}
.book-author {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.book-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.seller-info { display: flex; align-items: center; }
.seller-avatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  object-fit: cover;
}
.seller-name {
  font-size: 11px;
  color: #666;
  margin-left: 5px;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.book-price { font-size: 15px; font-weight: 600; color: #ff4d4f; }
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
}
.empty-text { color: #999; margin-top: 20rpx; font-size: 28rpx; }
.load-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
  color: #999;
}
.load-text { font-size: 13px; margin-left: 8px; }
</style>
