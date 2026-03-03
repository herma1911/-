<template>
  <view class="recruitment-management-container">
    <view class="header">
      <text class="title">招聘管理</text>
    </view>
    
    <!-- 选项卡 -->
    <view class="tab-buttons">
      <button :type="activeTab === 'applications' ? 'primary' : 'default'" class="tab-button" @click="switchTab('applications')">申请管理</button>
      <button :type="activeTab === 'employees' ? 'primary' : 'default'" class="tab-button" @click="switchTab('employees')">员工管理</button>
      <button :type="activeTab === 'departure' ? 'primary' : 'default'" class="tab-button" @click="switchTab('departure')">离职管理</button>
    </view>
    
    <!-- 申请管理 -->
    <view v-if="activeTab === 'applications'" class="tab-content">
      <!-- 批量操作按钮 -->
      <view v-if="jobApplications.length > 0" class="batch-actions">
        <button class="batch-btn" @click="batchScreening">一键通过初筛</button>
        <button class="batch-btn" @click="batchInterviewInvite">一键发送面试邀请</button>
      </view>
      <view v-for="(app, index) in jobApplications" :key="app.id" class="application-item">
        <view class="app-header">
          <text class="app-title">申请 #{{ app.id }}</text>
          <text class="app-status" :class="app.status">{{ getStatusText(app.status) }}</text>
        </view>
        <view class="app-details">
          <text class="detail-text">申请职位：{{ getJobTitle(app.jobId) }}</text>
          <text class="detail-text">申请人：{{ getApplicantName(app.applicantId) }}</text>
          <text class="detail-text">申请日期：{{ formatDate(app.applyDate) }}</text>
          <text v-if="app.notes" class="detail-text">备注：{{ app.notes }}</text>
        </view>
        <view class="app-actions">
          <button v-if="app.status === 'pending'" class="action-btn approve-btn" @click="startScreening(app)">开始筛选</button>
          <button v-if="app.status === 'screening'" class="action-btn approve-btn" @click="sendInterviewInvite(app)">发送面试邀请</button>
          <button v-if="app.status === 'interview_invited'" class="action-btn approve-btn" @click="startInterview(app)">开始面试</button>
          <button v-if="app.status === 'interviewing'" class="action-btn hire-btn" @click="approveHire(app)">同意入职</button>
          <button v-if="app.status === 'pending' || app.status === 'screening' || app.status === 'interview_invited'" class="action-btn reject-btn" @click="rejectApplication(app)">拒绝</button>
          <button class="action-btn note-btn" @click="addNote(app)">添加备注</button>
        </view>
      </view>
      <view v-if="jobApplications.length === 0" class="empty-state">
        <text>暂无申请记录</text>
      </view>
    </view>
    
    <!-- 员工管理 -->
    <view v-if="activeTab === 'employees'" class="tab-content">
      <view v-for="(emp, index) in employees" :key="emp.id" class="employee-item">
        <view class="emp-header">
          <text class="emp-name">{{ emp.name }}</text>
          <text class="emp-status" :class="emp.status">{{ emp.status }}</text>
        </view>
        <view class="emp-details">
          <text class="detail-text">职位：{{ emp.position }}</text>
          <text class="detail-text">入职日期：{{ emp.hireDate }}</text>
          <text class="detail-text">联系方式：139****6666</text>
        </view>
        <view class="emp-actions">
          <button class="action-btn fire-btn" @click="initiateFiring(emp)">发起辞退</button>
        </view>
      </view>
      <view v-if="employees.length === 0" class="empty-state">
        <text>暂无员工记录</text>
      </view>
    </view>
    
    <!-- 离职管理 -->
    <view v-if="activeTab === 'departure'" class="tab-content">
      <view v-for="(dep, index) in departureRequests" :key="dep.id" class="departure-item">
        <view class="dep-header">
          <text class="dep-title">{{ dep.employeeName }}</text>
          <text class="dep-status" :class="dep.status">{{ getDepartureStatusText(dep.status) }}</text>
        </view>
        <view class="dep-details">
          <text class="detail-text">离职类型：{{ dep.type }}</text>
          <text class="detail-text">申请日期：{{ formatDate(dep.applyDate) }}</text>
          <text v-if="dep.notes" class="detail-text">备注：{{ dep.notes }}</text>
        </view>
        <view class="dep-actions">
          <button v-if="dep.status === 'pending'" class="action-btn approve-btn" @click="approveDeparture(dep)">同意离职</button>
          <button v-if="dep.status === 'pending'" class="action-btn reject-btn" @click="rejectDeparture(dep)">拒绝</button>
          <button v-if="dep.status === 'approved'" class="action-btn confirm-btn" @click="confirmDeparture(dep)">确认离职</button>
        </view>
      </view>
      <view v-if="departureRequests.length === 0" class="empty-state">
        <text>暂无离职记录</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      activeTab: 'applications',
      jobApplications: [],
      employees: [],
      departureRequests: []
    }
  },
  onLoad() {
    this.loadApplications()
    this.loadEmployees()
    this.loadDepartureRequests()
  },
  methods: {
    switchTab(tab) {
      this.activeTab = tab
    },
    loadApplications() {
      this.jobApplications = uni.getStorageSync('jobApplications') || []
    },
    loadEmployees() {
      this.employees = uni.getStorageSync('employees') || []
    },
    loadDepartureRequests() {
      this.departureRequests = uni.getStorageSync('departureRequests') || []
    },
    getStatusText(status) {
      switch (status) {
        case 'pending': return '待查看'
        case 'screening': return '简历筛选中'
        case 'interview_invited': return '面试邀请'
        case 'interviewing': return '面试中'
        case 'hired': return '已录用'
        case 'rejected': return '已拒绝'
        default: return status
      }
    },
    getDepartureStatusText(status) {
      switch (status) {
        case 'pending': return '待处理'
        case 'approved': return '已同意'
        case 'confirmed': return '已确认'
        case 'rejected': return '已拒绝'
        default: return status
      }
    },
    getJobTitle(jobId) {
      // 模拟获取职位名称
      const jobs = [
        { id: 1, title: '服装设计师' },
        { id: 2, title: '缝纫工' },
        { id: 3, title: '质检员' },
        { id: 4, title: '拷边工' },
        { id: 5, title: '拉链工' },
        { id: 6, title: '全能缝纫工' }
      ]
      const job = jobs.find(j => j.id === jobId)
      return job ? job.title : '未知职位'
    },
    getApplicantName(applicantId) {
      // 模拟获取申请人姓名
      const applicants = [
        { id: 1, name: '当前用户' },
        { id: 2, name: '张三' },
        { id: 3, name: '李四' },
        { id: 4, name: '王五' }
      ]
      const applicant = applicants.find(a => a.id === applicantId)
      return applicant ? applicant.name : '未知申请人'
    },
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString()
    },
    startScreening(app) {
      app.status = 'screening'
      uni.setStorageSync('jobApplications', this.jobApplications)
      uni.showToast({
        title: '已开始筛选',
        icon: 'success'
      })
    },
    sendInterviewInvite(app) {
      // 弹出面试时间选择
      uni.showModal({
        title: '发送面试邀请',
        content: '请选择3个面试时间段',
        success: (res) => {
          if (res.confirm) {
            app.status = 'interview_invited'
            app.interviewTimeSlots = [
              new Date(Date.now() + 86400000).toISOString(), // 明天
              new Date(Date.now() + 172800000).toISOString(), // 后天
              new Date(Date.now() + 259200000).toISOString() // 大后天
            ]
            uni.setStorageSync('jobApplications', this.jobApplications)
            uni.showToast({
              title: '面试邀请已发送',
              icon: 'success'
            })
          }
        }
      })
    },
    startInterview(app) {
      app.status = 'interviewing'
      uni.setStorageSync('jobApplications', this.jobApplications)
      uni.showToast({
        title: '面试已开始',
        icon: 'success'
      })
    },
    batchScreening() {
      const pendingApps = this.jobApplications.filter(app => app.status === 'pending')
      if (pendingApps.length === 0) {
        uni.showToast({
          title: '没有待处理的申请',
          icon: 'none'
        })
        return
      }
      pendingApps.forEach(app => {
        app.status = 'screening'
      })
      uni.setStorageSync('jobApplications', this.jobApplications)
      uni.showToast({
        title: `已批量通过 ${pendingApps.length} 个申请的初筛`,
        icon: 'success'
      })
    },
    batchInterviewInvite() {
      const screeningApps = this.jobApplications.filter(app => app.status === 'screening')
      if (screeningApps.length === 0) {
        uni.showToast({
          title: '没有筛选中的申请',
          icon: 'none'
        })
        return
      }
      screeningApps.forEach(app => {
        app.status = 'interview_invited'
        app.interviewTimeSlots = [
          new Date(Date.now() + 86400000).toISOString(),
          new Date(Date.now() + 172800000).toISOString(),
          new Date(Date.now() + 259200000).toISOString()
        ]
      })
      uni.setStorageSync('jobApplications', this.jobApplications)
      uni.showToast({
        title: `已批量发送 ${screeningApps.length} 个面试邀请`,
        icon: 'success'
      })
    },
    rejectApplication(app) {
      // 弹出面试评价
      uni.showModal({
        title: '面试评价',
        content: '请填写面试评价',
        editable: true,
        placeholderText: '如：技能匹配度高、需进一步考察等',
        success: (res) => {
          if (res.confirm) {
            app.status = 'rejected'
            app.interviewFeedback = res.content || '未提供评价'
            uni.setStorageSync('jobApplications', this.jobApplications)
            uni.showToast({
              title: '已拒绝申请',
              icon: 'success'
            })
          }
        }
      })
    },
    approveHire(app) {
      // 弹出面试评价
      uni.showModal({
        title: '面试评价',
        content: '请填写面试评价',
        editable: true,
        placeholderText: '如：技能匹配度高、需进一步考察等',
        success: (res) => {
          if (res.confirm && res.content) {
            app.status = 'hired'
            app.interviewFeedback = res.content
            uni.setStorageSync('jobApplications', this.jobApplications)
            
            // 添加到员工列表
            const newEmployee = {
              id: Date.now(),
              name: this.getApplicantName(app.applicantId),
              position: this.getJobTitle(app.jobId),
              hireDate: new Date().toISOString(),
              departureDate: null,
              status: '在职',
              phone: '13800138000' // 模拟电话号码
            }
            this.employees.push(newEmployee)
            uni.setStorageSync('employees', this.employees)
            
            uni.showToast({
              title: '已同意入职',
              icon: 'success'
            })
          }
        }
      })
    },
    addNote(app) {
      uni.showModal({
        title: '添加备注',
        content: '请输入备注内容',
        editable: true,
        placeholderText: '请输入备注',
        success: (res) => {
          if (res.confirm && res.content) {
            app.notes = res.content
            uni.setStorageSync('jobApplications', this.jobApplications)
            uni.showToast({
              title: '备注添加成功',
              icon: 'success'
            })
          }
        }
      })
    },
    initiateFiring(emp) {
      uni.showModal({
        title: '发起辞退',
        content: `确定要辞退 ${emp.name} 吗？`,
        confirmText: '确定',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            // 创建离职申请
            const newDepartureRequest = {
              id: Date.now(),
              employeeId: emp.id,
              employeeName: emp.name,
              type: '辞退',
              status: 'pending',
              applyDate: new Date().toISOString(),
              notes: ''
            }
            this.departureRequests.push(newDepartureRequest)
            uni.setStorageSync('departureRequests', this.departureRequests)
            
            uni.showToast({
              title: '已发起辞退',
              icon: 'success'
            })
          }
        }
      })
    },
    approveDeparture(dep) {
      dep.status = 'approved'
      uni.setStorageSync('departureRequests', this.departureRequests)
      uni.showToast({
        title: '已同意离职',
        icon: 'success'
      })
    },
    rejectDeparture(dep) {
      dep.status = 'rejected'
      uni.setStorageSync('departureRequests', this.departureRequests)
      uni.showToast({
        title: '已拒绝离职',
        icon: 'success'
      })
    },
    confirmDeparture(dep) {
      dep.status = 'confirmed'
      uni.setStorageSync('departureRequests', this.departureRequests)
      
      // 更新员工状态
      const updatedEmployees = this.employees.map(emp => {
        if (emp.id === dep.employeeId) {
          return {
            ...emp,
            status: '已离职',
            departureDate: new Date().toISOString()
          }
        }
        return emp
      })
      this.employees = updatedEmployees
      uni.setStorageSync('employees', this.employees)
      
      uni.showToast({
        title: '已确认离职',
        icon: 'success'
      })
    }
  }
}
</script>

