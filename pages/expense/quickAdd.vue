<template>
  <view class="quick-add-page">
    <!-- 顶部固定导航栏 -->
    <view class="nav-header">
      <text class="nav-back" @tap="goBack">返回</text>
      <view class="nav-title-container" @tap="showBookList">
        <text class="nav-title">{{ currentBook.name }}</text>
        <text class="nav-title-arrow">▼</text>
      </view>
      <text class="nav-monthly-expense">本月已支出：¥{{ monthlyExpense }}</text>
      <text class="nav-history" @tap="goToHistory">历史账单</text>
    </view>
    
    <!-- 轻量化手动记账区 -->
    <view class="manual-section">
      <input 
        type="number" 
        v-model.number="manualAmount" 
        class="amount-input" 
        placeholder="¥0.00" 
        @input="handleManualAmountInput"
        autofocus
      />
      <view class="date-section" v-if="showDateSection">
        <text class="date-label">支出日期：{{ currentDateText }}</text>
        <text class="date-icon" @tap="showDatePicker = true">📅</text>
      </view>
      <view class="category-selector">
        <text class="category-label">分类</text>
        <picker v-model="manualCategoryIndex" :range="categories" class="category-picker">
          <text class="picker-text">{{ categories[manualCategoryIndex] }}</text>
        </picker>
      </view>
    </view>
    
    <!-- 核心快捷卡片网格区 -->
    <view class="cards-section">
      <view class="cards-grid">
        <view 
          v-for="card in quickCards" 
          :key="card.id"
          class="card"
          @tap="saveCardExpense(card)"
          @longpress="showCardActions(card)"
        >
          <text class="card-name">{{ card.name }}</text>
          <text class="card-amount">¥{{ card.amount }}</text>
        </view>
        <!-- 添加卡片 -->
        <view class="card add-card" @tap="showAddModal = true">
          <text class="add-icon">+</text>
          <text class="add-text">添加常用支出</text>
        </view>
      </view>
    </view>
    
    <!-- 底部功能区 -->
    <view class="bottom-section">
      <text class="date-toggle" @tap="showDateSection = !showDateSection">📅 {{ showDateSection ? '隐藏日期' : '补记日期' }}</text>
    </view>
    
    <!-- 日期选择器 -->
    <view v-if="showDatePicker" class="modal-overlay" @tap="showDatePicker = false">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-cancel" @tap="showDatePicker = false">取消</text>
          <text class="modal-title">选择日期</text>
          <text class="modal-confirm" @tap="confirmDate">确认</text>
        </view>
        <input type="date" v-model="expenseDate" class="date-input" />
      </view>
    </view>
    
    <!-- 添加卡片弹窗 -->
    <view v-if="showAddModal" class="modal-overlay" @tap="closeAddModal">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-cancel" @tap="closeAddModal">取消</text>
          <text class="modal-title">添加常用支出</text>
          <text class="modal-confirm" @tap="addQuickCard">确认</text>
        </view>
        <view class="form-group">
          <text class="form-label">支出名称</text>
          <input type="text" v-model="newCard.name" class="form-input" placeholder="如：早餐" />
        </view>
        <view class="form-group">
          <text class="form-label">默认金额</text>
          <input type="number" v-model.number="newCard.amount" class="form-input" placeholder="如：6" />
        </view>
        <view class="form-group">
          <text class="form-label">绑定分类</text>
          <picker v-model="newCard.categoryIndex" :range="categories" class="form-picker">
            <text class="picker-text">{{ categories[newCard.categoryIndex] }}</text>
          </picker>
        </view>
      </view>
    </view>
    
    <!-- 编辑卡片弹窗 -->
    <view v-if="showEditModal" class="modal-overlay" @tap="closeEditModal">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-cancel" @tap="closeEditModal">取消</text>
          <text class="modal-title">编辑卡片</text>
          <text class="modal-confirm" @tap="updateQuickCard">确认</text>
        </view>
        <view class="form-group">
          <text class="form-label">支出名称</text>
          <input type="text" v-model="editingCard.name" class="form-input" />
        </view>
        <view class="form-group">
          <text class="form-label">默认金额</text>
          <input type="number" v-model.number="editingCard.amount" class="form-input" />
        </view>
        <view class="form-group">
          <text class="form-label">绑定分类</text>
          <picker v-model="editingCard.categoryIndex" :range="categories" class="form-picker">
            <text class="picker-text">{{ categories[editingCard.categoryIndex] }}</text>
          </picker>
        </view>
      </view>
    </view>
    
    <!-- 修改金额弹窗 -->
    <view v-if="showAmountModal" class="modal-overlay" @tap="closeAmountModal">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-cancel" @tap="closeAmountModal">取消</text>
          <text class="modal-title">修改默认金额</text>
          <text class="modal-confirm" @tap="updateCardAmount">确认</text>
        </view>
        <view class="form-group">
          <text class="form-label">新金额</text>
          <input type="number" v-model.number="editingAmount" class="form-input" placeholder="请输入新金额" />
        </view>
      </view>
    </view>
    
    <!-- 账本管理弹窗 -->
    <view v-if="showBookModal" class="modal-overlay" @tap="closeBookModal">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-cancel" @tap="closeBookModal">取消</text>
          <text class="modal-title">选择账本</text>
          <text class="modal-confirm" @tap="closeBookModal">完成</text>
        </view>
        <view class="book-list">
          <view 
            v-for="book in accountBooks" 
            :key="book.id"
            class="book-item"
            :class="{ 'active': book.id === currentBook.id }"
            @tap="switchBook(book)"
            @longpress="book.id !== 1 && showBookActions(book)"
          >
            <text class="book-name">{{ book.name }}</text>
            <text v-if="book.id === currentBook.id" class="book-check">✓</text>
          </view>
          <view class="book-item add-book" @tap="openAddBookDialog">
            <text class="add-book-icon">+</text>
            <text class="add-book-text">新建账本</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 新建账本弹窗 -->
    <view v-if="showAddBookModal" class="modal-overlay" @tap="closeAddBookModal">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-cancel" @tap="closeAddBookModal">取消</text>
          <text class="modal-title">新建账本</text>
          <text class="modal-confirm" @tap="addAccountBook">确认</text>
        </view>
        <view class="form-group">
          <text class="form-label">账本名称</text>
          <input type="text" v-model="newBook.name" class="form-input" placeholder="如：家庭账本" />
        </view>
      </view>
    </view>
    
    <!-- 编辑账本弹窗 -->
    <view v-if="showEditBookModal" class="modal-overlay" @tap="closeEditBookModal">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-cancel" @tap="closeEditBookModal">取消</text>
          <text class="modal-title">修改账本名称</text>
          <text class="modal-confirm" @tap="updateAccountBook">确认</text>
        </view>
        <view class="form-group">
          <text class="form-label">账本名称</text>
          <input type="text" v-model="editingBook.name" class="form-input" />
        </view>
      </view>
    </view>
    

  </view>
