<template>
  <view class="post-publish-page">
    <view class="form-card">
      <view class="form-item">
        <text class="form-label">内容</text>
        <textarea
          class="form-textarea"
          v-model="content"
          placeholder="分享你的想法..."
          maxlength="500"
          :show-confirm-bar="false"
        />
        <text class="form-count">{{ (content || '').length }}/500</text>
      </view>
      <view class="form-item">
        <text class="form-label">图片（选填）</text>
        <view class="img-list">
          <image
            v-for="(img, idx) in images"
            :key="idx"
            class="preview-img"
            :src="getImageUrl(img)"
            mode="aspectFill"
            @click="delImg(idx)"
          />
          <view v-if="images.length < 9" class="add-img" @click="chooseImg">
            <uni-icons type="plusempty" size="40" color="#ccc"></uni-icons>
            <text class="add-text">添加图片</text>
          </view>
        </view>
      </view>
    </view>
    <view class="submit-bar">
      <button class="submit-btn" @click="submit" :disabled="submitting">
        {{ submitting ? '发布中...' : '发布' }}
      </button>
    </view>
  </view>
</template>

<script>
import request from '@/untils/request.js';
import { getImageUrl } from '@/untils/config.js';
export default {
  data() {
    return {
      content: '',
      images: [],
      submitting: false
    };
  },
  methods: {
    getImageUrl,
    chooseImg() {
      const remain = 9 - this.images.length;
      if (remain <= 0) return;
      uni.chooseImage({
        count: remain,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFiles = res.tempFilePaths || [];
          // 这里需要上传到服务器得到 URL；若后端暂不支持上传，可先存 base64 或仅文本发布
          // 示例：直接使用本地路径仅适合部分端，建议接上传接口
          this.images = this.images.concat(tempFiles);
        }
      });
    },
    delImg(idx) {
      this.images.splice(idx, 1);
    },
    async submit() {
      const content = (this.content || '').trim();
      if (!content) {
        uni.showToast({ title: '请输入内容', icon: 'none' });
        return;
      }
      this.submitting = true;
      try {
        // 若图片未上传，可传空；有上传接口时先上传再传 URLs
        const imagesStr = this.images.length ? this.images.join(',') : '';
        await request({
          url: '/discover/posts',
          method: 'POST',
          data: { content, images: imagesStr }
        });
        uni.showToast({ title: '发布成功', icon: 'success' });
        setTimeout(() => {
          uni.navigateBack();
        }, 500);
      } catch (e) {
        uni.showToast({ title: e.message || '发布失败', icon: 'none' });
      }
      this.submitting = false;
    }
  }
};
</script>

<style scoped>
.post-publish-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 24rpx 24rpx 120rpx;
}
.form-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}
.form-item {
  margin-bottom: 32rpx;
}
.form-item:last-child {
  margin-bottom: 0;
}
.form-label {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  display: block;
  margin-bottom: 16rpx;
}
.form-textarea {
  width: 100%;
  min-height: 240rpx;
  padding: 20rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}
.form-count {
  font-size: 24rpx;
  color: #999;
  display: block;
  text-align: right;
  margin-top: 8rpx;
}
.img-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}
.preview-img {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  background: #f0f0f0;
}
.add-img {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  border: 2rpx dashed #ddd;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.add-text {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}
.submit-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 24rpx;
  background: #fff;
  border-top: 1px solid #eee;
}
.submit-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: #007AFF;
  color: #fff;
  font-size: 32rpx;
  border-radius: 44rpx;
}
.submit-btn[disabled] {
  opacity: 0.6;
}
</style>
