<template>
  <view class="wage-big-data-container">
    <view class="filter-section">
      <!-- 基础核心筛选 -->
      <view class="filter-group">
        <text class="filter-title">基础筛选</text>
        <view class="filter-row">
          <view class="filter-item">
            <text class="filter-label">款号</text>
            <input type="text" v-model="filters.styleNumber" placeholder="输入款号" class="filter-input" />
          </view>
          <view class="filter-item">
            <text class="filter-label">品类</text>
            <picker @change="handleCategoryChange" :range="categories" :range-key="'name'" :value="selectedCategoryIndex" class="filter-picker">
              <view class="filter-picker-display">{{selectedCategory.name || '选择品类'}}</view>
            </picker>
          </view>
        </view>
        <view class="filter-row">
          <view class="filter-item">
            <text class="filter-label">工序</text>
            <picker @change="handleProcessChange" :range="processes" :value="selectedProcessIndex" class="filter-picker">
              <view class="filter-picker-display">{{selectedProcess || '选择工序'}}</view>
            </picker>
          </view>
          <view class="filter-item">
            <text class="filter-label">地区</text>
            <picker @change="handleRegionChange" :range="regions" :value="selectedRegionIndex" class="filter-picker">
              <view class="filter-picker-display">{{selectedRegion || '选择地区'}}</view>
            </picker>
          </view>
        </view>
      </view>

      <!-- 时间维度筛选 -->
      <view class="filter-group">
        <text class="filter-title">时间筛选</text>
        <view class="filter-row">
          <view class="filter-item">
            <text class="filter-label">开始日期</text>
            <input type="date" v-model="filters.startDate" class="filter-input" />
          </view>
          <view class="filter-item">
            <text class="filter-label">结束日期</text>
            <input type="date" v-model="filters.endDate" class="filter-input" />
          </view>
        </view>
        <view class="preset-buttons">
          <button @click="setPresetDate('1m')" :class="{ active: presetDate === '1m' }" class="preset-button">近1个月</button>
          <button @click="setPresetDate('3m')" :class="{ active: presetDate === '3m' }" class="preset-button">近3个月</button>
          <button @click="setPresetDate('6m')" :class="{ active: presetDate === '6m' }" class="preset-button">近6个月</button>
          <button @click="setPresetDate('1y')" :class="{ active: presetDate === '1y' }" class="preset-button">近1年</button>
        </view>
      </view>

      <!-- 进阶筛选 -->
      <view class="filter-group">
        <text class="filter-title">进阶筛选</text>
        <view class="filter-row">
          <view class="filter-item">
            <text class="filter-label">用工类型</text>
            <picker @change="handleWorkTypeChange" :range="workTypes" :value="selectedWorkTypeIndex" class="filter-picker">
              <view class="filter-picker-display">{{selectedWorkType || '选择类型'}}</view>
            </picker>
          </view>
          <view class="filter-item">
            <text class="filter-label">样本量</text>
            <input type="number" v-model="filters.minSampleSize" placeholder="最小样本量" class="filter-input" />
          </view>
        </view>
        <view class="filter-row">
          <view class="filter-item full-width">
            <text class="filter-label">价格区间</text>
            <view class="price-range">
              <input type="number" v-model="filters.minPrice" placeholder="最低价" class="price-input" />
              <text class="price-separator">-</text>
              <input type="number" v-model="filters.maxPrice" placeholder="最高价" class="price-input" />
            </view>
          </view>
        </view>
      </view>

      <!-- 查询按钮 -->
      <button @click="searchData" class="search-button">
        <text class="search-icon">🔍</text>
        <text>查询</text>
      </button>
    </view>

    <!-- 结果列表 -->
    <view class="result-section">
      <view class="result-header">
        <text class="result-title">查询结果</text>
        <text class="result-count">{{wageData.length}} 条数据</text>
        <view class="sort-options">
          <text class="sort-label">排序：</text>
          <picker @change="handleSortChange" :range="sortOptions" :value="selectedSortIndex" class="sort-picker">
            <view class="sort-picker-display">{{selectedSort || '默认'}}</view>
          </picker>
        </view>
      </view>

      <view class="result-table">
        <view class="table-header">
          <text class="table-header-cell">款号</text>
          <text class="table-header-cell">工序</text>
          <text class="table-header-cell">地区</text>
          <text class="table-header-cell">统计周期</text>
          <text class="table-header-cell">最低价</text>
          <text class="table-header-cell">最高价</text>
          <text class="table-header-cell">平均价</text>
          <text class="table-header-cell">样本量</text>
          <text class="table-header-cell">操作</text>
        </view>
        <view v-for="(item, index) in wageData" :key="index" class="table-row">
          <text class="table-cell">{{item.styleNumber}}</text>
          <text class="table-cell">{{item.process}}</text>
          <text class="table-cell">{{item.region}}</text>
          <text class="table-cell">{{item.period}}</text>
          <text class="table-cell">{{item.minPrice}}元/件</text>
          <text class="table-cell">{{item.maxPrice}}元/件</text>
          <text class="table-cell">{{item.avgPrice}}元/件</text>
          <text class="table-cell">{{item.sampleSize}}条</text>
          <view class="table-cell">
            <button @click="viewDetails(item)" class="detail-button">查看详情</button>
            <button @click="exportData(item)" class="export-button">导出</button>
          </view>
        </view>
      </view>

      <!-- 导出全量数据按钮 -->
      <button @click="exportAllData" class="export-all-button">
        <text class="export-icon">📤</text>
        <text>导出全量数据</text>
      </button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 筛选条件
      filters: {
        styleNumber: '',
        category: '',
        process: '',
        region: '',
        startDate: '',
        endDate: '',
        workType: '计件',
        minSampleSize: '',
        minPrice: '',
        maxPrice: ''
      },
      // 预设日期
      presetDate: '',
      // 选择器数据
      categories: [
        { name: 'T恤' },
        { name: '羽绒服' },
        { name: '裤子' },
        { name: '外套' }
      ],
      processes: ['车位', '锁边', '熨烫', '包装', '裁剪'],
      regions: ['全国', '江苏省', '浙江省', '广东省', '山东省'],
      workTypes: ['计件', '计时'],
      sortOptions: ['默认', '平均价升序', '平均价降序', '样本量升序', '样本量降序'],
      // 选择索引
      selectedCategoryIndex: 0,
      selectedProcessIndex: 0,
      selectedRegionIndex: 0,
      selectedWorkTypeIndex: 0,
      selectedSortIndex: 0,
      // 选中值
      selectedCategory: '',
      selectedProcess: '',
      selectedRegion: '',
      selectedWorkType: '',
      selectedSort: '',
      // 模拟数据
      wageData: [
        {
          styleNumber: 'T恤-2026-001',
          process: '车位',
          region: '苏州昆山',
          period: '近3个月',
          minPrice: 4.5,
          maxPrice: 6,
          avgPrice: 5.2,
          sampleSize: 126
        },
        {
          styleNumber: '羽绒服-A01',
          process: '车位',
          region: '苏州昆山',
          period: '近3个月',
          minPrice: 12,
          maxPrice: 18,
          avgPrice: 15,
          sampleSize: 87
        },
        {
          styleNumber: '裤子-2026-001',
          process: '锁边',
          region: '浙江省',
          period: '近6个月',
          minPrice: 3.2,
          maxPrice: 4.5,
          avgPrice: 3.8,
          sampleSize: 98
        }
      ]
    }
  },
  onLoad() {
    // 初始化默认值
    this.selectedCategory = this.categories[0].name
    this.selectedProcess = this.processes[0]
    this.selectedRegion = this.regions[0]
    this.selectedWorkType = this.workTypes[0]
    this.selectedSort = this.sortOptions[0]
    // 设置默认日期范围为近3个月
    this.setPresetDate('3m')
  },
  methods: {
    // 品类选择
    handleCategoryChange(e) {
      this.selectedCategoryIndex = e.detail.value
      this.selectedCategory = this.categories[this.selectedCategoryIndex].name
      this.filters.category = this.selectedCategory
    },
    // 工序选择
    handleProcessChange(e) {
      this.selectedProcessIndex = e.detail.value
      this.selectedProcess = this.processes[this.selectedProcessIndex]
      this.filters.process = this.selectedProcess
    },
    // 地区选择
    handleRegionChange(e) {
      this.selectedRegionIndex = e.detail.value
      this.selectedRegion = this.regions[this.selectedRegionIndex]
      this.filters.region = this.selectedRegion
    },
    // 用工类型选择
    handleWorkTypeChange(e) {
      this.selectedWorkTypeIndex = e.detail.value
      this.selectedWorkType = this.workTypes[this.selectedWorkTypeIndex]
      this.filters.workType = this.selectedWorkType
    },
    // 排序选择
    handleSortChange(e) {
      this.selectedSortIndex = e.detail.value
      this.selectedSort = this.sortOptions[this.selectedSortIndex]
      this.sortData()
    },
    // 设置预设日期
    setPresetDate(preset) {
      this.presetDate = preset
      const endDate = new Date()
      let startDate = new Date()
      
      switch (preset) {
        case '1m':
          startDate.setMonth(startDate.getMonth() - 1)
          break
        case '3m':
          startDate.setMonth(startDate.getMonth() - 3)
          break
        case '6m':
          startDate.setMonth(startDate.getMonth() - 6)
          break
        case '1y':
          startDate.setFullYear(startDate.getFullYear() - 1)
          break
      }
      
      this.filters.startDate = this.formatDate(startDate)
      this.filters.endDate = this.formatDate(endDate)
    },
    // 格式化日期
    formatDate(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    // 查询数据
    searchData() {
      // 这里应该调用API获取数据
      console.log('查询条件:', this.filters)
      // 模拟查询
      uni.showToast({
        title: '查询成功',
        icon: 'success'
      })
    },
    // 排序数据
    sortData() {
      switch (this.selectedSort) {
        case '平均价升序':
          this.wageData.sort((a, b) => a.avgPrice - b.avgPrice)
          break
        case '平均价降序':
          this.wageData.sort((a, b) => b.avgPrice - a.avgPrice)
          break
        case '样本量升序':
          this.wageData.sort((a, b) => a.sampleSize - b.sampleSize)
          break
        case '样本量降序':
          this.wageData.sort((a, b) => b.sampleSize - a.sampleSize)
          break
      }
    },
    // 查看详情
    viewDetails(item) {
      uni.navigateTo({
        url: './wage-data-detail?item=' + encodeURIComponent(JSON.stringify(item))
      })
    },
    // 导出单条数据
    exportData(item) {
      console.log('导出数据:', item)
      uni.showToast({
        title: '导出成功',
        icon: 'success'
      })
    },
    // 导出全量数据
    exportAllData() {
      console.log('导出全量数据')
      uni.showToast({
        title: '全量数据导出成功',
        icon: 'success'
      })
    }
  }
}
</script>

