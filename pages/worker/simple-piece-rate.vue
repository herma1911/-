<template>
  <view class="bookkeeping-container">
    <!-- 顶部导航栏 -->
    <view class="anxin-header">
      <text class="anxin-title">记账</text>
    </view>
    
    <!-- 免责声明 -->
    <view class="disclaimer">
      <text class="disclaimer-text">本账本仅为个人记账参考，不构成工资发放依据</text>
    </view>
    

    
    <!-- 快捷入口 -->
    <view class="quick-actions">
      <view class="action-card piece-action" @click="switchTab('piece')">
        <text class="action-icon">📝</text>
        <text class="action-text">计件</text>
      </view>
      <view class="action-card time-action" @click="switchTab('time')">
        <text class="action-icon">⏰</text>
        <text class="action-text">计时</text>
      </view>
    </view>
    
    <!-- 记账内容 -->
    <view class="anxin-tab-content">
      <!-- 计件内容 -->
      <view v-show="activeTab === 'piece'" class="anxin-piece-content">
        <!-- 计件表单 -->
        <view class="anxin-piece-form">
          <view v-for="(item, index) in pieceRateItems" :key="index" class="anxin-style-group">
            <!-- 款号输入 -->
            <view class="anxin-style-header">
              <view class="anxin-form-group">
                <text class="form-label">款号</text>
                <input type="text" v-model="item.styleNumber" @input="handleStyleNumberChange(index)" placeholder="请输入款号" class="anxin-input" />
                <!-- 历史款号选择 -->
                <view v-if="styleHistory.length > 0" class="style-history">
                  <text class="history-label">历史款号：</text>
                  <view class="history-tags">
                    <text 
                      v-for="(style, historyIndex) in styleHistory" 
                      :key="historyIndex"
                      class="history-tag"
                      @click="selectHistoryStyle(index, style)"
                    >
                      {{style}}
                    </text>
                  </view>
                </view>
              </view>
              <button class="anxin-delete-style-btn" @click="deleteStyleGroup(index)">删除款号</button>
            </view>
            
            <!-- 工序列表 -->
            <view class="anxin-process-list">
              <view v-for="(process, processIndex) in item.processes" :key="processIndex" class="anxin-form-row">
                <view class="anxin-form-group">
                  <text class="form-label">工序</text>
                  <input type="text" v-model="process.processName" placeholder="请输入工序（例如：整件，开口袋）" class="anxin-input" />
                  <button 
                    v-if="item.styleNumber" 
                    class="process-history-btn"
                    @click="showProcessHistory(item.styleNumber)"
                  >
                    历史工序
                  </button>
                </view>
                <view class="anxin-form-group">
                  <text class="form-label">单价</text>
                  <input type="number" v-model.number="process.unitPrice" placeholder="0.00" class="anxin-input" @input="calculateProcessTotal(index, processIndex)" />
                </view>
                <view class="anxin-form-group">
                  <text class="form-label">数量</text>
                  <input type="number" v-model.number="process.quantity" placeholder="0" class="anxin-input" @input="calculateProcessTotal(index, processIndex)" />
                </view>
                <view class="anxin-form-group">
                  <text class="form-label">金额</text>
                  <text class="anxin-amount">{{process.rowTotal}}元</text>
                </view>
                <view class="anxin-form-actions">
                  <button class="anxin-photo-btn" @click="uploadPhoto('piece', index, processIndex)">📷</button>
                  <button class="anxin-delete-btn" @click="deleteProcess(index, processIndex)">删除工序</button>
                </view>
                <!-- 照片预览 -->
                <view v-if="process.photos.length > 0" class="anxin-photo-preview">
                  <view v-for="(photo, photoIndex) in process.photos" :key="photoIndex" class="anxin-photo-item">
                    <image :src="photo" mode="aspectFill" class="anxin-photo-img" />
                    <button class="anxin-remove-photo" @click="removePhoto('piece', index, processIndex, photoIndex)">×</button>
                  </view>
                </view>
              </view>
              
              <!-- 添加工序按钮 -->
              <button class="anxin-add-btn" @click="addProcess(index)">+ 添加工序</button>
            </view>
          </view>
          
          <!-- 添加款号按钮 -->
          <button class="anxin-add-btn" @click="addStyleGroup">+ 添加款号</button>

        </view>
        
        <!-- 计件总计 -->
        <view class="anxin-total-section">
          <text class="anxin-total-label">计件总计：</text>
          <text class="anxin-total-value">{{grandTotal}}元</text>
        </view>
      </view>
      
      <!-- 计时内容 -->
      <view v-show="activeTab === 'time'" class="anxin-time-content">
        <!-- 计时表单 -->
        <view class="anxin-time-form">
          <view v-for="(item, index) in timeRateItems" :key="index" class="anxin-form-row">
            <view class="anxin-form-group">
              <text class="form-label">时薪</text>
              <input type="number" v-model.number="item.hourlyWage" placeholder="请输入时薪" class="anxin-input" @input="calculateTimeRowTotal(index)" />
            </view>
            <view class="anxin-form-group">
              <text class="form-label">工时</text>
              <input type="number" v-model.number="item.workHours" placeholder="请输入工时" class="anxin-input" @input="calculateTimeRowTotal(index)" />
            </view>
            <view class="anxin-form-group">
              <text class="form-label">金额</text>
              <text class="anxin-amount">{{item.rowTotal}}元</text>
            </view>
            <view class="anxin-form-group">
              <text class="form-label">备注</text>
              <input type="text" v-model="item.remark" placeholder="请输入备注（选填）" class="anxin-input" />
            </view>
            <view class="anxin-form-actions">
              <button class="anxin-photo-btn" @click="uploadPhoto('time', index)">📷</button>
              <button class="anxin-delete-btn" @click="deleteTimeRow(index)">删除</button>
            </view>
            <!-- 照片预览 -->
            <view v-if="item.photos.length > 0" class="anxin-photo-preview">
              <view v-for="(photo, photoIndex) in item.photos" :key="photoIndex" class="anxin-photo-item">
                <image :src="photo" mode="aspectFill" class="anxin-photo-img" />
                <button class="anxin-remove-photo" @click="removePhoto('time', index, photoIndex)">×</button>
              </view>
            </view>
          </view>
          
          <!-- 添加行按钮 -->
          <button class="anxin-add-btn" @click="addTimeRow">+ 添加记工单</button>

        </view>
        
        <!-- 计时总计 -->
        <view class="anxin-total-section">
          <text class="anxin-total-label">计时总计：</text>
          <text class="anxin-total-value">{{timeGrandTotal}}元</text>
        </view>
      </view>
    </view>
    
    <!-- 底部提交区域 -->
    <view class="anxin-footer">
      <view class="anxin-daily-total">
        <text class="daily-label">今日收入：</text>
        <text class="daily-value">{{overallTotal}}元</text>
      </view>
      <button class="anxin-submit-btn" @click="submitAll">确认提交</button>
    </view>
    

  </view>
