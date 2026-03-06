<template>
  <view class="worker-action-guide-page">
    <!-- 顶部导航栏 -->
    <view class="nav-header">
      <view class="back-btn" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="page-title">工人动作指导</text>
      <view class="placeholder"></view>
    </view>

    <!-- 工人选择区 -->
    <view class="worker-selection-section">
      <view class="form-group">
        <text class="form-label">选择工人</text>
        <picker @change="handleWorkerChange" :value="selectedWorkerIndex" :range="workers">
          <view class="picker-input">
            <text>{{ workers[selectedWorkerIndex] }}</text>
          </view>
        </picker>
      </view>
      <view class="form-group">
        <text class="form-label">选择工序</text>
        <picker @change="handleProcessChange" :value="selectedProcessIndex" :range="processes">
          <view class="picker-input">
            <text>{{ processes[selectedProcessIndex] }}</text>
          </view>
        </picker>
      </view>
    </view>

    <!-- 视频查看区 -->
    <view class="video-section">
      <text class="section-title">工人操作视频</text>
      <view class="video-container">
        <video :src="selectedVideoUrl" controls class="action-video"></video>
        <view class="video-info">
          <text class="video-title">{{ selectedWorkerName }} - {{ selectedProcessName }}操作视频</text>
          <text class="video-meta">录制时间：{{ videoRecordTime }}</text>
        </view>
      </view>
    </view>

    <!-- 标注优化区 -->
    <view class="annotation-section">
      <text class="section-title">标注优化点</text>
      <view class="annotation-card">
        <view class="annotation-timeline">
          <view v-for="annotation in annotations" :key="annotation.id" class="annotation-item">
            <view class="annotation-time">
              <text class="time-text">{{ annotation.time }}</text>
              <view class="time-marker"></view>
            </view>
            <view class="annotation-content">
              <text class="annotation-text">{{ annotation.content }}</text>
              <text class="annotation-type">{{ annotation.type }}</text>
            </view>
          </view>
        </view>
        <view class="add-annotation">
          <text class="add-label">添加优化点</text>
          <input type="number" v-model.number="newAnnotationTime" class="time-input" placeholder="输入时间点(秒)" min="0" />
          <input type="text" v-model="newAnnotationContent" class="content-input" placeholder="输入优化建议" />
          <picker @change="handleAnnotationTypeChange" :value="selectedAnnotationTypeIndex" :range="annotationTypes">
            <view class="type-picker">
              <text>{{ annotationTypes[selectedAnnotationTypeIndex] }}</text>
            </view>
          </picker>
          <button class="add-btn" @tap="addAnnotation">添加</button>
        </view>
      </view>
    </view>

    <!-- 指导意见区 -->
    <view class="guidance-section">
      <text class="section-title">1对1指导意见</text>
      <view class="guidance-card">
        <textarea v-model="guidanceContent" class="guidance-textarea" placeholder="输入详细的指导意见，包括操作技巧、注意事项等" rows="5"></textarea>
      </view>
    </view>

    <!-- 操作按钮区 -->
    <view class="action-buttons-section">
      <button class="action-btn primary" @tap="sendGuidance">发送指导意见</button>
      <button class="action-btn secondary" @tap="saveAnnotation">保存标注</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 工人选择
      workers: ['请选择工人', '张三', '李四', '王五', '赵六'],
      selectedWorkerIndex: 1,
      // 工序选择
      processes: ['请选择工序', '平车', '裁剪', '熨烫', '包装'],
      selectedProcessIndex: 1,
      // 视频信息
      selectedVideoUrl: 'https://example.com/video.mp4',
      videoRecordTime: '2026-03-06 10:30:00',
      // 标注信息
      annotations: [
        {
          id: 1,
          time: '00:15',
          content: '手势不正确，建议调整手指位置',
          type: '动作规范'
        },
        {
          id: 2,
          time: '00:45',
          content: '速度过快，容易出错',
          type: '速度控制'
        },
        {
          id: 3,
          time: '01:20',
          content: '工具摆放不合理，建议重新整理工作台',
          type: '工作环境'
        }
      ],
      newAnnotationTime: '',
      newAnnotationContent: '',
      annotationTypes: ['动作规范', '速度控制', '工作环境', '其他'],
      selectedAnnotationTypeIndex: 0,
      // 指导意见
      guidanceContent: ''
    }
  },
  computed: {
    selectedWorkerName() {
      return this.workers[this.selectedWorkerIndex]
    },
    selectedProcessName() {
      return this.processes[this.selectedProcessIndex]
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    handleWorkerChange(e) {
      this.selectedWorkerIndex = e.detail.value
      // 这里可以根据选择的工人更新视频和标注
    },
    handleProcessChange(e) {
      this.selectedProcessIndex = e.detail.value
      // 这里可以根据选择的工序更新视频和标注
    },
    handleAnnotationTypeChange(e) {
      this.selectedAnnotationTypeIndex = e.detail.value
    },
    addAnnotation() {
      if (!this.newAnnotationTime || !this.newAnnotationContent) {
        uni.showToast({
          title: '请输入时间点和优化建议',
          icon: 'none'
        })
        return
      }
      
      // 格式化时间
      const seconds = parseInt(this.newAnnotationTime)
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      const formattedTime = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
      
      // 添加新标注
      const newAnnotation = {
        id: Date.now(),
        time: formattedTime,
        content: this.newAnnotationContent,
        type: this.annotationTypes[this.selectedAnnotationTypeIndex]
      }
      
      this.annotations.push(newAnnotation)
      
      // 清空输入
      this.newAnnotationTime = ''
      this.newAnnotationContent = ''
      this.selectedAnnotationTypeIndex = 0
      
      uni.showToast({
        title: '标注添加成功',
        icon: 'success'
      })
    },
    saveAnnotation() {
      // 模拟保存标注
      uni.showToast({
        title: '标注保存成功',
        icon: 'success'
      })
    },
    sendGuidance() {
      if (!this.guidanceContent) {
        uni.showToast({
          title: '请输入指导意见',
          icon: 'none'
        })
        return
      }
      
      // 模拟发送指导意见
      uni.showToast({
        title: '指导意见发送成功',
        icon: 'success'
      })
    }
  }
}
</script>

