<template>
  <view class="organization-management-container">
    <view class="header">
      <text class="title">组织架构管理</text>
    </view>
    
    <!-- 组织架构说明 -->
    <view class="organization-info">
      <text class="info-text">在这里管理工厂的组织架构，包括车间、班组等信息</text>
    </view>
    
    <!-- 组织架构列表 -->
    <view class="organization-list">
      <view class="list-header">
        <text class="header-title">组织架构列表</text>
        <button class="add-btn" @click="addDepartment">+ 添加</button>
      </view>
      
      <view v-if="departments.length === 0" class="empty-state">
        <text class="empty-text">暂无组织架构数据</text>
        <button class="empty-btn" @click="addDepartment">添加第一个部门</button>
      </view>
      
      <view v-else class="department-list">
        <view v-for="(dept, index) in departments" :key="dept.id" class="department-item">
          <view class="department-info">
            <text class="department-name">{{ dept.name }}</text>
            <text class="department-type">{{ dept.type }}</text>
          </view>
          <view class="department-actions">
            <button class="edit-btn" @click="editDepartment(dept)">编辑</button>
            <button class="delete-btn" @click="deleteDepartment(dept.id)">删除</button>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 添加/编辑部门弹窗 -->
    <view v-if="showModal" class="modal-overlay" @click="closeModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ isEditing ? '编辑部门' : '添加部门' }}</text>
          <text class="close-btn" @click="closeModal">✕</text>
        </view>
        <view class="modal-body">
          <view class="form-item">
            <text class="label">部门名称</text>
            <input type="text" v-model="formData.name" placeholder="请输入部门名称" class="input" />
          </view>
          <view class="form-item">
            <text class="label">部门类型</text>
            <picker @change="handleTypeChange" :value="typeIndex" :range="departmentTypes">
              <view class="picker">
                {{ departmentTypes[typeIndex] }}
              </view>
            </picker>
          </view>
        </view>
        <view class="modal-footer">
          <button class="cancel-btn" @click="closeModal">取消</button>
          <button class="confirm-btn" @click="saveDepartment">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      departments: [],
      showModal: false,
      isEditing: false,
      editingId: null,
      formData: {
        name: '',
        type: '车间'
      },
      typeIndex: 0,
      departmentTypes: ['车间', '班组', '部门']
    }
  },
  onLoad() {
    this.loadDepartments()
  },
  methods: {
    loadDepartments() {
      // 从本地存储加载组织架构数据
      const storedDepartments = uni.getStorageSync('departments') || [
        { id: 1, name: '裁剪车间', type: '车间' },
        { id: 2, name: '缝纫车间', type: '车间' },
        { id: 3, name: '后整车间', type: '车间' },
        { id: 4, name: '包装车间', type: '车间' }
      ]
      this.departments = storedDepartments
    },
    addDepartment() {
      this.isEditing = false
      this.editingId = null
      this.formData = {
        name: '',
        type: '车间'
      }
      this.typeIndex = 0
      this.showModal = true
    },
    editDepartment(dept) {
      this.isEditing = true
      this.editingId = dept.id
      this.formData = {
        name: dept.name,
        type: dept.type
      }
      this.typeIndex = this.departmentTypes.indexOf(dept.type)
      this.showModal = true
    },
    deleteDepartment(id) {
      uni.showModal({
        title: '删除部门',
        content: '确定要删除这个部门吗？',
        success: (res) => {
          if (res.confirm) {
            this.departments = this.departments.filter(dept => dept.id !== id)
            this.saveDepartments()
            uni.showToast({
              title: '删除成功',
              icon: 'success'
            })
          }
        }
      })
    },
    saveDepartment() {
      if (!this.formData.name.trim()) {
        uni.showToast({
          title: '请输入部门名称',
          icon: 'none'
        })
        return
      }
      
      if (this.isEditing) {
        // 编辑现有部门
        const index = this.departments.findIndex(dept => dept.id === this.editingId)
        if (index !== -1) {
          this.departments[index] = {
            ...this.departments[index],
            name: this.formData.name.trim(),
            type: this.formData.type
          }
        }
      } else {
        // 添加新部门
        const newDepartment = {
          id: Date.now(),
          name: this.formData.name.trim(),
          type: this.formData.type
        }
        this.departments.push(newDepartment)
      }
      
      this.saveDepartments()
      this.closeModal()
      uni.showToast({
        title: this.isEditing ? '编辑成功' : '添加成功',
        icon: 'success'
      })
    },
    saveDepartments() {
      // 保存组织架构数据到本地存储
      uni.setStorageSync('departments', this.departments)
    },
    closeModal() {
      this.showModal = false
    },
    handleTypeChange(e) {
      this.typeIndex = e.detail.value
      this.formData.type = this.departmentTypes[this.typeIndex]
    }
  }
}
</script>

