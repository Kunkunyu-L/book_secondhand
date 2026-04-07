<template>
  <view class="changelog-page">
    <!-- 页面头部 -->
    <view class="header">
      <text class="header-title">更新日志</text>
      <text class="header-subtitle">版本历史</text>
    </view>

    <!-- 版本列表 -->
    <view class="version-list">
      <view
        class="version-item"
        v-for="(log, index) in changelogs"
        :key="index"
      >
        <!-- 版本信息 -->
        <view class="version-info">
          <text class="version-num">{{ log.version }}</text>
          <text class="version-date">{{ log.date }}</text>
        </view>

        <!-- 变更内容 -->
        <view class="changes">
          <view
            class="change-item"
            v-for="(item, idx) in log.changes"
            :key="idx"
          >
            <view class="change-indicator" :class="'type-' + item.type"></view>
            <text class="change-text">{{ item.text }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部 -->
    <view class="footer">
      <text class="footer-text">感谢使用</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const changelogs = ref([
  {
    version: 'v1.0.0',
    date: '2026.04.07',
    changes: [
      { type: 'new', text: '正式上线二手书交易平台' },
      { type: 'new', text: '图书发布与购买功能' },
      { type: 'new', text: '平台自营与用户闲置双模式' },
      { type: 'new', text: '购物车与订单管理' },
      { type: 'new', text: '在线聊天与客服系统' },
      { type: 'new', text: '发现社区功能' },
      { type: 'new', text: '优惠券与余额提现' }
    ]
  }
])
</script>

<style scoped>
.changelog-page {
  min-height: 100vh;
  background: #fafafa;
  padding: 0 32rpx 80rpx;
}

/* 头部 */
.header {
  padding: 80rpx 0 60rpx;
}

.header-title {
  display: block;
  font-size: 48rpx;
  font-weight: 600;
  color: #111;
  letter-spacing: -1rpx;
  margin-bottom: 8rpx;
}

.header-subtitle {
  display: block;
  font-size: 26rpx;
  color: #999;
}

/* 版本列表 */
.version-list {
  display: flex;
  flex-direction: column;
  gap: 60rpx;
}

.version-item {
  padding-top: 40rpx;
  border-top: 1rpx solid #e5e5e5;
}

.version-item:first-child {
  border-top: none;
  padding-top: 0;
}

/* 版本信息 */
.version-info {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 28rpx;
}

.version-num {
  font-size: 32rpx;
  font-weight: 600;
  color: #111;
}

.version-date {
  font-size: 24rpx;
  color: #999;
  font-family: monospace;
}

/* 变更内容 */
.changes {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.change-item {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
}

.change-indicator {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  margin-top: 10rpx;
  flex-shrink: 0;
}

.type-new {
  background: #111;
}

.type-improve {
  background: #666;
}

.type-fix {
  background: #999;
}

.type-remove {
  background: #ccc;
}

.change-text {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  line-height: 1.7;
}

/* 底部 */
.footer {
  padding-top: 80rpx;
  text-align: center;
}

.footer-text {
  font-size: 24rpx;
  color: #ccc;
}
</style>
