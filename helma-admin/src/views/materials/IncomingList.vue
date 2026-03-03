<template>
  <div class="incoming-list">
    <!-- 顶部标题 -->
    <div class="page-header">
      <h1 class="page-title">来料管理列表</h1>
      <p class="page-subtitle">来料数据总览，方便核对</p>
    </div>
    
    <!-- 顶部筛选区 -->
    <div class="filter-section">
      <el-form :model="filterForm" label-width="100px" size="large" inline>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            size="large"
          />
        </el-form-item>
        <el-form-item label="供应商">
          <el-select v-model="filterForm.supplier" placeholder="选择供应商" size="large">
            <el-option v-for="supplier in suppliers" :key="supplier.id" :label="supplier.name" :value="supplier.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="检验状态">
          <el-select v-model="filterForm.inspectionStatus" placeholder="选择检验状态" size="large">
            <el-option label="全部" value="" />
            <el-option label="待检验" value="pending" />
            <el-option label="已检验" value="completed" />
            <el-option label="不合格" value="unqualified" />
          </el-select>
        </el-form-item>
        <el-form-item label="入库状态">
          <el-select v-model="filterForm.storageStatus" placeholder="选择入库状态" size="large">
            <el-option label="全部" value="" />
            <el-option label="未入库" value="not_stored" />
            <el-option label="已入库" value="stored" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" @click="searchMaterials">查询</el-button>
          <el-button size="large" @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 核心数据看板 -->
    <div class="dashboard-section">
      <div class="dashboard-cards">
        <div class="dashboard-card">
          <div class="card-value">{{ todayIncomingTotal }}</div>
          <div class="card-label">今日来料总数</div>
        </div>
        <div class="dashboard-card">
          <div class="card-value">{{ qualifiedCount }}</div>
          <div class="card-label">合格数</div>
        </div>
        <div class="dashboard-card warning">
          <div class="card-value">{{ unqualifiedCount }}</div>
          <div class="card-label">不合格数</div>
        </div>
        <div class="dashboard-card">
          <div class="card-value">{{ pendingCount }}</div>
          <div class="card-label">待检验数</div>
        </div>
      </div>
    </div>
    
    <!-- 来料列表 -->
    <div class="list-section">
      <div class="list-header">
        <h3 class="section-title">来料列表</h3>
        <div class="batch-actions">
          <el-button type="primary" size="large" @click="batchExport">批量导出Excel</el-button>
          <el-button type="info" size="large" @click="batchMarkProcessed">批量标记已处理</el-button>
        </div>
      </div>
      
      <el-table :data="incomingList" style="width: 100%" size="large" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="60" />
        <el-table-column prop="receiptNo" label="收料单号" width="180" />
        <el-table-column prop="supplierName" label="供应商" width="200" />
        <el-table-column prop="materialName" label="物料名称" width="200" />
        <el-table-column prop="batchNo" label="批次号" width="180" />
        <el-table-column prop="quantity" label="数量" width="100" />
        <el-table-column prop="unit" label="单位" width="80" />
        <el-table-column prop="inspectionStatus" label="检验状态" width="120">
          <template #default="scope">
            <el-tag :type="getInspectionTagType(scope.row.inspectionStatus)">
              {{ getInspectionStatusText(scope.row.inspectionStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="storageStatus" label="入库状态" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.storageStatus === 'stored' ? 'success' : 'warning'">
              {{ scope.row.storageStatus === 'stored' ? '已入库' : '未入库' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="操作人" width="120" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="viewDetail(scope.row)">查看</el-button>
            <el-button size="small" type="primary" @click="editMaterial(scope.row)">编辑</el-button>
            <el-button size="small" type="info" @click="inspectMaterial(scope.row)">检验</el-button>
            <el-button size="small" type="success" @click="exportDetail(scope.row)">导出</el-button>
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
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 筛选表单
      filterForm: {
        dateRange: null,
        supplier: '',
        inspectionStatus: '',
        storageStatus: ''
      },
      // 分页
      currentPage: 1,
      pageSize: 20,
      total: 0,
      // 选中项
      selectedRows: [],
      // 模拟数据
      suppliers: [
        { id: 1, name: '广州面料供应商' },
        { id: 2, name: '深圳辅料供应商' },
        { id: 3, name: '东莞包装材料供应商' }
      ],
      incomingList: [
        {
          receiptNo: 'RC20260301001',
          supplierName: '广州面料供应商',
          materialName: '纯棉面料',
          batchNo: '20260301-001',
          quantity: 1000,
          unit: '米',
          inspectionStatus: 'completed',
          storageStatus: 'stored',
          operator: '张三',
          createTime: '2026-03-01 10:00:00'
        },
        {
          receiptNo: 'RC20260302002',
          supplierName: '深圳辅料供应商',
          materialName: '拉链',
          batchNo: '20260302-001',
          quantity: 5000,
          unit: '条',
          inspectionStatus: 'pending',
          storageStatus: 'not_stored',
          operator: '李四',
          createTime: '2026-03-02 14:30:00'
        },
        {
          receiptNo: 'RC20260303003',
          supplierName: '东莞包装材料供应商',
          materialName: '标签',
          batchNo: '20260303-001',
          quantity: 10000,
          unit: '个',
          inspectionStatus: 'unqualified',
          storageStatus: 'not_stored',
          operator: '王五',
          createTime: '2026-03-03 09:15:00'
        },
        {
          receiptNo: 'RC20260303004',
          supplierName: '广州面料供应商',
          materialName: '涤纶面料',
          batchNo: '20260303-002',
          quantity: 800,
          unit: '米',
          inspectionStatus: 'completed',
          storageStatus: 'stored',
          operator: '张三',
          createTime: '2026-03-03 11:45:00'
        }
      ]
    }
  },
  computed: {
    // 今日来料总数
    todayIncomingTotal() {
      return this.incomingList.length;
    },
    // 合格数
    qualifiedCount() {
      return this.incomingList.filter(item => item.inspectionStatus === 'completed').length;
    },
    // 不合格数
    unqualifiedCount() {
      return this.incomingList.filter(item => item.inspectionStatus === 'unqualified').length;
    },
    // 待检验数
    pendingCount() {
      return this.incomingList.filter(item => item.inspectionStatus === 'pending').length;
    }
  },
  methods: {
    // 搜索物料
    searchMaterials() {
      // 模拟搜索
      this.$message.success('查询成功');
    },
    
    // 重置筛选
    resetFilter() {
      this.filterForm = {
        dateRange: null,
        supplier: '',
        inspectionStatus: '',
        storageStatus: ''
      };
    },
    
    // 处理选择
    handleSelectionChange(selection) {
      this.selectedRows = selection;
    },
    
    // 批量导出
    batchExport() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请选择要导出的数据');
        return;
      }
      this.$message.success('批量导出成功');
    },
    
    // 批量标记已处理
    batchMarkProcessed() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请选择要标记的数据');
        return;
      }
      this.$message.success('批量标记已处理成功');
    },
    
    // 查看详情
    viewDetail(item) {
      this.$message.info('查看详情功能开发中');
    },
    
    // 编辑物料
    editMaterial(item) {
      this.$router.push('/materials/incoming-registration');
    },
    
    // 检验物料
    inspectMaterial(item) {
      this.$router.push('/materials/incoming-inspection');
    },
    
    // 导出详情
    exportDetail(item) {
      this.$message.success('导出成功');
    },
    
    // 获取检验状态标签类型
    getInspectionTagType(status) {
      switch (status) {
        case 'pending': return 'warning';
        case 'completed': return 'success';
        case 'unqualified': return 'danger';
        default: return 'info';
      }
    },
    
    // 获取检验状态文本
    getInspectionStatusText(status) {
      switch (status) {
        case 'pending': return '待检验';
        case 'completed': return '已检验';
        case 'unqualified': return '不合格';
        default: return '未知';
      }
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
.incoming-list {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 30px;
  text-align: center;
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

.filter-section {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.dashboard-section {
  margin-bottom: 20px;
}

.dashboard-cards {
  display: flex;
  gap: 20px;
}

.dashboard-card {
  flex: 1;
  background-color: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s ease;
}

.dashboard-card:hover {
  transform: translateY(-5px);
}

.dashboard-card.warning {
  border-left: 4px solid #f56c6c;
}

.card-value {
  font-size: 36px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.card-label {
  font-size: 16px;
  color: #666;
}

.list-section {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.batch-actions {
  display: flex;
  gap: 10px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.el-button {
  font-size: 16px;
  padding: 12px 24px;
}

.el-form-item {
  margin-bottom: 15px;
}

.el-form-item__label {
  font-size: 16px;
  font-weight: 500;
}

.el-input__inner,
.el-select__input {
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