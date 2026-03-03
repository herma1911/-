<template> 
   <view class="factory-salary-credit"> 
     <!-- 顶部金标+核心看板 --> 
     <view class="credit-header"> 
       <view class="gold-badge" v-if="factoryInfo.continuousPayMonth >= 3"> 
         <text class="badge-icon">🏆</text> 
         <text class="badge-text">平台认证·准时发薪</text> 
       </view> 
       <view class="continuous-pay-tip"> 
         连续 {{ factoryInfo.continuousPayMonth }} 个月准时发薪 
       </view> 
     </view> 

     <!-- 核心数据看板 --> 
     <view class="credit-dashboard"> 
       <view class="dashboard-item"> 
         <text class="item-value">{{ factoryInfo.lastPayDate }}</text> 
         <text class="item-label">最近发薪</text> 
       </view> 
       <view class="dashboard-divider"></view> 
       <view class="dashboard-item"> 
         <text class="item-value">{{ factoryInfo.payOnTimeRate }}%</text> 
         <text class="item-label">发薪准时率</text> 
       </view> 
       <view class="dashboard-divider"></view> 
       <view class="dashboard-item"> 
         <text class="item-value">{{ factoryInfo.workerConfirmRate }}%</text> 
         <text class="item-label">工人确认率</text> 
       </view> 
     </view> 

     <!-- 权限提示条 --> 
     <view class="auth-tip" v-if="userLevel === 'free'"> 
       <text class="tip-text">🔒 优质用户可查看完整12个月发薪记录，连续记工28天即可解锁</text> 
       <text class="tip-btn" @tap="goToAuth">去解锁</text> 
     </view> 

     <!-- 发薪记录列表 --> 
     <view class="salary-list"> 
       <view class="list-header"> 
         <text class="list-title">历史发薪记录</text> 
         <text class="list-sub">仅展示最近{{ showMonthLimit }}个月</text> 
       </view> 

       <view 
         class="salary-item" 
         v-for="item in showSalaryList" 
         :key="item.month" 
         @tap="viewSalaryDetail(item)" 
       > 
         <view class="item-left"> 
           <text class="month">{{ item.month }}</text> 
           <text class="pay-date">发薪日期：{{ item.payDate }}</text> 
         </view> 
         <view class="item-middle"> 
           <text class="status" :class="item.status === '准时' ? 'on-time' : 'late'">{{ item.status }}</text> 
           <text class="worker-count">涉及{{ item.workerCount }}位工人</text> 
         </view> 
         <view class="item-right"> 
           <text class="confirm-rate">{{ item.confirmRate }}% 确认</text> 
           <text class="arrow">></text> 
         </view> 
       </view> 
     </view>

     <!-- 工人评价标签 --> 
     <view class="worker-tag-section" v-if="factoryInfo.workerTags.length > 0"> 
       <text class="tag-title">工人真实评价</text> 
       <view class="tag-list"> 
         <text class="tag-item" v-for="tag in factoryInfo.workerTags" :key="tag">{{ tag }}</text> 
       </view> 
     </view> 

     <!-- 发薪详情弹窗 --> 
     <view class="detail-modal" v-if="showDetailModal" @tap="closeDetailModal"> 
       <view class="modal-content" @tap.stop> 
         <view class="modal-header"> 
           <text class="modal-title">{{ currentDetail.month }} 发薪详情</text> 
         </view> 
         <view class="modal-info"> 
           <view class="info-row"> 
             <text class="info-label">发薪日期</text> 
             <text class="info-value">{{ currentDetail.payDate }}</text> 
           </view> 
           <view class="info-row"> 
             <text class="info-label">发薪状态</text> 
             <text class="info-value" :class="currentDetail.status === '准时' ? 'on-time' : 'late'">{{ currentDetail.status }}</text> 
           </view> 
           <view class="info-row"> 
             <text class="info-label">发薪总金额</text> 
             <text class="info-value">¥{{ currentDetail.totalAmount }}</text> 
           </view> 
           <view class="info-row"> 
             <text class="info-label">涉及工人数</text> 
             <text class="info-value">{{ currentDetail.workerCount }}人</text> 
           </view> 
           <view class="info-row"> 
             <text class="info-label">工人确认率</text> 
             <text class="info-value">{{ currentDetail.confirmRate }}%</text> 
           </view> 
         </view> 
         <view class="feedback-section" v-if="currentDetail.workerFeedback.length > 0"> 
           <text class="feedback-title">工人匿名反馈</text> 
           <view class="feedback-list"> 
             <text class="feedback-item" v-for="(feedback, index) in currentDetail.workerFeedback" :key="index">✅ {{ feedback }}</text> 
           </view> 
         </view> 
         <button class="modal-close" @tap="closeDetailModal">知道了</button> 
       </view> 
     </view> 
   </view> 
