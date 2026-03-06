<template>
  <view class="standard-time-setting-page">
    <!-- 顶部导航栏 -->
    <view class="nav-header">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="page-title">标准工时制定</text>
      <view class="placeholder"></view>
    </view>

    <!-- 搜索查询区 -->
    <view style="background-color: #fff; border-radius: 16rpx; padding: 30rpx; margin: 30rpx; box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);">
      <view style="display: flex; gap: 20rpx; margin-bottom: 20rpx; align-items: center;">
        <input type="text" v-model="searchKeyword" style="flex: 7; height: 80rpx; padding: 0 20rpx; border: 1rpx solid #e0e0e0; border-radius: 16rpx; font-size: 28rpx; color: #333; background-color: #fff;" placeholder="搜索工序名称、ID或描述" />
        <button @click="performSearch" style="flex: 3; height: 80rpx; background-color: #1890ff; color: #fff; border: none; border-radius: 16rpx; font-size: 28rpx; font-weight: bold; display: flex; align-items: center; justify-content: center;">搜索</button>
      </view>
      <view style="display: flex; gap: 12rpx; flex-wrap: wrap;">
        <picker @change="handleCategoryChange" :value="selectedCategoryIndex" :range="categories">
          <view style="flex: 1; min-width: 200rpx; padding: 16rpx; border: 2rpx solid #e8e8e8; border-radius: 12rpx; font-size: 22rpx; background-color: #f9f9f9; text-align: center;">
            <text>{{ categories[selectedCategoryIndex] }}</text>
          </view>
        </picker>
        <picker @change="handleMachineTypeChange" :value="selectedMachineTypeIndex" :range="machineTypes">
          <view style="flex: 1; min-width: 200rpx; padding: 16rpx; border: 2rpx solid #e8e8e8; border-radius: 12rpx; font-size: 22rpx; background-color: #f9f9f9; text-align: center;">
            <text>{{ machineTypes[selectedMachineTypeIndex] }}</text>
          </view>
        </picker>
        <picker @change="handleFabricCategoryChange" :value="selectedFabricCategoryIndex" :range="fabricCategories">
          <view style="flex: 1; min-width: 200rpx; padding: 16rpx; border: 2rpx solid #e8e8e8; border-radius: 12rpx; font-size: 22rpx; background-color: #f9f9f9; text-align: center;">
            <text>{{ fabricCategories[selectedFabricCategoryIndex] }}</text>
          </view>
        </picker>
        <picker @change="handleFabricTypeChange" :value="selectedFabricTypeIndex" :range="fabricTypes">
          <view style="flex: 1; min-width: 200rpx; padding: 16rpx; border: 2rpx solid #e8e8e8; border-radius: 12rpx; font-size: 22rpx; background-color: #f9f9f9; text-align: center;">
            <text>{{ fabricTypes[selectedFabricTypeIndex] }}</text>
          </view>
        </picker>
      </view>
    </view>

    <!-- 搜索结果区 -->
    <view v-if="searchResults.length > 0" class="search-results-section">
      <text class="section-title">搜索结果</text>
      <view class="results-list">
        <view v-for="(result, index) in searchResults" :key="index" class="result-item" @click="selectProcess(result)">
          <text class="result-name">{{ result.process_name }}</text>
          <text class="result-id">{{ result.process_id }}</text>
          <text class="result-info">工时: {{ result.standard_time }}秒 | {{ result.machine_type }}{{ result.sub_machine_type ? '(' + result.sub_machine_type + ')' : '' }}</text>
        </view>
      </view>
    </view>

    <!-- 基础信息区 -->
    <view class="basic-info-section">
      <view class="form-group">
        <text class="form-label">选择工序</text>
        <picker @change="handleProcessChange" :value="selectedProcessIndex" :range="processes">
          <view class="picker-input">
            <text>{{ processes[selectedProcessIndex] }}</text>
          </view>
        </picker>
      </view>
      <view class="form-group">
        <text class="form-label">面料类型</text>
        <picker @change="handleFabricChange" :value="selectedFabricIndex" :range="fabrics">
          <view class="picker-input">
            <text>{{ fabrics[selectedFabricIndex] }}</text>
          </view>
        </picker>
      </view>
    </view>

    <!-- 数据来源选择区 -->
    <view class="data-source-section">
      <text class="section-title">数据来源选择</text>
      <view class="data-source-options">
        <view class="option-card" :class="{ 'active': dataSource === 'industry' }" @click="selectDataSource('industry')">
          <text class="option-icon">📊</text>
          <text class="option-title">引用行业数据库</text>
          <text class="option-desc">系统自动展示同工序、同面料的全国平均标准工时</text>
          <view v-if="dataSource === 'industry'" class="option-content">
            <text class="content-label">行业平均标准工时：</text>
            <text class="content-value">{{ industryStandardTime }}分钟/件</text>
          </view>
        </view>
        <view class="option-card" :class="{ 'active': dataSource === 'worker' }" @click="selectDataSource('worker')">
          <text class="option-icon">👤</text>
          <text class="option-title">引用工人实测数据</text>
          <text class="option-desc">下拉选择绑定工厂的工人，自动带入该工人的最新测算数据</text>
          <view v-if="dataSource === 'worker'" class="option-content">
            <text class="content-label">选择工人：</text>
            <picker @change="handleWorkerChange" :value="selectedWorkerIndex" :range="workers">
              <view class="picker-input small">
                <text>{{ workers[selectedWorkerIndex] }}</text>
              </view>
            </picker>
            <text v-if="selectedWorkerIndex > 0" class="content-label">实测工时：</text>
            <text v-if="selectedWorkerIndex > 0" class="content-value">{{ workerActualTime }}分钟/件</text>
          </view>
        </view>
        <view class="option-card" :class="{ 'active': dataSource === 'manual' }" @click="selectDataSource('manual')">
          <text class="option-icon">✏️</text>
          <text class="option-title">手动输入IE标准</text>
          <text class="option-desc">工厂IE手动输入实测用时、评比系数、宽放率</text>
          <view v-if="dataSource === 'manual'" class="option-content">
            <view class="form-group small">
              <text class="form-label">实测用时（分钟/件）</text>
              <input type="text" v-model="manualActualTime" class="form-input" placeholder="请输入实测用时" />
            </view>
            <view class="form-group small">
              <text class="form-label">评比系数（%）</text>
              <input type="text" v-model="ratingFactor" class="form-input" placeholder="请输入评比系数" />
            </view>
            <view class="form-group small">
              <text class="form-label">宽放率（%）</text>
              <input type="text" v-model="allowanceRate" class="form-input" placeholder="请输入宽放率" />
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 计算结果区 -->
    <view class="result-section">
      <text class="section-title">计算结果</text>
      <view class="result-card">
        <view class="result-row">
          <text class="result-label">工厂标准单件工时</text>
          <text class="result-value">{{ factoryStandardTime }}分钟/件</text>
        </view>
      </view>
    </view>

    <!-- 操作按钮区 -->
    <view class="action-buttons-section">
      <button class="action-btn primary" @click="saveStandardTime">保存到工厂标准库</button>
      <button class="action-btn secondary" @click="syncToWorkers">同步给对应工序工人</button>
    </view>
  </view>
