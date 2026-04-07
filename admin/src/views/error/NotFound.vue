<template>
  <div class="not-found">
    <div class="content">
      <h1 class="code">404</h1>
      <p class="text">页面不存在</p>
      <p class="desc">您访问的页面可能已移除或暂时无法访问</p>
      <button class="back-btn" @click="goBack">返回</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.push('/dashboard')
}
</script>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.content {
  text-align: center;
}

.code {
  font-size: 120px;
  font-weight: bold;
  color: #ddd;
  line-height: 1;
  margin: 0 0 20px 0;
}

.text {
  font-size: 24px;
  color: #333;
  margin: 0 0 10px 0;
}

.desc {
  font-size: 14px;
  color: #999;
  margin: 0 0 40px 0;
}

.back-btn {
  padding: 12px 40px;
  background: #333;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.back-btn:hover {
  background: #555;
}
</style>