</template>

<script>
export default {
  data() {
    return {
      activeTab: 'piece', // piece 或 time
      lastStyleNumber: '',
      styleProcessMap: {}, // 存储款号对应的工序信息
      styleHistory: [], // 存储历史款号，最多保存5个
      pieceRateItems: [
        {
          styleNumber: '',
          processes: [
            {
              processName: '',
              unitPrice: 0,
              quantity: 0,
              rowTotal: '0.00',
              photos: []
            }
          ]
        }
      ],
      timeRateItems: [
        {
          hourlyWage: 0,
          workHours: 0,
          rowTotal: '0.00',
          photos: [],
          remark: ''
        }
      ]
    }
  },
  onLoad(options) {
    // 加载最后一次输入的款号
    this.lastStyleNumber = uni.getStorageSync('lastStyleNumber') || ''
    if (this.lastStyleNumber && this.pieceRateItems.length > 0) {
      this.pieceRateItems[0].styleNumber = this.lastStyleNumber
    }
    
    // 加载上一次的时薪值
    const lastHourlyWage = uni.getStorageSync('lastHourlyWage') || 0
    if (lastHourlyWage > 0 && this.timeRateItems.length > 0) {
      this.timeRateItems[0].hourlyWage = lastHourlyWage
    }
    
    // 加载款号工序映射
    this.styleProcessMap = uni.getStorageSync('styleProcessMap') || {}
    
    // 加载历史款号记录
    this.styleHistory = uni.getStorageSync('styleHistory') || []
    
    // 检查URL参数，设置默认标签
    if (options && options.tab === 'time') {
      this.activeTab = 'time'
    }
    
    // 检查是否有未读的换款号通知
    this.checkStyleChangeNotifications()
  },
  
  // 检查换款号通知
  checkStyleChangeNotifications() {
    const notifications = uni.getStorageSync('notifications') || []
    const unreadStyleChangeNotifications = notifications.filter(note => 
      note.type === 'style_change' && !note.isRead
    )
    
    if (unreadStyleChangeNotifications.length > 0) {
      // 显示最近的一个通知
      const latestNotification = unreadStyleChangeNotifications[unreadStyleChangeNotifications.length - 1]
      this.showStyleChangeNotification(latestNotification)
    }
  },
  
  // 显示换款号通知
  showStyleChangeNotification(notification) {
    uni.showModal({
      title: notification.title,
      content: notification.content,
      confirmText: '确认',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 标记通知为已读
          this.markNotificationAsRead(notification.id)
          // 自动填充款号
          this.pieceRateItems[0].styleNumber = notification.styleNumber
          // 加载该款号的工序信息
          this.loadProcessesByStyleNumber(notification.styleNumber)
        }
      }
    })
  },
  
  // 标记通知为已读
    markNotificationAsRead(notificationId) {
      const notifications = uni.getStorageSync('notifications') || []
      const updatedNotifications = notifications.map(note => 
        note.id === notificationId ? { ...note, isRead: true } : note
      )
      uni.setStorageSync('notifications', updatedNotifications)
    },
    
    // 选择历史款号
    selectHistoryStyle(styleIndex, styleNumber) {
      this.pieceRateItems[styleIndex].styleNumber = styleNumber
      this.handleStyleNumberChange(styleIndex)
    },
    
    // 显示工序历史选择
    showProcessHistory(styleNumber) {
      const styleProcessMap = uni.getStorageSync('styleProcessMap') || {}
      const wageItems = uni.getStorageSync('wageItems') || []
      
      // 合并历史工序和组长设置的工序
      const processes = []
      
      // 添加组长设置的工序
      wageItems.filter(item => item.styleNumber === styleNumber).forEach(item => {
        processes.push({
          processName: item.processName,
          unitPrice: item.unitPrice,
          source: 'leader'
        })
      })
      
      // 添加历史工序
      if (styleProcessMap[styleNumber]) {
        processes.push({
          processName: styleProcessMap[styleNumber].processName,
          unitPrice: styleProcessMap[styleNumber].unitPrice,
          source: 'history'
        })
      }
      
      // 去重
      const uniqueProcesses = []
      const seenProcesses = new Set()
      
      processes.forEach(process => {
        if (!seenProcesses.has(process.processName)) {
          seenProcesses.add(process.processName)
          uniqueProcesses.push(process)
        }
      })
      
      if (uniqueProcesses.length > 0) {
        // 构建工序选择列表
        const processOptions = uniqueProcesses.map((process, index) => {
          return {
            text: `${process.processName} - ${process.unitPrice}元`,
            value: index
          }
        })
        
        uni.showActionSheet({
          itemList: processOptions.map(option => option.text),
          success: (res) => {
            const selectedProcess = uniqueProcesses[res.tapIndex]
            // 填充工序和价格
            if (this.pieceRateItems[0].processes.length > 0) {
              this.pieceRateItems[0].processes[0].processName = selectedProcess.processName
              this.pieceRateItems[0].processes[0].unitPrice = selectedProcess.unitPrice
            }
            uni.showToast({
              title: '已选择工序：' + selectedProcess.processName,
              icon: 'success'
            })
          },
          fail: (err) => {
            console.log('选择工序失败', err)
          }
        })
      }
    },
    
    // 更新款号历史记录
    updateStyleHistory(styleNumber) {
      if (!styleNumber) return
      
      // 移除已存在的相同款号
      this.styleHistory = this.styleHistory.filter(style => style !== styleNumber)
      
      // 添加到历史记录开头
      this.styleHistory.unshift(styleNumber)
      
      // 最多保存5个款号
      if (this.styleHistory.length > 5) {
        this.styleHistory = this.styleHistory.slice(0, 5)
      }
      
      // 保存到本地存储
      uni.setStorageSync('styleHistory', this.styleHistory)
    },
  
  // 根据款号加载工序信息
  loadProcessesByStyleNumber(styleNumber) {
    const wageItems = uni.getStorageSync('wageItems') || []
    const styleProcesses = wageItems.filter(item => item.styleNumber === styleNumber)
    
    if (styleProcesses.length > 0) {
      // 如果有对应的工序信息，显示工序选择
      this.showProcessSelection(styleProcesses)
    }
  },
  computed: {
    grandTotal() {
      return this.pieceRateItems.reduce((total, item) => {
        return total + item.processes.reduce((processTotal, process) => {
          return processTotal + parseFloat(process.rowTotal)
        }, 0)
      }, 0).toFixed(2)
    },
    timeGrandTotal() {
      return this.timeRateItems.reduce((total, item) => {
        return total + parseFloat(item.rowTotal)
      }, 0).toFixed(2)
    },
    overallTotal() {
      const pieceTotal = parseFloat(this.grandTotal)
      const timeTotal = parseFloat(this.timeGrandTotal)
      return (pieceTotal + timeTotal).toFixed(2)
    }
  },
  methods: {
    switchTab(tab) {
      this.activeTab = tab
    },
    handleStyleNumberChange(styleIndex) {
      const styleItem = this.pieceRateItems[styleIndex]
      const styleNumber = styleItem.styleNumber
      
      if (styleNumber) {
        // 优先从组长设置的工价中获取工序信息
        const wageItems = uni.getStorageSync('wageItems') || []
        const styleProcesses = wageItems.filter(item => item.styleNumber === styleNumber)
        
        if (styleProcesses.length > 0) {
          // 如果有对应的工序信息，显示工序选择
          this.showProcessSelection(styleProcesses)
        } else if (this.styleProcessMap[styleNumber]) {
          // 如果款号有对应的工序信息，自动填充
          const lastProcess = this.styleProcessMap[styleNumber]
          if (styleItem.processes.length > 0) {
            styleItem.processes[0].processName = lastProcess.processName
            styleItem.processes[0].unitPrice = lastProcess.unitPrice
          }
        }
      }
    },
    // 计件相关方法
    addStyleGroup() {
      this.pieceRateItems.push({
        styleNumber: '',
        processes: [
          {
            processName: '',
            unitPrice: 0,
            quantity: 0,
            rowTotal: '0.00',
            photos: []
          }
        ]
      })
    },
    deleteStyleGroup(index) {
      if (this.pieceRateItems.length > 1) {
        this.pieceRateItems.splice(index, 1)
      } else {
        uni.showToast({
          title: '至少保留一个款号',
          icon: 'none'
        })
      }
    },
    addProcess(styleIndex) {
      this.pieceRateItems[styleIndex].processes.push({
        processName: '',
        unitPrice: 0,
        quantity: 0,
        rowTotal: '0.00',
        photos: []
      })
    },
    deleteProcess(styleIndex, processIndex) {
      if (this.pieceRateItems[styleIndex].processes.length > 1) {
        this.pieceRateItems[styleIndex].processes.splice(processIndex, 1)
      } else {
        uni.showToast({
          title: '至少保留一个工序',
          icon: 'none'
        })
      }
    },
    calculateProcessTotal(styleIndex, processIndex) {
      const process = this.pieceRateItems[styleIndex].processes[processIndex]
      process.rowTotal = (process.unitPrice * process.quantity).toFixed(2)
    },
    submitPieceRate() {
      // 收集所有有效的工序
      const validProcesses = []
      this.pieceRateItems.forEach((styleItem, styleIndex) => {
        if (styleItem.styleNumber) {
          styleItem.processes.forEach((process, processIndex) => {
            if (process.processName && process.unitPrice > 0 && process.quantity > 0) {
              validProcesses.push({
                styleNumber: styleItem.styleNumber,
                processName: process.processName,
                unitPrice: process.unitPrice,
                quantity: process.quantity,
                rowTotal: process.rowTotal
              })
            }
          })
        }
      })
      
      if (validProcesses.length === 0) {
        uni.showToast({
          title: '请至少输入一行有效的计件数据',
          icon: 'none'
        })
        return
      }
      
      // 准备提交数据
      const submitData = validProcesses.map((item, index) => {
        return `行${index + 1}: ${item.styleNumber} - ${item.processName} - ${item.unitPrice}元 × ${item.quantity} = ${item.rowTotal}元`
      }).join('\n')
      
      uni.showModal({
        title: '提交计件',
        content: `共 ${validProcesses.length} 行数据\n\n${submitData}\n\n总计：${this.grandTotal}元\n\n确认提交？`,
        confirmText: '确认',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            // 保存记账记录到账本
            const ledgerRecords = uni.getStorageSync('ledgerRecords') || []
            
            validProcesses.forEach((process) => {
              ledgerRecords.push({
                id: Date.now() + Math.random(),
                date: new Date().toISOString(),
                description: `${process.styleNumber} - ${process.processName}`,
                amount: process.rowTotal,
                type: 'piece'
              })
            })
            
            uni.setStorageSync('ledgerRecords', ledgerRecords)
            
            // 显示记账成功弹窗
            uni.showModal({
              title: '记账成功！',
              content: '已同步到你的技能档案',
              confirmText: '查看档案',
              cancelText: '确定',
              success: (modalRes) => {
                if (modalRes.confirm) {
                  // 跳转到技能档案页面
                  uni.navigateTo({
                    url: './skill-profile'
                  })
                }
              }
            })
            
            // 重置表单
            setTimeout(() => {
              this.pieceRateItems = [{
                styleNumber: '',
                processes: [
                  {
                    processName: '',
                    unitPrice: 0,
                    quantity: 0,
                    rowTotal: '0.00',
                    photos: []
                  }
                ]
              }]
            }, 1000)
          }
        }
      })
    },
    // 计时相关方法
    addTimeRow() {
      // 获取上一次的时薪值
      const lastHourlyWage = uni.getStorageSync('lastHourlyWage') || 0
      this.timeRateItems.push({
        hourlyWage: lastHourlyWage,
        workHours: 0,
        rowTotal: '0.00',
        photos: [],
        remark: ''
      })
    },
    deleteTimeRow(index) {
      if (this.timeRateItems.length > 1) {
        this.timeRateItems.splice(index, 1)
      } else {
        uni.showToast({
          title: '至少保留一行',
          icon: 'none'
        })
      }
    },
    calculateTimeRowTotal(index) {
      const item = this.timeRateItems[index]
      item.rowTotal = (item.hourlyWage * item.workHours).toFixed(2)
      // 保存当前时薪值到本地存储
      if (item.hourlyWage > 0) {
        uni.setStorageSync('lastHourlyWage', item.hourlyWage)
      }
    },
    submitTimeRate() {
      // 验证所有行
      const validItems = this.timeRateItems.filter(item => {
        return item.hourlyWage > 0 && item.workHours > 0
      })
      
      if (validItems.length === 0) {
        uni.showToast({
          title: '请至少输入一行有效的计时数据',
          icon: 'none'
        })
        return
      }
      
      // 准备提交数据
      const submitData = validItems.map((item, index) => {
        let remarkInfo = item.remark ? `（备注：${item.remark}）` : ''
        return `行${index + 1}: ${item.hourlyWage}元/小时 × ${item.workHours}工时 = ${item.rowTotal}元${remarkInfo}`
      }).join('\n')
      
      uni.showModal({
        title: '提交计时',
        content: `共 ${validItems.length} 行数据\n\n${submitData}\n\n总计：${this.timeGrandTotal}元\n\n确认提交？`,
        confirmText: '确认',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            // 保存计时记录到账本
            const ledgerRecords = uni.getStorageSync('ledgerRecords') || []
            
            validItems.forEach((item) => {
              ledgerRecords.push({
                id: Date.now() + Math.random(),
                date: new Date().toISOString(),
                description: `计时 - ${item.remark || '无备注'}`,
                amount: item.rowTotal,
                type: 'time'
              })
            })
            
            uni.setStorageSync('ledgerRecords', ledgerRecords)
            
            // 显示记账成功弹窗
            uni.showModal({
              title: '记账成功！',
              content: '已同步到你的技能档案',
              confirmText: '查看档案',
              cancelText: '确定',
              success: (modalRes) => {
                if (modalRes.confirm) {
                  // 跳转到技能档案页面
                  uni.navigateTo({
                    url: './skill-profile'
                  })
                }
              }
            })
            
            // 重置表单
            setTimeout(() => {
              this.timeRateItems = [{
                hourlyWage: 0,
                workHours: 0,
                rowTotal: '0.00',
                photos: [],
                remark: ''
              }]
            }, 1000)
          }
        }
      })
    },
    uploadPhoto(type, styleIndex, processIndex) {
      uni.chooseImage({
        count: 3, // 最多选择3张照片
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePaths = res.tempFilePaths
          if (type === 'piece') {
            this.pieceRateItems[styleIndex].processes[processIndex].photos = this.pieceRateItems[styleIndex].processes[processIndex].photos.concat(tempFilePaths)
          } else if (type === 'time') {
            this.timeRateItems[styleIndex].photos = this.timeRateItems[styleIndex].photos.concat(tempFilePaths)
          }
          uni.showToast({
            title: '照片上传成功',
            icon: 'success'
          })
        },
        fail: (err) => {
          console.log('选择照片失败', err)
          uni.showToast({
            title: '选择照片失败',
            icon: 'none'
          })
        }
      })
    },
    removePhoto(type, styleIndex, processIndex, photoIndex) {
      if (type === 'piece') {
        this.pieceRateItems[styleIndex].processes[processIndex].photos.splice(photoIndex, 1)
      } else if (type === 'time') {
        this.timeRateItems[styleIndex].photos.splice(processIndex, 1)
      }
      uni.showToast({
        title: '照片已删除',
        icon: 'success'
      })
    },
    // 显示工序选择
    showProcessSelection(processes) {
      // 构建工序选择列表
      const processOptions = processes.map((process, index) => {
        return {
          text: `${process.processName} - ${process.unitPrice}元`,
          value: index
        }
      })
      
      uni.showActionSheet({
        itemList: processOptions.map(option => option.text),
        success: (res) => {
          const selectedProcess = processes[res.tapIndex]
          // 填充工序和价格
          if (this.pieceRateItems[0].processes.length > 0) {
            this.pieceRateItems[0].processes[0].processName = selectedProcess.processName
            this.pieceRateItems[0].processes[0].unitPrice = selectedProcess.unitPrice
          }
          uni.showToast({
            title: '已选择工序：' + selectedProcess.processName,
            icon: 'success'
          })
        },
        fail: (err) => {
          console.log('选择工序失败', err)
        }
      })
    },
    

    submitAll() {
      // 验证计件数据
      const validPieceItems = []
      let lastUsedStyleNumber = ''
      
      this.pieceRateItems.forEach((styleItem) => {
        if (styleItem.styleNumber) {
          lastUsedStyleNumber = styleItem.styleNumber
          styleItem.processes.forEach((process) => {
            if (process.processName && process.unitPrice > 0 && process.quantity > 0) {
              validPieceItems.push({
                styleNumber: styleItem.styleNumber,
                processName: process.processName,
                unitPrice: process.unitPrice,
                quantity: process.quantity,
                rowTotal: process.rowTotal,
                photos: process.photos
              })
            }
          })
        }
      })
      
      // 保存最后一次使用的款号
      if (lastUsedStyleNumber) {
        this.lastStyleNumber = lastUsedStyleNumber
        uni.setStorageSync('lastStyleNumber', lastUsedStyleNumber)
        // 更新款号历史记录
        this.updateStyleHistory(lastUsedStyleNumber)
      }
      
      // 保存款号对应的工序信息
      this.pieceRateItems.forEach((styleItem) => {
        if (styleItem.styleNumber) {
          styleItem.processes.forEach((process) => {
            if (process.processName && process.unitPrice > 0) {
              this.styleProcessMap[styleItem.styleNumber] = {
                processName: process.processName,
                unitPrice: process.unitPrice
              }
            }
          })
        }
      })
      
      // 保存到本地存储
      uni.setStorageSync('styleProcessMap', this.styleProcessMap)
      
      // 验证计时数据
      const validTimeItems = this.timeRateItems.filter(item => {
        return item.hourlyWage > 0 && item.workHours > 0
      })
      
      // 检查是否有有效数据
      if (validPieceItems.length === 0 && validTimeItems.length === 0) {
        uni.showToast({
          title: '请至少输入一行有效的记账数据',
          icon: 'none'
        })
        return
      }
      
      // 准备提交数据
      let submitData = ''
      let totalCount = 0
      
      if (validPieceItems.length > 0) {
        totalCount += validPieceItems.length
        submitData += `计件数据（${validPieceItems.length}行）：\n`
        submitData += validPieceItems.map((item, index) => {
          let photoInfo = item.photos.length > 0 ? `（${item.photos.length}张照片）` : ''
          return `行${index + 1}: ${item.styleNumber} - ${item.processName} - ${item.unitPrice}元 × ${item.quantity} = ${item.rowTotal}元${photoInfo}`
        }).join('\n')
        submitData += '\n\n'
      }
      
      if (validTimeItems.length > 0) {
        totalCount += validTimeItems.length
        submitData += `计时数据（${validTimeItems.length}行）：\n`
        submitData += validTimeItems.map((item, index) => {
          let photoInfo = item.photos.length > 0 ? `（${item.photos.length}张照片）` : ''
          let remarkInfo = item.remark ? `（备注：${item.remark}）` : ''
          return `行${index + 1}: ${item.hourlyWage}元/小时 × ${item.workHours}工时 = ${item.rowTotal}元${photoInfo}${remarkInfo}`
        }).join('\n')
        submitData += '\n\n'
      }
      
      uni.showModal({
        title: '提交所有记账',
        content: `共 ${totalCount} 行数据\n\n${submitData}总计：${this.overallTotal}元\n\n确认提交？`,
        confirmText: '确认',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            // 保存记账记录到账本
            const ledgerRecords = uni.getStorageSync('ledgerRecords') || []
            
            // 生成账单ID
            const billId = Date.now()
            
            // 添加计件数据
            validPieceItems.forEach((process) => {
              const recordId = Date.now() + Math.random()
              ledgerRecords.push({
                id: recordId,
                billId: billId,
                date: new Date().toISOString(),
                description: `${process.styleNumber} - ${process.processName}`,
                amount: process.rowTotal,
                type: 'piece',
                status: 'pending', // pending, confirmed
                styleNumber: process.styleNumber,
                processName: process.processName,
                quantity: process.quantity,
                unitPrice: process.unitPrice,
                photos: process.photos
              })
            })
            
            // 添加计时数据
            validTimeItems.forEach((item) => {
              const recordId = Date.now() + Math.random()
              ledgerRecords.push({
                id: recordId,
                billId: billId,
                date: new Date().toISOString(),
                description: `计时 - ${item.remark || '无备注'}`,
                amount: item.rowTotal,
                type: 'time',
                status: 'pending',
                hourlyWage: item.hourlyWage,
                workHours: item.workHours,
                remark: item.remark,
                photos: item.photos
              })
            })
            
            // 保存账单信息
            const billInfo = {
              id: billId,
              workerId: uni.getStorageSync('userId') || 'worker_' + Math.random(),
              workerName: uni.getStorageSync('userInfo')?.name || '当前用户',
              totalAmount: this.overallTotal,
              items: [...validPieceItems, ...validTimeItems],
              status: 'pending',
              submittedAt: new Date().toISOString(),
              confirmedAt: null,
              confirmerName: null
            }
            
            const bills = uni.getStorageSync('bills') || []
            bills.push(billInfo)
            uni.setStorageSync('bills', bills)
            
            // 保存数据
            uni.setStorageSync('ledgerRecords', ledgerRecords)
            
            // 显示操作选项
            uni.showActionSheet({
              itemList: ['直接保存', '转发给老板确认'],
              success: (actionRes) => {
                if (actionRes.tapIndex === 0) {
                  // 直接保存
                  uni.showModal({
                    title: '保存成功',
                    content: '记账已保存',
                    confirmText: '查看账本',
                    cancelText: '确定',
                    success: (modalRes) => {
                      if (modalRes.confirm) {
                        // 跳转到账本页面
                        uni.navigateTo({
                          url: './ledger'
                        })
                      }
                    }
                  })
                } else if (actionRes.tapIndex === 1) {
                  // 转发给老板确认
                  this.shareBillToBoss(billId)
                }
              }
            })
            
            // 重置表单
            setTimeout(() => {
              // 重置计件数据，保持最后一次使用的款号
              this.pieceRateItems = [{
                styleNumber: this.lastStyleNumber,
                processes: [
                  {
                    processName: '',
                    unitPrice: 0,
                    quantity: 0,
                    rowTotal: '0.00',
                    photos: []
                  }
                ]
              }]
              
              // 重置计时数据
              this.timeRateItems = [{
                hourlyWage: 0,
                workHours: 0,
                rowTotal: '0.00',
                photos: [],
                remark: ''
              }]
            }, 1000)
          }
        }
      })
    },
    // 分享账单给老板
    shareBillToBoss(billId) {
      const bills = uni.getStorageSync('bills') || []
      const bill = bills.find(b => b.id === billId)
      
      if (bill) {
        // 生成分享内容 - 只显示款号、工序、总数量
        let totalQuantity = 0
        const itemSummary = {} // 按款号+工序分组
        
        bill.items.forEach(item => {
          if (item.type === 'piece') {
            const key = `${item.styleNumber}-${item.processName}`
            if (!itemSummary[key]) {
              itemSummary[key] = {
                styleNumber: item.styleNumber,
                processName: item.processName,
                totalQuantity: 0
              }
            }
            itemSummary[key].totalQuantity += parseInt(item.quantity)
            totalQuantity += parseInt(item.quantity)
          }
        })
        
        // 生成分享内容 - 添加免责提醒
        const shareContent = `【工人账单确认】\n\n⚠️ 重要提醒：本确认仅认工单事实，不做最终薪资结算依据\n1. 您本次确认，仅代表知晓该笔工单的发生事实，不代表对最终结算金额的认可；\n2. 最终薪资发放数量、金额，以您和工人线下当面核对的结果为准；\n3. 平台不介入您与工人的任何薪资纠纷，不承担任何相关法律责任。\n\n工人：${bill.workerName}\n总数量：${totalQuantity}件\n记录条数：${bill.items.length}条\n\n请确认以下记账记录：\n${Object.values(itemSummary).map((item, index) => {
          return `- ${item.styleNumber} - ${item.processName}: ${item.totalQuantity}件`
        }).join('\n')}\n\n👉 无需下载APP、无需注册登录，点确认仅帮工人完成记账对账，无任何后续绑定成本\n👉 数量有偏差直接点驳回，让工人修改后重新转发即可，无任何操作负担\n\n每日明细仅供参考，最终发薪以线下统计为准`
        
        // 生成分享卡片
        this.generateShareCard(billId, shareContent)
      }
    },
    // 生成分享卡片
    generateShareCard(billId, shareContent) {
      // 模拟生成分享卡片
      uni.showModal({
        title: '生成分享卡片',
        content: '正在生成分享卡片...',
        showCancel: false
      })
      
      setTimeout(() => {
        // 显示分享选项
        uni.showActionSheet({
          itemList: ['微信好友', '微信朋友圈', '复制链接'],
          success: (res) => {
            if (res.tapIndex === 0) {
              // 分享给微信好友
              this.shareToWeChat('friend', billId, shareContent)
            } else if (res.tapIndex === 1) {
              // 分享到微信朋友圈
              this.shareToWeChat('moment', billId, shareContent)
            } else if (res.tapIndex === 2) {
              // 复制链接
              uni.setClipboardData({
                data: shareContent,
                success: () => {
                  uni.showToast({ title: '链接已复制', icon: 'success' })
                }
              })
            }
          }
        })
      }, 1000)
    },
    // 分享到微信
    shareToWeChat(type, billId, shareContent) {
      // 模拟微信分享
      uni.showModal({
        title: '分享到微信',
        content: `正在分享到微信${type === 'friend' ? '好友' : '朋友圈'}...`,
        showCancel: false
      })
      
      setTimeout(() => {
        // 模拟分享成功
        uni.showToast({ 
          title: `分享到微信${type === 'friend' ? '好友' : '朋友圈'}成功，请提醒老板确认`, 
          icon: 'success' 
        })
        
        // 模拟老板确认流程
        setTimeout(() => {
          this.simulateBossConfirmation(billId)
        }, 3000)
      }, 1000)
    },
    // 模拟老板确认
    simulateBossConfirmation(billId) {
      // 模拟老板审核界面 - 只有确认和驳回两个按钮，添加免责提醒
      uni.showModal({
        title: '账单审核',
        content: '⚠️ 重要提醒：本确认仅认工单事实，不做最终薪资结算依据\n\n请选择操作：\n\n【确认账单】：大差不差点确认，最终发薪数线下说了算，无任何法律责任\n【驳回账单】：数量不对直接驳回，无需解释原因，线下核对后让工人重发即可\n\n无需下载APP、无需注册登录，点确认仅帮工人完成记账对账，无任何后续绑定成本',
        confirmText: '确认账单',
        cancelText: '驳回账单',
        success: (res) => {
          if (res.confirm) {
            // 老板确认
            this.confirmBill(billId)
          } else if (res.cancel) {
            // 老板驳回
            this.rejectBill(billId)
          }
        }
      })
    },
    // 确认账单
    confirmBill(billId) {
      // 更新账单状态
      const bills = uni.getStorageSync('bills') || []
      const updatedBills = bills.map(bill => {
        if (bill.id === billId) {
          return {
            ...bill,
            status: 'confirmed',
            confirmedAt: new Date().toISOString(),
            confirmerName: '老板'
          }
        }
        return bill
      })
      uni.setStorageSync('bills', updatedBills)
      
      // 更新账本记录状态
      const ledgerRecords = uni.getStorageSync('ledgerRecords') || []
      const updatedRecords = ledgerRecords.map(record => {
        if (record.billId === billId) {
          return {
            ...record,
            status: 'confirmed'
          }
        }
        return record
      })
      uni.setStorageSync('ledgerRecords', updatedRecords)
      
      // 同步到个人技能档案
      this.syncToSkillProfile(billId)
      
      // 显示确认通知
      uni.showModal({
        title: '账单已确认',
        content: '✅ 账单确认成功\n\n再次提醒：本次确认仅为工单事实知晓，最终薪资结算以您和工人线下核对为准，平台不介入任何纠纷\n\n【可选轻量引导，非强制】：入驻衣起赚APP，可免费使用班组批量对账、工人管理功能，一键核对全组工单总量，省一半对账时间\n\n已自动同步到您的个人技能档案',
        confirmText: '查看档案',
        cancelText: '确定',
        success: (modalRes) => {
          if (modalRes.confirm) {
            // 跳转到技能档案页面
            uni.navigateTo({
              url: './skill-profile'
            })
          }
        }
      })
      
      // 保存确认状态到通知
      const notifications = uni.getStorageSync('notifications') || []
      notifications.push({
        id: Date.now(),
        type: 'bill_confirmation',
        title: '账单确认通知',
        content: '老板已确认您的账单，线上确认仅确认工单真实性，最终发薪以线下统计为准',
        time: new Date().toISOString(),
        read: false
      })
      uni.setStorageSync('notifications', notifications)
    },
    // 驳回账单
    rejectBill(billId) {
      // 更新账单状态
      const bills = uni.getStorageSync('bills') || []
      const updatedBills = bills.map(bill => {
        if (bill.id === billId) {
          return {
            ...bill,
            status: 'rejected',
            rejectedAt: new Date().toISOString(),
            rejecterName: '老板'
          }
        }
        return bill
      })
      uni.setStorageSync('bills', updatedBills)
      
      // 更新账本记录状态
      const ledgerRecords = uni.getStorageSync('ledgerRecords') || []
      const updatedRecords = ledgerRecords.map(record => {
        if (record.billId === billId) {
          return {
            ...record,
            status: 'rejected'
          }
        }
        return record
      })
      uni.setStorageSync('ledgerRecords', updatedRecords)
      
      // 显示驳回通知
      uni.showModal({
        title: '账单已驳回',
        content: '✅ 账单已驳回\n\n请您线下和工人核对好数量后，让工人修改账单重新转发即可，无任何操作限制',
        confirmText: '确定',
        showCancel: false
      })
      
      // 保存驳回状态到通知
      const notifications = uni.getStorageSync('notifications') || []
      notifications.push({
        id: Date.now(),
        type: 'bill_rejection',
        title: '账单驳回通知',
        content: '老板已驳回您的账单，请与组长线下核对数量后重新提交',
        time: new Date().toISOString(),
        read: false
      })
      uni.setStorageSync('notifications', notifications)
    },
    // 同步到个人技能档案
    syncToSkillProfile(billId) {
      // 加载技能档案
      const skillProfile = uni.getStorageSync('skillProfile') || {
        workRecords: []
      }
      
      // 获取确认的账单
      const bills = uni.getStorageSync('bills') || []
      const bill = bills.find(b => b.id === billId)
      
      if (bill) {
        // 处理计件数据
        bill.items.forEach(item => {
          if (item.type === 'piece' && item.processName) {
            // 查找是否已有该技能的记录
            const existingRecordIndex = skillProfile.workRecords.findIndex(record => 
              record.skill === item.processName
            )
            
            if (existingRecordIndex >= 0) {
              // 更新现有记录
              skillProfile.workRecords[existingRecordIndex].count += parseInt(item.quantity)
            } else {
              // 添加新记录
              skillProfile.workRecords.push({
                skill: item.processName,
                count: parseInt(item.quantity),
                level: '熟练'
              })
            }
          }
        })
        
        // 保存更新后的技能档案
        uni.setStorageSync('skillProfile', skillProfile)
      }
    }
  }
}
</script>

