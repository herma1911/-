<template>
  <div class="inventory-dashboard">
    <!-- 顶部标题 -->
    <div class="page-header">
      <h1 class="page-title">库存看板</h1>
      <p class="page-subtitle">实时掌握库存动态，及时预警异常</p>
    </div>
    
    <!-- 顶部核心指标 -->
    <div class="core-metrics">
      <div class="metric-card">
        <div class="metric-value">{{ totalInventoryValue }}</div>
        <div class="metric-label">总库存金额</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">{{ materialTypesCount }}</div>
        <div class="metric-label">物料种类数</div>
      </div>
      <div class="metric-card warning">
        <div class="metric-value">{{ lowStockCount }}</div>
        <div class="metric-label">低于安全库存</div>
      </div>
      <div class="metric-card warning">
        <div class="metric-value">{{ expiredCount }}</div>
        <div class="metric-label">超期物料</div>
      </div>
    </div>
    
    <!-- 库存分类卡片 -->
    <div class="category-section">
      <h3 class="section-title">库存分类</h3>
      <div class="category-cards">
        <div class="category-card" @click="viewCategoryDetail('fabric')">
          <div class="card-icon">🧵</div>
          <div class="card-title">面料类</div>
          <div class="card-value">{{ fabricCount }} 种</div>
          <div class="card-subtitle">点击查看详情</div>
        </div>
        <div class="category-card" @click="viewCategoryDetail('accessory')">
          <div class="card-icon">🔗</div>
          <div class="card-title">辅料类</div>
          <div class="card-value">{{ accessoryCount }} 种</div>
          <div class="card-subtitle">点击查看详情</div>
        </div>
        <div class="category-card" @click="viewCategoryDetail('semi-finished')">
          <div class="card-icon">📦</div>
          <div class="card-title">半成品类</div>
          <div class="card-value">{{ semiFinishedCount }} 种</div>
          <div class="card-subtitle">点击查看详情</div>
        </div>
        <div class="category-card" @click="viewCategoryDetail('finished')">
          <div class="card-icon">👕</div>
          <div class="card-title">成品类</div>
          <div class="card-value">{{ finishedCount }} 种</div>
          <div class="card-subtitle">点击查看详情</div>
        </div>
      </div>
    </div>
    
    <!-- 库存列表 -->
    <div class="inventory-section">
      <div class="section-header">
        <h3 class="section-title">库存列表</h3>
        <div class="search-box">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索物料名称/编码"
            size="large"
            prefix-icon="el-icon-search"
            @keyup.enter="searchInventory"
          />
        </div>
      </div>
      
      <el-table :data="inventoryList" style="width: 100%" size="large">
        <el-table-column prop="materialCode" label="物料编码" width="150" />
        <el-table-column prop="materialName" label="物料名称" width="200" />
        <el-table-column prop="specification" label="规格" width="150" />
        <el-table-column prop="unit" label="单位" width="80" />
        <el-table-column prop="quantity" label="库存数量" width="120">
          <template #default="scope">
            <span :class="{ 'low-stock': scope.row.quantity < scope.row.safetyStock }">
              {{ scope.row.quantity }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="safetyStock" label="安全库存" width="120" />
        <el-table-column prop="warehouseLocation" label="库位" width="120" />
        <el-table-column prop="batchNo" label="批次号" width="180" />
        <el-table-column prop="category" label="分类" width="100" />
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button size="small" @click="viewMaterialDetail(scope.row)">查看</el-button>
            <el-button size="small" type="primary" @click="editMaterial(scope.row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          size="large"
        />
      </div>
    </div>
    
    <!-- 右侧预警提示栏 -->
    <div class="warning-sidebar">
      <h3 class="sidebar-title">⚠️ 库存预警</h3>
      <div class="warning-list">
        <div v-for="warning in inventoryWarnings" :key="warning.id" class="warning-item">
          <div class="warning-icon">{{ warning.icon }}</div>
          <div class="warning-content">
            <div class="warning-title">{{ warning.title }}</div>
            <div class="warning-desc">{{ warning.description }}</div>
          </div>
        </div>
        <div v-if="inventoryWarnings.length === 0" class="no-warning">
          <div class="no-warning-icon">✅</div>
          <div class="no-warning-text">暂无预警信息</div>
        </div>
      </div>
      
      <!-- 快速操作按钮 -->
      <div class="quick-actions">
        <el-button type="primary" size="large" class="action-btn" @click="quick领料">快速领料</el-button>
        <el-button type="info" size="large" class="action-btn" @click="startInventory">盘点</el-button>
        <el-button type="success" size="large" class="action-btn" @click="exportInventory">导出库存表</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 搜索
      searchKeyword: '',
      // 分页
      currentPage: 1,
      pageSize: 20,
      total: 0,
      // 模拟数据
      inventoryList: [
        {
          materialCode: 'MAT001',
          materialName: '纯棉面料',
          specification: '21支',
          unit: '米',
          quantity: 800,
          safetyStock: 500,
          warehouseLocation: '原料仓A区',
          batchNo: '20260301-001',
          category: '面料类'
        },
        {
          materialCode: 'MAT002',
          materialName: '涤纶面料',
          specification: '32支',
          unit: '米',
          quantity: 1200,
          safetyStock: 500,
          warehouseLocation: '原料仓A区',
          batchNo: '20260302-001',
          category: '面料类'
        },
        {
          materialCode: 'MAT003',
          materialName: '拉链',
          specification: '5号',
          unit: '条',
          quantity: 300,
          safetyStock: 500,
          warehouseLocation: '辅料仓',
          batchNo: '20260303-001',
          category: '辅料类'
        },
        {
          materialCode: 'MAT004',
          materialName: '纽扣',
          specification: '15mm',
          unit: '个',
          quantity: 10000,
          safetyStock: 5000,
          warehouseLocation: '辅料仓',
          batchNo: '20260301-002',
          category: '辅料类'
        },
        {
          materialCode: 'MAT005',
          materialName: '标签',
          specification: '8x4cm',
          unit: '个',
          quantity: 5000,
          safetyStock: 3000,
          warehouseLocation: '辅料仓',
          batchNo: '20260302-002',
          category: '辅料类'
        },
        {
          materialCode: 'SFP001',
          materialName: '牛仔裤半成品',
          specification: '32码',
          unit: '条',
          quantity: 200,
          safetyStock: 100,
          warehouseLocation: '半成品仓',
          batchNo: '20260303-002',
          category: '半成品类'
        },
        {
          materialCode: 'FP001',
          materialName: '牛仔裤成品',
          specification: '32码',
          unit: '条',
          quantity: 150,
          safetyStock: 50,
          warehouseLocation: '成品仓',
          batchNo: '20260303-003',
          category: '成品类'
        }
      ],
      inventoryWarnings: [
        {
          id: 1,
          icon: '⚠️',
          title: '拉链库存不足',
          description: '当前库存300条，低于安全库存500条'
        },
        {
          id: 2,
          icon: '⏰',
          title: '纯棉面料即将超期',
          description: '批次20260301-001将在7天后超期'
        }
      ]
    }
  },
  computed: {
    // 总库存金额
    totalInventoryValue() {
      return '¥1,250,000';
    },
    // 物料种类数
    materialTypesCount() {
      return this.inventoryList.length;
    },
    // 低于安全库存数
    lowStockCount() {
      return this.inventoryList.filter(item => item.quantity < item.safetyStock).length;
    },
    // 超期物料数
    expiredCount() {
      return 1;
    },
    // 面料类数量
    fabricCount() {
      return this.inventoryList.filter(item => item.category === '面料类').length;
    },
    // 辅料类数量
    accessoryCount() {
      return this.inventoryList.filter(item => item.category === '辅料类').length;
    },
    // 半成品类数量
    semiFinishedCount() {
      return this.inventoryList.filter(item => item.category === '半成品类').length;
    },
    // 成品类数量
    finishedCount() {
      return this.inventoryList.filter(item => item.category === '成品类').length;
    }
  },
  methods: {
    // 搜索库存
    searchInventory() {
      // 模拟搜索
      this.$message.success('搜索成功');
    },
    
    // 查看分类详情
    viewCategoryDetail(category) {
      this.$message.info(`查看${category}分类详情`);
    },
    
    // 查看物料详情
    viewMaterialDetail(item) {
      this.$message.info('查看物料详情功能开发中');
    },
    
    // 编辑物料
    editMaterial(item) {
      this.$message.info('编辑物料功能开发中');
    },
    
    // 快速领料
    quick领料() {
      this.$router.push('/materials/production-issue');
    },
    
    // 开始盘点
    startInventory() {
      this.$router.push('/materials/inventory-count');
    },
    
    // 导出库存表
    exportInventory() {
      this.$message.success('库存表已导出');
    },
    
    // 分页处理
    handleSizeChange(size) {
      this.pageSize = size;
    },
    
    handleCurrentChange(current) {
      this.currentPage = current;
    }
  }
}
</script>