</template>

<script> 
export default { 
   name: 'FactorySalaryCredit', 
   data() { 
     return { 
       // 用户层级：free免费/active优质/vip付费 
       userLevel: 'free', 
       // 工厂模拟数据，对接后端替换 
       factoryInfo: { 
         continuousPayMonth: 12, 
         lastPayDate: '2026-02-28', 
         payOnTimeRate: 100, 
         workerConfirmRate: 98, 
         workerTags: ['从不压工资', '工价透明', '当月结清', '空调车间'] 
       }, 
       // 完整发薪记录 
       fullSalaryList: [ 
         { month: '2026年2月', payDate: '2026-02-28', status: '准时', workerCount: 126, confirmRate: 98, totalAmount: '128.6万', workerFeedback: ['工资准时到账，工价和说好的一样', '没有乱扣钱，全勤奖也发了'] }, 
         { month: '2026年1月', payDate: '2026-01-29', status: '准时', workerCount: 122, confirmRate: 97, totalAmount: '122.3万', workerFeedback: ['当月工资当月结清，太靠谱了', '加班工资也按时发了'] }, 
         { month: '2025年12月', payDate: '2025-12-30', status: '准时', workerCount: 118, confirmRate: 96, totalAmount: '118.5万', workerFeedback: ['年底工资也准时发，不压工资'] }, 
         { month: '2025年11月', payDate: '2025-11-28', status: '准时', workerCount: 115, confirmRate: 98, totalAmount: '115.2万', workerFeedback: ['工价透明，每天都能算自己赚多少'] } 
       ], 
       showDetailModal: false, 
       currentDetail: {} 
     } 
   }, 
   computed: { 
     // 根据用户层级限制展示月份 
     showMonthLimit() { 
       if (this.userLevel === 'free') return 3 
       if (this.userLevel === 'active') return 12 
       return 999 // vip无限制 
     }, 
     // 最终展示的列表 
     showSalaryList() { 
       return this.fullSalaryList.slice(0, this.showMonthLimit) 
     } 
   }, 
   methods: { 
     viewSalaryDetail(item) { 
       // 免费用户点击详情，提示解锁 
       if (this.userLevel === 'free') { 
         uni.showModal({ 
           title: '权限不足', 
           content: '连续记工满28天，解锁优质用户权限，即可查看完整发薪详情', 
           confirmText: '去解锁', 
           success: (res) => { 
             if (res.confirm) this.goToAuth() 
           } 
         }) 
         return 
       } 
       this.currentDetail = item 
       this.showDetailModal = true 
     }, 
     closeDetailModal() { 
       this.showDetailModal = false 
     }, 
     goToAuth() { 
       uni.navigateTo({ url: '/pages/worker/ledger' }) // 跳转到账本页，引导记工 
     } 
   } 
 } 
</script>

