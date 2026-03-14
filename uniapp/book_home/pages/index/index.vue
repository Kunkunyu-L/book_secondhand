<template>
  <view class="page-wrap">
    <!-- ① 顶部搜索栏（固定在最顶部） -->
    <view class="top-bar">
      <view class="search-fake" @click="goSearch">
        <uni-icons type="search" size="18" color="#9ca3af"></uni-icons>
        <text class="search-placeholder">搜索书名、作者、ISBN</text>
      </view>
    </view>

    <!-- ② 来源切换：官方自营 / 用户闲置 -->
    <view class="source-bar">
      <view
        class="source-item"
        :class="{ 'source-active': currentSource === 'all' }"
        @click="switchSource('all')"
      >全部</view>
      <view
        class="source-item"
        :class="{ 'source-active': currentSource === 'platform' }"
        @click="switchSource('platform')"
      >官方自营</view>
      <view
        class="source-item"
        :class="{ 'source-active': currentSource === 'user' }"
        @click="switchSource('user')"
      >用户闲置</view>
    </view>

    <!-- ③ 滚动内容区 -->
    <scroll-view
      class="scroll-area"
      scroll-y
      :show-scrollbar="false"
      @scroll="onScroll"
      :scroll-top="scrollTop"
    >
      <!-- 轮播图 -->
      <swiper
        v-if="banners.length > 0"
        class="banner-swiper"
        indicator-dots
        autoplay
        circular
        :interval="4000"
      >
        <swiper-item v-for="item in banners" :key="item.id" @click="onBannerClick(item)">
          <image :src="item.image_url" mode="aspectFill" class="banner-img"></image>
        </swiper-item>
      </swiper>

      <!-- ④ 推荐区（仅登录且填了学校/专业时显示） -->
      <view v-if="recommended.length > 0" class="section">
        <view class="section-header">
          <text class="section-title">📚 为你推荐</text>
          <text class="section-sub">根据你的专业智能匹配</text>
        </view>
        <scroll-view scroll-x class="h-scroll" :show-scrollbar="false">
          <view
            class="h-book-card"
            v-for="book in recommended"
            :key="'rec_' + book.id"
            @click="detailBtn(book.id, book.bcp_type || book.source)"
          >
            <image :src="getImageUrl(book.cover_img)" mode="aspectFill" class="h-book-img"></image>
            <view class="h-book-info">
              <text class="h-book-title">{{ book.title }}</text>
              <text class="h-book-price">¥{{ Number(book.bcp_price || book.price || 0).toFixed(2) }}</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- ⑤ 粘性分类 tab -->
      <view class="sticky-tabs" :class="{ 'tabs-sticked': tabSticked }">
        <scroll-view scroll-x class="tabs-scroll" :show-scrollbar="false">
          <view
            class="tab-item"
            :class="{ 'tab-active': currentCat === '' }"
            @click="switchCat('')"
          >全部</view>
          <view
            v-for="cat in categories"
            :key="cat.id"
            class="tab-item"
            :class="{ 'tab-active': currentCat === String(cat.id) }"
            @click="switchCat(String(cat.id))"
          >{{ cat.name }}</view>
        </scroll-view>
      </view>

      <!-- ⑥ 图书列表 -->
      <view class="book-list">
        <view
          class="book-card"
          v-for="book in filteredBooks"
          :key="book.id + '_' + (book.source || book.bcp_type)"
          @click="detailBtn(book.id, book.bcp_type || book.source)"
        >
          <view class="book-img-wrap">
            <image :src="getImageUrl(book.cover_img)" mode="aspectFill" class="book-img"></image>
            <view class="tag-condition">{{ book.bcp_condition_desc || getConditionText(book.bcp_condition) }}</view>
            <view class="tag-official" v-if="!book.nickname">官方</view>
          </view>
          <view class="book-info">
            <text class="book-title">{{ book.title }}</text>
            <text class="book-author">{{ book.author }}</text>
            <view class="book-meta">
              <view class="seller-row" v-if="book.nickname">
                <image :src="book.avatar || '/static/common.jpg'" mode="aspectFill" class="seller-avatar"></image>
                <text class="seller-name">{{ book.nickname }}</text>
              </view>
              <view class="seller-row" v-else>
                <image src="/static/common.jpg" mode="aspectFill" class="seller-avatar"></image>
                <text class="seller-name">官方自营</text>
              </view>
              <text class="book-price">¥{{ Number(book.bcp_price || book.price || 0).toFixed(2) }}</text>
            </view>
          </view>
        </view>
      </view>

      <view v-if="filteredBooks.length === 0 && !loading" class="empty">
        <uni-icons type="search" size="60" color="#ccc"></uni-icons>
        <text class="empty-text">暂无相关图书</text>
      </view>
      <view class="load-more" v-if="loading">
        <uni-icons type="spinner" size="16" color="#999"></uni-icons>
        <text class="load-text">加载中…</text>
      </view>

      <view style="height: 30rpx;"></view>
    </scroll-view>
  </view>