<style scoped>
/* 记账整体样式 */
.bookkeeping-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

/* 免责声明 */
.disclaimer {
  background-color: #fff3cd;
  border: 1rpx solid #ffeaa7;
  border-radius: 10rpx;
  padding: 15rpx;
  margin-bottom: 20rpx;
}

.disclaimer-text {
  font-size: 20rpx;
  color: #856404;
  text-align: center;
  line-height: 1.4;
}

/* 顶部导航栏 */
.anxin-header {
  background-color: #4A90E2;
  color: #fff;
  padding: 30rpx;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
  text-align: center;
  box-shadow: 0 4rpx 15rpx rgba(74, 144, 226, 0.3);
}

.anxin-title {
  font-size: 36rpx;
  font-weight: bold;
}

/* 工厂信息 */
.factory-info {
  background-color: #fff;
  padding: 20rpx;
  border-radius: 15rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.factory-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.factory-code {
  font-size: 22rpx;
  color: #666;
  margin-bottom: 15rpx;
  display: block;
}

.unbound-text {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-bottom: 15rpx;
}

.bind-btn {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 20rpx;
  background-color: #4A90E2;
  color: #fff;
}

.unbind-btn {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 20rpx;
  background-color: #f0f0f0;
  color: #666;
  margin-top: 10rpx;
}

/* 快捷入口 */
.quick-actions {
  display: flex;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.action-card {
  flex: 1;
  background-color: #fff;
  padding: 30rpx;
  border-radius: 15rpx;
  text-align: center;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.action-card:active {
  transform: scale(0.95);
}

.action-icon {
  font-size: 60rpx;
  display: block;
  margin-bottom: 15rpx;
}

.action-text {
  font-size: 24rpx;
  color: #333;
  font-weight: bold;
}

.piece-action {
  border-left: 6rpx solid #4A90E2;
}

.time-action {
  border-left: 6rpx solid #52c41a;
}

/* 记账内容 */
.anxin-tab-content {
  background-color: #fff;
  border-radius: 15rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 30rpx;
}

/* 计件内容 */
.anxin-piece-content,
.anxin-time-content {
  padding: 20rpx;
}

/* 表单样式 */
.anxin-piece-form,
.anxin-time-form {
  margin-bottom: 20rpx;
}

/* 款号组样式 */
.anxin-style-group {
  margin-bottom: 30rpx;
  padding: 20rpx;
  background-color: #fff;
  border-radius: 15rpx;
  border: 2rpx solid #4A90E2;
  box-shadow: 0 2rpx 10rpx rgba(74, 144, 226, 0.1);
}

.anxin-style-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20rpx;
  padding-bottom: 15rpx;
  border-bottom: 1rpx solid #e8e8e8;
}

.anxin-style-header .anxin-form-group {
  flex: 1;
  margin-right: 15rpx;
}

.anxin-delete-style-btn {
  padding: 10rpx 20rpx;
  font-size: 22rpx;
  background-color: #fff1f0;
  color: #ff4d4f;
  border-radius: 10rpx;
  white-space: nowrap;
}

.anxin-process-list {
  margin-top: 15rpx;
}

.anxin-form-row {
  margin-bottom: 15rpx;
  padding: 15rpx;
  background-color: #f9f9f9;
  border-radius: 10rpx;
  border: 1rpx solid #e8e8e8;
}

.anxin-form-group {
  margin-bottom: 15rpx;
}

.form-label {
  font-size: 22rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
  font-weight: bold;
}

.anxin-input {
  width: 100%;
  height: 70rpx;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  padding: 0 15rpx;
  font-size: 24rpx;
  background-color: #fff;
}

.anxin-amount {
  font-size: 26rpx;
  font-weight: bold;
  color: #4A90E2;
  padding: 20rpx 0;
}

.anxin-form-actions {
  display: flex;
  gap: 15rpx;
  margin-top: 15rpx;
}

.anxin-photo-btn {
  flex: 1;
  height: 60rpx;
  font-size: 22rpx;
  background-color: #e6f7ff;
  color: #4A90E2;
  border-radius: 10rpx;
}

.anxin-delete-btn {
  flex: 1;
  height: 60rpx;
  font-size: 22rpx;
  background-color: #fff1f0;
  color: #ff4d4f;
  border-radius: 10rpx;
}

/* 历史款号样式 */
.style-history {
  margin-top: 10rpx;
  padding: 10rpx;
  background-color: #f9f9f9;
  border-radius: 10rpx;
}

.history-label {
  font-size: 22rpx;
  color: #666;
  margin-right: 10rpx;
}

.history-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 10rpx;
}

.history-tag {
  padding: 8rpx 15rpx;
  background-color: #e6f7ff;
  color: #4A90E2;
  border-radius: 20rpx;
  font-size: 20rpx;
  cursor: pointer;
  white-space: nowrap;
}

.history-tag:active {
  background-color: #4A90E2;
  color: #fff;
}

/* 历史工序按钮样式 */
.process-history-btn {
  margin-top: 10rpx;
  padding: 8rpx 15rpx;
  background-color: #f6ffed;
  color: #52c41a;
  border-radius: 20rpx;
  font-size: 20rpx;
  align-self: flex-start;
}

/* 照片预览 */
.anxin-photo-preview {
  display: flex;
  gap: 10rpx;
  margin-top: 15rpx;
  flex-wrap: wrap;
}

.anxin-photo-item {
  position: relative;
  width: 120rpx;
  height: 120rpx;
  border-radius: 10rpx;
  overflow: hidden;
}

.anxin-photo-img {
  width: 100%;
  height: 100%;
}

.anxin-remove-photo {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background-color: rgba(255, 77, 79, 0.9);
  color: #fff;
  font-size: 24rpx;
  line-height: 40rpx;
  text-align: center;
  padding: 0;
}

/* 添加按钮 */
.anxin-add-btn {
  width: 100%;
  height: 70rpx;
  font-size: 24rpx;
  background-color: #f6ffed;
  color: #52c41a;
  border-radius: 15rpx;
  margin: 20rpx 0;
}

.invite-btn {
  background-color: #e6f7ff;
  color: #4A90E2;
  margin-top: 10rpx;
}

/* 总计区域 */
.anxin-total-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background-color: #f6ffed;
  border-radius: 15rpx;
  margin-top: 20rpx;
}

