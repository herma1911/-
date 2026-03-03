<template>
  <view class="worker-details-container">
    <view class="header">
      <text class="title">员工详情</text>
      <view class="header-buttons">
        <button :class="['follow-btn', isFollowing ? 'followed' : '']" @click="toggleFollow">{{isFollowing ? '已关注' : '关注'}}</button>
        <button class="message-btn" @click="sendMessage">发消息</button>
      </view>
    </view>
    
    <view class="worker-info">
      <text class="worker-name">{{ workerInfo.name || '未知员工' }}</text>
      <text class="worker-skills">
        技能：{{ workerInfo.skills ? workerInfo.skills.join(', ') : '无' }}
      </text>
      <text class="worker-status" :class="workerInfo.statusType">{{ workerInfo.statusText || '状态未知' }}</text>
    </view>
    
    <!-- 四大维度 -->
    <view class="four-dimensions">
      <!-- 1. 技能档案 -->
      <view class="dimension-section">
        <text class="section-title">1. 技能档案</text>
        <view class="skills-list">
          <text v-for="(skill, index) in (workerInfo.skills || [])" :key="index" class="skill-tag">{{ skill }}</text>
          <text v-if="!workerInfo.skills || workerInfo.skills.length === 0" class="no-data">暂无技能信息</text>
        </view>
      </view>
      
      <!-- 2. 记账实绩 -->
      <view class="dimension-section">
        <text class="section-title">2. 记账实绩</text>
        <view class="work-records">
          <view v-for="(record, index) in (workerInfo.workRecords || [])" :key="index" class="work-record-item">
            <text class="record-skill">{{ record.skill }}</text>
            <text class="record-count">｜累计 {{ record.count }} 件</text>
            <text class="record-level">｜{{ record.level }}</text>
          </view>
          <view v-if="!workerInfo.workRecords || workerInfo.workRecords.length === 0" class="no-data">
            <text>暂无记账实绩</text>
          </view>
        </view>
      </view>
      
      <!-- 3. 工友认可 -->
      <view class="dimension-section">
        <text class="section-title">3. 工友认可</text>
        <view class="peer-recognition">
          <view v-for="(peerEval, index) in (workerInfo.peerEvaluations || [])" :key="index" class="peer-eval-item">
            <text class="peer-eval-content">{{ peerEval.content }}</text>
            <text class="peer-eval-from">(来自{{ peerEval.from }})</text>
          </view>
          <view v-if="!workerInfo.peerEvaluations || workerInfo.peerEvaluations.length === 0" class="no-data">
            <text>暂无工友评价</text>
          </view>
        </view>
      </view>
      
      <!-- 4. 工厂评价 -->
      <view class="dimension-section">
        <text class="section-title">4. 工厂评价</text>
        <view class="factory-evaluation">
          <view v-if="workerEvaluation && workerEvaluation.evaluations && workerEvaluation.evaluations.length > 0">
            <view v-for="(evaluation, index) in workerEvaluation.evaluations" :key="evaluation.id" class="factory-eval-item">
              <view class="evaluator-info">
                <text class="evaluator-name">{{ evaluation.evaluatorName }}</text>
                <text class="evaluation-date">{{ evaluation.evaluationDate }}</text>
              </view>
              <text class="evaluation-comment">{{ evaluation.comment }}</text>
              <view v-if="evaluation.tags && evaluation.tags.length > 0" class="tag-list">
                <text 
                  v-for="tag in evaluation.tags" 
                  :key="tag"
                  class="tag"
                >{{ tag }}</text>
              </view>
            </view>
          </view>
          <view v-else class="no-data">
            <text>暂无工厂评价</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 员工评价 -->
    <view class="evaluation-section">
      <text class="section-title">用工者评价</text>
      
      <view v-if="workerEvaluation" class="evaluation-summary">
        <view class="overall-rating">
          <text class="rating-label">综合评分：</text>
          <text class="rating-value">{{ getOverallRating().toFixed(1) }}分</text>
        </view>
        
        <!-- 各维度评分 -->
        <view class="dimension-ratings">
          <view class="dimension-item">
            <text class="dimension-label">技能熟练度：</text>
            <view class="star-rating">
              <text 
                v-for="star in 5" 
                :key="star" 
                :class="['star', workerEvaluation.skillProficiency >= star ? 'active' : '']"
              >★</text>
            </view>
            <text class="rating-value">{{ workerEvaluation.skillProficiency.toFixed(1) }}分</text>
          </view>
          
          <view class="dimension-item">
            <text class="dimension-label">效率高低：</text>
            <view class="star-rating">
              <text 
                v-for="star in 5" 
                :key="star" 
                :class="['star', workerEvaluation.efficiency >= star ? 'active' : '']"
              >★</text>
            </view>
            <text class="rating-value">{{ workerEvaluation.efficiency.toFixed(1) }}分</text>
          </view>
          
          <view class="dimension-item">
            <text class="dimension-label">学习能力：</text>
            <view class="star-rating">
              <text 
                v-for="star in 5" 
                :key="star" 
                :class="['star', workerEvaluation.learningAbility >= star ? 'active' : '']"
              >★</text>
            </view>
            <text class="rating-value">{{ workerEvaluation.learningAbility.toFixed(1) }}分</text>
          </view>
          
          <view class="dimension-item">
            <text class="dimension-label">责任心：</text>
            <view class="star-rating">
              <text 
                v-for="star in 5" 
                :key="star" 
                :class="['star', workerEvaluation.responsibility >= star ? 'active' : '']"
              >★</text>
            </view>
            <text class="rating-value">{{ workerEvaluation.responsibility.toFixed(1) }}分</text>
          </view>
          
          <view class="dimension-item">
            <text class="dimension-label">团队配合：</text>
            <view class="star-rating">
              <text 
                v-for="star in 5" 
                :key="star" 
                :class="['star', workerEvaluation.teamwork >= star ? 'active' : '']"
              >★</text>
            </view>
            <text class="rating-value">{{ workerEvaluation.teamwork.toFixed(1) }}分</text>
          </view>
        </view>
        
        <!-- 评价列表 -->
        <view class="evaluation-list">
          <view v-for="(evaluation, index) in workerEvaluation.evaluations" :key="evaluation.id" class="evaluation-item">
            <view class="evaluator-info">
              <text class="evaluator-name">{{ evaluation.evaluatorName }}</text>
              <text class="evaluation-date">{{ evaluation.evaluationDate }}</text>
            </view>
            
            <view class="evaluation-details">
              <view class="rating-row">
                <text class="rating-item">技能：{{ evaluation.skillProficiency }}星</text>
                <text class="rating-item">效率：{{ evaluation.efficiency }}星</text>
                <text class="rating-item">学习：{{ evaluation.learningAbility }}星</text>
                <text class="rating-item">责任：{{ evaluation.responsibility }}星</text>
                <text class="rating-item">团队：{{ evaluation.teamwork }}星</text>
              </view>
              
              <text v-if="evaluation.comment" class="evaluation-comment">{{ evaluation.comment }}</text>
              
              <!-- 评价标签 -->
              <view v-if="evaluation.tags && evaluation.tags.length > 0" class="tag-list">
                <text 
                  v-for="tag in evaluation.tags" 
                  :key="tag"
                  class="tag"
                >{{ tag }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <view v-else class="no-evaluation">
        <text>暂无评价</text>
      </view>
    </view>
    
    <!-- 操作按钮 -->
    <view class="action-section">
      <button type="primary" class="evaluate-button" @click="evaluateWorker">评价该员工</button>
      <button 
        :type="isWorkerBlacklisted ? 'default' : 'warn'" 
        class="blacklist-button" 
        @click="toggleBlacklist"
      >
        {{ isWorkerBlacklisted ? '取消拉黑' : '拉黑此工人' }}
      </button>
    </view>
  </view>
</template>

<script>
import { getWorkerEvaluation } from '../../utils/evaluation.js'
import { addToBlacklist, removeFromBlacklist, isInBlacklist } from '../../utils/blacklist.js'

export default {
  data() {
    return {
      workerId: '',
      workerInfo: {},
      workerEvaluation: null,
      isWorkerBlacklisted: false,
      isFollowing: false // 是否已关注该工人
    }
  },
  onLoad(options) {
    this.workerId = options.workerId
    this.loadWorkerInfo()
    this.loadWorkerEvaluation()
    this.checkBlacklistStatus()
    this.checkIfFollowing()
  },
  methods: {
    // 检查是否已关注该工人
    checkIfFollowing() {
      const followedWorkers = uni.getStorageSync('followedWorkers') || []
      this.isFollowing = followedWorkers.some(worker => worker.id === this.workerId)
    },
    // 切换关注状态
    toggleFollow() {
      if (this.isFollowing) {
        // 取消关注
        uni.showModal({
          title: '取消关注',
          content: '确定要取消关注该工人吗？',
          confirmText: '确定',
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) {
              let followedWorkers = uni.getStorageSync('followedWorkers') || []
              followedWorkers = followedWorkers.filter(worker => worker.id !== this.workerId)
              uni.setStorageSync('followedWorkers', followedWorkers)
              this.isFollowing = false
              uni.showToast({
                title: '已取消关注',
                icon: 'success'
              })
            }
          }
        })
      } else {
        // 关注工人
        const newWorker = {
          id: this.workerId,
          avatar: '👨',
          name: this.workerInfo.name || '未知工人',
          age: this.workerInfo.age || 0,
          skills: this.workerInfo.skills || [],
          status: 'followable',
          statusText: '可关注',
          latestAchievement: {
            skill: this.workerInfo.skills && this.workerInfo.skills.length > 0 ? this.workerInfo.skills[0] : '无',
            count: '0'
          },
          hasNewUpdate: false,
          lastUpdate: new Date().toISOString()
        }
        let followedWorkers = uni.getStorageSync('followedWorkers') || []
        followedWorkers.push(newWorker)
        uni.setStorageSync('followedWorkers', followedWorkers)
        this.isFollowing = true
        uni.showToast({
          title: '关注成功',
          icon: 'success'
        })
      }
    },
    // 发消息
    sendMessage() {
      uni.navigateTo({
        url: '../worker/chat?userId=' + this.workerId + '&type=worker'
      })
    },
    checkBlacklistStatus() {
      // 获取当前用户ID（这里使用模拟ID，实际应该从登录状态获取）
      const currentUserId = uni.getStorageSync('userId') || 'factory_1'
      this.isWorkerBlacklisted = isInBlacklist(currentUserId, this.workerId, 'worker')
    },
    loadWorkerInfo() {
      // 从本地存储获取员工技能档案
      const skillProfile = uni.getStorageSync('skillProfile')
      
      if (skillProfile) {
        // 确保peerEvaluations字段存在，与peerRecognition对应
        if (skillProfile.peerRecognition && !skillProfile.peerEvaluations) {
          skillProfile.peerEvaluations = skillProfile.peerRecognition.map(item => ({
            content: `${item.skill}技能得到${item.count}个工友认可`,
            from: '工友们'
          }))
        }
        this.workerInfo = skillProfile
      } else {
        // 使用丰富的默认数据
        this.workerInfo = {
          name: '李明',
          age: '28',
          gender: '男',
          education: '初中',
          experience: '6年经验',
          expectedSalary: '7500-9500元/月',
          type: '针织',
          skills: ['平车', '装领', '上腰', '拷边', '开口袋', '装拉链'],
          statusText: '求职中',
          statusType: 'status-available',
          workRecords: [
            { skill: '装领', count: '32600', level: '精通' },
            { skill: '上腰', count: '18300', level: '熟练' },
            { skill: '拷边', count: '15800', level: '熟练' },
            { skill: '平车', count: '28500', level: '精通' },
            { skill: '开口袋', count: '12600', level: '熟练' },
            { skill: '装拉链', count: '9800', level: '熟练' }
          ],
          peerRecognition: [
            { skill: '平车', count: 58 },
            { skill: '装领', count: 45 },
            { skill: '上腰', count: 36 },
            { skill: '拷边', count: 31 },
            { skill: '开口袋', count: 24 },
            { skill: '装拉链', count: 18 }
          ],
          peerEvaluations: [
            { content: '平车技术非常熟练，速度快，质量好', from: '王师傅' },
            { content: '装领手艺精湛，经验丰富', from: '李组长' },
            { content: '工作态度认真，责任心强', from: '张主管' },
            { content: '团队合作能力强，乐于助人', from: '工友们' }
          ],
          workExperience: [
            {
              company: '广州衣起赚服装厂',
              position: '熟练车工',
              period: '2022-2024',
              description: '主要负责装领、上腰等工序，工作认真负责，效率高，多次被评为优秀员工。'
            },
            {
              company: '深圳XX制衣厂',
              position: '车工',
              period: '2020-2022',
              description: '从事平车、拷边等工作，积累了丰富的经验。'
            }
          ]
        }
      }
    },
    loadWorkerEvaluation() {
      // 获取员工评价
      const evaluation = getWorkerEvaluation(this.workerId)
      if (evaluation) {
        this.workerEvaluation = evaluation
      } else {
        // 使用丰富的默认评价数据
        this.workerEvaluation = {
          skillProficiency: 4.8,
          efficiency: 4.7,
          learningAbility: 4.5,
          responsibility: 4.9,
          teamwork: 4.6,
          totalEvaluations: 15,
          evaluations: [
            {
              id: '1',
              evaluatorName: '广州衣起赚服装厂',
              evaluationDate: '2026-02-20',
              skillProficiency: 5,
              efficiency: 5,
              learningAbility: 4,
              responsibility: 5,
              teamwork: 4,
              comment: '手艺稳、速度快、做事主动、配合度高，是一位非常优秀的工人。平均日产量达到280件，质量合格率99.5%。',
              tags: ['手艺稳', '速度快', '做事主动', '配合度高']
            },
            {
              id: '2',
              evaluatorName: '深圳XX制衣厂',
              evaluationDate: '2026-01-15',
              skillProficiency: 4,
              efficiency: 5,
              learningAbility: 5,
              responsibility: 4,
              teamwork: 5,
              comment: '技术熟练，工作认真负责，能够按时完成任务，团队合作能力强。学习新技能的能力很强，很快就能上手新工序。',
              tags: ['技术熟练', '工作认真', '按时完成', '团队合作']
            },
            {
              id: '3',
              evaluatorName: '东莞童装厂',
              evaluationDate: '2025-12-10',
              skillProficiency: 5,
              efficiency: 4,
              learningAbility: 4,
              responsibility: 5,
              teamwork: 4,
              comment: '装领技术非常精湛，做出来的领子平整美观，质量稳定。工作态度认真，责任心强，值得信赖。',
              tags: ['技术精湛', '质量稳定', '责任心强', '值得信赖']
            }
          ]
        }
      }
    },
    getOverallRating() {
      if (!this.workerEvaluation) return 0
      
      // 计算加权综合评分
      const { skillProficiency, efficiency, learningAbility, responsibility, teamwork } = this.workerEvaluation
      return skillProficiency * 0.4 + efficiency * 0.15 + learningAbility * 0.15 + responsibility * 0.15 + teamwork * 0.15
    },
    evaluateWorker() {
      // 跳转到评价页面
      uni.navigateTo({
        url: './evaluate-worker?workerId=' + this.workerId
      })
    },
    toggleBlacklist() {
      // 获取当前用户ID（这里使用模拟ID，实际应该从登录状态获取）
      const currentUserId = uni.getStorageSync('userId') || 'factory_1'
      
      if (this.isWorkerBlacklisted) {
        // 取消拉黑
        const success = removeFromBlacklist(currentUserId, this.workerId, 'worker')
        if (success) {
          this.isWorkerBlacklisted = false
          uni.showToast({
            title: '已取消拉黑',
            icon: 'success'
          })
        }
      } else {
        // 拉黑
        const success = addToBlacklist(currentUserId, this.workerId, 'worker', this.workerInfo.name || '未知工人')
        if (success) {
          this.isWorkerBlacklisted = true
          uni.showToast({
            title: '已加入黑名单',
            icon: 'success'
          })
        } else {
          uni.showToast({
            title: '已经在黑名单中',
            icon: 'none'
          })
        }
      }
    }
  }
}
</script>

