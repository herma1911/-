<template>
  <view class="process-query-page">
    <!-- 顶部导航栏 -->
    <view class="nav-header">
      <view class="back-btn" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="page-title">工序查询</text>
      <view class="placeholder"></view>
    </view>

    <!-- 搜索栏 -->
    <view class="search-section">
      <view class="search-bar">
        <text class="search-icon">🔍</text>
        <input type="text" v-model="searchKeyword" placeholder="搜索工序名称、编码或描述" class="search-input" @input="handleSearch" />
        <text v-if="searchKeyword" class="clear-btn" @tap="clearSearch">×</text>
      </view>
    </view>

    <!-- 筛选栏 -->
    <view class="filter-section">
      <view class="filter-row">
        <view class="filter-item">
          <text class="filter-label">服装大类</text>
          <picker @change="handleCategoryChange" :value="selectedCategoryIndex" :range="garmentCategories">
            <view class="filter-value">{{ garmentCategories[selectedCategoryIndex] || '全部' }}</view>
          </picker>
        </view>
        <view class="filter-item">
          <text class="filter-label">细分品类</text>
          <picker @change="handleSubCategoryChange" :value="selectedSubCategoryIndex" :range="filteredSubCategories">
            <view class="filter-value">{{ filteredSubCategories[selectedSubCategoryIndex] || '全部' }}</view>
          </picker>
        </view>
      </view>
      <view class="filter-row">
        <view class="filter-item">
          <text class="filter-label">机种</text>
          <picker @change="handleMachineTypeChange" :value="selectedMachineTypeIndex" :range="machineTypes">
            <view class="filter-value">{{ machineTypes[selectedMachineTypeIndex] || '全部' }}</view>
          </picker>
        </view>
        <view class="filter-item">
          <text class="filter-label">面料类型</text>
          <picker @change="handleFabricTypeChange" :value="selectedFabricTypeIndex" :range="fabricTypes">
            <view class="filter-value">{{ fabricTypes[selectedFabricTypeIndex] || '全部' }}</view>
          </picker>
        </view>
      </view>
    </view>

    <!-- 工序列表 -->
    <view class="process-list-section">
      <view v-if="filteredProcesses.length === 0" class="empty-state">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无符合条件的工序</text>
      </view>
      <view v-else class="process-list">
        <view v-for="process in filteredProcesses" :key="process.process_id" class="process-card" @tap="viewProcessDetail(process)">
          <view class="process-header">
            <text class="process-name">{{ process.process_name }}</text>
            <text class="process-id">{{ process.process_id }}</text>
          </view>
          <view class="process-info">
            <view class="info-row">
              <text class="info-label">所属品类：</text>
              <text class="info-value">{{ process.garment_category }} / {{ process.sub_category }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">适用机种：</text>
              <text class="info-value">{{ process.machine_type }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">标准工时：</text>
              <text class="info-value">{{ process.standard_time }}秒</text>
            </view>
            <view class="info-row">
              <text class="info-label">基准工价：</text>
              <text class="info-value price">{{ process.base_price }}元</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 工序详情弹窗 -->
    <view v-if="showDetail" class="detail-popup-overlay" @tap="closeDetail">
      <view class="detail-popup" @tap.stop>
        <view class="detail-header">
          <text class="detail-title">{{ selectedProcess?.process_name }}</text>
          <text class="detail-id">{{ selectedProcess?.process_id }}</text>
          <text class="close-btn" @tap="closeDetail">×</text>
        </view>
        <view class="detail-content">
          <view class="detail-row">
            <text class="detail-label">服装大类：</text>
            <text class="detail-value">{{ selectedProcess?.garment_category }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">细分品类：</text>
            <text class="detail-value">{{ selectedProcess?.sub_category }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">适用机种：</text>
            <text class="detail-value">{{ selectedProcess?.machine_type }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">适用面料：</text>
            <text class="detail-value">{{ selectedProcess?.fabric_type }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">标准工时：</text>
            <text class="detail-value">{{ selectedProcess?.standard_time }}秒</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">难度系数：</text>
            <text class="detail-value">{{ selectedProcess?.difficulty_coefficient }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">基准工价：</text>
            <text class="detail-value price">{{ selectedProcess?.base_price }}元</text>
          </view>
          <view class="detail-row full-width">
            <text class="detail-label">工序说明：</text>
            <text class="detail-value">{{ selectedProcess?.process_desc }}</text>
          </view>
        </view>
        <view class="detail-actions">
          <button class="action-btn primary" @tap="useProcess">使用此工序</button>
          <button class="action-btn secondary" @tap="closeDetail">关闭</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { 
  initProcessStandardDB, 
  getAllProcesses, 
  getProcessesByCategory, 
  getProcessesBySubCategory, 
  getProcessesByMachineType, 
  getProcessesByFabricType, 
  searchProcesses, 
  getProcessById, 
  getGarmentCategories, 
  getSubCategories, 
  getMachineTypes, 
  getFabricTypes 
} from '../../utils/process-standard-db';

export default {
  data() {
    return {
      // 搜索和筛选
      searchKeyword: '',
      garmentCategories: ['全部'],
      selectedCategoryIndex: 0,
      subCategories: ['全部'],
      selectedSubCategoryIndex: 0,
      machineTypes: ['全部'],
      selectedMachineTypeIndex: 0,
      fabricTypes: ['全部'],
      selectedFabricTypeIndex: 0,
      // 工序数据
      allProcesses: [],
      filteredProcesses: [],
      // 详情弹窗
      showDetail: false,
      selectedProcess: null
    };
  },
  computed: {
    filteredSubCategories() {
      if (this.selectedCategoryIndex === 0) {
        return ['全部', ...this.subCategories.slice(1)];
      } else {
        const selectedCategory = this.garmentCategories[this.selectedCategoryIndex];
        const filtered = this.allProcesses
          .filter(process => process.garment_category === selectedCategory)
          .map(process => process.sub_category);
        const uniqueSubCategories = [...new Set(filtered)];
        return ['全部', ...uniqueSubCategories];
      }
    }
  },
  onLoad() {
    // 初始化数据库
    initProcessStandardDB();
    // 加载数据
    this.loadData();
  },
  methods: {
    // 加载数据
    loadData() {
      this.allProcesses = getAllProcesses();
      this.filteredProcesses = this.allProcesses;
      
      // 加载筛选选项
      this.garmentCategories = ['全部', ...getGarmentCategories()];
      this.subCategories = ['全部', ...getSubCategories()];
      this.machineTypes = ['全部', ...getMachineTypes()];
      this.fabricTypes = ['全部', ...getFabricTypes()];
    },
    // 处理搜索
    handleSearch() {
      this.filterProcesses();
    },
    // 清除搜索
    clearSearch() {
      this.searchKeyword = '';
      this.filterProcesses();
    },
    // 处理品类变化
    handleCategoryChange(e) {
      this.selectedCategoryIndex = e.detail.value;
      this.selectedSubCategoryIndex = 0;
      this.filterProcesses();
    },
    // 处理细分品类变化
    handleSubCategoryChange(e) {
      this.selectedSubCategoryIndex = e.detail.value;
      this.filterProcesses();
    },
    // 处理机种变化
    handleMachineTypeChange(e) {
      this.selectedMachineTypeIndex = e.detail.value;
      this.filterProcesses();
    },
    // 处理面料类型变化
    handleFabricTypeChange(e) {
      this.selectedFabricTypeIndex = e.detail.value;
      this.filterProcesses();
    },
    // 筛选工序
    filterProcesses() {
      let filtered = this.allProcesses;
      
      // 搜索筛选
      if (this.searchKeyword) {
        filtered = searchProcesses(this.searchKeyword);
      }
      
      // 品类筛选
      if (this.selectedCategoryIndex > 0) {
        const category = this.garmentCategories[this.selectedCategoryIndex];
        filtered = filtered.filter(process => process.garment_category === category);
      }
      
      // 细分品类筛选
      if (this.selectedSubCategoryIndex > 0) {
        const subCategory = this.filteredSubCategories[this.selectedSubCategoryIndex];
        filtered = filtered.filter(process => process.sub_category === subCategory);
      }
      
      // 机种筛选
      if (this.selectedMachineTypeIndex > 0) {
        const machineType = this.machineTypes[this.selectedMachineTypeIndex];
        filtered = filtered.filter(process => process.machine_type === machineType);
      }
      
      // 面料类型筛选
      if (this.selectedFabricTypeIndex > 0) {
        const fabricType = this.fabricTypes[this.selectedFabricTypeIndex];
        filtered = filtered.filter(process => process.fabric_type === fabricType);
      }
      
      this.filteredProcesses = filtered;
    },
    // 查看工序详情
    viewProcessDetail(process) {
      this.selectedProcess = process;
      this.showDetail = true;
    },
    // 关闭详情
    closeDetail() {
      this.showDetail = false;
      this.selectedProcess = null;
    },
    // 使用此工序
    useProcess() {
      if (this.selectedProcess) {
        // 这里可以添加使用工序的逻辑，例如跳转到招工页面或标准工时制定页面
        uni.showToast({
          title: `已选择工序：${this.selectedProcess.process_name}`,
          icon: 'success'
        });
        this.closeDetail();
      }
    },
    // 返回
    goBack() {
      uni.navigateBack();
    }
  }
};
</script>

<style scoped>
.process-query-page {
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
  position: sticky;
  top: 0;
  z-index: 100;
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

/* 搜索栏 */
.search-section {
  padding: 20rpx;
  background-color: #fff;
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: #f0f0f0;
  border-radius: 12rpx;
  padding: 15rpx 20rpx;
}

.search-icon {
  font-size: 28rpx;
  color: #999;
  margin-right: 10rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  background: transparent;
  border: none;
  outline: none;
}

.clear-btn {
  font-size: 32rpx;
  color: #999;
  padding: 0 10rpx;
}

/* 筛选栏 */
.filter-section {
  background-color: #fff;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.filter-row {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.filter-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.filter-label {
  font-size: 24rpx;
  color: #666;
}

.filter-value {
  padding: 15rpx;
  border: 2rpx solid #e8e8e8;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #333;
  background-color: #f9f9f9;
  text-align: center;
}

/* 工序列表 */
.process-list-section {
  padding: 0 20rpx 20rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  text-align: center;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.process-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.process-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 25rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.process-card:active {
  transform: translateY(-5rpx);
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.15);
}

.process-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 15rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.process-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
}

.process-id {
  font-size: 22rpx;
  color: #999;
  background-color: #f0f0f0;
  padding: 5rpx 10rpx;
  border-radius: 6rpx;
}

.process-info {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-size: 24rpx;
  color: #666;
}

.info-value {
  font-size: 24rpx;
  color: #333;
  font-weight: 500;
}

.info-value.price {
  color: #f5222d;
  font-weight: bold;
}

/* 详情弹窗 */
.detail-popup-overlay {
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

.detail-popup {
  background-color: #fff;
  border-radius: 20rpx;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  padding: 30rpx;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30rpx;
  padding-bottom: 20rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.detail-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
}

.detail-id {
  font-size: 20rpx;
  color: #999;
  background-color: #f0f0f0;
  padding: 5rpx 10rpx;
  border-radius: 6rpx;
  margin-left: 10rpx;
}

.close-btn {
  font-size: 36rpx;
  color: #999;
  padding: 0 10rpx;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.detail-row.full-width {
  flex-direction: column;
  align-items: flex-start;
  gap: 10rpx;
}

.detail-label {
  font-size: 24rpx;
  color: #666;
  min-width: 120rpx;
}

.detail-value {
  font-size: 24rpx;
  color: #333;
  flex: 1;
  text-align: right;
}

.detail-row.full-width .detail-value {
  text-align: left;
  line-height: 1.5;
}

.detail-value.price {
  color: #f5222d;
  font-weight: bold;
}

.detail-actions {
  display: flex;
  gap: 20rpx;
}

.action-btn {
  flex: 1;
  padding: 20rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: bold;
  border: none;
  transition: all 0.3s ease;
}

.action-btn.primary {
  background-color: #1890ff;
  color: #fff;
}

.action-btn.secondary {
  background-color: #f0f0f0;
  color: #333;
}

.action-btn:active {
  transform: scale(0.98);
  opacity: 0.9;
}

/* 响应式设计 */
@media (max-width: 750rpx) {
  .filter-row {
    flex-direction: column;
  }
  
  .filter-item {
    width: 100%;
  }
  
  .detail-popup {
    width: 95%;
    padding: 20rpx;
  }
  
  .detail-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10rpx;
  }
  
  .detail-id {
    margin-left: 0;
  }
  
  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 5rpx;
  }
  
  .detail-value {
    text-align: left;
  }
}
</style>