.anxin-total-label {
  font-size: 24rpx;
  font-weight: bold;
  color: #333;
}

.anxin-total-value {
  font-size: 30rpx;
  font-weight: bold;
  color: #52c41a;
}

/* 底部提交区域 */
.anxin-footer {
  background-color: #fff;
  padding: 20rpx;
  border-radius: 15rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  position: sticky;
  bottom: 20rpx;
}

.anxin-daily-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding: 15rpx;
  background-color: #e6f7ff;
  border-radius: 15rpx;
}

.daily-label {
  font-size: 24rpx;
  font-weight: bold;
  color: #333;
}

.daily-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #4A90E2;
}

.anxin-submit-btn {
  width: 100%;
  height: 40rpx;
  font-size: 30rpx;
  background-color: #4A90E2;
  color: #fff;
  border-radius: 40rpx;
  font-weight: bold;
}

/* 工厂绑定弹窗 */
.bind-modal {
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

.bind-modal-content {
  background-color: #fff;
  padding: 30rpx;
  border-radius: 20rpx;
  width: 80%;
  max-width: 500rpx;
  box-shadow: 0 5rpx 25rpx rgba(0, 0, 0, 0.3);
}

.bind-modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 30rpx;
}

.bind-input {
  width: 100%;
  height: 70rpx;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  padding: 0 15rpx;
  font-size: 24rpx;
  margin-bottom: 20rpx;
}

.bind-modal-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 30rpx;
}

.bind-cancel-btn,
.bind-confirm-btn {
  flex: 1;
  height: 70rpx;
  font-size: 24rpx;
  border-radius: 10rpx;
}

.bind-cancel-btn {
  background-color: #f0f0f0;
  color: #666;
}

.bind-confirm-btn {
  background-color: #4A90E2;
  color: #fff;
}
</style>