<style scoped>
.wage-big-data-container {
  padding: 16dp;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.filter-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 16dp;
  margin-bottom: 16dp;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.filter-group {
  margin-bottom: 20dp;
  padding-bottom: 20dp;
  border-bottom: 1rpx solid #f0f0f0;
}

.filter-group:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.filter-title {
  font-size: 18sp;
  font-weight: bold;
  color: #333;
  margin-bottom: 12dp;
  display: block;
}

.filter-row {
  display: flex;
  margin-bottom: 12dp;
  gap: 12dp;
}

.filter-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6dp;
}

.filter-item.full-width {
  flex: 1 1 100%;
}

.filter-label {
  font-size: 14sp;
  color: #666;
}

.filter-input {
  height: 44dp;
  border: 1rpx solid #ddd;
  border-radius: 4px;
  padding: 0 12dp;
  font-size: 16sp;
}

.filter-picker {
  height: 44dp;
  border: 1rpx solid #ddd;
  border-radius: 4px;
  display: flex;
  align-items: center;
  padding: 0 12dp;
  background-color: #f9f9f9;
}

.filter-picker-display {
  font-size: 16sp;
  color: #333;
}

.preset-buttons {
  display: flex;
  gap: 8dp;
  flex-wrap: wrap;
  margin-top: 8dp;
}