</template>

<script>
export default {
  data() {
    return {
      // 账本相关
      accountBooks: [],
      currentBook: { id: 1, name: '个人账本', type: 'personal', isDefault: true, createTime: new Date().toISOString() },
      showBookModal: false,
      showAddBookModal: false,
      showEditBookModal: false,
      newBook: { name: '' },
      editingBook: { id: '', name: '' },
      
      // 核心数据
      quickCards: [],
      manualAmount: 0,
      manualCategoryIndex: 7, // 默认其他
      expenseDate: new Date().toISOString().split('T')[0],
      showDatePicker: false,
      showAddModal: false,
      showEditModal: false,
      showAmountModal: false,
      selectedCard: null,
      editingCard: {
        id: '',
        name: '',
        amount: 0,
        categoryIndex: 7
      },
      editingAmount: 0,
      newCard: {
        name: '',
        amount: 0,
        categoryIndex: 7
      },
      categories: ['伙食费', '房租水电', '话费网费', '日用品', '交通出行', '看病买药', '子女家用', '其他'],
      showDateSection: false

    }
  },
  computed: {
    currentDateText() {
      const date = new Date()
      return `${date.getMonth() + 1}月${date.getDate()}日`
    },
    monthlyExpense() {
      const records = uni.getStorageSync('workRecords') || []
      const currentMonth = new Date().getMonth() + 1
      const currentYear = new Date().getFullYear()
      
      return records
        .filter(record => {
          if (record.type !== 'expense') return false
          if (record.bookId !== this.currentBook.id) return false
          const recordDate = new Date(record.date)
          return recordDate.getFullYear() === currentYear && recordDate.getMonth() + 1 === currentMonth
        })
        .reduce((total, record) => total + record.amount, 0)
    },

  },
  onLoad() {
    this.loadAccountBooks()
    this.loadQuickCards()
  },
  methods: {
    // 加载账本
    loadAccountBooks() {
      let books = uni.getStorageSync('accountBooks') || []
      
      // 首次使用预置模板
      if (books.length === 0) {
        books = [
          { id: 1, name: '个人账本', type: 'personal', isDefault: true, createTime: new Date().toISOString() },
          { id: 2, name: '家庭账本', type: 'family', isDefault: false, createTime: new Date().toISOString() },
          { id: 3, name: '班组/团队账本', type: 'team', isDefault: false, createTime: new Date().toISOString() }
        ]
        uni.setStorageSync('accountBooks', books)
      }
      
      this.accountBooks = books
      // 设置当前账本为默认账本
      this.currentBook = books.find(book => book.isDefault) || books[0]
    },
    
    // 加载快捷卡片
    loadQuickCards() {
      let cards = uni.getStorageSync('expenseQuickCards') || []
      
      // 过滤当前账本的卡片
      cards = cards.filter(card => card.bookId === this.currentBook.id)
      
      // 首次使用预置模板
      if (cards.length === 0) {
        const defaultCards = [
          { id: Date.now() + 1, name: '早餐', amount: 6, category: '伙食费', useCount: 0, createTime: new Date().toISOString(), bookId: this.currentBook.id },
          { id: Date.now() + 2, name: '午餐', amount: 12, category: '伙食费', useCount: 0, createTime: new Date().toISOString(), bookId: this.currentBook.id },
          { id: Date.now() + 3, name: '晚餐', amount: 15, category: '伙食费', useCount: 0, createTime: new Date().toISOString(), bookId: this.currentBook.id },
          { id: Date.now() + 4, name: '香烟', amount: 20, category: '其他', useCount: 0, createTime: new Date().toISOString(), bookId: this.currentBook.id },
          { id: Date.now() + 5, name: '房租', amount: 800, category: '房租水电', useCount: 0, createTime: new Date().toISOString(), bookId: this.currentBook.id },
          { id: Date.now() + 6, name: '话费', amount: 50, category: '话费网费', useCount: 0, createTime: new Date().toISOString(), bookId: this.currentBook.id },
          { id: Date.now() + 7, name: '日用品', amount: 30, category: '日用品', useCount: 0, createTime: new Date().toISOString(), bookId: this.currentBook.id },
          { id: Date.now() + 8, name: '交通', amount: 10, category: '交通出行', useCount: 0, createTime: new Date().toISOString(), bookId: this.currentBook.id }
        ]
        
        // 保存到本地存储
        const allCards = uni.getStorageSync('expenseQuickCards') || []
        allCards.push(...defaultCards)
        uni.setStorageSync('expenseQuickCards', allCards)
        
        cards = defaultCards
      }
      
      // 按使用次数排序
      this.quickCards = cards.sort((a, b) => b.useCount - a.useCount)
    },
    
    // 保存卡片支出
    saveCardExpense(card) {
      const record = {
        id: Date.now(),
        type: 'expense',
        date: this.expenseDate,
        amount: card.amount,
        category: card.category,
        note: card.name,
        bookId: this.currentBook.id,
        createdAt: new Date().toISOString()
      }
      
      this.saveRecord(record)
      this.updateCardUseCount(card.id)
      
      // 震动反馈
      uni.vibrateShort({})
      
      uni.showToast({
        title: `已记：${card.name} ¥${card.amount}`,
        icon: 'success',
        duration: 1500
      })
    },
    
    // 保存手动支出
    saveManualExpense() {
      if (this.manualAmount <= 0) return
      
      const record = {
        id: Date.now(),
        type: 'expense',
        date: this.expenseDate,
        amount: this.manualAmount,
        category: this.categories[this.manualCategoryIndex],
        note: '',
        bookId: this.currentBook.id,
        createdAt: new Date().toISOString()
      }
      
      this.saveRecord(record)
      
      // 震动反馈
      uni.vibrateShort({})
      
      uni.showToast({
        title: `已记：${this.categories[this.manualCategoryIndex]} ¥${this.manualAmount}`,
        icon: 'success',
        duration: 1500
      })
      
      // 重置表单
      this.manualAmount = 0
      this.manualCategoryIndex = 7
      this.expenseDate = new Date().toISOString().split('T')[0]
    },
    
    // 保存记录
    saveRecord(record) {
      const records = uni.getStorageSync('workRecords') || []
      records.push(record)
      uni.setStorageSync('workRecords', records)
    },
    
    // 更新卡片使用次数
    updateCardUseCount(cardId) {
      let cards = uni.getStorageSync('expenseQuickCards') || []
      cards = cards.map(card => {
        if (card.id === cardId) {
          return { ...card, useCount: card.useCount + 1 }
        }
        return card
      })
      uni.setStorageSync('expenseQuickCards', cards)
      this.loadQuickCards() // 重新加载并排序
    },
    
    // 显示账本列表
    showBookList() {
      this.showBookModal = true
    },
    
    // 关闭账本弹窗
    closeBookModal() {
      this.showBookModal = false
    },
    
    // 切换账本
    switchBook(book) {
      this.currentBook = book
      this.loadQuickCards()
      this.closeBookModal()
    },
    
    // 显示账本操作菜单
    showBookActions(book) {
      this.editingBook = { ...book }
      uni.showActionSheet({
        itemList: ['修改名称', '删除账本'],
        success: (res) => {
          switch (res.tapIndex) {
            case 0:
              this.showEditBookModal = true
              break
            case 1:
              this.confirmDeleteBook()
              break
          }
        }
      })
    },
    
    // 确认删除账本
    confirmDeleteBook() {
      uni.showModal({
        title: '删除确认',
        content: '确定删除该账本吗？删除后不影响已记录的账单数据',
        success: (res) => {
          if (res.confirm) {
            this.deleteAccountBook()
          }
        }
      })
    },
    
    // 删除账本
    deleteAccountBook() {
      let books = uni.getStorageSync('accountBooks') || []
      books = books.filter(book => book.id !== this.editingBook.id)
      uni.setStorageSync('accountBooks', books)
      this.loadAccountBooks()
      uni.showToast({
        title: '删除成功',
        icon: 'success'
      })
    },
    
    // 显示新建账本弹窗
    openAddBookDialog() {
      this.showAddBookModal = true
    },
    
    // 关闭新建账本弹窗
    closeAddBookModal() {
      this.showAddBookModal = false
      this.newBook = { name: '' }
    },
    
    // 添加账本
    addAccountBook() {
      if (!this.newBook.name) {
        uni.showToast({
          title: '请输入账本名称',
          icon: 'none'
        })
        return
      }
      
      let books = uni.getStorageSync('accountBooks') || []
      const newBook = {
        id: Date.now(),
        name: this.newBook.name,
        type: 'custom',
        isDefault: false,
        createTime: new Date().toISOString()
      }
      books.push(newBook)
      uni.setStorageSync('accountBooks', books)
      this.loadAccountBooks()
      this.switchBook(newBook)
      this.closeAddBookModal()
      uni.showToast({
        title: '添加成功',
        icon: 'success'
      })
    },
    
    // 关闭编辑账本弹窗
    closeEditBookModal() {
      this.showEditBookModal = false
      this.editingBook = { id: '', name: '' }
    },
    
    // 更新账本
    updateAccountBook() {
      if (!this.editingBook.name) {
        uni.showToast({
          title: '请输入账本名称',
          icon: 'none'
        })
        return
      }
      
      let books = uni.getStorageSync('accountBooks') || []
      books = books.map(book => {
        if (book.id === this.editingBook.id) {
          return { ...book, name: this.editingBook.name }
        }
        return book
      })
      uni.setStorageSync('accountBooks', books)
      this.loadAccountBooks()
      this.closeEditBookModal()
      uni.showToast({
        title: '修改成功',
        icon: 'success'
      })
    },
    

    

    
    // 显示卡片操作菜单
    showCardActions(card) {
      this.selectedCard = card
      uni.showActionSheet({
        itemList: ['修改默认金额', '编辑卡片信息', '删除卡片'],
        success: (res) => {
          switch (res.tapIndex) {
            case 0:
              this.showAmountModal = true
              this.editingAmount = card.amount
              break
            case 1:
              this.showEditModal = true
              this.editingCard = {
                id: card.id,
                name: card.name,
                amount: card.amount,
                categoryIndex: this.categories.indexOf(card.category)
              }
              break
            case 2:
              this.confirmDeleteCard()
              break
          }
        }
      })
    },
    
    // 确认删除卡片
    confirmDeleteCard() {
      uni.showModal({
        title: '删除确认',
        content: '确定删除该快捷卡片吗？删除后不影响已记录的账单',
        success: (res) => {
          if (res.confirm) {
            this.deleteQuickCard()
          }
        }
      })
    },
    
    // 删除卡片
    deleteQuickCard() {
      let cards = uni.getStorageSync('expenseQuickCards') || []
      cards = cards.filter(card => card.id !== this.selectedCard.id)
      uni.setStorageSync('expenseQuickCards', cards)
      this.loadQuickCards()
      uni.showToast({
        title: '删除成功',
        icon: 'success'
      })
    },
    
    // 更新卡片金额
    updateCardAmount() {
      if (this.editingAmount <= 0) return
      
      let cards = uni.getStorageSync('expenseQuickCards') || []
      cards = cards.map(card => {
        if (card.id === this.selectedCard.id) {
          return { ...card, amount: this.editingAmount }
        }
        return card
      })
      uni.setStorageSync('expenseQuickCards', cards)
      this.loadQuickCards()
      this.closeAmountModal()
      uni.showToast({
        title: '修改成功',
        icon: 'success'
      })
    },
    
    // 更新卡片信息
    updateQuickCard() {
      if (!this.editingCard.name || this.editingCard.amount <= 0) {
        uni.showToast({
          title: '请填写完整信息',
          icon: 'none'
        })
        return
      }
      
      let cards = uni.getStorageSync('expenseQuickCards') || []
      cards = cards.map(card => {
        if (card.id === this.editingCard.id) {
          return {
            ...card,
            name: this.editingCard.name,
            amount: this.editingCard.amount,
            category: this.categories[this.editingCard.categoryIndex]
          }
        }
        return card
      })
      uni.setStorageSync('expenseQuickCards', cards)
      this.loadQuickCards()
      this.closeEditModal()
      uni.showToast({
        title: '修改成功',
        icon: 'success'
      })
    },
    
    // 添加快捷卡片
    addQuickCard() {
      if (!this.newCard.name || this.newCard.amount <= 0) {
        uni.showToast({
          title: '请填写完整信息',
          icon: 'none'
        })
        return
      }
      
      let cards = uni.getStorageSync('expenseQuickCards') || []
      const newCard = {
        id: Date.now(),
        name: this.newCard.name,
        amount: this.newCard.amount,
        category: this.categories[this.newCard.categoryIndex],
        useCount: 0,
        createTime: new Date().toISOString(),
        bookId: this.currentBook.id
      }
      cards.push(newCard)
      uni.setStorageSync('expenseQuickCards', cards)
      this.loadQuickCards()
      this.closeAddModal()
      uni.showToast({
        title: '添加成功',
        icon: 'success'
      })
    },
    
    // 处理手动金额输入
    handleManualAmountInput() {
      if (this.manualAmount > 0) {
        // 自动保存
        this.saveManualExpense()
      }
    },
    
    // 更新手动记账分类
    updateManualCategory() {
      if (this.manualAmount > 0 && this.manualCategoryIndex === 7) {
        // 自动选择合适的分类
        this.manualCategoryIndex = 7 // 默认其他
      }
    },
    
    // 确认日期
    confirmDate() {
      this.showDatePicker = false
    },
    
    // 关闭添加卡片弹窗
    closeAddModal() {
      this.showAddModal = false
      this.newCard = {
        name: '',
        amount: 0,
        categoryIndex: 7
      }
    },
    
    // 关闭编辑卡片弹窗
    closeEditModal() {
      this.showEditModal = false
      this.editingCard = {
        id: '',
        name: '',
        amount: 0,
        categoryIndex: 7
      }
    },
    
    // 关闭修改金额弹窗
    closeAmountModal() {
      this.showAmountModal = false
      this.editingAmount = 0
    },
    
    // 返回首页
    goBack() {
      uni.navigateBack()
    },
    
    // 跳转到历史账单
    goToHistory() {
      uni.navigateTo({ url: '/pages/worker/ledger' })
    },
    
    // 跳转到固定支出管理
    goToFixedExpenses() {
      uni.navigateTo({ url: '/pages/worker/fixed-expenses' })
    }
  }
}
</script>

