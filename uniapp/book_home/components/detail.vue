<template>
  <view class="container">
	<view @click="back" style="position: absolute;top: 20rpx;left: 20rpx;z-index: 100;border-radius: 100%;background-color: #eee;padding: 4rpx;">
		  <uni-icons type="back" size="30"></uni-icons>
	</view>
	
	<!-- 收藏按钮 -->
	<view @click="toggleFavorite" style="position: absolute;top: 20rpx;right: 20rpx;z-index: 100;border-radius: 100%;background-color: #eee;padding: 4rpx;">
		<uni-icons :type="isFavorited ? 'heart-filled' : 'heart'" size="30" :color="isFavorited ? '#FF5500' : '#666'"></uni-icons>
	</view>
	
    <!-- 图书图片轮播 -->
    <view class="book-images">
      <swiper class="swiper" indicator-dots="true" autoplay="false" interval="5000" duration="500">
        <swiper-item v-for="(item, index) in imageList" :key="index">
          <image class="swiper-image" :src="item" mode="aspectFill"></image>
        </swiper-item>
      </swiper>
    </view>

    <!-- 图书基本信息 -->
    <view class="book-info-card">
      <view class="price-section">
		<text class="current-price">¥{{ bookInfo.price ? Number(bookInfo.price).toFixed(2) : '0.00' }}</text>
		<text class="original-price">{{ bookInfo.original_price ? Number(bookInfo.original_price).toFixed(2) : '0.00' }}</text>
        <uni-tag :text="bookInfo.condition_desc || getConditionText(bookInfo.condition)" type="error" size="small" class="condition-tag" />
        <uni-tag v-if="bookInfo.price && bookInfo.original_price" :text="(bookInfo.price/bookInfo.original_price*10).toFixed(1) + '折'" type="error" size="small" class="discount-tag" />
      </view>
      
      <view class="book-title">{{bookInfo.title}}</view>
      
      <view class="book-meta">
        <text class="meta-item">作者：{{bookInfo.author}}</text>
        <text class="meta-item">出版社：{{bookInfo.publisher}}</text>
        <text class="meta-item">出版时间：{{bookInfo.publish_date}}</text>
      </view>
      
      <view class="book-tags">
        <uni-tag v-for="(tag, index) in tagList" :key="index" :text="tag" type="primary" size="small" />
      </view>
    </view>

    <!-- 卖家信息：仅展示昵称、信用分、头像 -->
    <view class="seller-card" v-if="bookInfo.nickname">
      <view class="card-title">卖家信息</view>
      <view class="seller-content">
        <view class="seller-avatar">
          <image :src="bookInfo.avatar || '/static/common.jpg'" mode="aspectFill"></image>
        </view>
        <view class="seller-details">
          <text class="seller-name">{{bookInfo.nickname}}</text>
          <text class="seller-credit">{{bookInfo.credit_score || 100}} 信用分</text>
        </view>
      </view>
    </view>

    <!-- 图书详情 -->
    <view class="detail-card">
      <view class="card-title">图书详情</view>
      
      <view class="description-section" v-if="bookInfo.book_story || bookInfo.description">
        <text class="section-label">商品描述</text>
        <text class="description-text">{{bookInfo.book_story || bookInfo.description}}</text>
      </view>
      
      <view class="details-section">
        <text class="section-label">详细信息</text>
		<text class="detail-label">ISBN</text>:<text class="detail-value">{{bookInfo.isbn}}</text>
      </view>
	  
	  <view class="details-section" v-if="bookInfo.stock !== undefined">
	    <text class="section-label">库存：{{bookInfo.stock}} 件</text>
	  </view>
    </view>

	<!-- 底部留白 -->
	<view style="height: 120rpx;"></view>

    <!-- 底部操作栏：左侧收藏，右侧购买、聊一聊 -->
    <view class="action-bar">
      <view class="action-left">
        <view class="action-icon" @tap="toggleFavorite">
          <uni-icons :type="isFavorited ? 'heart-filled' : 'heart'" size="24" :color="isFavorited ? '#FF5500' : '#666'"></uni-icons>
          <text class="action-text">{{ isFavorited ? '已收藏' : '收藏' }}</text>
        </view>
      </view>
      <view class="action-right">
        <button class="buy-now-btn" @tap="buyNow">购买</button>
        <button class="chat-btn" @tap="contactService">聊一聊</button>
      </view>
    </view>
  </view>
</template>

