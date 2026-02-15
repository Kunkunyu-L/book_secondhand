<template>
  <view class="book-market-page">

    <!-- 分类标签 -->
    <view class="tag-container">
      <scroll-view scroll-x class="tag-scroll">
		<view 
		      class="tag-item" 
		      :class="{ active: item.id === currentCategoryId }" 
		      v-for="(item, index) in category" 
		      :key="item.id"
		      @click="switchCategory(item.id)"
		    >
		      {{ item.name }}
		    </view>
      </scroll-view>
    </view>

    <!-- 搜索框 -->
    <view class="search-container">
      <input
        class="search-input"
        type="text"
        v-model="keyword"
        placeholder="搜索书名、作者"
        confirm-type="search"
        @confirm="doSearch"
      />
      <button class="search-btn" @click="doSearch">搜索</button>
    </view>

    <!-- 书籍列表 -->
    <view class="book-list">
      <view class="book-card" v-for="(book, index) in filteredBooks" :key="book.id + '_' + book.source">
        <view @click="detailBtn(book.id, book.bcp_type || book.source)">
          <!-- 书籍封面 -->
          <view class="book-img-wrap">
            <image :src="getImageUrl(book.cover_img)" mode="aspectFill" class="book-img"></image>
            <view class="book-condition-tag1">{{ book.bcp_condition_desc || getConditionText(book.bcp_condition) }}</view>
			<view class="book-condition-tag2" v-if="!book.nickname">平台售卖</view>
          </view>

          <!-- 书籍信息 -->
          <view class="book-info">
            <text class="book-title">{{ book.title }}</text>
            <text class="book-author">{{ book.author }}</text>
            
            <view class="book-meta">
              <view class="seller-info" v-if="book.nickname">
                <image :src="book.avatar || '/static/common.jpg'" mode="aspectFill" class="seller-avatar"></image>
                <text class="seller-name">{{ book.nickname }}</text>
              </view>
			  <view class="seller-info" v-if="!book.nickname">
			    <image src="/static/common.jpg" mode="aspectFill" class="seller-avatar"></image>
			    <text class="seller-name">平台售卖</text>
			  </view>
              <text class="book-price">¥{{ Number(book.bcp_price || book.price || 0).toFixed(2) }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

	<!-- 无结果 -->
	<view v-if="filteredBooks.length === 0 && !loading" class="empty-result">
	  <uni-icons type="search" size="60" color="#ccc"></uni-icons>
	  <text style="color: #999; margin-top: 20rpx;">暂无相关图书</text>
	</view>

    <!-- 加载更多 -->
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
	  loading: false,
	  keyword: '',
	  category:[],
	  currentCategoryId: 0,
	  marketBook:[],
	  searchResults: null  // null表示未搜索
    };
  },
  computed: {
    filteredBooks() {
	  const source = this.searchResults !== null ? this.searchResults : this.marketBook;
	  if (this.currentCategoryId === 0) return source;
	  return source.filter(book => book.category == this.currentCategoryId);
    }
  },
  onLoad() {
    this.loadData();
  },
  onShow() {
    // 从首页分类跳转过来时，读取并设置分类ID
    const selectedCategoryId = uni.getStorageSync('selectedCategoryId');
    if (selectedCategoryId) {
      this.currentCategoryId = selectedCategoryId;
      uni.removeStorageSync('selectedCategoryId'); // 清除存储，避免影响后续操作
    }
  },
  methods: {
	getImageUrl,
	async loadData() {
		this.loading = true;
		try {
			const categoryRes = await request({ url: '/home/categories/level1', method: 'GET' });
			this.category = [ { id: 0, name: '全部' } ].concat(categoryRes.data); 
			
			const bookRes = await request({ url: '/home/books/market', method: 'GET' });
			this.marketBook = bookRes.data || [];
		} catch (err) {
			console.error('数据获取失败:', err);
		}
		this.loading = false;
	},
	async doSearch() {
		if (!this.keyword.trim()) {
			this.searchResults = null;
			return;
		}
		this.loading = true;
		try {
			let url = `/home/books/search?keyword=${encodeURIComponent(this.keyword.trim())}`;
			if (this.currentCategoryId > 0) {
				url += `&category=${this.currentCategoryId}`;
			}
			const res = await request({ url, method: 'GET' });
			this.searchResults = res.data || [];
		} catch (err) {
			console.error('搜索失败:', err);
		}
		this.loading = false;
	},
	switchCategory(id) {
		this.currentCategoryId = id;
		if (this.keyword.trim()) {
			this.doSearch();
		}
	},
	getConditionText(condition) {
		if (!condition) return '';
		if (condition >= 10) return '全新';
		if (condition >= 9) return '九成新';
		if (condition >= 8) return '八成新';
		if (condition >= 7) return '七成新';
		return '六成新以下';
	},
	detailBtn(bookId, bookType){
		uni.navigateTo({
			url: `/components/detail?bookType=${bookType}&bookId=${bookId}`
		})
	}
  }
};
</script>

<style scoped>
@import '../../static/css/market/market.css';

.search-container {
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
.empty-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
}
</style>
