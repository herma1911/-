<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <h1 class="error-code">404</h1>
      <h2 class="error-message">页面不存在</h2>
      <p class="error-description">抱歉，您访问的页面不存在或已被删除</p>
      <el-button type="primary" @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/dashboard')
}
</script>

<style scoped>
.not-found-container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f7fa;
}

.not-found-content {
  text-align: center;
  background: #fff;
  padding: 60px;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  color: #409EFF;
  margin: 0 0 20px 0;
}

.error-message {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 0 0 10px 0;
}

.error-description {
  font-size: 16px;
  color: #666;
  margin: 0 0 30px 0;
}
</style>