<style lang="scss" scoped> 
 .factory-salary-credit { 
   background: #fff; 
   border-radius: 20rpx; 
   padding: 30rpx; 
   margin: 0 30rpx 30rpx; 
   box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04); 
 } 

 /* 顶部金标 */ 
 .credit-header { 
   text-align: center; 
   margin-bottom: 20rpx; 
 } 

 .gold-badge { 
   display: inline-flex; 
   align-items: center; 
   background: linear-gradient(90deg, #ffd700 0%, #ffed4e 100%); 
   padding: 8rpx 20rpx; 
   border-radius: 30rpx; 
   margin-bottom: 15rpx; 
 } 

 .badge-icon { 
   font-size: 24rpx; 
   margin-right: 6rpx; 
 } 

 .badge-text { 
   font-size: 24rpx; 
   font-weight: 600; 
   color: #874c00; 
 } 

 .continuous-pay-tip { 
   font-size: 32rpx; 
   font-weight: 700; 
   color: #d48806; 
 }


/* 数据看板 */ 
 .credit-dashboard { 
   display: flex; 
   align-items: center; 
   background: #f8f9fa; 
   border-radius: 16rpx; 
   padding: 30rpx 0; 
   margin-bottom: 20rpx; 
 } 

 .dashboard-item { 
   flex: 1; 
   text-align: center; 
 } 

 .item-value { 
   font-size: 28rpx; 
   font-weight: 600; 
   color: #1a1a1a; 
   display: block; 
   margin-bottom: 6rpx; 
 } 

 .item-label { 
   font-size: 22rpx; 
   color: #999; 
 } 

 .dashboard-divider { 
   width: 1rpx; 
   height: 40rpx; 
   background: #e8e8e8; 
 } 

 /* 权限提示条 */ 
 .auth-tip { 
   display: flex; 
   align-items: center; 
   justify-content: space-between; 
   background: #fff7e6; 
   border-radius: 12rpx; 
   padding: 15rpx 20rpx; 
   margin-bottom: 20rpx; 
 } 

 .tip-text { 
   font-size: 22rpx; 
   color: #d48806; 
   flex: 1; 
 } 

 .tip-btn { 
   font-size: 22rpx; 
   color: #1677ff; 
   font-weight: 600; 
   margin-left: 10rpx; 
 } 

 /* 发薪记录列表 */ 
 .salary-list { 
   margin-bottom: 30rpx; 
 } 

 .list-header { 
   display: flex; 
   justify-content: space-between; 
   align-items: center; 
   margin-bottom: 20rpx; 
 } 

 .list-title { 
   font-size: 30rpx; 
   font-weight: 600; 
   color: #1a1a1a; 
 } 

 .list-sub { 
   font-size: 22rpx; 
   color: #999; 
 } 

 .salary-item { 
   display: flex; 
   align-items: center; 
   padding: 20rpx 0; 
   border-bottom: 1rpx solid #f5f5f5; 
 } 

 .salary-item:last-child { 
   border-bottom: none; 
 } 

 .item-left { 
   flex: 2; 
 } 

 .month { 
   font-size: 28rpx; 
   font-weight: 600; 
   color: #1a1a1a; 
   display: block; 
   margin-bottom: 4rpx; 
 } 

 .pay-date { 
   font-size: 22rpx; 
   color: #666; 
 } 

 .item-middle { 
   flex: 1.5; 
   text-align: center; 
 } 

 .status { 
   font-size: 26rpx; 
   font-weight: 600; 
   display: block; 
   margin-bottom: 4rpx; 
 } 

 .status.on-time { 
   color: #52c41a; 
 } 

 .status.late { 
   color: #ff4d4f; 
 } 

 .worker-count { 
   font-size: 22rpx; 
   color: #666; 
 } 

 .item-right { 
   flex: 1.5; 
   text-align: right; 
   display: flex; 
   align-items: center; 
   justify-content: flex-end; 
 } 

 .confirm-rate { 
   font-size: 26rpx; 
   color: #1a1a1a; 
   margin-right: 8rpx; 
 } 

 .arrow { 
   font-size: 24rpx; 
   color: #999; 
 } 

 /* 工人评价标签 */ 
 .worker-tag-section { 
   margin-top: 20rpx; 
 } 

 .tag-title { 
   font-size: 28rpx; 
   font-weight: 600; 
   color: #1a1a1a; 
   display: block; 
   margin-bottom: 15rpx; 
 } 

 .tag-list { 
   display: flex; 
   flex-wrap: wrap; 
   gap: 10rpx; 
 } 

 .tag-item { 
   background: #f0f5ff; 
   color: #1677ff; 
   padding: 8rpx 16rpx; 
   border-radius: 8rpx; 
   font-size: 22rpx; 
 } 

 /* 详情弹窗 */ 
 .detail-modal { 
   position: fixed; 
   top: 0; 
   left: 0; 
   right: 0; 
   bottom: 0; 
   background: rgba(0, 0, 0, 0.5); 
   display: flex; 
   align-items: center; 
   justify-content: center; 
   z-index: 999; 
 } 

 .modal-content { 
   width: 560rpx; 
   background: #fff; 
   border-radius: 20rpx; 
   padding: 40rpx 30rpx; 
   max-height: 80vh; 
   overflow-y: auto; 
 } 

 .modal-header { 
   margin-bottom: 20rpx; 
   text-align: center; 
 } 

 .modal-title { 
   font-size: 32rpx; 
   font-weight: 600; 
   color: #1a1a1a; 
 } 

 .info-row { 
   display: flex; 
   justify-content: space-between; 
   align-items: center; 
   padding: 15rpx 0; 
   border-bottom: 1rpx solid #f5f5f5; 
 } 

 .info-label { 
   font-size: 26rpx; 
   color: #666; 
 } 

 .info-value { 
   font-size: 26rpx; 
   font-weight: 600; 
   color: #1a1a1a; 
 } 

 .info-value.on-time { 
   color: #52c41a; 
 } 

 .feedback-section { 
   margin-top: 20rpx; 
 } 

 .feedback-title { 
   font-size: 28rpx; 
   font-weight: 600; 
   color: #1a1a1a; 
   display: block; 
   margin-bottom: 15rpx; 
 } 

 .feedback-item { 
   font-size: 24rpx; 
   color: #333; 
   padding: 8rpx 0; 
   display: block; 
 } 

 .modal-close { 
   width: 100%; 
   height: 80rpx; 
   line-height: 80rpx; 
   background: linear-gradient(90deg, #1677ff 0%, #4096ff 100%); 
   color: #fff; 
   border-radius: 40rpx; 
   font-size: 28rpx; 
   border: none; 
   margin-top: 30rpx; 
 } 
</style>