</template>

<script>
import { initProcessStandardDB, searchProcesses, getGarmentCategories, getMachineTypes, getAllProcesses, getFabricTypes, getFabricCategories, getProcessesByCategory, getProcessesByMachineType, getProcessesByFabricType, getProcessesByFabricCategory, queryTimeByFabricAndOperation } from '../../utils/process-standard-db.js'

export default {
  data() {
    return {
      // 基础信息
      processes: ['请选择工序'],
      selectedProcessIndex: 0,
      fabrics: ['请选择面料类型'],
      selectedFabricIndex: 0,
      // 搜索相关
      searchKeyword: '',
      searchResults: [],
      categories: ['全部分类'],
      selectedCategoryIndex: 0,
      machineTypes: ['全部机种'],
      selectedMachineTypeIndex: 0,
      fabricTypes: ['全部面料'],
      selectedFabricTypeIndex: 0,
      fabricCategories: ['全部面料大分类'],
      selectedFabricCategoryIndex: 0,
      // 数据来源
      dataSource: 'industry', // industry, worker, manual
      // 行业数据
      industryStandardTime: 3.0,
      // 工人数据
      workers: ['请选择工人', '张三', '李四', '王五', '赵六'],
      selectedWorkerIndex: 0,
      workerActualTime: 0,
      // 手动输入数据
      manualActualTime: '',
      ratingFactor: '',
      allowanceRate: ''
    }
  },
  computed: {
    factoryStandardTime() {
      switch (this.dataSource) {
        case 'industry':
          return this.industryStandardTime
        case 'worker':
          return this.workerActualTime
        case 'manual':
          const actualTime = parseFloat(this.manualActualTime)
          const rating = parseFloat(this.ratingFactor)
          const allowance = parseFloat(this.allowanceRate)
          if (!isNaN(actualTime) && actualTime > 0) {
            const ratedTime = actualTime * (rating / 100)
            const standardTime = ratedTime * (1 + allowance / 100)
            return standardTime.toFixed(2)
          }
          return 0
        default:
          return 0
      }
    }
  },
  mounted() {
    // 初始化数据库（强制重新初始化，确保新添加的机种被加载）
    const initialData = initProcessStandardDB(true)
    
    // 立即加载数据，使用初始化返回的数据
    this.loadCategories()
    this.loadMachineTypes()
    this.loadFabricTypes()
    this.loadFabricCategories()
    // 加载所有工序和面料类型
    this.loadAllProcesses()
    this.loadAllFabrics()
    
    // 打印数据，检查是否加载成功
    console.log('Categories:', this.categories)
    console.log('Machine Types:', this.machineTypes)
    console.log('Fabric Types:', this.fabricTypes)
    console.log('Fabric Categories:', this.fabricCategories)
    console.log('Processes:', this.processes)
    console.log('Fabrics:', this.fabrics)
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    handleProcessChange(e) {
      this.selectedProcessIndex = e.detail.value
      // 这里可以根据工序更新行业标准工时
    },
    handleFabricChange(e) {
      this.selectedFabricIndex = e.detail.value
      // 这里可以根据面料类型更新行业标准工时
    },
    selectDataSource(source) {
      this.dataSource = source
    },
    handleWorkerChange(e) {
      this.selectedWorkerIndex = e.detail.value
      // 这里可以根据选择的工人更新实测工时
      if (this.selectedWorkerIndex > 0) {
        // 模拟数据
        const workerTimes = [0, 2.5, 1.8, 3.2, 1.2]
        this.workerActualTime = workerTimes[this.selectedWorkerIndex]
      } else {
        this.workerActualTime = 0
      }
    },
    saveStandardTime() {
      if (this.selectedProcessIndex === 0 || this.selectedFabricIndex === 0) {
        uni.showToast({
          title: '请选择工序和面料类型',
          icon: 'none'
        })
        return
      }
      
      if (this.factoryStandardTime === 0) {
        uni.showToast({
          title: '请输入或选择有效数据',
          icon: 'none'
        })
        return
      }
      
      // 模拟保存到标准库
      uni.showToast({
        title: '保存成功',
        icon: 'success'
      })
    },
    syncToWorkers() {
      if (this.selectedProcessIndex === 0) {
        uni.showToast({
          title: '请选择工序',
          icon: 'none'
        })
        return
      }
      
      if (this.factoryStandardTime === 0) {
        uni.showToast({
          title: '请先计算标准工时',
          icon: 'none'
        })
        return
      }
      
      // 模拟同步给工人
      uni.showToast({
        title: '同步成功',
        icon: 'success'
      })
    },
    // 加载分类数据
    loadCategories() {
      const categoryList = getGarmentCategories()
      this.categories = ['全部分类', ...categoryList]
    },
    // 加载机种数据
    loadMachineTypes() {
      const machineTypeList = getMachineTypes()
      this.machineTypes = ['全部机种', ...machineTypeList]
    },
    // 加载面料类型数据
    loadFabricTypes() {
      const fabricTypeList = getFabricTypes()
      this.fabricTypes = ['全部面料', ...fabricTypeList]
    },
    // 加载面料大分类数据
    loadFabricCategories() {
      const fabricCategoryList = getFabricCategories()
      this.fabricCategories = ['全部面料大分类', ...fabricCategoryList]
    },
    // 执行搜索
    performSearch() {
      // 先获取所有工序数据
      let results = getAllProcesses()
      
      // 如果有搜索关键词，先进行搜索
      if (this.searchKeyword.trim()) {
        results = searchProcesses(this.searchKeyword)
      }
      
      // 根据分类过滤
      const selectedCategory = this.categories[this.selectedCategoryIndex]
      if (selectedCategory !== '全部分类') {
        results = results.filter(process => process.garment_category === selectedCategory)
      }
      
      // 根据机种过滤
      const selectedMachineType = this.machineTypes[this.selectedMachineTypeIndex]
      if (selectedMachineType !== '全部机种') {
        results = results.filter(process => process.machine_type === selectedMachineType)
      }
      
      // 根据面料大分类过滤
      const selectedFabricCategory = this.fabricCategories[this.selectedFabricCategoryIndex]
      if (selectedFabricCategory !== '全部面料大分类') {
        results = results.filter(process => process.fabric_category === selectedFabricCategory)
      }
      
      // 根据面料类型过滤
      const selectedFabricType = this.fabricTypes[this.selectedFabricTypeIndex]
      if (selectedFabricType !== '全部面料') {
        results = results.filter(process => process.fabric_type === selectedFabricType)
      }
      
      this.searchResults = results
      
      if (results.length === 0) {
        uni.showToast({
          title: '未找到匹配的工序',
          icon: 'none'
        })
      }
    },
    // 选择搜索结果
    selectProcess(process) {
      // 这里可以根据选择的工序更新相关数据
      uni.showToast({
        title: `已选择: ${process.process_name}`,
        icon: 'success'
      })
      // 将选择的工序信息填充到表单中
      this.industryStandardTime = process.standard_time / 60 // 转换为分钟
      
      // 更新工序选择
      const processIndex = this.processes.indexOf(process.process_name)
      if (processIndex > 0) {
        this.selectedProcessIndex = processIndex
      } else {
        // 如果工序不在列表中，添加到列表
        this.processes.push(process.process_name)
        this.selectedProcessIndex = this.processes.length - 1
      }
      
      // 更新面料类型选择
      const fabricIndex = this.fabrics.indexOf(process.fabric_type)
      if (fabricIndex > 0) {
        this.selectedFabricIndex = fabricIndex
      } else {
        // 如果面料类型不在列表中，添加到列表
        this.fabrics.push(process.fabric_type)
        this.selectedFabricIndex = this.fabrics.length - 1
      }
      
      // 更新面料大分类选择
      const fabricCategoryIndex = this.fabricCategories.indexOf(process.fabric_category)
      if (fabricCategoryIndex > 0) {
        this.selectedFabricCategoryIndex = fabricCategoryIndex
      }
    },
    // 处理分类选择
    handleCategoryChange(e) {
      this.selectedCategoryIndex = e.detail.value
      // 这里可以根据选择的分类过滤工序
    },
    // 处理机种选择
    handleMachineTypeChange(e) {
      this.selectedMachineTypeIndex = e.detail.value
      // 这里可以根据选择的机种过滤工序
    },
    // 处理面料类型选择
    handleFabricTypeChange(e) {
      this.selectedFabricTypeIndex = e.detail.value
      // 这里可以根据选择的面料类型过滤工序
    },
    // 处理面料大分类选择
    handleFabricCategoryChange(e) {
      this.selectedFabricCategoryIndex = e.detail.value
      // 这里可以根据选择的面料大分类过滤工序
    },
    // 加载所有工序
    loadAllProcesses() {
      const allProcesses = getAllProcesses()
      console.log('All Processes:', allProcesses)
      const processNames = [...new Set(allProcesses.map(process => process.process_name))]
      this.processes = ['请选择工序', ...processNames]
      console.log('Processes loaded:', this.processes)
    },
    // 加载所有面料类型
    loadAllFabrics() {
      const allProcesses = getAllProcesses()
      console.log('All Processes for fabrics:', allProcesses)
      const fabricTypes = [...new Set(allProcesses.map(process => process.fabric_type))]
      this.fabrics = ['请选择面料类型', ...fabricTypes]
      console.log('Fabrics loaded:', this.fabrics)
    },
    // 处理输入框焦点事件
    handleInputFocus() {
      console.log('Search input focused')
    },
    // 处理输入框失焦事件
    handleInputBlur() {
      console.log('Search input blurred')
    },
    // 处理输入框点击事件
    handleInputClick() {
      console.log('Search input clicked')
    },
    // 处理输入框输入事件
    handleInput(e) {
      console.log('Input event triggered:', e.detail.value)
      this.searchKeyword = e.detail.value
    }
  }
}
</script>

