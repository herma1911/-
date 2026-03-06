<template>
  <view class="expense-input-container">
    <view class="form-section">
      <text class="form-title">开支录入</text>
      <view class="form-item">
        <text class="form-label">日期</text>
        <picker mode="date" :value="expenseDate" start="2023-01-01" end="2026-12-31" @change="bindDateChange">
          <view class="picker">{{expenseDate}}</view>
        </picker>
      </view>
      <view class="form-item">
        <text class="form-label">金额</text>
        <input type="number" v-model="amount" placeholder="请输入金额" class="form-input" />
      </view>
      <view class="form-item">
        <text class="form-label">快捷一键记</text>
        <view class="quick-buttons-container">
          <view class="quick-buttons" :style="{ width: quickExpenses.length > 4 ? (quickExpenses.length * 50 + 15 * (quickExpenses.length - 1)) + '%' : '100%' }">
            <view 
              v-for="(item, index) in quickExpenses" 
              :key="item.id"
              class="quick-btn"
              @tap="quickExpense(item.amount, item.category)"
              @longpress="showQuickMenu(item, index)"
            >
              <text class="quick-amount">¥{{item.amount}}</text>
              <text class="quick-label">{{item.label}}</text>
            </view>
            <view class="quick-btn add-btn" @tap="showAddQuickItem">
              <text class="add-icon">+</text>
              <text class="add-label">添加</text>
            </view>
          </view>
        </view>
      </view>
      <view class="form-item">
        <text class="form-label">分类</text>
        <view class="category-grid">
          <view 
            v-for="(category, index) in categories" 
            :key="index"
            :class="['category-item', selectedCategory === category ? 'selected' : '']"
            @click="selectCategory(category)"
          >
            {{category}}
          </view>
        </view>
        <view v-if="selectedCategory === '其他'" class="form-item">
          <text class="form-label">其他分类</text>
          <input type="text" v-model="otherCategory" placeholder="请输入其他分类" class="form-input" />
        </view>
      </view>
      <view class="form-item">
        <text class="form-label">备注</text>
        <textarea v-model="remark" placeholder="请输入备注信息" class="form-textarea" />
      </view>
    </view>
    <view class="button-section">
      <button type="primary" class="submit-button" @click="submitExpense">提交</button>
      <button type="default" class="cancel-button" @click="cancel">取消</button>
    </view>
    
    <!-- 快捷项编辑/添加弹窗 -->
    <view v-if="showQuickItemDialog" class="dialog-mask" @click="closeQuickItemPopup">
      <view class="dialog-content" @click.stop>
        <text class="dialog-title">{{editingQuickItem ? '编辑快捷项' : '添加快捷项'}}</text>
        <view class="dialog-form">
          <view class="dialog-form-item">
            <text class="dialog-label">金额</text>
            <input type="number" v-model="quickItemForm.amount" placeholder="请输入金额" class="dialog-input" />
          </view>
          <view class="dialog-form-item">
            <text class="dialog-label">备注</text>
            <input type="text" v-model="quickItemForm.label" placeholder="如'早餐'、'咖啡'" class="dialog-input" />
          </view>
          <view class="dialog-form-item">
            <text class="dialog-label">分类</text>
            <view class="dialog-category-grid">
              <view 
                v-for="(category, index) in categories" 
                :key="index"
                :class="['dialog-category-item', quickItemForm.category === category ? 'selected' : '']"
                @click="quickItemForm.category = category"
              >
                {{category}}
              </view>
            </view>
          </view>
        </view>
        <view class="dialog-buttons">
          <button type="default" class="dialog-button cancel" @click="closeQuickItemPopup">取消</button>
          <button type="primary" class="dialog-button confirm" @click="saveQuickItem">确定</button>
        </view>
      </view>
    </view>
    
    <!-- 删除确认弹窗 -->
    <view v-if="showDeleteConfirmDialog" class="dialog-mask" @click="closeDeleteConfirmPopup">
      <view class="dialog-content delete-confirm" @click.stop>
        <text class="dialog-title">确认删除</text>
        <text class="delete-message">确定要删除这个快捷项吗？删除后可重新添加。</text>
        <view class="dialog-buttons">
          <button type="default" class="dialog-button cancel" @click="closeDeleteConfirmPopup">取消</button>
          <button type="primary" class="dialog-button confirm delete" @click="confirmDeleteQuickItem">确认删除</button>
        </view>
      </view>
    </view>
    
    <!-- 快捷项操作菜单 -->
    <view v-if="showQuickMenuDialog" class="dialog-mask" @click="closeQuickMenuPopup">
      <view class="menu-content" @click.stop>
        <view class="menu-item" @click="editQuickItem">编辑</view>
        <view class="menu-item delete" @click="confirmDelete">删除</view>
        <view class="menu-item cancel" @click="closeQuickMenuPopup">取消</view>
      </view>
    </view>
  </view>
</template>

<script>

