<template>
  <view class="disclaimer-footer">
    <text class="disclaimer-text">本APP仅为个人记账工具</text>
    <text class="disclaimer-text">不代表工厂薪资结算凭证</text>
    <text class="disclaimer-text">实际工资以工厂发放为准</text>
    <text class="disclaimer-text">招工信息由厂方发布，平台仅提供信息展示</text>
  </view>
</template>

<script>
export default {
  name: 'disclaimer-footer'
}
</script>

<style scoped>
.disclaimer-footer {
  background-color: #f5f5f5;
  padding: 20rpx;
  margin-top: 30rpx;
  border-top: 1rpx solid #e0e0e0;
}

.disclaimer-text {
  font-size: 18rpx;
  color: #999;
  text-align: center;
  display: block;
  margin-bottom: 8rpx;
}

.disclaimer-text:last-child {
  margin-bottom: 0;
}
</style>