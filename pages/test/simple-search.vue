<template>
  <view class="container">
    <view class="search-container">
      <input type="text" v-model="keyword" placeholder="请输入搜索内容" />
      <button @click="search">搜索</button>
    </view>
    <view class="result">
      输入内容: {{ keyword }}
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      keyword: ''
    }
  },
  methods: {
    search() {
      console.log('搜索:', this.keyword)
    }
  }
}
</script>

<style>
.container {
  padding: 30px;
}

.search-container {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

button {
  padding: 10px 20px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
}

.result {
  font-size: 16px;
  color: #333;
}
</style>