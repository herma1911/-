<template>
  <view class="sub-account-management-container">
    <view class="header">
      <text class="title">子账号管理</text>
      <text class="subtitle">工厂主专属 - 精细化管理工厂内部账号</text>
    </view>
    
    <!-- 子账号列表 -->
    <view class="account-list-section">
      <text class="section-title">子账号列表</text>
      <view class="account-list">
        <view v-for="(account, index) in subAccounts" :key="account.id" class="account-item">
          <view class="account-header">
            <text class="account-name">{{account.name}}</text>
            <text class="account-role">{{account.role || '未设置'}}</text>
            <text class="account-position">{{account.position}}</text>
            <text :class="['account-status', account.status]" v-if="account.status === 'active'">活跃</text>
            <text :class="['account-status', account.status]" v-else>已停用</text>
          </view>
          <view class="account-details">
            <text class="detail-text">手机号：{{maskPhone(account.phone)}}</text>
            <text class="detail-text">解锁额度：{{account.unlockQuota || 0}}次/月</text>
            <text class="detail-text">创建时间：{{account.createdAt}}</text>
          </view>
          <view class="account-actions">
            <button class="action-btn edit-btn" @click="editAccount(account)">编辑</button>
            <button v-if="account.status === 'active'" class="action-btn disable-btn" @click="disableAccount(account)">停用</button>
            <button v-else class="action-btn enable-btn" @click="enableAccount(account)">启用</button>
            <button class="action-btn delete-btn" @click="deleteAccount(account)">删除</button>
          </view>
        </view>
        <view v-if="subAccounts.length === 0" class="empty-state">
          <text>暂无子账号，点击下方按钮创建</text>
        </view>
      </view>
    </view>
    
    <!-- 创建子账号按钮 -->
    <view class="create-section">
      <button class="create-btn" @click="createAccount">+ 创建子账号</button>
    </view>
    
    <!-- 子账号创建/编辑弹窗 -->
    <view v-if="showAccountModal" class="modal-overlay" @click="closeAccountModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{editingAccount ? '编辑子账号' : '创建子账号'}}</text>
        </view>
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">负责人姓名</text>
            <input type="text" v-model="formData.name" placeholder="请输入姓名" class="form-input" />
          </view>
          <view class="form-item">
            <text class="form-label">手机号码</text>
            <input type="number" v-model="formData.phone" placeholder="请输入手机号" class="form-input" />
          </view>
          <view class="form-item">
            <text class="form-label">角色</text>
            <picker :value="roleIndex" :range="roles" @change="roleChange">
              <view class="picker">
                {{ roles[roleIndex] }}
              </view>
            </picker>
          </view>
          <view class="form-item">
            <text class="form-label">岗位名称</text>
            <input type="text" v-model="formData.position" placeholder="如：人事经理、财务主管" class="form-input" />
          </view>
          <view class="form-item">
            <text class="form-label">解锁额度（次/月）</text>
            <input type="number" v-model.number="formData.unlockQuota" placeholder="0" class="form-input" />
          </view>
          <view class="form-item checkbox-group">
            <text class="form-label">权限设置</text>
            <view class="permission-list">
              <view class="permission-item">
                <checkbox :checked="formData.permissions.includes('publishRecruitment')" @change="togglePermission('publishRecruitment')" />
                <text class="permission-label">发布/管理招聘信息</text>
              </view>
              <view class="permission-item">
                <checkbox :checked="formData.permissions.includes('manageApplications')" @change="togglePermission('manageApplications')" />
                <text class="permission-label">管理职位申请</text>
              </view>
              <view class="permission-item">
                <checkbox :checked="formData.permissions.includes('viewEmployeeInfo')" @change="togglePermission('viewEmployeeInfo')" />
                <text class="permission-label">查看员工信息</text>
              </view>
              <view class="permission-item">
                <checkbox :checked="formData.permissions.includes('unlockPhone')" @change="togglePermission('unlockPhone')" />
                <text class="permission-label">解锁员工手机号</text>
              </view>
              <view class="permission-item">
                <checkbox :checked="formData.permissions.includes('initiateDismissal')" @change="togglePermission('initiateDismissal')" />
                <text class="permission-label">发起员工辞退</text>
              </view>
              <view class="permission-item">
                <checkbox :checked="formData.permissions.includes('viewProductionData')" @change="togglePermission('viewProductionData')" />
                <text class="permission-label">查看生产数据</text>
              </view>
              <view class="permission-item">
                <checkbox :checked="formData.permissions.includes('viewFinancialData')" @change="togglePermission('viewFinancialData')" />
                <text class="permission-label">查看财务数据</text>
              </view>
              <view class="permission-item">
                <checkbox :checked="formData.permissions.includes('setWage')" @change="togglePermission('setWage')" />
                <text class="permission-label">设置打工价</text>
              </view>
              <view class="permission-item">
                <checkbox :checked="formData.permissions.includes('generateInviteCode')" @change="togglePermission('generateInviteCode')" />
                <text class="permission-label">生成邀请码</text>
              </view>
              <view class="permission-item">
                <checkbox :checked="formData.permissions.includes('viewTeamData')" @change="togglePermission('viewTeamData')" />
                <text class="permission-label">查看该组生成数据</text>
              </view>
              <view class="permission-item">
                <checkbox :checked="formData.permissions.includes('confirmReconciliation')" @change="togglePermission('confirmReconciliation')" />
                <text class="permission-label">确认工人对账单</text>
              </view>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <button class="cancel-button" @click="closeAccountModal">取消</button>
          <button class="confirm-button" @click="saveAccount">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      subAccounts: [],
      showAccountModal: false,
      editingAccount: null,
      roles: ['工厂人事/招工管理员', '工厂财务', '厂长', '组长'], 
      roleIndex: 0,
      formData: {
        name: '',
        phone: '',
        role: '',
        position: '',
        unlockQuota: 0,
        permissions: []
      }
    }
  },
  onLoad() {
    this.loadSubAccounts()
  },
  methods: {
    loadSubAccounts() {
      // 从本地存储加载子账号数据
      const subAccounts = uni.getStorageSync('subAccounts') || [
        {
          id: '1',
          name: '李四',
          phone: '13900139000',
          role: '工厂人事/招工管理员',
          position: '招聘主管',
          status: 'active',
          unlockQuota: 30,
          permissions: ['publishRecruitment', 'manageApplications', 'viewEmployeeInfo', 'unlockPhone', 'initiateDismissal'],
          createdAt: '2026-02-21'
        },
        {
          id: '2',
          name: '王五',
          phone: '13700137000',
          role: '工厂财务',
          position: '财务主管',
          status: 'active',
          unlockQuota: 0,
          permissions: ['viewFinancialData'],
          createdAt: '2026-02-22'
        },
        {
          id: '3',
          name: '赵六',
          phone: '13800138000',
          role: '厂长',
          position: '生产厂长',
          status: 'active',
          unlockQuota: 50,
          permissions: ['publishRecruitment', 'manageApplications', 'viewEmployeeInfo', 'unlockPhone', 'initiateDismissal', 'viewProductionData'],
          createdAt: '2026-02-23'
        },
        {
          id: '4',
          name: '钱七',
          phone: '13600136000',
          role: '组长',
          position: '缝纫组组长',
          status: 'active',
          unlockQuota: 20,
          permissions: ['setWage', 'generateInviteCode', 'viewTeamData', 'confirmReconciliation'],
          createdAt: '2026-02-24'
        },
        {
          id: '5',
          name: '孙八',
          phone: '13500135000',
          role: '组长',
          position: '裁剪组组长',
          status: 'active',
          unlockQuota: 20,
          permissions: ['setWage', 'generateInviteCode', 'viewTeamData', 'confirmReconciliation'],
          createdAt: '2026-02-25'
        }
      ]
      this.subAccounts = subAccounts
    },
    maskPhone(phone) {
      if (!phone) return ''
      return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
    },
    createAccount() {
      this.editingAccount = null
      this.roleIndex = 0
      this.formData = {
        name: '',
        phone: '',
        role: this.roles[0],
        position: '',
        unlockQuota: 0,
        permissions: []
      }
      this.setRolePermissions()
      this.showAccountModal = true
    },
    roleChange(e) {
      this.roleIndex = e.detail.value
      this.formData.role = this.roles[this.roleIndex]
      this.setRolePermissions()
    },
    setRolePermissions() {
      const role = this.formData.role
      switch(role) {
        case '工厂人事/招工管理员':
          this.formData.permissions = ['publishRecruitment', 'manageApplications', 'viewEmployeeInfo', 'unlockPhone', 'initiateDismissal']
          this.formData.unlockQuota = 30
          break
        case '工厂财务':
          this.formData.permissions = ['viewFinancialData']
          this.formData.unlockQuota = 0
          break
        case '厂长':
          this.formData.permissions = ['publishRecruitment', 'manageApplications', 'viewEmployeeInfo', 'unlockPhone', 'initiateDismissal', 'viewProductionData']
          this.formData.unlockQuota = 50
          break
        case '组长':
          this.formData.permissions = ['setWage', 'generateInviteCode', 'viewTeamData', 'confirmReconciliation']
          this.formData.unlockQuota = 20
          break
        default:
          this.formData.permissions = []
          this.formData.unlockQuota = 0
      }
    },
    editAccount(account) {
      this.editingAccount = account
      this.formData = {
        name: account.name,
        phone: account.phone,
        role: account.role || '',
        position: account.position,
        unlockQuota: account.unlockQuota || 0,
        permissions: [...(account.permissions || [])]
      }
      this.roleIndex = this.roles.indexOf(account.role) || 0
      this.showAccountModal = true
    },
    saveAccount() {
      if (!this.formData.name || !this.formData.phone || !this.formData.position) {
        uni.showToast({
          title: '请填写完整信息',
          icon: 'none'
        })
        return
      }
      
      if (this.editingAccount) {
        // 更新现有账号
        const index = this.subAccounts.findIndex(a => a.id === this.editingAccount.id)
        if (index !== -1) {
          this.subAccounts[index] = {
            ...this.editingAccount,
            ...this.formData
          }
        }
      } else {
        // 创建新账号
        const newAccount = {
          id: Date.now().toString(),
          ...this.formData,
          status: 'active',
          createdAt: new Date().toISOString().split('T')[0]
        }
        this.subAccounts.push(newAccount)
      }
      
      // 保存到本地存储
      uni.setStorageSync('subAccounts', this.subAccounts)
      
      // 记录操作日志
      this.addOperationLog(this.editingAccount ? '修改子账号' : '创建子账号', this.formData.name)
      
      this.closeAccountModal()
      uni.showToast({
        title: this.editingAccount ? '修改成功' : '创建成功',
        icon: 'success'
      })
    },
    disableAccount(account) {
      uni.showModal({
        title: '停用子账号',
        content: `确定要停用 ${account.name}（${account.position}）吗？`,
        confirmText: '确定',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            const index = this.subAccounts.findIndex(a => a.id === account.id)
            if (index !== -1) {
              this.subAccounts[index].status = 'disabled'
              uni.setStorageSync('subAccounts', this.subAccounts)
              this.addOperationLog('停用子账号', account.name)
              uni.showToast({
                title: '已停用',
                icon: 'success'
              })
            }
          }
        }
      })
    },
    enableAccount(account) {
      uni.showModal({
        title: '启用子账号',
        content: `确定要启用 ${account.name}（${account.position}）吗？`,
        confirmText: '确定',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            const index = this.subAccounts.findIndex(a => a.id === account.id)
            if (index !== -1) {
              this.subAccounts[index].status = 'active'
              uni.setStorageSync('subAccounts', this.subAccounts)
              this.addOperationLog('启用子账号', account.name)
              uni.showToast({
                title: '已启用',
                icon: 'success'
              })
            }
          }
        }
      })
    },
    deleteAccount(account) {
      uni.showModal({
        title: '删除子账号',
        content: `确定要删除 ${account.name}（${account.position}）吗？此操作不可恢复。`,
        confirmText: '确定',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            // 二次确认支付密码
            uni.showModal({
              title: '确认删除',
              content: '请输入工厂主支付密码确认删除',
              editable: true,
              placeholderText: '请输入支付密码',
              success: (pwdRes) => {
                if (pwdRes.confirm && pwdRes.content === '123456') { // 模拟密码验证
                  this.subAccounts = this.subAccounts.filter(a => a.id !== account.id)
                  uni.setStorageSync('subAccounts', this.subAccounts)
                  this.addOperationLog('删除子账号', account.name)
                  uni.showToast({
                    title: '已删除',
                    icon: 'success'
                  })
                } else {
                  uni.showToast({
                    title: '密码错误',
                    icon: 'none'
                  })
                }
              }
            })
          }
        }
      })
    },
    closeAccountModal() {
      this.showAccountModal = false
      this.editingAccount = null
    },
    togglePermission(permission) {
      const index = this.formData.permissions.indexOf(permission)
      if (index === -1) {
        this.formData.permissions.push(permission)
      } else {
        this.formData.permissions.splice(index, 1)
      }
    },
    addOperationLog(action, target) {
      // 添加操作日志
      const operationLogs = uni.getStorageSync('operationLogs') || []
      operationLogs.push({
        id: Date.now().toString(),
        action: action,
        target: target,
        time: new Date().toISOString(),
        operator: '工厂主'
      })
      uni.setStorageSync('operationLogs', operationLogs)
    }
  }
}
</script>