<style scoped>
.inventory-dashboard {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 36px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.page-subtitle {
  font-size: 18px;
  color: #666;
}

.core-metrics {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.metric-card {
  flex: 1;
  background-color: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-5px);
}

.metric-card.warning {
  border-left: 4px solid #f56c6c;
  background-color: #fef0f0;
}

.metric-value {
  font-size: 36px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.metric-label {
  font-size: 16px;
  color: #666;
}

.category-section {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
}

.category-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.category-card {
  background-color: #f9f9f9;
  padding: 30px;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-color: #4A90E2;
}

.card-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.card-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  color: #4A90E2;
  margin-bottom: 10px;
}

.card-subtitle {
  font-size: 14px;
  color: #666;
}

.inventory-section {
  flex: 1;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-right: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-box {
  width: 300px;
}

.low-stock {
  color: #f56c6c;
  font-weight: bold;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.warning-sidebar {
  width: 300px;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.sidebar-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
}

.warning-list {
  margin-bottom: 30px;
}

.warning-item {
  display: flex;
  gap: 10px;
  padding: 15px;
  background-color: #fef0f0;
  border-radius: 8px;
  margin-bottom: 10px;
  border-left: 4px solid #f56c6c;
}

.warning-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.warning-content {
  flex: 1;
}

.warning-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.warning-desc {
  font-size: 12px;
  color: #666;
}

.no-warning {
  text-align: center;
  padding: 40px 20px;
  background-color: #f0f9eb;
  border-radius: 8px;
  border: 1px solid #b7eb8f;
}

.no-warning-icon {
  font-size: 32px;
  margin-bottom: 10px;
}

.no-warning-text {
  font-size: 14px;
  color: #52c41a;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action-btn {
  width: 100%;
  font-size: 16px;
  padding: 12px;
}

.el-button {
  font-size: 16px;
  padding: 12px 24px;
}

.el-input__inner {
  font-size: 16px;
  height: 48px;
}

.el-table {
  margin-top: 20px;
}

.el-table th {
  font-size: 14px;
  font-weight: 600;
}

.el-table td {
  font-size: 14px;
}
</style>