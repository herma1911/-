<template>
  <view class="set-wage-container">
    <view class="header">
      <text class="title">打工价管理</text>
    </view>
    
    <view class="wage-section">
      <text class="section-title">工序工价设置</text>
      <view class="wage-form">
        <view class="form-item">
          <text class="form-label">款号：</text>
          <input type="text" v-model="currentStyleNumber" @input="onStyleNumberChange" placeholder="请输入款号" class="form-input" />
        </view>
        <view class="form-item">
          <text class="form-label">厂长总价：</text>
          <text class="form-value">¥{{adminTotalPrice}}/件</text>
        </view>
        
        <!-- 工序列表 -->
        <view v-for="(item, index) in newWageItems" :key="index" class="wage-item-group">
          <view class="item-header">
            <text class="item-title">工序 {{index + 1}}</text>
            <button 
              v-if="newWageItems.length > 1" 
              class="delete-item-btn"
              @click="deleteWageItemInput(index)"
            >
              删除
            </button>
          </view>
          <view class="form-item">
            <text class="form-label">工序名称：</text>
            <input type="text" v-model="item.processName" placeholder="请输入工序名称" class="form-input" />
          </view>
          <view class="form-item">
            <text class="form-label">工价（元）：</text>
            <input type="number" v-model.number="item.unitPrice" @blur="handlePriceInput(index)" placeholder="请输入工价" class="form-input" />
          </view>
        </view>
        
        <!-- 添加工序按钮 -->
        <button class="add-item-btn" @click="addWageItemInput">+ 添加工序</button>
        
        <!-- 提交按钮 -->
        <button class="add-btn" @click="addWageItems">添加工价</button>
      </view>
    </view>
    
    <view class="wage-section">
      <text class="section-title">已设置工价</text>
      <view class="wage-list">
        <!-- 按款号分组显示 -->
        <view v-for="(styleGroup, styleIndex) in groupedWageItems" :key="styleIndex" class="style-group">
          <view class="style-header">
            <text class="style-number">款号：{{styleGroup.styleNumber}}</text>
            <text class="style-invite" v-if="styleGroup.inviteCode">邀请码：{{styleGroup.inviteCode}}</text>
            <button class="style-edit-btn" @click="editStyleGroup(styleGroup)">修改</button>
          </view>
          <view class="style-processes">
            <view v-for="(process, processIndex) in styleGroup.processes" :key="processIndex" class="wage-item">
              <view class="wage-info">
                <view class="wage-details">
                  <text class="wage-process">工序：{{process.processName}}</text>
                </view>
                <text class="wage-price">{{process.unitPrice}}元</text>
              </view>
              <view class="wage-remark" v-if="process.remark">
                <text>{{process.remark}}</text>
              </view>
            </view>
          </view>
        </view>
        <view v-if="groupedWageItems.length === 0" class="empty-state">
          <text>暂无已设置的工价</text>
        </view>
      </view>
    </view>
    
    <!-- 编辑工价弹窗 -->
    <view v-if="showEditModal" class="modal">
      <view class="modal-content">
        <text class="modal-title">编辑工价</text>
        <view class="form-item">
          <text class="form-label">款号：</text>
          <input type="text" v-model="editingItem.styleNumber" placeholder="请输入款号" class="form-input" />
        </view>
        <view class="form-item">
          <text class="form-label">工序名称：</text>
          <input type="text" v-model="editingItem.processName" placeholder="请输入工序名称" class="form-input" />
        </view>
        <view class="form-item">
          <text class="form-label">工价（元）：</text>
          <input type="number" v-model.number="editingItem.unitPrice" placeholder="请输入工价" class="form-input" />
        </view>
        <view class="form-item">
          <text class="form-label">备注：</text>
          <input type="text" v-model="editingItem.remark" placeholder="请输入备注（选填）" class="form-input" />
        </view>
        <view class="form-item">
          <text class="form-label">邀请码：</text>
          <input type="text" v-model="editingItem.inviteCode" placeholder="自动生成" class="form-input" disabled />
        </view>
        <view class="modal-actions">
          <button class="cancel-btn" @click="showEditModal = false">取消</button>
          <button class="confirm-btn" @click="saveEditedItem">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      currentStyleNumber: '',
      newWageItems: [
        {
          processName: '',
          unitPrice: 0
        }
      ],
      // 厂长总价
      adminTotalPrice: 0,
      wageItems: [],
      showEditModal: false,
      editingItem: {
        styleNumber: '',
        processName: '',
        unitPrice: 0,
        remark: ''
      },
      editingIndex: -1,
      // 完整订单数据
      orders: []
    }
  },
  onLoad() {
    this.loadOrders()
    this.loadWageItems()
  },
  computed: {
    // 按款号分组工价数据
    groupedWageItems() {
      const grouped = {}
      
      // 按款号分组
      this.wageItems.forEach(item => {
        if (!grouped[item.styleNumber]) {
          grouped[item.styleNumber] = {
            styleNumber: item.styleNumber,
            inviteCode: item.inviteCode,
            processes: []
          }
        }
        grouped[item.styleNumber].processes.push({
          processName: item.processName,
          unitPrice: item.unitPrice,
          remark: item.remark,
          originalIndex: this.wageItems.indexOf(item)
        })
      })
      
      // 转换为数组
      return Object.values(grouped)
    }
  },
  methods: {
    // 加载订单
    loadOrders() {
      const orders = uni.getStorageSync('orders') || []
      const userInfo = uni.getStorageSync('userInfo') || {}
      
      let filteredOrders = []
      
      if (userInfo.role === '厂长') {
        // 厂长只能看到自己产线的订单
        const users = uni.getStorageSync('users') || []
        const currentUser = users.find(u => u.username === userInfo.username)
        
        if (currentUser && currentUser.productionLines && currentUser.productionLines.length > 0) {
          filteredOrders = orders.filter(order => 
            currentUser.productionLines.includes(order.productionLine)
          )
        }
      } else {
        // 企业用户可以看到所有订单
        filteredOrders = orders
      }
      
      this.orders = filteredOrders
    },
    loadWageItems() {
      // 从本地存储加载工价数据
      const savedWageItems = uni.getStorageSync('wageItems') || []
      const userInfo = uni.getStorageSync('userInfo') || {}
      
      let filteredWageItems = savedWageItems
      
      if (userInfo.role === '厂长') {
        // 厂长只能看到自己产线相关的工价
        // 获取厂长产线的订单款号
        const users = uni.getStorageSync('users') || []
        const currentUser = users.find(u => u.username === userInfo.username)
        
        if (currentUser && currentUser.productionLines && currentUser.productionLines.length > 0) {
          // 获取厂长产线的订单款号
          const lineOrders = this.orders.filter(order => 
            currentUser.productionLines.includes(order.productionLine)
          )
          const lineStyleNumbers = lineOrders.map(order => order.styleNumber)
          
          // 过滤工价项
          filteredWageItems = savedWageItems.filter(wage => 
            lineStyleNumbers.includes(wage.styleNumber)
          )
        }
      }
      
      this.wageItems = filteredWageItems
    },
    saveWageItems() {
      // 保存工价数据到本地存储
      uni.setStorageSync('wageItems', this.wageItems)
    },
    onStyleNumberChange() {
      // 当款号变化时，从本地存储加载对应的车缝总价作为厂长总价
      if (this.currentStyleNumber) {
        const sewingTotalPrices = uni.getStorageSync('sewingTotalPrices') || {}
        if (sewingTotalPrices[this.currentStyleNumber]) {
          this.adminTotalPrice = sewingTotalPrices[this.currentStyleNumber]
        } else {
          this.adminTotalPrice = 0
        }
      } else {
        this.adminTotalPrice = 0
      }
    },
    
    // 添加新的工序输入项
    addWageItemInput() {
      this.newWageItems.push({
        processName: '',
        unitPrice: 0
      })
    },
    
    // 删除工序输入项
    deleteWageItemInput(index) {
      if (this.newWageItems.length > 1) {
        this.newWageItems.splice(index, 1)
      } else {
        uni.showToast({
          title: '至少保留一个工序',
          icon: 'none'
        })
      }
    },
    
    // 处理价格输入完成
    handlePriceInput(index) {
      const currentItem = this.newWageItems[index]
      // 如果当前工序的价格已输入，且是最后一个工序，则自动添加下一个工序
      if (currentItem.unitPrice > 0 && index === this.newWageItems.length - 1) {
        this.newWageItems.push({
          processName: '',
          unitPrice: 0,
          remark: ''
        })
      }
    },
    
    // 批量添加多个工序的工价
    addWageItems() {
      if (!this.currentStyleNumber) {
        uni.showToast({
          title: '请输入款号',
          icon: 'none'
        })
        return
      }
      
      // 过滤出有效的工序
      const validWageItems = this.newWageItems.filter(item => 
        item.processName && item.unitPrice > 0
      )
      
      if (validWageItems.length === 0) {
        uni.showToast({
          title: '请至少填写一个有效的工序信息',
          icon: 'none'
        })
        return
      }
      
      // 计算整款总价
      const totalPrice = validWageItems.reduce((sum, item) => sum + item.unitPrice, 0)
      
      // 显示整款总价，确认提交
      uni.showModal({
        title: '确认提交',
        content: `款号：${this.currentStyleNumber}\n\n共 ${validWageItems.length} 个工序\n整款总价：¥${totalPrice.toFixed(2)}/件\n\n确认提交并生成邀请码？`,
        confirmText: '确认提交',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            // 生成邀请码（使用款号的前4位+随机4位数字）
            const randomPart = Math.floor(1000 + Math.random() * 9000)
            const inviteCode = this.currentStyleNumber.substring(0, 4).toUpperCase() + randomPart
            
            // 批量添加工价
            validWageItems.forEach(item => {
              this.wageItems.push({
                styleNumber: this.currentStyleNumber,
                processName: item.processName,
                unitPrice: item.unitPrice,
                inviteCode: inviteCode
              })
            })
            
            // 保存到本地存储
            this.saveWageItems()
            
            // 生成换款号通知
            this.generateStyleChangeNotification(this.currentStyleNumber)
            
            // 重置表单
            this.newWageItems = [
              {
                processName: '',
                unitPrice: 0,
                remark: ''
              }
            ]
            
            // 显示邀请码
            uni.showModal({
              title: '工价添加成功',
              content: `邀请码：${inviteCode}\n\n共添加了 ${validWageItems.length} 个工序工价\n整款总价：¥${totalPrice.toFixed(2)}/件\n\n请将邀请码分享给工人，工人输入邀请码后即可关联价格。`,
              confirmText: '复制邀请码',
              cancelText: '确定',
              success: (res) => {
                if (res.confirm) {
                  // 复制邀请码到剪贴板
                  uni.setClipboardData({
                    data: inviteCode,
                    success: () => {
                      uni.showToast({
                        title: '邀请码已复制',
                        icon: 'success'
                      })
                    }
                  })
                }
              }
            })
          }
        }
      })
    },
    
    // 生成换款号通知
    generateStyleChangeNotification(styleNumber) {
      // 获取当前用户信息
      const userInfo = uni.getStorageSync('userInfo') || {}
      
      // 创建通知对象
      const notification = {
        id: Date.now() + Math.random(),
        title: '换款号提醒',
        content: `组长已设置新工价，款号：${styleNumber}`,
        styleNumber: styleNumber,
        type: 'style_change',
        createdAt: new Date().toISOString(),
        isRead: false,
        sender: userInfo.username || '系统'
      }
      
      // 获取现有通知
      const notifications = uni.getStorageSync('notifications') || []
      
      // 添加新通知
      notifications.push(notification)
      
      // 保存通知到本地存储
      uni.setStorageSync('notifications', notifications)
      
      console.log('生成换款号通知:', notification)
    },
    editWageItem(index) {
      // 打开编辑弹窗
      this.editingItem = { ...this.wageItems[index] }
      this.editingIndex = index
      this.showEditModal = true
    },
    saveEditedItem() {
      if (!this.editingItem.processName || this.editingItem.unitPrice <= 0) {
        uni.showToast({
          title: '请填写完整的工价信息',
          icon: 'none'
        })
        return
      }
      
      // 保存编辑
      this.wageItems[this.editingIndex] = { ...this.editingItem }
      
      // 保存到本地存储
      this.saveWageItems()
      
      // 关闭弹窗
      this.showEditModal = false
      
      // 检查是否有邀请码，如果没有则生成
      if (!this.editingItem.inviteCode) {
        const randomPart = Math.floor(1000 + Math.random() * 9000)
        const inviteCode = this.editingItem.styleNumber.substring(0, 4).toUpperCase() + randomPart
        this.wageItems[this.editingIndex].inviteCode = inviteCode
        this.saveWageItems()
        
        uni.showModal({
          title: '工价编辑成功',
          content: `邀请码：${inviteCode}\n\n请将邀请码分享给工人，工人输入邀请码后即可关联价格。`,
          confirmText: '复制邀请码',
          cancelText: '确定',
          success: (res) => {
            if (res.confirm) {
              // 复制邀请码到剪贴板
              uni.setClipboardData({
                data: inviteCode,
                success: () => {
                  uni.showToast({
                    title: '邀请码已复制',
                    icon: 'success'
                  })
                }
              })
            }
          }
        })
      } else {
        uni.showModal({
          title: '工价编辑成功',
          content: `邀请码：${this.editingItem.inviteCode}\n\n请将邀请码分享给工人，工人输入邀请码后即可关联价格。`,
          confirmText: '复制邀请码',
          cancelText: '确定',
          success: (res) => {
            if (res.confirm) {
              // 复制邀请码到剪贴板
              uni.setClipboardData({
                data: this.editingItem.inviteCode,
                success: () => {
                  uni.showToast({
                    title: '邀请码已复制',
                    icon: 'success'
                  })
                }
              })
            }
          }
        })
      }
    },
    deleteWageItem(index) {
      uni.showModal({
        title: '删除工价',
        content: '确定要删除这个工价吗？',
        confirmText: '确定',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            // 删除工价
            this.wageItems.splice(index, 1)
            
            // 保存到本地存储
            this.saveWageItems()
            
            uni.showToast({
              title: '工价删除成功',
              icon: 'success'
            })
          }
        }
      })
    },
    
    // 修改整个款号的工价
    editStyleGroup(styleGroup) {
      // 填充款号
      this.currentStyleNumber = styleGroup.styleNumber
      // 填充工序
      this.newWageItems = styleGroup.processes.map(process => ({
        processName: process.processName,
        unitPrice: process.unitPrice
      }))
      // 触发款号变化，加载厂长总价
      this.onStyleNumberChange()
      // 显示提示
      uni.showToast({
        title: '已加载款号工序，可直接修改',
        icon: 'success'
      })
    }
  }
}
</script>