<style scoped>
.sub-account-management-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.header {
  background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
  color: #fff;
  padding: 40rpx 30rpx;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
  text-align: center;
}

.title {
  font-size: 36rpx;
  font-weight: 600;
  margin-bottom: 10rpx;
  display: block;
}

.subtitle {
  font-size: 24rpx;
  opacity: 0.9;
  display: block;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.account-list-section {
  background-color: #fff;
  padding: 30rpx;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.account-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.account-item {
  background-color: #f9f9f9;
  padding: 25rpx;
  border-radius: 15rpx;
  border: 1rpx solid #e8e8e8;
}

.account-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15rpx;
  padding-bottom: 15rpx;
  border-bottom: 1rpx solid #e8e8e8;
}

.account-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.account-role {
  font-size: 20rpx;
  color: #666;
  margin: 0 10rpx;
  background-color: #f6ffed;
  padding: 5rpx 15rpx;
  border-radius: 15rpx;
}

.account-position {
  font-size: 22rpx;
  color: #666;
  margin: 0 10rpx;
  background-color: #e6f7ff;
  padding: 5rpx 15rpx;
  border-radius: 15rpx;
}

.account-status {
  font-size: 20rpx;
  padding: 5rpx 15rpx;
  border-radius: 15rpx;
}

.account-status.active {
  background-color: #f6ffed;
  color: #52c41a;
  border: 1rpx solid #b7eb8f;
}

.account-status.disabled {
  background-color: #fff2e8;
  color: #fa8c16;
  border: 1rpx solid #ffd591;
}

.account-details {
  margin-bottom: 20rpx;
}

.detail-text {
  font-size: 22rpx;
  color: #666;
  margin-bottom: 10rpx;
  display: block;
}

.account-actions {
  display: flex;
  gap: 10rpx;
  flex-wrap: wrap;
}

.action-btn {
  flex: 1;
  min-width: 120rpx;
  height: 60rpx;
  border-radius: 10rpx;
  font-size: 22rpx;
}

.edit-btn {
  background-color: #4A90E2;
  color: #fff;
}

.disable-btn {
  background-color: #fa8c16;
  color: #fff;
}

.enable-btn {
  background-color: #52c41a;
  color: #fff;
}

.delete-btn {
  background-color: #ff4d4f;
  color: #fff;
}

.empty-state {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 24rpx;
}

.create-section {
  margin-bottom: 30rpx;
}

.create-btn {
  background-color: #4A90E2;
  color: #fff;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 600;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  width: 90%;
  max-width: 600rpx;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  margin-bottom: 30rpx;
  text-align: center;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.form-item {
  margin-bottom: 25rpx;
}

.form-label {
  font-size: 24rpx;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.form-input {
  height: 70rpx;
  border: 1rpx solid #e8e8e8;
  border-radius: 10rpx;
  padding: 0 15rpx;
  font-size: 24rpx;
  background-color: #f9f9f9;
}

.picker {
  height: 70rpx;
  border: 1rpx solid #e8e8e8;
  border-radius: 10rpx;
  padding: 0 15rpx;
  font-size: 24rpx;
  background-color: #f9f9f9;
  display: flex;
  align-items: center;
}

.checkbox-group {
  margin-top: 10rpx;
}

.permission-list {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.permission-item {
  display: flex;
  align-items: center;
}

.permission-label {
  font-size: 22rpx;
  color: #333;
  margin-left: 10rpx;
  flex: 1;
}

.modal-footer {
  display: flex;
  gap: 20rpx;
  margin-top: 40rpx;
}

.cancel-button {
  flex: 1;
  height: 70rpx;
  border-radius: 10rpx;
  font-size: 24rpx;
  background-color: #f0f0f0;
  color: #333;
}

.confirm-button {
  flex: 1;
  height: 70rpx;
  border-radius: 10rpx;
  font-size: 24rpx;
  background-color: #4A90E2;
  color: #fff;
}
</style>