export default {
  data() {
    return {
      expenseDate: new Date().toISOString().split('T')[0],
      amount: '',
      categories: ['餐饮', '住宿', '交通', '日用品', '话费', '零食烟酒', '医疗', '其他'],
      selectedCategory: '餐饮',
      otherCategory: '',
      remark: '',
      quickExpenses: [],
      editingQuickItem: false,
      quickItemForm: {
        amount: '',
        label: '',
        category: '餐饮'
      },
      currentQuickItemIndex: -1,
      showQuickItemDialog: false,
      showDeleteConfirmDialog: false,
      showQuickMenuDialog: false
    }
  },
  onLoad() {
    this.loadQuickExpenses()
  },
  methods: {
    bindDateChange(e) {
      this.expenseDate = e.detail.value
    },
    selectCategory(category) {
      this.selectedCategory = category
      if (category !== '其他') {
        this.otherCategory = ''
      }
    },
    quickExpense(amount, category) {
      this.amount = amount.toString()
      this.selectedCategory = category
      this.submitExpense()
    },
    submitExpense() {
      if (!this.amount) {
        uni.showToast({
          title: '请输入金额',
          icon: 'none'
        })
        return
      }
      
      let category = this.selectedCategory
      if (category === '其他' && this.otherCategory) {
        category = this.otherCategory
      }
      
      const expenseData = {
        date: this.expenseDate,
        amount: this.amount,
        category: category,
        remark: this.remark,
        createTime: new Date().toISOString()
      }
      
      // 保存到本地存储
      let expenses = uni.getStorageSync('expenses') || []
      expenses.push(expenseData)
      uni.setStorageSync('expenses', expenses)
      
      // 支出具象化提示
      const amountNum = parseFloat(this.amount)
      let tipMessage = `今日支出 ${amountNum} 元，相当于少攒了 ${Math.ceil(amountNum / 50)} 件衣服的钱，明天继续加油攒钱～`
      
      uni.showToast({
        title: tipMessage,
        icon: 'none',
        duration: 3000
      })
      
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    },
    cancel() {
      uni.navigateBack()
    },
    // 加载快捷支出项
    loadQuickExpenses() {
      const savedQuickExpenses = uni.getStorageSync('quickExpenses')
      if (savedQuickExpenses && savedQuickExpenses.length > 0) {
        this.quickExpenses = savedQuickExpenses
      } else {
        // 默认快捷项
        this.quickExpenses = [
          { id: 1, amount: 30, label: '餐饮', category: '餐饮' },
          { id: 2, amount: 10, label: '交通', category: '交通' },
          { id: 3, amount: 50, label: '购物', category: '日用品' },
          { id: 4, amount: 20, label: '其他', category: '其他' }
        ]
        this.saveQuickExpenses()
      }
    },

    // 保存快捷支出项
    saveQuickExpenses() {
      uni.setStorageSync('quickExpenses', this.quickExpenses)
    },
    // 显示添加快捷项弹窗
    showAddQuickItem() {
      this.editingQuickItem = false
      this.quickItemForm = {
        amount: '',
        label: '',
        category: '餐饮'
      }
      this.showQuickItemDialog = true
    },
    // 显示快捷项操作菜单
    showQuickMenu(item, index) {
      this.currentQuickItemIndex = index
      this.showQuickMenuDialog = true
    },
    // 编辑快捷项
    editQuickItem() {
      const item = this.quickExpenses[this.currentQuickItemIndex]
      this.editingQuickItem = true
      this.quickItemForm = {
        amount: item.amount.toString(),
        label: item.label,
        category: item.category
      }
      this.showQuickMenuDialog = false
      this.showQuickItemDialog = true
    },
    // 确认删除
    confirmDelete() {
      this.showQuickMenuDialog = false
      this.showDeleteConfirmDialog = true
    },
    // 确认删除快捷项
    confirmDeleteQuickItem() {
      this.quickExpenses.splice(this.currentQuickItemIndex, 1)
      this.saveQuickExpenses()
      this.showDeleteConfirmDialog = false
    },
    // 保存快捷项
    saveQuickItem() {
      if (!this.quickItemForm.amount || !this.quickItemForm.label) {
        uni.showToast({
          title: '请填写金额和备注',
          icon: 'none'
        })
        return
      }
      
      if (this.editingQuickItem) {
        // 编辑现有项
        this.quickExpenses[this.currentQuickItemIndex] = {
          ...this.quickExpenses[this.currentQuickItemIndex],
          amount: parseFloat(this.quickItemForm.amount),
          label: this.quickItemForm.label,
          category: this.quickItemForm.category
        }
      } else {
        // 添加新项
        const newItem = {
          id: Date.now(),
          amount: parseFloat(this.quickItemForm.amount),
          label: this.quickItemForm.label,
          category: this.quickItemForm.category
        }
        this.quickExpenses.push(newItem)
      }
      
      this.saveQuickExpenses()
      this.showQuickItemDialog = false
    },
    // 关闭快捷项弹窗
    closeQuickItemPopup() {
      this.showQuickItemDialog = false
    },
    // 关闭删除确认弹窗
    closeDeleteConfirmPopup() {
      this.showDeleteConfirmDialog = false
    },
    // 关闭快捷项操作菜单
    closeQuickMenuPopup() {
      this.showQuickMenuDialog = false
    }
  }
}
</script>