.preset-button {
  flex: 1;
  min-width: 80dp;
  height: 36dp;
  font-size: 14sp;
  border-radius: 18dp;
  border: 1rpx solid #ddd;
  background-color: #f9f9f9;
}

.preset-button.active {
  background-color: #4A90E2;
  color: #fff;
  border-color: #4A90E2;
}

.price-range {
  display: flex;
  align-items: center;
  gap: 8dp;
}

.price-input {
  flex: 1;
  height: 44dp;
  border: 1rpx solid #ddd;
  border-radius: 4px;
  padding: 0 12dp;
  font-size: 16sp;
}

.price-separator {
  font-size: 16sp;
  color: #666;
}

.search-button {
  width: 100%;
  height: 48dp;
  border-radius: 8px;
  background-color: #4A90E2;
  color: #fff;
  font-size: 16sp;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8dp;
  margin-top: 16dp;
}

.search-icon {
  font-size: 20rpx;
}

.result-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 16dp;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16dp;
  padding-bottom: 12dp;
  border-bottom: 1rpx solid #f0f0f0;
}

.result-title {
  font-size: 18sp;
  font-weight: bold;
  color: #333;
}

.result-count {
  font-size: 14sp;
  color: #666;
}

.sort-options {
  display: flex;
  align-items: center;
  gap: 8dp;
}

.sort-label {
  font-size: 14sp;
  color: #666;
}

.sort-picker {
  height: 32dp;
  border: 1rpx solid #ddd;
  border-radius: 4px;
  padding: 0 8dp;
  background-color: #f9f9f9;
}

.sort-picker-display {
  font-size: 14sp;
  color: #333;
}

.result-table {
  margin-bottom: 16dp;
}

.table-header {
  display: flex;
  background-color: #f9f9f9;
  border-radius: 4px 4px 0 0;
  padding: 12dp;
  font-weight: bold;
  font-size: 14sp;
  color: #333;
  border-bottom: 1rpx solid #ddd;
}

.table-header-cell {
  flex: 1;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.table-row {
  display: flex;
  padding: 12dp;
  border-bottom: 1rpx solid #f0f0f0;
  font-size: 14sp;
  color: #333;
}

.table-row:last-child {
  border-bottom: none;
}

.table-cell {
  flex: 1;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
}

.table-cell:last-child {
  display: flex;
  gap: 8dp;
}

.detail-button {
  flex: 1;
  height: 32dp;
  font-size: 12sp;
  border-radius: 4px;
  background-color: #4A90E2;
  color: #fff;
  border: none;
}

.export-button {
  flex: 1;
  height: 32dp;
  font-size: 12sp;
  border-radius: 4px;
  background-color: #f9f9f9;
  color: #333;
  border: 1rpx solid #ddd;
}

.export-all-button {
  width: 100%;
  height: 48dp;
  border-radius: 8px;
  background-color: #f9f9f9;
  color: #333;
  font-size: 16sp;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8dp;
  border: 1rpx solid #ddd;
  margin-top: 16dp;
}

.export-icon {
  font-size: 20rpx;
}
</style>