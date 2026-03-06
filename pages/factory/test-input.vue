<template>
  <view class="test-page">
    <view class="search-input-group">
      <input type="text" v-model="searchKeyword" class="search-input" placeholder="搜索工序名称、ID或描述" />
      <button @click="performSearch" class="search-btn">搜索</button>
    </view>
    <text>输入的内容: {{ searchKeyword }}</text>
  </view>
</template>

<script>
export default {
  data() {
    return {
      searchKeyword: ''
    }
  },
  methods: {
    performSearch() {
      console.log('搜索关键词:', this.searchKeyword)
    }
  }
}
</script>

<style scoped>
.test-page {
  padding: 30rpx;
}

.search-input-group {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.search-input {
  flex: 1;
  padding: 25rpx;
  border: 2rpx solid #e8e8e8;
  border-radius: 12rpx;
  font-size: 28rpx;
  background-color: #fff;
  box-sizing: border-box;
}

.search-btn {
  padding: 25rpx 40rpx;
  background-color: #1890ff;
  color: #fff;
  border: none;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: bold;
}
</style>