<style scoped>
.worker-details-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  position: relative;
}

/* 关注按钮样式 */
.header-buttons {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  display: flex;
  gap: 10rpx;
}

.follow-btn {
  background-color: #f0f0f0;
  color: #333;
  border: none;
  border-radius: 20rpx;
  padding: 10rpx 20rpx;
  font-size: 24rpx;
}

.follow-btn.followed {
  background-color: #FF6B35;
  color: #fff;
}

/* 消息按钮样式 */
.message-btn {
  background-color: #4A90E2;
  color: #fff;
  border: none;
  border-radius: 20rpx;
  padding: 10rpx 20rpx;
  font-size: 24rpx;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  text-align: center;
}

.worker-info {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.worker-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.worker-skills {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-bottom: 10rpx;
}

.worker-status {
  font-size: 22rpx;
  padding: 5rpx 15rpx;
  border-radius: 15rpx;
  display: inline-block;
  margin-top: 10rpx;
}

/* 四大维度样式 */
.four-dimensions {
  margin-bottom: 20rpx;
}

.dimension-section {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 15rpx;
  display: block;
}

/* 技能标签样式 */
.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.skill-tag {
  padding: 8rpx 16rpx;
  background-color: #e6f2ff;
  color: #4A90E2;
  border-radius: 20rpx;
  font-size: 22rpx;
}

/* 记账实绩样式 */
.work-records {
  margin-top: 10rpx;
}

.work-record-item {
  padding: 10rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.record-skill {
  font-size: 24rpx;
  font-weight: bold;
  color: #333;
}

.record-count {
  font-size: 22rpx;
  color: #666;
  margin-left: 10rpx;
}

.record-level {
  font-size: 22rpx;
  color: #4A90E2;
  margin-left: 10rpx;
}

/* 工友认可样式 */
.peer-recognition {
  margin-top: 10rpx;
}

.peer-eval-item {
  padding: 15rpx;
  background-color: #f9f9f9;
  border-radius: 10rpx;
  margin-bottom: 10rpx;
}

.peer-eval-content {
  font-size: 22rpx;
  color: #333;
  display: block;
  margin-bottom: 5rpx;
}

.peer-eval-from {
  font-size: 20rpx;
  color: #999;
}

/* 无数据样式 */
.no-data {
  text-align: center;
  padding: 20rpx;
  color: #999;
  font-size: 22rpx;
}

.worker-status.status-available {
  background-color: #e6f7ff;
  color: #1890ff;
}

.worker-status.status-working {
  background-color: #f6ffed;
  color: #52c41a;
}

.evaluation-section {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.evaluation-summary {
  margin-bottom: 20rpx;
}

.overall-rating {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.rating-label {
  font-size: 24rpx;
  color: #666;
}

.rating-value {
  font-size: 28rpx;
  font-weight: bold;
  color: #4A90E2;
  margin-left: 10rpx;
}

.dimension-ratings {
  margin-bottom: 20rpx;
}

.dimension-item {
  display: flex;
  align-items: center;
  margin-bottom: 15rpx;
}

.dimension-label {
  font-size: 22rpx;
  color: #666;
  width: 120rpx;
}

.star-rating {
  flex: 1;
  display: flex;
  gap: 5rpx;
  margin: 0 15rpx;
}

.star {
  font-size: 24rpx;
  color: #ddd;
}

.star.active {
  color: #ffd700;
}

.evaluation-list {
  margin-top: 20rpx;
}

.evaluation-item {
  background-color: #f9f9f9;
  border-radius: 10rpx;
  padding: 15rpx;
  margin-bottom: 15rpx;
}

.evaluator-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.evaluator-name {
  font-size: 22rpx;
  font-weight: bold;
  color: #333;
}

.evaluation-date {
  font-size: 20rpx;
  color: #999;
}

.evaluation-details {
  margin-top: 10rpx;
}

.rating-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-bottom: 10rpx;
}

.rating-item {
  font-size: 20rpx;
  color: #666;
  background-color: #f0f0f0;
  padding: 5rpx 10rpx;
  border-radius: 10rpx;
}

.evaluation-comment {
  font-size: 22rpx;
  color: #333;
  line-height: 32rpx;
  margin-top: 10rpx;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 10rpx;
}

.tag {
  padding: 5rpx 15rpx;
  border-radius: 15rpx;
  font-size: 20rpx;
  background-color: #e6f7ff;
  color: #1890ff;
}

.no-evaluation {
  background-color: #f9f9f9;
  border-radius: 10rpx;
  padding: 40rpx;
  text-align: center;
  color: #999;
  font-size: 24rpx;
}

.action-section {
  margin-top: 30rpx;
}

.evaluate-button {
  width: 100%;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 32rpx;
  background-color: #4A90E2;
  color: #fff;
  margin-bottom: 20rpx;
}

.blacklist-button {
  width: 100%;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 32rpx;
  margin-bottom: 20rpx;
}

.blacklist-button[type="warn"] {
  background-color: #ff4d4f;
  color: #fff;
}

.blacklist-button[type="default"] {
  background-color: #f0f0f0;
  color: #333;
}
</style>