<style scoped>
.set-wage-container {
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

.wage-section {
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

.wage-form {
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

.form-value {
  flex: 1;
  height: 70rpx;
  line-height: 70rpx;
  font-size: 24rpx;
  color: #4A90E2;
  font-weight: bold;
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

/* 工价项组样式 */
.wage-item-group {
  margin-bottom: 20rpx;
  padding: 20rpx;
  background-color: #f9f9f9;
  border-radius: 10rpx;
  border: 1rpx solid #e8e8e8;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
  padding-bottom: 10rpx;
  border-bottom: 1rpx solid #e8e8e8;
}

.item-title {
  font-size: 24rpx;
  font-weight: bold;
  color: #333;
}

.delete-item-btn {
  padding: 8rpx 15rpx;
  background-color: #fff1f0;
  color: #ff4d4f;
  font-size: 20rpx;
  border-radius: 10rpx;
}

/* 添加工序按钮 */
.add-item-btn {
  width: 100%;
  height: 60rpx;
  background-color: #f6ffed;
  color: #52c41a;
  font-size: 22rpx;
  border-radius: 10rpx;
  margin: 10rpx 0;
}

.wage-list {
  margin-top: 10rpx;
}

.wage-item {
  background-color: #f9f9f9;
  border-radius: 10rpx;
  padding: 20rpx;
  margin-bottom: 15rpx;
}

.wage-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10rpx;
}

.wage-details {
  flex: 1;
  margin-right: 15rpx;
}

.wage-style {
  display: block;
  font-size: 24rpx;
  color: #666;
  margin-bottom: 5rpx;
}

.wage-process {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 5rpx;
}

.wage-invite {
  display: block;
  font-size: 22rpx;
  color: #4A90E2;
  font-weight: bold;
  margin-top: 5rpx;
  padding: 5rpx;
  background-color: #e6f7ff;
  border-radius: 5rpx;
}

.wage-price {
  font-size: 26rpx;
  font-weight: bold;
  color: #4A90E2;
  min-width: 100rpx;
  text-align: right;
}

.wage-remark {
  font-size: 22rpx;
  color: #666;
  margin-bottom: 15rpx;
  padding-left: 10rpx;
  border-left: 3rpx solid #4A90E2;
}

.wage-actions {
  display: flex;
  gap: 10rpx;
  justify-content: flex-end;
}

.edit-btn {
  flex: 1;
  height: 60rpx;
  background-color: #f0f0f0;
  color: #333;
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

.empty-state {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 24rpx;
}

/* 款号分组样式 */
.style-group {
  margin-bottom: 30rpx;
  padding: 20rpx;
  background-color: #f9f9f9;
  border-radius: 15rpx;
  border: 2rpx solid #4A90E2;
}

.style-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
  padding-bottom: 15rpx;
  border-bottom: 1rpx solid #e8e8e8;
}

.style-number {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
}

.style-invite {
  font-size: 22rpx;
  color: #4A90E2;
  font-weight: bold;
  margin: 0 15rpx;
  padding: 5rpx 10rpx;
  background-color: #e6f7ff;
  border-radius: 10rpx;
}

.style-edit-btn {
  padding: 8rpx 20rpx;
  background-color: #4A90E2;
  color: #fff;
  font-size: 20rpx;
  border-radius: 10rpx;
}

.style-processes {
  margin-top: 10rpx;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-content {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 30rpx;
  width: 80%;
  max-width: 500rpx;
}

.modal-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 20rpx;
}

.modal-actions {
  display: flex;
  gap: 15rpx;
  margin-top: 30rpx;
}

.cancel-btn {
  flex: 1;
  height: 70rpx;
  background-color: #f0f0f0;
  color: #333;
  font-size: 24rpx;
  border-radius: 10rpx;
}

.confirm-btn {
  flex: 1;
  height: 70rpx;
  background-color: #4A90E2;
  color: #fff;
  font-size: 24rpx;
  border-radius: 10rpx;
}
</style>