<style scoped>
.quick-add-page {
  min-height: 100vh;
  background-color: #f8f9fa;
}

/* 顶部导航栏 */
.nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 20rpx 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 99;
  flex-wrap: wrap;
  gap: 10rpx;
}

.nav-back {
  font-size: 32rpx;
  font-weight: 600;
  color: #666;
  flex-shrink: 0;
}

.nav-title-container {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 0 20rpx;
  border-radius: 20rpx;
  background: #f5f5f5;
  flex-shrink: 0;
}

.nav-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.nav-title-arrow {
  font-size: 24rpx;
  color: #666;
}

.nav-monthly-expense {
  font-size: 24rpx;
  color: #ff4d4f;
  font-weight: 600;
  flex-shrink: 0;
}

.nav-history {
  font-size: 28rpx;
  color: #1677ff;
  font-weight: 600;
  flex-shrink: 0;
}

/* 手动记账区 */
.manual-section {
  background: #fff;
  padding: 30rpx;
  margin: 20rpx;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

.date-section {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10rpx;
  margin-bottom: 20rpx;
  padding: 10rpx;
  background: #f5f5f5;
  border-radius: 10rpx;
}

.date-label {
  font-size: 24rpx;
  color: #666;
}

.date-icon {
  font-size: 24rpx;
}

.amount-input {
  width: 100%;
  height: 100rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 10rpx;
  padding: 0 30rpx;
  font-size: 48rpx;
  text-align: center;
  background: #fafafa;
  margin-bottom: 20rpx;
  font-weight: bold;
  color: #333;
}

.category-selector {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.category-label {
  font-size: 24rpx;
  color: #333;
  font-weight: 500;
}

.category-picker {
  width: 200rpx;
  height: 60rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 8rpx;
  padding: 0 15rpx;
  display: flex;
  align-items: center;
  background: #fafafa;
}

.picker-text {
  font-size: 22rpx;
  color: #666;
}

/* 卡片网格区 */
.cards-section {
  padding: 0 20rpx 20rpx;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  text-align: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  min-height: 160rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
}

.card:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.12);
}