<style scoped>
.expense-input-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.form-section {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.form-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
  display: block;
  text-align: center;
}

.form-item {
  margin-bottom: 30rpx;
}

.form-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.form-input {
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
  background-color: #f9f9f9;
}

.form-textarea {
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
  background-color: #f9f9f9;
  min-height: 150rpx;
}

.picker {
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
  background-color: #f9f9f9;
}

.button-section {
  margin-top: 30rpx;
  display: flex;
  gap: 20rpx;
}

.submit-button {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 30rpx;
  background-color: #4A90E2;
}

.cancel-button {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 30rpx;
}

/* 快捷按钮样式 */
.quick-buttons-container {
  overflow-x: auto;
  margin-top: 10rpx;
  padding-bottom: 10rpx;
  -webkit-overflow-scrolling: touch;
}

.quick-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15rpx;
  min-width: 100%;
}

.quick-btn {
  padding: 25rpx;
  border: 2rpx solid #ff7a45;
  border-radius: 12rpx;
  text-align: center;
  background: linear-gradient(135deg, #fff7f0 0%, #fff0e6 100%);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 120rpx;
}

.quick-btn:active {
  background: linear-gradient(135deg, #ff7a45 0%, #ff9a61 100%);
  color: #fff;
  transform: scale(0.98);
}

.quick-amount {
  font-size: 28rpx;
  font-weight: 600;
  color: #ff7a45;
  display: block;
  margin-bottom: 5rpx;
}

.quick-label {
  font-size: 24rpx;
  color: #666;
}

/* 添加按钮样式 */
.add-btn {
  border: 2rpx dashed #ff7a45;
  background: #fff;
}

.add-icon {
  font-size: 40rpx;
  color: #ff7a45;
  margin-bottom: 5rpx;
}

.add-label {
  font-size: 24rpx;
  color: #ff7a45;
}

/* 分类网格样式 */
.category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15rpx;
  margin-top: 10rpx;
}

.category-item {
  padding: 20rpx;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  text-align: center;
  font-size: 24rpx;
  background-color: #f9f9f9;
  transition: all 0.3s ease;
}

.category-item:active {
  background-color: #e8f4f8;
}

.category-item.selected {
  background-color: #4A90E2;
  color: white;
  border-color: #4A90E2;
}

/* 弹窗样式 */
.dialog-mask {
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

.dialog-content {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 30rpx;
  width: 80%;
  max-width: 500rpx;
}

.dialog-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 30rpx;
  display: block;
}

.dialog-form {
  margin-bottom: 30rpx;
}

.dialog-form-item {
  margin-bottom: 20rpx;
}

.dialog-label {
  font-size: 26rpx;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.dialog-input {
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 26rpx;
  background-color: #f9f9f9;
}

.dialog-category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10rpx;
  margin-top: 10rpx;
}

.dialog-category-item {
  padding: 15rpx;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  text-align: center;
  font-size: 22rpx;
  background-color: #f9f9f9;
  transition: all 0.3s ease;
}

.dialog-category-item:active {
  background-color: #e8f4f8;
}

.dialog-category-item.selected {
  background-color: #4A90E2;
  color: white;
  border-color: #4A90E2;
}

.dialog-buttons {
  display: flex;
  gap: 15rpx;
  margin-top: 20rpx;
}

.dialog-button {
  flex: 1;
  height: 70rpx;
  border-radius: 35rpx;
  font-size: 28rpx;
}

.dialog-button.cancel {
  background-color: #f5f5f5;
  color: #333;
}

.dialog-button.confirm {
  background-color: #4A90E2;
  color: white;
}

.dialog-button.confirm.delete {
  background-color: #ff4d4f;
}

/* 删除确认弹窗 */
.delete-confirm {
  text-align: center;
}

.delete-message {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 30rpx;
  line-height: 1.5;
}

/* 操作菜单样式 */
.menu-content {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  border-top-left-radius: 15rpx;
  border-top-right-radius: 15rpx;
  padding: 20rpx;
  z-index: 1000;
}

.menu-item {
  padding: 25rpx;
  text-align: center;
  font-size: 28rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.menu-item:last-child {
  border-bottom: none;
  margin-top: 20rpx;
  color: #999;
}

.menu-item.delete {
  color: #ff4d4f;
}

/* 滚动条样式 */
.quick-buttons-container::-webkit-scrollbar {
  height: 6rpx;
}

.quick-buttons-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3rpx;
}

.quick-buttons-container::-webkit-scrollbar-thumb {
  background: #ff7a45;
  border-radius: 3rpx;
}

.quick-buttons-container::-webkit-scrollbar-thumb:hover {
  background: #ff9a61;
}
</style>