<style scoped>
.recruitment-management-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  background-color: #4A90E2;
  color: #fff;
  padding: 30rpx;
  border-radius: 15rpx;
  margin-bottom: 30rpx;
  text-align: center;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
}

.tab-buttons {
  display: flex;
  gap: 10rpx;
  margin-bottom: 30rpx;
}

.tab-button {
  flex: 1;
  padding: 20rpx;
  font-size: 24rpx;
  border-radius: 10rpx;
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.batch-actions {
  display: flex;
  gap: 10rpx;
  margin-bottom: 10rpx;
}

.batch-btn {
  flex: 1;
  height: 60rpx;
  border-radius: 10rpx;
  font-size: 24rpx;
  background-color: #4A90E2;
  color: #fff;
}

.application-item,
.employee-item,
.departure-item {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.app-header,
.emp-header,
.dep-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
  padding-bottom: 15rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.app-title,
.emp-name,
.dep-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.app-status,
.emp-status,
.dep-status {
  font-size: 22rpx;
  padding: 5rpx 15rpx;
  border-radius: 15rpx;
}

.app-status.pending,
.dep-status.pending {
  background-color: #fff7e6;
  color: #faad14;
}

.app-status.screening {
  background-color: #f6ffed;
  color: #52c41a;
}

.app-status.interview_invited {
  background-color: #e6f7ff;
  color: #1890ff;
}

.app-status.interviewing {
  background-color: #f0f5ff;
  color: #722ed1;
}

.app-status.hired,
.emp-status.在职 {
  background-color: #f6ffed;
  color: #52c41a;
}

.app-status.rejected,
.dep-status.rejected {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.dep-status.approved {
  background-color: #e6f7ff;
  color: #1890ff;
}

.dep-status.confirmed {
  background-color: #f5f5f5;
  color: #999;
}

.app-details,
.emp-details,
.dep-details {
  margin-bottom: 20rpx;
}

.detail-text {
  display: block;
  font-size: 24rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.app-actions,
.emp-actions,
.dep-actions {
  display: flex;
  gap: 10rpx;
}

.action-btn {
  flex: 1;
  height: 60rpx;
  border-radius: 10rpx;
  font-size: 24rpx;
}

.approve-btn {
  background-color: #52c41a;
  color: #fff;
}

.reject-btn {
  background-color: #ff4d4f;
  color: #fff;
}

.hire-btn {
  background-color: #1890ff;
  color: #fff;
}

.note-btn {
  background-color: #faad14;
  color: #fff;
}

.fire-btn {
  background-color: #ff4d4f;
  color: #fff;
}

.confirm-btn {
  background-color: #1890ff;
  color: #fff;
}

.empty-state {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 40rpx;
  text-align: center;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.empty-state text {
  font-size: 24rpx;
  color: #999;
}
</style>