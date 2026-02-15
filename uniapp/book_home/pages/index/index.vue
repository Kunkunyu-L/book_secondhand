<template>
	<view class="page-container">
		<!-- 轮播图（后台管理配置，无数据时省略） -->
		<swiper v-if="banners.length > 0" class="banner-swiper" indicator-dots autoplay circular :interval="4000">
			<swiper-item v-for="item in banners" :key="item.id" @click="onBannerClick(item)">
				<image :src="item.image_url" mode="aspectFill" class="banner-img"></image>
			</swiper-item>
		</swiper>

		<!-- 分类导航：两排，一排4个，第二排第4个为更多（超过8个时） -->
		<view class="category-container">
			<view class="category-grid">
				<view class="category-item" v-for="(item, index) in displayCategories" :key="item.id || 'more'" @click="item.isMore ? goMarket() : goCategory(item.id)">
					<view class="category-icon">
						<image v-if="item.isMore" src="/static/img/more.png" mode="aspectFit" class="category-img"></image>
						<image v-else :src="item.img" mode="aspectFit" class="category-img"></image>
					</view>
					<text class="category-name">{{ item.name }}</text>
				</view>
			</view>
		</view>

		<!-- 平台售卖区 -->
		<view class="platform-container" :class="{ 'animate-in': platformVisible }" ref="platformRef">
			<view class="section-header">
				<text class="section-title">平台精选</text>
				<text class="section-more" @click="goMarket">查看全部 →</text>
			</view>
		
			<view class="book-grid" v-if="platformBooks.length > 0">
				<view class="book-card" v-for="(item,index) in platformBooks" :key="item.id" @click="detailBtn(item.book_id,item.type)">
					<view class="book-img-wrap">
						<image :src="item.cover_img" mode="aspectFill" class="book-img"></image>
						<view class="tag">平台自营</view>
					</view>
					<view class="book-info">
						<text class="book-title">{{item.title}}</text>
						<text class="book-author">{{item.author}}</text>
						<view class="book-price">
							<text class="current-price">¥{{item.price}}</text>
							<text class="original-price" v-if="item.original_price">¥{{item.original_price.toFixed(2)}}</text>
						</view>
					</view>
				</view>
			</view>
			<view class="empty-state" v-else>
				<text>暂无平台精选图书</text>
			</view>
		</view>

		<!-- 用户自主售卖区 -->
		<view class="user-container" :class="{ 'animate-in': userVisible }" ref="userRef">
			<view class="section-header">
				<text class="section-title">用户闲置</text>
				<text class="section-more" @click="goPublish">我要卖书 +</text>
			</view>
		
			<view class="user-book-list" v-if="userBooks.length > 0">
				<view class="user-book-item" v-for="(item,index) in userBooks" :key="item.id" @click="detailBtn(item.book_id,item.type)">
					<image :src="item.cover_img" mode="aspectFill" class="user-book-img"></image>
					<view class="user-book-info">
						<text class="user-book-title">{{item.title}}</text>
						<text class="user-book-author">{{item.author}}<text v-if="item.publisher"> / {{item.publisher}}</text></text>
						<view class="user-book-footer">
							<view class="seller-info">
								<image :src="item.avatar || '/static/common.jpg'" mode="aspectFill" class="seller-avatar"></image>
								<text class="seller-name">{{item.nickname || '用户'}}</text>
							</view>
							<view class="price-condition">
								<text class="user-book-price">¥{{item.price ? item.price.toFixed(2) : '0.00'}}</text>
								<text class="book-condition" v-if="item.condition_desc">{{item.condition_desc}}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
			<view class="empty-state" v-else>
				<text>暂无用户闲置图书</text>
			</view>
			
			<view class="load-more-wrap" v-if="userBooks.length > 0">
				<text class="load-more-text" @click="goMarket">查看更多 →</text>
			</view>
		</view>

		<!-- 右下角浮动发布按钮 -->
		<view class="fab-publish" @click="goPublish">
			<text class="fab-icon">+</text>
		</view>
	</view>
</template>