</template>

<script>
import request from '@/untils/request.js';
import { getImageUrl } from '@/untils/config.js';

// 分类与专业关键词映射（智能推荐辅助）
const MAJOR_KEYWORDS = {
  '计算机': ['计算机', '编程', 'Python', 'Java', '数据结构', '算法', '软件'],
  '软件工程': ['计算机', '编程', '软件', '架构', '数据库'],
  '数学': ['数学', '高等数学', '线性代数', '概率论', '数学分析'],
  '物理': ['物理', '力学', '电磁', '量子', '热力学'],
  '化学': ['化学', '有机化学', '无机化学', '分析化学'],
  '经济': ['经济', '微观经济', '宏观经济', '金融', '会计'],
  '金融': ['金融', '投资', '财务', '会计', '经济'],
  '中文': ['文学', '汉语', '写作', '古典', '诗词'],
  '历史': ['历史', '中国史', '世界史', '文明'],
  '英语': ['英语', '英文', '口语', 'IELTS', 'TOEFL'],
  '医学': ['医学', '解剖', '药理', '临床', '生理'],
  '法学': ['法律', '民法', '刑法', '宪法', '诉讼'],
  '教育': ['教育', '心理', '教学', '课程'],
  '艺术': ['艺术', '设计', '美术', '绘画'],
};

function getRecommendScore(book, major) {
  if (!major) return 0;
  const keywords = MAJOR_KEYWORDS[major] || [major];
  const target = `${book.title || ''} ${book.author || ''} ${book.tags || ''} ${book.category_name || ''}`.toLowerCase();
  let score = 0;
  for (const kw of keywords) {
    if (target.includes(kw.toLowerCase())) score += 1;
  }
  return score;
}

