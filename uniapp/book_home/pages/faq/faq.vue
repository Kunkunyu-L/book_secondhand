<template>
  <view class="faq-page">
    <!-- 搜索框 -->
    <view class="search-bar">
      <view class="search-input-wrap">
        <uni-icons type="search" size="16" color="#9ca3af"></uni-icons>
        <input
          class="search-input"
          v-model="keyword"
          placeholder="搜索问题关键词"
          @input="onSearch"
          confirm-type="search"
        />
        <text v-if="keyword" class="clear-btn" @click="clearSearch">✕</text>
      </view>
    </view>

    <view v-if="loading" class="loading">
      <uni-icons type="spinner" size="32" color="#ccc"></uni-icons>
    </view>

    <scroll-view v-else scroll-y class="content" :show-scrollbar="false">
      <view v-if="filteredList.length === 0" class="empty">
        <uni-icons type="help" size="60" color="#ccc"></uni-icons>
        <text class="empty-text">暂无相关问题</text>
      </view>

      <!-- 按分类分组展示 -->
      <template v-for="(group, cat) in groupedFaqs" :key="cat">
        <view class="category-header">{{ cat }}</view>
        <view
          v-for="faq in group"
          :key="faq.id"
          class="faq-item"
          @click="toggle(faq.id)"
        >
          <view class="faq-question">
            <text class="q-icon">Q</text>
            <text class="q-text">{{ faq.question }}</text>
            <uni-icons
              :type="expanded[faq.id] ? 'top' : 'bottom'"
              size="16"
              color="#ccc"
            ></uni-icons>
          </view>
          <view v-if="expanded[faq.id]" class="faq-answer">
            <text class="a-icon">A</text>
            <text class="a-text">{{ faq.answer }}</text>
          </view>
        </view>
      </template>
    </scroll-view>
  </view>
</template>

<script>
import request from '@/untils/request.js'

export default {
  data() {
    return {
      keyword: '',
      faqs: [],
      loading: false,
      expanded: {},
      searchTimer: null,
    }
  },
  computed: {
    filteredList() {
      if (!this.keyword.trim()) return this.faqs
      const kw = this.keyword.trim().toLowerCase()
      return this.faqs.filter(f =>
        f.question.toLowerCase().includes(kw) || f.answer.toLowerCase().includes(kw)
      )
    },
    groupedFaqs() {
      const groups = {}
      this.filteredList.forEach(f => {
        const cat = f.category_name || '其他'
        if (!groups[cat]) groups[cat] = []
        groups[cat].push(f)
      })
      return groups
    }
  },
  onLoad() {
    this.loadFaqs()
  },
  methods: {
    async loadFaqs() {
      this.loading = true
      try {
        const res = await request({ url: '/home/faq', method: 'GET' })
        if (res.status === 200) this.faqs = res.data || []
      } catch (e) {}
      this.loading = false
    },
    toggle(id) {
      this.expanded = { ...this.expanded, [id]: !this.expanded[id] }
    },
    onSearch() {
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => {}, 300)
    },
    clearSearch() {
      this.keyword = ''
    },
  }
}
</script>

<style scoped>
.faq-page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.search-bar {
  background: #fff;
  padding: 20rpx 24rpx;
  flex-shrink: 0;
}
.search-input-wrap {
  display: flex;
  align-items: center;
  background: #f3f4f6;
  border-radius: 32rpx;
  padding: 0 24rpx;
  height: 72rpx;
  gap: 12rpx;
}
.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #374151;
  background: transparent;
  border: none;
  outline: none;
}
.clear-btn {
  font-size: 24rpx;
  color: #9ca3af;
  padding: 4rpx 8rpx;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 100rpx 0;
}
.content {
  flex: 1;
  height: calc(100vh - 120rpx);
}
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
  color: #ccc;
}
.empty-text { font-size: 28rpx; margin-top: 20rpx; }

.category-header {
  font-size: 24rpx;
  color: #9ca3af;
  font-weight: 500;
  padding: 24rpx 24rpx 10rpx;
  background: #f5f5f5;
  letter-spacing: 0.05em;
}

.faq-item {
  background: #fff;
  margin: 0 0 1rpx;
  overflow: hidden;
}

.faq-question {
  display: flex;
  align-items: center;
  padding: 28rpx 24rpx;
  gap: 14rpx;
  cursor: pointer;
}
.q-icon {
  width: 40rpx;
  height: 40rpx;
  border-radius: 8rpx;
  background: #eff6ff;
  color: #2563eb;
  font-size: 22rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  text-align: center;
  line-height: 40rpx;
}
.q-text {
  flex: 1;
  font-size: 28rpx;
  color: #1f2937;
  font-weight: 500;
  line-height: 1.5;
}

.faq-answer {
  display: flex;
  padding: 0 24rpx 28rpx;
  gap: 14rpx;
  background: #fafafa;
  border-top: 1rpx solid #f3f4f6;
}
.a-icon {
  width: 40rpx;
  height: 40rpx;
  border-radius: 8rpx;
  background: #f0fdf4;
  color: #16a34a;
  font-size: 22rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  text-align: center;
  line-height: 40rpx;
  margin-top: 28rpx;
}
.a-text {
  flex: 1;
  font-size: 26rpx;
  color: #4b5563;
  line-height: 1.7;
  padding-top: 28rpx;
}
</style>