<style scoped>
.worker-action-guide-page {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  background-color: #fff;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.back-btn {
  display: flex;
  align-items: center;
  padding: 10rpx;
}

.back-icon {
  font-size: 40rpx;
  color: #333;
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.placeholder {
  width: 80rpx;
}

/* 工人选择区 */
.worker-selection-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 30rpx;
}

.form-label {
  display: block;
  font-size: 30rpx;
  color: #333;
  margin-bottom: 15rpx;
  font-weight: 500;
}

.picker-input {
  padding: 25rpx;
  border: 2rpx solid #e8e8e8;
  border-radius: 12rpx;
  font-size: 28rpx;
  background-color: #f9f9f9;
}

/* 视频查看区 */
.video-section {
  padding: 0 30rpx;
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.video-container {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.action-video {
  width: 100%;
  height: 300rpx;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
}

.video-info {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.video-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.video-meta {
  font-size: 22rpx;
  color: #999;
}

/* 标注优化区 */
.annotation-section {
  padding: 0 30rpx;
  margin-bottom: 30rpx;
}

.annotation-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.annotation-timeline {
  margin-bottom: 30rpx;
  padding-bottom: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.annotation-item {
  display: flex;
  gap: 20rpx;
  margin-bottom: 25rpx;
}

.annotation-time {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  flex-shrink: 0;
}

.time-text {
  font-size: 24rpx;
  font-weight: bold;
  color: #1890ff;
}

.time-marker {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background-color: #1890ff;
}

.annotation-content {
  flex: 1;
  background-color: #f0f7ff;
  padding: 20rpx;
  border-radius: 12rpx;
  border-left: 4rpx solid #1890ff;
}

.annotation-text {
  font-size: 24rpx;
  color: #333;
  line-height: 1.5;
  margin-bottom: 10rpx;
  display: block;
}

.annotation-type {
  font-size: 20rpx;
  color: #666;
  background-color: #e6f7ff;
  padding: 5rpx 15rpx;
  border-radius: 12rpx;
  display: inline-block;
}

.add-annotation {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.add-label {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.time-input,
.content-input {
  padding: 20rpx;
  border: 2rpx solid #e8e8e8;
  border-radius: 8rpx;
  font-size: 24rpx;
  box-sizing: border-box;
  background-color: #f9f9f9;
}

.content-input {
  height: 120rpx;
  resize: none;
}

.type-picker {
  padding: 20rpx;
  border: 2rpx solid #e8e8e8;
  border-radius: 8rpx;
  font-size: 24rpx;
  background-color: #f9f9f9;
}

.add-btn {
  padding: 20rpx;
  background-color: #1890ff;
  color: #fff;
  border: none;
  border-radius: 8rpx;
  font-size: 24rpx;
  font-weight: bold;
  text-align: center;
  transition: all 0.3s ease;
}

.add-btn:active {
  transform: scale(0.98);
  opacity: 0.9;
}

/* 指导意见区 */
.guidance-section {
  padding: 0 30rpx;
  margin-bottom: 30rpx;
}

.guidance-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.guidance-textarea {
  width: 100%;
  height: 200rpx;
  padding: 20rpx;
  border: 2rpx solid #e8e8e8;
  border-radius: 8rpx;
  font-size: 24rpx;
  box-sizing: border-box;
  background-color: #f9f9f9;
  resize: none;
}

/* 操作按钮区 */
.action-buttons-section {
  padding: 0 30rpx 30rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.action-btn {
  padding: 25rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: bold;
  border: none;
  text-align: center;
  transition: all 0.3s ease;
}

.action-btn.primary {
  background-color: #1890ff;
  color: #fff;
}

.action-btn.secondary {
  background-color: #52c41a;
  color: #fff;
}

.action-btn:active {
  transform: scale(0.98);
  opacity: 0.9;
}

/* 响应式设计 */
@media (max-width: 750rpx) {
  .worker-selection-section {
    margin: 20rpx;
    padding: 20rpx;
  }
  
  .video-section,
  .annotation-section,
  .guidance-section,
  .action-buttons-section {
    padding: 0 20rpx 20rpx;
  }
  
  .video-container,
  .annotation-card,
  .guidance-card {
    padding: 20rpx;
  }
  
  .action-video {
    height: 200rpx;
  }
  
  .action-btn {
    padding: 20rpx;
    font-size: 26rpx;
  }
}
</style>