.card-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.card-amount {
  font-size: 36rpx;
  font-weight: bold;
  color: #ff4d4f;
}

.card-checkbox {
  position: absolute;
  top: 20rpx;
  left: 20rpx;
  z-index: 10;
}

.checkbox {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
}

.checkbox.checked {
  background: #1677ff;
  border-color: #1677ff;
}

.checkbox-check {
  color: #fff;
  font-size: 24rpx;
  font-weight: bold;
}

.add-card {
  background: #f5f5f5;
  border: 2rpx dashed #e0e0e0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.add-icon {
  font-size: 48rpx;
  color: #999;
  margin-bottom: 10rpx;
}

.add-text {
  font-size: 24rpx;
  color: #666;
}

/* 底部功能区 */
.bottom-section {
  background: #fff;
  padding: 20rpx 30rpx;
  margin-top: 20rpx;
  box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.08);
  position: sticky;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.multi-select-btn {
  width: 100%;
  height: 80rpx;
  background: #f5f5f5;
  color: #666;
  border: 2rpx solid #e0e0e0;
  border-radius: 10rpx;
  font-size: 28rpx;
  font-weight: 600;
  margin-bottom: 20rpx;
}

.multi-select-btn.active {
  background: #1677ff;
  color: #fff;
  border-color: #1677ff;
}

