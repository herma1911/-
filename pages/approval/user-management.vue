<template>
  <view class="user-management-container">
    <view class="header">
      <text class="title">用户管理</text>
    </view>
    
    <!-- 搜索栏和新增按钮 -->
    <view class="search-bar">
      <input type="text" v-model="searchKeyword" placeholder="搜索用户名或手机号" class="search-input" />
      <button class="search-btn" @click="search">搜索</button>
      <button class="add-btn" @click="showAddEmployeeDialog">新增员工</button>
    </view>
    
    <!-- 用户列表 -->
    <view class="user-list">
      <view v-for="(user, index) in filteredUsers" :key="user.username" class="user-item">
        <view class="user-header">
          <text class="user-name">{{ user.username }}</text>
          <text class="user-role" :class="getRoleClass(user.role)">
            {{ user.role === '班组长' ? '厂长' : user.role }}
          </text>
        </view>
        <view class="user-details">
          <text class="detail-text">手机号：{{ user.phone || user.username }}</text>
          <text class="detail-text">注册时间：{{ user.registerTime || '未知' }}</text>
          <text class="detail-text">企业：{{ user.enterpriseName || '未分配' }}</text>
        </view>
        <view class="user-actions">
          <button v-if="user.role !== '厂长'" class="action-btn role-btn" @click="assignAdminRole(user)">
            设为厂长
          </button>
          <button v-else class="action-btn role-btn" @click="removeAdminRole(user)">
            取消厂长
          </button>
          <button class="action-btn view-btn" @click="viewUserDetail(user)">
            查看详情
          </button>
          <button v-if="user.role === '工厂'" class="action-btn phone-btn" @click="changePhoneNumber(user)">
            变更手机号
          </button>
        </view>
      </view>
      <view v-if="filteredUsers.length === 0" class="empty-state">
        <text>暂无用户数据</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      searchKeyword: '',
      users: [],
      addEmployeeForm: {
        name: '',
        phone: ''
      }
    }
  },
  onLoad() {
    this.loadUsers()
  },
  computed: {
    filteredUsers() {
      if (!this.searchKeyword) {
        return this.users
      }
      return this.users.filter(user => 
        user.username.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
        (user.phone && user.phone.includes(this.searchKeyword))
      )
    }
  },
  methods: {
    loadUsers() {
      // 从本地存储加载用户数据
      const userInfo = uni.getStorageSync('userInfo') || {}
      const enterpriseApplications = uni.getStorageSync('enterpriseApplications') || []
      const approvedEnterprises = enterpriseApplications.filter(app => app.status === 'approved')
      
      // 构建用户列表
      const users = []
      
      // 添加企业用户
      approvedEnterprises.forEach(app => {
        users.push({
          username: app.userId,
          phone: app.phone || app.userId,
          role: '工厂',
          registerTime: new Date(app.approveTime).toLocaleString(),
          enterpriseName: app.enterpriseName || app.userId
        })
      })
      
      // 从其他存储中加载更多用户数据
      const additionalUsers = uni.getStorageSync('users') || []
      users.push(...additionalUsers)
      
      // 加载所有注册用户（从userInfo_前缀的存储中）
      try {
        const keys = uni.getStorageInfoSync().keys
        keys.forEach(key => {
          if (key.startsWith('userInfo_') && key !== 'userInfo') {
            const storedUser = uni.getStorageSync(key)
            if (storedUser && storedUser.username) {
              users.push({
                username: storedUser.username,
                phone: storedUser.phone || storedUser.username,
                role: storedUser.role || '工人',
                registerTime: storedUser.registerTime || '未知',
                enterpriseName: storedUser.enterpriseName || '未分配'
              })
            }
          }
        })
      } catch (e) {
        console.log('获取存储信息失败', e)
      }
      
      // 去重
      const uniqueUsers = []
      const seenUsernames = new Set()
      
      users.forEach(user => {
        if (!seenUsernames.has(user.username)) {
          seenUsernames.add(user.username)
          uniqueUsers.push(user)
        }
      })
      
      this.users = uniqueUsers
    },
    search() {
      // 搜索逻辑已在computed中实现
    },
    getRoleClass(role) {
      switch (role) {
        case '工厂':
          return 'role-enterprise'
        case '厂长':
          return 'role-team-leader'
        case '工人':
          return 'role-worker'
        case '赫尔玛智能':
          return 'role-app-holder'
        default:
          return ''
      }
    },
    assignAdminRole(user) {
      // 获取所有产线
      const productionLines = uni.getStorageSync('productionLines') || []
      
      if (productionLines.length === 0) {
        uni.showToast({
          title: '请先创建产线',
          icon: 'none'
        })
        return
      }
      
      // 显示输入姓名的弹窗
      uni.showModal({
        title: '设置厂长',
        content: '请输入厂长的姓名',
        editable: true,
        placeholderText: '请输入姓名',
        success: (nameRes) => {
          if (nameRes.confirm && nameRes.content) {
            const adminName = nameRes.content.trim()
            
            // 显示输入手机号码的弹窗
            uni.showModal({
              title: '设置厂长',
              content: '请输入厂长的手机号码',
              editable: true,
              placeholderText: '请输入手机号码',
              success: (phoneRes) => {
                if (phoneRes.confirm && phoneRes.content) {
                  const phoneNumber = phoneRes.content.trim()
                  
                  if (!/^1[3-9]\d{9}$/.test(phoneNumber)) {
                    uni.showToast({
                      title: '请输入正确的手机号码',
                      icon: 'none'
                    })
                    return
                  }
                  
                  // 检查是否是首位厂长
                  const existingAdmins = this.users.filter(u => u.role === '厂长' && u.enterpriseName === (user.enterpriseName || '未分配'))
                  const isFirstAdmin = existingAdmins.length === 0
                  
                  // 创建或更新用户信息
                  const updatedUser = {
                    username: phoneNumber,
                    phone: phoneNumber,
                    name: adminName,
                    role: '厂长',
                    registerTime: new Date().toLocaleString(),
                    enterpriseName: user.enterpriseName || '未分配',
                    productionLines: isFirstAdmin ? [productionLines[0].id || 1] : []
                  }
                  
                  // 更新本地存储
                  this.updateUserInStorage(updatedUser)
                  
                  // 重新加载用户列表
                  this.loadUsers()
                  
                  uni.showToast({
                    title: isFirstAdmin ? '设置成功，该手机号码登录后将显示厂长管理页面并默认绑定第一条产线' : '设置成功，该手机号码登录后将显示厂长管理页面',
                    icon: 'success'
                  })
                }
              }
            })
          }
        }
      })
    },
    removeAdminRole(user) {
      uni.showModal({
        title: '取消厂长',
        content: `确定要取消 ${user.name || user.phone || user.username} 的厂长角色吗？`,
        confirmText: '确定',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            // 更新用户角色
            const updatedUser = {
              ...user,
              role: '工人',
              phone: user.phone || user.username,
              username: user.phone || user.username // 确保用户名与手机号一致
            }
            
            // 更新本地存储
            this.updateUserInStorage(updatedUser)
            
            // 重新加载用户列表
            this.loadUsers()
            
            uni.showToast({
              title: '取消成功',
              icon: 'success'
            })
          }
        }
      })
    },
    showAddEmployeeDialog() {
      // 重置表单
      this.addEmployeeForm = {
        name: '',
        phone: ''
      }
      
      // 显示姓名输入框
      uni.showModal({
        title: '新增员工',
        content: '请输入员工姓名',
        editable: true,
        placeholderText: '请输入员工姓名',
        success: (nameRes) => {
          if (nameRes.confirm && nameRes.content) {
            this.addEmployeeForm.name = nameRes.content.trim()
            
            // 显示手机号输入框
            uni.showModal({
              title: '新增员工',
              content: '请输入员工手机号码',
              editable: true,
              placeholderText: '请输入手机号码',
              success: (phoneRes) => {
                if (phoneRes.confirm && phoneRes.content) {
                  this.addEmployeeForm.phone = phoneRes.content.trim()
                  
                  // 验证表单
                  if (!this.addEmployeeForm.name) {
                    uni.showToast({
                      title: '请输入姓名',
                      icon: 'none'
                    })
                    return
                  }
                  
                  if (!this.addEmployeeForm.phone) {
                    uni.showToast({
                      title: '请输入手机号码',
                      icon: 'none'
                    })
                    return
                  }
                  
                  if (!/^1[3-9]\d{9}$/.test(this.addEmployeeForm.phone)) {
                    uni.showToast({
                      title: '请输入正确的手机号码',
                      icon: 'none'
                    })
                    return
                  }
                  
                  // 创建新员工
                  const newEmployee = {
                    username: this.addEmployeeForm.phone,
                    phone: this.addEmployeeForm.phone,
                    name: this.addEmployeeForm.name,
                    role: '工人',
                    registerTime: new Date().toLocaleString(),
                    enterpriseName: this.getCurrentEnterpriseName()
                  }
                  
                  // 保存到本地存储
                  this.updateUserInStorage(newEmployee)
                  
                  // 重新加载用户列表
                  this.loadUsers()
                  
                  uni.showToast({
                    title: '员工添加成功',
                    icon: 'success'
                  })
                }
              }
            })
          }
        }
      })
    },
    getCurrentEnterpriseName() {
      // 获取当前企业名称
      const currentUser = uni.getStorageSync('userInfo') || {}
      const enterpriseApplications = uni.getStorageSync('enterpriseApplications') || []
      const currentApp = enterpriseApplications.find(app => app.userId === currentUser.username)
      return currentApp ? currentApp.enterpriseName : '未分配'
    },
    updateUserInStorage(user) {
      // 更新用户信息
      uni.setStorageSync('userInfo_' + user.username, user)
      
      // 保存到用户列表
      const users = uni.getStorageSync('users') || []
      const existingIndex = users.findIndex(u => u.username === user.username)
      
      if (existingIndex >= 0) {
        users[existingIndex] = user
      } else {
        users.push(user)
      }
      
      uni.setStorageSync('users', users)
    },
    viewUserDetail(user) {
      uni.showModal({
        title: '用户详情',
        content: `用户名: ${user.username}\n姓名: ${user.name || '未设置'}\n手机号: ${user.phone || user.username}\n角色: ${user.role === '班组长' ? '厂长' : user.role}\n注册时间: ${user.registerTime || '未知'}\n企业: ${user.enterpriseName || '未分配'}`,
        showCancel: false
      })
    },
    changePhoneNumber(user) {
      // 显示输入新手机号码的弹窗
      uni.showModal({
        title: '变更手机号码',
        content: '请输入新的手机号码',
        editable: true,
        placeholderText: '请输入新手机号码',
        success: (res) => {
          if (res.confirm && res.content) {
            const newPhoneNumber = res.content.trim()
            
            if (!/^1[3-9]\d{9}$/.test(newPhoneNumber)) {
              uni.showToast({
                title: '请输入正确的手机号码',
                icon: 'none'
              })
              return
            }
            
            // 更新用户信息
            const updatedUser = {
              username: newPhoneNumber,
              phone: newPhoneNumber,
              name: user.name,
              role: user.role,
              registerTime: user.registerTime || new Date().toLocaleString(),
              enterpriseName: user.enterpriseName || '未分配'
            }
            
            // 更新本地存储
            this.updateUserInStorage(updatedUser)
            
            // 更新企业申请记录
            const applications = uni.getStorageSync('enterpriseApplications') || []
            const updatedApplications = applications.map(app => {
              if (app.userId === user.username) {
                return {
                  ...app,
                  userId: newPhoneNumber,
                  phone: newPhoneNumber
                }
              }
              return app
            })
            uni.setStorageSync('enterpriseApplications', updatedApplications)
            
            // 重新加载用户列表
            this.loadUsers()
            
            uni.showToast({
              title: '手机号码变更成功，新号码登录后将保持工厂权限',
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
.user-management-container {
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

.search-bar {
  display: flex;
  gap: 10rpx;
  margin-bottom: 20rpx;
}

.search-input {
  flex: 1;
  height: 70rpx;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  padding: 0 15rpx;
  font-size: 24rpx;
  background-color: #fff;
}

.search-btn {
  background-color: #4A90E2;
  color: #fff;
  font-size: 24rpx;
  padding: 0 30rpx;
  border-radius: 10rpx;
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.user-item {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.user-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
  padding-bottom: 15rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.user-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.user-role {
  font-size: 22rpx;
  padding: 5rpx 15rpx;
  border-radius: 15rpx;
}

.role-enterprise {
  background-color: #e6f7ff;
  color: #1890ff;
}

.role-team-leader {
  background-color: #f6ffed;
  color: #52c41a;
}

.role-worker {
  background-color: #fff7e6;
  color: #faad14;
}

.role-app-holder {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.user-details {
  margin-bottom: 15rpx;
}

.detail-text {
  display: block;
  font-size: 24rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.user-actions {
  display: flex;
  gap: 10rpx;
}

.action-btn {
  flex: 1;
  height: 60rpx;
  border-radius: 10rpx;
  font-size: 24rpx;
}

.role-btn {
  background-color: #52c41a;
  color: #fff;
}

.view-btn {
  background-color: #4A90E2;
  color: #fff;
}

.phone-btn {
  background-color: #faad14;
  color: #fff;
}

.empty-state {
  text-align: center;
  padding: 60rpx;
  background-color: #fff;
  border-radius: 15rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.empty-state text {
  font-size: 24rpx;
  color: #999;
}
</style>