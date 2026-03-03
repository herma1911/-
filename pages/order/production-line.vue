<template>
  <view class="production-line-container">
    <view class="header">
      <text class="title">产线管理</text>
    </view>
    
    <!-- 新增产线 -->
    <view class="add-section">
      <text class="section-title">新增产线</text>
      <view class="add-form">
        <view class="form-item">
          <text class="form-label">产线名称：</text>
          <input type="text" v-model="newLine.name" placeholder="请输入产线名称" class="form-input" />
        </view>
        <view class="form-item">
          <text class="form-label">负责人：</text>
          <input type="text" v-model="newLine.manager" placeholder="请输入负责人姓名" class="form-input" />
        </view>
        <view class="form-item">
          <text class="form-label">负责人手机：</text>
          <input type="number" v-model="newLine.managerPhone" placeholder="请输入负责人手机号码" class="form-input" />
        </view>
        <view class="form-item">
          <text class="form-label">人数：</text>
          <input type="number" v-model.number="newLine.capacity" placeholder="请输入产线人数" class="form-input" />
        </view>
        <view class="form-item">
          <text class="form-label">状态：</text>
          <picker :value="statusIndex" :range="statusOptions" @change="statusChange">
            <view class="picker">
              {{ statusOptions[statusIndex] }}
            </view>
          </picker>
        </view>
        <button class="add-btn" @click="addProductionLine">添加产线</button>
      </view>
    </view>
    
    <!-- 产线列表 -->
    <view class="list-section">
      <text class="section-title">产线列表</text>
      <view class="line-list">
        <view v-for="(line, index) in productionLines" :key="line.id" class="line-item">
          <view class="line-header">
            <text class="line-name">{{ line.name }}</text>
            <text class="line-status" :class="line.status === '运行中' ? 'status-running' : 'status-stop'">{{ line.status }}</text>
          </view>
          <view class="line-details">
            <text>负责人：{{ line.manager }}</text>
            <text>负责人手机：{{ line.managerPhone || '未填写' }}</text>
            <text>人数：{{ line.capacity }} 人</text>
            <text>创建时间：{{ line.createTime }}</text>
            <text>绑定厂长：{{ line.teamLeader || '未绑定' }}</text>
          </view>
          <view class="line-actions">
            <button class="edit-btn" @click="editLine(line)">编辑</button>
            <button class="bind-btn" @click="bindAdmin(line)">绑定厂长</button>
            <button class="delete-btn" @click="deleteLine(line.id)">删除</button>
          </view>
        </view>
        <view v-if="productionLines.length === 0" class="empty-state">
          <text>暂无产线数据</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 新增产线数据
      newLine: {
        name: '',
        manager: '',
        managerPhone: '',
        capacity: 0,
        status: '运行中'
      },
      // 状态选项
      statusOptions: ['运行中', '停止'],
      statusIndex: 0,
      // 产线列表
      productionLines: []
    }
  },
  onLoad() {
    this.loadProductionLines()
  },
  methods: {
    // 加载产线数据
    loadProductionLines() {
      const lines = uni.getStorageSync('productionLines') || []
      this.productionLines = lines
    },
    // 状态选择
    statusChange(e) {
      this.statusIndex = e.detail.value
      this.newLine.status = this.statusOptions[this.statusIndex]
    },
    // 添加产线
    addProductionLine() {
      if (!this.newLine.name || !this.newLine.manager || !this.newLine.capacity) {
        uni.showToast({
          title: '请填写完整的产线信息',
          icon: 'none'
        })
        return
      }
      
      // 创建新产线
      const newProductionLine = {
        id: Date.now(),
        ...this.newLine,
        createTime: new Date().toISOString().split('T')[0]
      }
      
      // 添加到列表
      this.productionLines.push(newProductionLine)
      
      // 保存到本地存储
      uni.setStorageSync('productionLines', this.productionLines)
      
      // 如果填写了负责人手机号码，创建或更新负责人信息
      if (this.newLine.managerPhone) {
        const phoneNumber = this.newLine.managerPhone.trim()
        if (/^1[3-9]\d{9}$/.test(phoneNumber)) {
          // 创建或更新负责人信息
          const updatedLeader = {
            username: phoneNumber,
            phone: phoneNumber,
            name: this.newLine.manager,
            role: '厂长',
            registerTime: new Date().toLocaleString(),
            enterpriseName: '未分配',
            productionLines: [newProductionLine.name]
          }
          
          // 保存到用户列表
          const users = uni.getStorageSync('users') || []
          const existingLeaderIndex = users.findIndex(user => 
            user.username === phoneNumber || user.phone === phoneNumber
          )
          
          if (existingLeaderIndex >= 0) {
            // 更新现有负责人
            const existingLeader = users[existingLeaderIndex]
            updatedLeader.productionLines = [...(existingLeader.productionLines || []), newProductionLine.name]
            users[existingLeaderIndex] = updatedLeader
          } else {
            // 添加新负责人
            users.push(updatedLeader)
          }
          
          uni.setStorageSync('users', users)
          uni.setStorageSync('userInfo_' + phoneNumber, updatedLeader)
        }
      }
      
      // 重置表单
      this.newLine = {
        name: '',
        manager: '',
        managerPhone: '',
        capacity: 0,
        status: '运行中'
      }
      this.statusIndex = 0
      
      uni.showToast({
        title: '产线添加成功',
        icon: 'success'
      })
    },
    // 编辑产线
    editProductionLine(index) {
      const line = this.productionLines[index]
      uni.showModal({
        title: '编辑产线',
        content: `请输入新的产线名称：`,
        editable: true,
        placeholderText: line.name,
        success: (res) => {
          if (res.confirm && res.content) {
            line.name = res.content
            uni.setStorageSync('productionLines', this.productionLines)
            uni.showToast({
              title: '产线编辑成功',
              icon: 'success'
            })
          }
        }
      })
    },
    // 删除产线
    deleteProductionLine(index) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这条产线吗？',
        success: (res) => {
          if (res.confirm) {
            this.productionLines.splice(index, 1)
            uni.setStorageSync('productionLines', this.productionLines)
            uni.showToast({
              title: '产线删除成功',
              icon: 'success'
            })
          }
        }
      })
    },
    // 绑定厂长
    bindAdmin(line) {
      // 显示输入手机号码的弹窗
      uni.showModal({
        title: '绑定厂长',
        content: '请输入厂长的手机号码',
        editable: true,
        placeholderText: '请输入手机号码',
        success: (res) => {
          if (res.confirm && res.content) {
            const phoneNumber = res.content.trim()
            
            if (!/^1[3-9]\d{9}$/.test(phoneNumber)) {
              uni.showToast({
                title: '请输入正确的手机号码',
                icon: 'none'
              })
              return
            }
            
            // 更新产线绑定
            const updatedLines = this.productionLines.map(l => {
              if (l.id === line.id) {
                return {
                  ...l,
                  teamLeader: phoneNumber
                }
              }
              return l
            })
            
            uni.setStorageSync('productionLines', updatedLines)
            this.loadProductionLines()
            
            // 创建或更新厂长信息
            const users = uni.getStorageSync('users') || []
            const existingLeaderIndex = users.findIndex(user => 
              user.username === phoneNumber || user.phone === phoneNumber
            )
            
            const updatedLeader = {
              username: phoneNumber,
              phone: phoneNumber,
              role: '厂长',
              registerTime: new Date().toLocaleString(),
              enterpriseName: '未分配',
              productionLines: [line.name]
            }
            
            if (existingLeaderIndex >= 0) {
              // 更新现有厂长
              const existingLeader = users[existingLeaderIndex]
              updatedLeader.productionLines = [...(existingLeader.productionLines || []), line.name]
              users[existingLeaderIndex] = updatedLeader
            } else {
              // 添加新厂长
              users.push(updatedLeader)
            }
            
            uni.setStorageSync('users', users)
            uni.setStorageSync('userInfo_' + phoneNumber, updatedLeader)
            
            uni.showToast({
              title: '绑定成功，该手机号码登录后将显示厂长管理页面',
              icon: 'success'
            })
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.production-line-container {
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
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  text-align: center;
}

.add-section,
.list-section {
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

.add-form {
  background-color: #f9f9f9;
  border-radius: 10rpx;
  padding: 20rpx;
}

.form-item {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.form-label {
  font-size: 24rpx;
  color: #666;
  width: 150rpx;
}

.form-input {
  flex: 1;
  height: 70rpx;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  padding: 0 15rpx;
  font-size: 24rpx;
}

.picker {
  flex: 1;
  height: 70rpx;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  padding: 0 15rpx;
  font-size: 24rpx;
  line-height: 70rpx;
  background-color: #fff;
}

.add-btn {
  width: 100%;
  height: 70rpx;
  background-color: #4A90E2;
  color: #fff;
  font-size: 24rpx;
  border-radius: 10rpx;
  margin-top: 10rpx;
}

.line-list {
  margin-top: 10rpx;
}

.line-item {
  background-color: #f9f9f9;
  border-radius: 10rpx;
  padding: 20rpx;
  margin-bottom: 15rpx;
}

.line-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
  padding-bottom: 15rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.line-name {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
}

.line-status {
  font-size: 22rpx;
  padding: 5rpx 15rpx;
  border-radius: 15rpx;
}

.status-running {
  background-color: #e6f7ff;
  color: #1890ff;
}

.status-stop {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.line-details {
  margin-bottom: 15rpx;
}

.line-details text {
  display: block;
  font-size: 24rpx;
  color: #666;
  margin-bottom: 5rpx;
}

.line-actions {
  display: flex;
  gap: 10rpx;
}

.edit-btn {
  flex: 1;
  height: 60rpx;
  background-color: #e6f7ff;
  color: #1890ff;
  font-size: 22rpx;
  border-radius: 10rpx;
}

.delete-btn {
  flex: 1;
  height: 60rpx;
  background-color: #fff1f0;
  color: #ff4d4f;
  font-size: 22rpx;
  border-radius: 10rpx;
}

.bind-btn {
  flex: 1;
  height: 60rpx;
  background-color: #f6ffed;
  color: #52c41a;
  font-size: 22rpx;
  border-radius: 10rpx;
}

.empty-state {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 24rpx;
}
</style>