<style scoped>
.organization-management-container {
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

.organization-info {
  background-color: #f6ffed;
  border: 1rpx solid #b7eb8f;
  border-radius: 10rpx;
  padding: 15rpx;
  margin-bottom: 20rpx;
}

.info-text {
  font-size: 20rpx;
  color: #389e0d;
  line-height: 1.4;
  text-align: center;
}

.organization-list {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #e0e0e0;
}

.header-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.add-btn {
  background-color: #4A90E2;
  color: #fff;
  border: none;
  border-radius: 10rpx;
  padding: 10rpx 20rpx;
  font-size: 24rpx;
  font-weight: bold;
}

.empty-state {
  text-align: center;
  padding: 60rpx 0;
}

.empty-text {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 20rpx;
  display: block;
}

.empty-btn {
  background-color: #4A90E2;
  color: #fff;
  border: none;
  border-radius: 10rpx;
  padding: 15rpx 30rpx;
  font-size: 24rpx;
  font-weight: bold;
}

.department-list {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.department-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background-color: #f9f9f9;
  border-radius: 10rpx;
  border-left: 4rpx solid #4A90E2;
}

.department-info {
  flex: 1;
}

.department-name {
  font-size: 24rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 5rpx;
}

.department-type {
  font-size: 20rpx;
  color: #666;
  background-color: #e6f7ff;
  padding: 2rpx 10rpx;
  border-radius: 10rpx;
  display: inline-block;
}

.department-actions {
  display: flex;
  gap: 10rpx;
}

.edit-btn, .delete-btn {
  padding: 10rpx 20rpx;
  border-radius: 10rpx;
  font-size: 20rpx;
  font-weight: bold;
  border: none;
}

.edit-btn {
  background-color: #faad14;
  color: #fff;
}

.delete-btn {
  background-color: #ff4d4f;
  color: #fff;
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
  z-index: 9999;
}

.modal-content {
  background-color: #fff;
  border-radius: 15rpx;
  width: 80%;
  max-width: 500rpx;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  border-bottom: 1rpx solid #e0e0e0;
}

.modal-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.close-btn {
  font-size: 32rpx;
  color: #999;
  cursor: pointer;
}

.modal-body {
  padding: 30rpx 20rpx;
}

.form-item {
  margin-bottom: 20rpx;
}

.label {
  font-size: 24rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.input {
  border: 1rpx solid #e0e0e0;
  border-radius: 10rpx;
  padding: 20rpx;
  font-size: 24rpx;
  width: 100%;
}

.picker {
  border: 1rpx solid #e0e0e0;
  border-radius: 10rpx;
  padding: 20rpx;
  font-size: 24rpx;
  background-color: #f9f9f9;
}

.modal-footer {
  display: flex;
  border-top: 1rpx solid #e0e0e0;
}

.cancel-btn, .confirm-btn {
  flex: 1;
  height: 80rpx;
  border: none;
  font-size: 24rpx;
  font-weight: bold;
}

.cancel-btn {
  background-color: #f0f0f0;
  color: #333;
  border-right: 1rpx solid #e0e0e0;
}

.confirm-btn {
  background-color: #4A90E2;
  color: #fff;
}
</style>