.multi-select-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.action-btn {
  height: 80rpx;
  background: #1677ff;
  color: #fff;
  border: none;
  border-radius: 10rpx;
  font-size: 24rpx;
  font-weight: 600;
}

.fixed-expense-btn {
  width: 100%;
  height: 60rpx;
  background: #f5f5f5;
  color: #666;
  border: 1rpx solid #e0e0e0;
  border-radius: 10rpx;
  font-size: 24rpx;
  font-weight: 500;
  margin-top: 10rpx;
}

.monthly-summary {
  text-align: center;
  padding: 15rpx;
  background: #f5f5f5;
  border-radius: 10rpx;
}

/* 账本列表样式 */
.book-list {
  max-height: 500rpx;
  overflow-y: auto;
}

.book-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.book-item.active {
  color: #1677ff;
}

.book-name {
  font-size: 32rpx;
  font-weight: 600;
}

.book-check {
  font-size: 28rpx;
  font-weight: bold;
}

.add-book {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 30rpx 0;
  color: #999;
}

.add-book-icon {
  font-size: 36rpx;
}

.add-book-text {
  font-size: 32rpx;
}

/* 报销单样式 */
.expense-total {
  font-size: 48rpx;
  font-weight: bold;
  color: #ff4d4f;
  text-align: center;
  margin-top: 10rpx;
}

.summary-text {
  font-size: 24rpx;
  color: #666;
}

/* 弹窗样式 */
.modal-overlay {
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
  background: #fff;
  border-radius: 20rpx;
  width: 85%;
  max-width: 500rpx;
  padding: 30rpx;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.modal-cancel, .modal-confirm {
  font-size: 28rpx;
  font-weight: 600;
  color: #1677ff;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.form-group {
  margin-bottom: 25rpx;
}

.form-label {
  display: block;
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 10rpx;
}

.form-input {
  width: 100%;
  height: 70rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 10rpx;
  padding: 0 20rpx;
  font-size: 24rpx;
  background: #fafafa;
}

.form-picker {
  width: 100%;
  height: 70rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 10rpx;
  padding: 0 20rpx;
  display: flex;
  align-items: center;
  background: #fafafa;
}

.date-input {
  width: 100%;
  height: 70rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 10rpx;
  padding: 0 20rpx;
  font-size: 24rpx;
}

/* 日期切换按钮 */
.date-toggle {
  font-size: 28rpx;
  color: #1677ff;
  font-weight: 600;
  padding: 15rpx 30rpx;
  border-radius: 20rpx;
  background: #f0f7ff;
}

.date-toggle:active {
  background: #e0efff;
}
</style>