<script>
import request from '@/untils/request.js';
export default {
  data() {
    return {
	  bookId: null,
	  bookType: null,
	  tagList: [],
	  imageList:[],
      bookInfo: {},
	  isFavorited: false
    }
  },
  onLoad(options) {
      const { bookId, bookType } = options;
	  this.bookId = bookId;
	  this.bookType = bookType;
      this.getBookDetail(bookId, bookType);
	  this.checkFavorite();
    },
  methods: {
	async getBookDetail(bookId, bookType) {
	  	try {
	  		const bookRes = await request({ url: '/home/books/detail', method: 'POST', data: { bookId, bookType } });
	  		this.bookInfo = bookRes.data[0] || {};
			if (this.bookInfo.tags) {
			    this.tagList = this.bookInfo.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
			} else {
			    this.tagList = [];
			}
			if (this.bookInfo.detail_imgs) {
				this.imageList = this.bookInfo.detail_imgs.split(',').map(img => img.trim()).filter(img => img);
			} else if (this.bookInfo.cover_img) {
				this.imageList = [this.bookInfo.cover_img];
			} else {
				this.imageList = [];
			}
	  	} catch (err) {
	  		console.error('数据获取失败:', err);
			this.bookInfo = {};
	  	}
	},
	async checkFavorite() {
		const token = uni.getStorageSync('token');
		if (!token) return;
		try {
			const res = await request({ url: `/favorite/check?book_id=${this.bookId}&book_type=${this.bookType}`, method: 'GET' });
			this.isFavorited = res.data?.isFavorited || false;
		} catch (e) {}
	},
	async toggleFavorite() {
		const token = uni.getStorageSync('token');
		if (!token) {
			uni.showToast({ title: '请先登录', icon: 'none' });
			setTimeout(() => { uni.navigateTo({ url: '/pages/auth/login' }); }, 500);
			return;
		}
		try {
			if (this.isFavorited) {
				await request({ url: '/favorite/remove', method: 'DELETE', data: { book_id: this.bookId, book_type: this.bookType } });
				this.isFavorited = false;
				uni.showToast({ title: '取消收藏', icon: 'none' });
			} else {
				await request({ url: '/favorite/add', method: 'POST', data: { book_id: this.bookId, book_type: this.bookType } });
				this.isFavorited = true;
				uni.showToast({ title: '收藏成功', icon: 'success' });
			}
		} catch (e) {}
	},
	getConditionText(condition) {
		if (!condition) return '';
		if (condition >= 10) return '全新';
		if (condition >= 9) return '九成新';
		if (condition >= 8) return '八成新';
		if (condition >= 7) return '七成新';
		return '六成新以下';
	},
	back(){
		uni.navigateBack()
	},
    goHome() {
      uni.switchTab({ url: '/pages/index/index' })
    },
    contactService() {
      const token = uni.getStorageSync('token')
      if (!token) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        setTimeout(() => { uni.navigateTo({ url: '/pages/auth/login' }) }, 500)
        return
      }
      // 如果是用户图书，聊卖家；否则聊平台客服
      const targetId = this.bookType === 'user' ? (this.bookInfo.user_id || 0) : 0
      const targetType = this.bookType === 'user' ? 'seller' : 'service'
      const targetName = this.bookType === 'user' ? (this.bookInfo.seller_name || '卖家') : '平台客服'
      request({
        url: '/chat/session', method: 'POST',
        data: { target_id: targetId, target_type: targetType }
      }).then(res => {
        if (res.status === 200 && res.data) {
          uni.navigateTo({
            url: `/pages/chat/chat?session_id=${res.data.id}&target_name=${encodeURIComponent(targetName)}`
          })
        }
      }).catch(() => {
        uni.showToast({ title: '创建会话失败', icon: 'none' })
      })
    },
    buyNow() {
	  const token = uni.getStorageSync('token');
	  if (!token) {
		  uni.showToast({ title: '请先登录', icon: 'none' });
		  setTimeout(() => { uni.navigateTo({ url: '/pages/auth/login' }); }, 500);
		  return;
	  }
	  // 直接购买，跳转到订单确认页
	  const buyItem = {
		  book_id: this.bookId,
		  book_type: this.bookType,
		  title: this.bookInfo.title,
		  cover_img: this.bookInfo.cover_img,
		  price: this.bookInfo.price,
		  quantity: 1
	  };
	  uni.navigateTo({
		  url: `/pages/order/confirm?directBuy=${encodeURIComponent(JSON.stringify(buyItem))}`
	  });
    }
  }
}
</script>

<style scoped>
@import '../static/css/components/detail.css'
</style>