<style scoped>
.standard-time-setting-page {
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

/* 搜索查询区 */
/* 已移除搜索查询区的 CSS 类定义，使用内联样式 */

/* 搜索结果区 */
.search-results-section {
  padding: 0 30rpx;
  margin-bottom: 30rpx;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.result-item {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 25rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.result-item:active {
  transform: translateY(-3rpx);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
}

.result-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.result-id {
  font-size: 22rpx;
  color: #999;
  display: block;
  margin-bottom: 10rpx;
}

.result-info {
  font-size: 24rpx;
  color: #666;
  display: block;
}

/* 基础信息区 */
.basic-info-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 30rpx;
}

.form-group.small {
  margin-bottom: 20rpx;
}

.form-label {
  display: block;
  font-size: 30rpx;
  color: #333;
  margin-bottom: 15rpx;
  font-weight: 500;
}

.picker-input {
  padding: 25rpx;
  border: 2rpx solid #e8e8e8;
  border-radius: 12rpx;
  font-size: 28rpx;
  background-color: #f9f9f9;
}

.picker-input.small {
  padding: 15rpx;
  font-size: 24rpx;
}

.form-input {
  width: 100%;
  padding: 20rpx;
  border: 2rpx solid #e8e8e8;
  border-radius: 8rpx;
  font-size: 24rpx;
  box-sizing: border-box;
  background-color: #f9f9f9;
}

/* 数据来源选择区 */
.data-source-section {
  padding: 0 30rpx;
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.data-source-options {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.option-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 2rpx solid transparent;
}

.option-card.active {
  border-color: #1890ff;
  background-color: #f0f7ff;
}

.option-card:active {
  transform: translateY(-5rpx);
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.15);
}

.option-icon {
  font-size: 48rpx;
  margin-bottom: 15rpx;
  display: block;
}

.option-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.option-desc {
  font-size: 22rpx;
  color: #666;
  line-height: 1.4;
  margin-bottom: 20rpx;
  display: block;
}

.option-content {
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.content-label {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 10rpx;
  display: block;
}

.content-value {
  font-size: 28rpx;
  font-weight: bold;
  color: #1890ff;
  display: block;
}

/* 计算结果区 */
.result-section {
  padding: 0 30rpx;
  margin-bottom: 30rpx;
}

.result-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.result-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-label {
  font-size: 28rpx;
  color: #666;
}

.result-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #f5222d;
}

/* 操作按钮区 */
.action-buttons-section {
  padding: 0 30rpx 30rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.action-btn {
  padding: 25rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: bold;
  border: none;
  text-align: center;
  transition: all 0.3s ease;
}

.action-btn.primary {
  background-color: #1890ff;
  color: #fff;
}

.action-btn.secondary {
  background-color: #52c41a;
  color: #fff;
}

.action-btn:active {
  transform: scale(0.98);
  opacity: 0.9;
}

/* 响应式设计 */
@media (max-width: 750rpx) {
  .basic-info-section {
    margin: 20rpx;
    padding: 20rpx;
  }
  
  .data-source-section,
  .result-section,
  .action-buttons-section {
    padding: 0 20rpx 20rpx;
  }
  
  .option-card {
    padding: 20rpx;
  }
  
  .result-card {
    padding: 20rpx;
  }
  
  .action-btn {
    padding: 20rpx;
    font-size: 26rpx;
  }
}
</style>