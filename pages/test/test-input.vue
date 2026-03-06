<template>
  <view class="test-page">
    <view style="padding: 30rpx;">
      <view style="display: flex; gap: 20rpx; margin-bottom: 20rpx;">
        <input type="text" v-model="searchKeyword" style="flex: 1; padding: 25rpx; border: 2rpx solid #e8e8e8; border-radius: 12rpx; font-size: 28rpx; background-color: #fff; box-sizing: border-box;" placeholder="搜索工序名称、ID或描述" />
        <button @click="performSearch" style="padding: 25rpx 40rpx; background-color: #1890ff; color: #fff; border: none; border-radius: 12rpx; font-size: 28rpx; font-weight: bold;">搜索</button>
      </view>
      <text style="font-size: 28rpx; color: #333;">输入的内容: {{ searchKeyword }}</text>
    </view>
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
  background-color: #f5f5f5;
  min-height: 100vh;
}
</style>