export default {
  data() {
    return {
      loading: false,
      currentSource: 'all',
      currentCat: '',
      marketBook: [],
      banners: [],
      categories: [],
      recommended: [],
      tabSticked: false,
      scrollTop: 0,
      bannerHeight: 360,
    };
  },
  computed: {
    filteredBooks() {
      let list = this.marketBook;
      if (this.currentSource !== 'all') {
        list = list.filter(b => (b.source || b.bcp_type || '') === this.currentSource);
      }
      if (this.currentCat) {
        list = list.filter(b => String(b.category_id || b.category || '') === this.currentCat);
      }
      return list;
    }
  },
  onLoad() {
    this.loadData();
  },
  methods: {
    getImageUrl,
    onScroll(e) {
      const scrollY = e.detail.scrollTop;
      // 粘性：轮播图高度约 360rpx ≈ 180px（按 750rpx=375px 比例）
      const stickyThreshold = 180;
      this.tabSticked = scrollY > stickyThreshold;
    },
    async loadData() {
      this.loading = true;
      try {
        const token = uni.getStorageSync('token');
        const requests = [
          request({ url: '/home/banners', method: 'GET' }).catch(() => ({ data: [] })),
          request({ url: '/home/books/market', method: 'GET' }).catch(() => ({ data: [] })),
          request({ url: '/home/categories', method: 'GET' }).catch(() => ({ data: [] })),
        ];
        if (token) {
          requests.push(
            request({ url: '/my/getUserInfo', method: 'GET' }).catch(() => ({ data: {} }))
          );
        }
        const results = await Promise.all(requests);
        this.banners = results[0].data || [];
        this.marketBook = results[1].data || [];
        this.categories = results[2].data || [];
        if (token && results[3]) {
          const user = results[3].data || {};
          if (user.major || user.school) {
            this.buildRecommended(user.major || '');
          }
        }
      } catch (err) {
        console.error('数据获取失败:', err);
      }
      this.loading = false;
    },
    buildRecommended(major) {
      const scored = this.marketBook
        .map(b => ({ ...b, _score: getRecommendScore(b, major) }))
        .filter(b => b._score > 0)
        .sort((a, b) => b._score - a._score);
      this.recommended = scored.slice(0, 12);
    },
    switchSource(source) {
      this.currentSource = source;
    },
    switchCat(catId) {
      this.currentCat = catId;
    },
    goSearch() {
      uni.navigateTo({ url: '/pages/search/search' });
    },
    onBannerClick(item) {
      if (item.link_url) {
        uni.navigateTo({ url: item.link_url }).catch(() => {
          uni.switchTab({ url: item.link_url }).catch(() => {});
        });
      }
    },
    getConditionText(condition) {
      if (!condition) return '';
      if (condition >= 10) return '全新';
      if (condition >= 9) return '九成新';
      if (condition >= 8) return '八成新';
      if (condition >= 7) return '七成新';
      return '六成以下';
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
/* 整体布局 */
.page-wrap {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f6f8;
  overflow: hidden;
}

/* ① 搜索栏 */
.top-bar {
  background: #fff;
  padding: 20rpx 24rpx 16rpx;
  flex-shrink: 0;
}
.search-fake {
  height: 68rpx;
  background: #f3f4f6;
  border-radius: 34rpx;
  display: flex;
  align-items: center;
  padding: 0 24rpx;
  gap: 12rpx;
}
.search-placeholder {
  font-size: 28rpx;
  color: #9ca3af;
}

/* ② 来源切换 */
.source-bar {
  display: flex;
  background: #fff;
  padding: 0 24rpx 16rpx;
  gap: 16rpx;
  flex-shrink: 0;
}
.source-item {
  padding: 10rpx 28rpx;
  font-size: 26rpx;
  border-radius: 32rpx;
  background: #f3f4f6;
  color: #6b7280;
}
.source-active {
  background: #1f2937;
  color: #fff;
}

/* ③ 滚动区 */
.scroll-area {
  flex: 1;
  overflow: hidden;
}

/* 轮播图 */
.banner-swiper {
  width: 100%;
  height: 360rpx;
}
.banner-img {
  width: 100%;
  height: 360rpx;
}

/* ④ 推荐区 */
.section {
  background: #fff;
  margin: 20rpx 0 0;
  padding: 20rpx 24rpx 24rpx;
}
.section-header {
  display: flex;
  align-items: baseline;
  gap: 12rpx;
  margin-bottom: 20rpx;
}
.section-title { font-size: 30rpx; font-weight: 600; color: #1f2937; }
.section-sub { font-size: 22rpx; color: #9ca3af; }
.h-scroll { white-space: nowrap; }
.h-book-card {
  display: inline-flex;
  flex-direction: column;
  width: 200rpx;
  margin-right: 20rpx;
  vertical-align: top;
}
.h-book-img {
  width: 200rpx;
  height: 260rpx;
  border-radius: 8rpx;
  object-fit: cover;
}
.h-book-info { padding: 8rpx 4rpx 0; }
.h-book-title {
  font-size: 24rpx;
  color: #1f2937;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 6rpx;
}
.h-book-price { font-size: 26rpx; font-weight: 600; color: #dc2626; }

/* ⑤ 粘性分类 tabs */
.sticky-tabs {
  background: #fff;
  border-bottom: 1rpx solid #f3f4f6;
  padding: 16rpx 0 0;
  position: sticky;
  top: 0;
  z-index: 10;
}
.sticky-tabs.tabs-sticked {
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
}
.tabs-scroll { white-space: nowrap; }
.tab-item {
  display: inline-block;
  padding: 12rpx 28rpx;
  font-size: 26rpx;
  color: #6b7280;
  margin: 0 8rpx;
  border-bottom: 4rpx solid transparent;
}
.tab-active {
  color: #1f2937;
  font-weight: 600;
  border-bottom-color: #1f2937;
}

/* ⑥ 书单列表 */
.book-list {
  display: flex;
  flex-wrap: wrap;
  padding: 20rpx 10rpx 0;
  background: #f5f6f8;
}
.book-card {
  width: calc(50% - 10px);
  margin: 5px;
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}
.book-img-wrap {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
}
.book-img { width: 100%; height: 100%; object-fit: cover; }
.tag-condition {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0,0,0,0.55);
  color: #fff;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
}
.tag-official {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #1f2937;
  color: #fff;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
}
.book-info { padding: 10px; }
.book-title {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 4px;
}
.book-author {
  font-size: 12px;
  color: #9ca3af;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 8px;
}
.book-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.seller-row { display: flex; align-items: center; gap: 5px; }
.seller-avatar { width: 22px; height: 22px; border-radius: 50%; object-fit: cover; }
.seller-name {
  font-size: 11px;
  color: #6b7280;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.book-price { font-size: 15px; font-weight: 600; color: #dc2626; }

/* 空状态 */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 0;
}
.empty-text { color: #9ca3af; margin-top: 20rpx; font-size: 28rpx; }

/* 加载 */
.load-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
  color: #9ca3af;
}
.load-text { font-size: 13px; margin-left: 8px; }
</style>