<script>
import request from '@/untils/request.js';
export default {
  data() {
    return {
      platformVisible: false,
      userVisible: false,
      benefitVisible: false,
      category: [],
      platformBooks: [],
      observers: [],
      userBooks: [],
      banners: []
    }
  },
  computed: {
    // 两排4列：超过8个时显示前7个+更多，否则显示全部（不足8个时补更多）
    displayCategories() {
      const list = this.category || []
      if (list.length > 8) {
        return [...list.slice(0, 7), { id: 'more', name: '更多', isMore: true }]
      }
      if (list.length < 8) {
        return [...list, { id: 'more', name: '更多', isMore: true }]
      }
      return list
    }
  },
  onLoad() {
    this.getPlatformBooks();
  },
  onReady() {
    this.$nextTick(() => {
      // 统一初始化三个区域的观察
      this.initObserver('platformRef', 'platformVisible');
      this.initObserver('userRef', 'userVisible');
      this.initObserver('benefitRef', 'benefitVisible');
    });
  },
  onUnload() {
    this.observers.forEach(observer => observer?.disconnect());
  },
  methods: {
    // 通用观察器方法（将重复逻辑封装）
    initObserver(refName, visibleKey) {
		const targetRef = this.$refs[refName];
		if (!targetRef) return;

		const observer = new IntersectionObserver(
			(entries) => {entries.forEach(entry => {
				// 修复：元素进入视口时设为true，离开时设为false（避免仅触发一次）
				this[visibleKey] = entry.isIntersecting;
				});
			},
			{
			  root: null,
			  rootMargin: '0px',
			  threshold: 0.2 // 提高触发阈值到20%，避免误判
			}
		);

		observer.observe(targetRef.$el);
		this.observers.push(observer);
    },

    async getPlatformBooks() {
		try {
			// 并行加载：轮播图、分类、平台书、用户书
			const [bannerRes, categoryRes, booksRes, booksUser] = await Promise.all([
				request({ url: '/home/banners', method: 'GET' }).catch(() => ({ data: [] })),
				request({ url: '/home/categories/level1', method: 'GET' }),
				request({ url: '/home/books/platform', method: 'GET' }),
				request({ url: '/home/books/userbook', method: 'GET' })
			]);
			this.banners = bannerRes.data || [];
			this.category = categoryRes.data || [];
			this.platformBooks = booksRes.data || [];
			this.userBooks = booksUser.data || [];
		} catch (err) {
			console.error('数据获取失败:', err);
		}
    },
    onBannerClick(item) {
		if (item.link_url) {
			uni.navigateTo({ url: item.link_url }).catch(() => {
				uni.switchTab({ url: item.link_url }).catch(() => {});
			});
		}
    },
	//跳转详情
	detailBtn(bookId,bookType){
		uni.navigateTo({
			url: `/components/detail?bookType=${bookType}&bookId=${bookId}`
		})
	},
	// 查看全部 -> 书市
	goMarket(){
		uni.switchTab({ url: '/pages/market/market' })
	},
	// 我要卖书
	goPublish(){
		const token = uni.getStorageSync('token')
		if (!token) {
			uni.showToast({ title: '请先登录', icon: 'none' })
			setTimeout(() => { uni.navigateTo({ url: '/pages/auth/login' }) }, 500)
			return
		}
		uni.navigateTo({ url: '/pages/publish/publish' })
	},
	// 跳转到分类页面
	goCategory(categoryId){
		// 由于 market 是 tab 页面，使用存储传递分类ID
		uni.setStorageSync('selectedCategoryId', categoryId);
		uni.switchTab({ url: '/pages/market/market' });
	}
  }
}
</script>

<style scoped>
@import "../../static/css/index/index.css";

.banner-swiper {
  width: 100%;
  height: 360rpx;
  border-radius: 0 0 24rpx 24rpx;
  overflow: hidden;
}
.banner-img {
  width: 100%;
  height: 360rpx;
}
.category-grid {
  display: flex;
  flex-wrap: wrap;
}
.category-item {
  width: 25%;
  box-sizing: border-box;
}
.fab-publish {
  position: fixed;
  right: 24rpx;
  bottom: 120rpx;
  width: 96rpx;
  height: 96rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 20rpx rgba(102, 126, 234, 0.4);
  z-index: 100;
}
.fab-publish:active {
  transform: scale(0.95);
}
.fab-icon {
  font-size: 48rpx;
  font-weight: 300;
  color: #fff;
  line-height: 1;
}
</style>