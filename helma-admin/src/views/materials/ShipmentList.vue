<template>
  <div class="shipment-list">
    <!-- 顶部标题 -->
    <div class="page-header">
      <h1 class="page-title">出货管理列表</h1>
      <p class="page-subtitle">实时掌握出货数据，确保交付及时</p>
    </div>
    
    <!-- 顶部筛选区 -->
    <div class="filter-section">
      <h3 class="section-title">筛选条件</h3>
      <div class="filter-form">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-date-picker
              v-model="filterParams.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              size="large"
              style="width: 100%"
            />
          </el-col>
          <el-col :span="6">
            <el-select v-model="filterParams.customer" placeholder="客户" size="large" style="width: 100%">
              <el-option label="全部客户" value="" />
              <el-option label="张三贸易公司" value="customer1" />
              <el-option label="李四服装厂" value="customer2" />
              <el-option label="王五服饰" value="customer3" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="filterParams.status" placeholder="发货状态" size="large" style="width: 100%">
              <el-option label="全部状态" value="" />
              <el-option label="待发货" value="pending" />
              <el-option label="已发货" value="shipped" />
              <el-option label="已完成" value="completed" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" size="large" class="search-btn" @click="searchShipments">
              筛选
            </el-button>
          </el-col>
        </el-row>
      </div>
    </div>
    
    <!-- 数据看板 -->
    <div class="dashboard-section">
      <div class="dashboard-cards">
        <div class="dashboard-card">
          <div class="card-icon">📦</div>
          <div class="card-content">
            <div class="card-value">{{ todayShipment }}</div>
            <div class="card-label">今日出货量</div>
          </div>
        </div>
        <div class="dashboard-card">
          <div class="card-icon">📊</div>
          <div class="card-content">
            <div class="card-value">{{ monthShipment }}</div>
            <div class="card-label">本月出货量</div>
          </div>
        </div>
        <div class="dashboard-card">
          <div class="card-icon">✅</div>
          <div class="card-content">
            <div class="card-value">{{ onTimeRate }}%</div>
            <div class="card-label">准时交付率</div>
          </div>
        </div>
        <div class="dashboard-card">
          <div class="card-icon">🔄</div>
          <div class="card-content">
            <div class="card-value">{{ returnRate }}%</div>
            <div class="card-label">退货率</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 出货列表 -->
    <div class="list-section">
      <div class="section-header">
        <h3 class="section-title">出货记录</h3>
        <div class="action-buttons">
          <el-button type="primary" size="large" @click="batchExport">
            批量导出
          </el-button>
          <el-button type="info" size="large" @click="batchMarkCompleted">
            批量标记已完成
          </el-button>
        </div>
      </div>
      
      <el-table :data="shipmentList" style="width: 100%" size="large">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="shipmentNo" label="发货单号" width="180" />
        <el-table-column prop="orderNo" label="销售订单号" width="180" />
        <el-table-column prop="customer" label="客户" width="150" />
        <el-table-column prop="productName" label="成品名称" width="200" />
        <el-table-column prop="quantity" label="数量" width="100" />
        <el-table-column prop="logisticsNo" label="物流单号" width="180" />
        <el-table-column prop="status" label="发货状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="shipmentDate" label="发货时间" width="180" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="viewShipment(scope.row)">查看</el-button>
            <el-button size="small" type="primary" @click="editShipment(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="cancelShipment(scope.row)">取消发货</el-button>
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
      // 筛选参数
      filterParams: {
        dateRange: [],
        customer: '',
        status: ''
      },
      // 分页
      currentPage: 1,
      pageSize: 20,
      total: 0,
      // 模拟数据
      shipmentList: [
        {
          shipmentNo: 'SHIP20260306001',
          orderNo: 'SO20260301001',
          customer: '张三贸易公司',
          productName: '牛仔裤成品',
          quantity: 500,
          logisticsNo: 'SF1234567890',
          status: 'completed',
          shipmentDate: '2026-03-06 11:20'
        },
        {
          shipmentNo: 'SHIP20260305001',
          orderNo: 'SO20260302001',
          customer: '李四服装厂',
          productName: '衬衫成品',
          quantity: 300,
          logisticsNo: 'ZT9876543210',
          status: 'shipped',
          shipmentDate: '2026-03-05 16:45'
        },
        {
          shipmentNo: 'SHIP20260304001',
          orderNo: 'SO20260303001',
          customer: '王五服饰',
          productName: '牛仔裤成品',
          quantity: 150,
          logisticsNo: 'YT5678901234',
          status: 'shipped',
          shipmentDate: '2026-03-04 09:30'
        },
        {
          shipmentNo: 'SHIP20260303001',
          orderNo: 'SO20260301002',
          customer: '张三贸易公司',
          productName: 'T恤成品',
          quantity: 800,
          logisticsNo: 'SF2345678901',
          status: 'completed',
          shipmentDate: '2026-03-03 14:20'
        },
        {
          shipmentNo: 'SHIP20260302001',
          orderNo: 'SO20260302002',
          customer: '李四服装厂',
          productName: '衬衫成品',
          quantity: 200,
          logisticsNo: 'ZT8765432109',
          status: 'pending',
          shipmentDate: '2026-03-02 10:15'
        }
      ]
    }
  },
  computed: {
    total() {
      return this.shipmentList.length;
    },
    // 今日出货量
    todayShipment() {
      return 2;
    },
    // 本月出货量
    monthShipment() {
      return 1950;
    },
    // 准时交付率
    onTimeRate() {
      return 95;
    },
    // 退货率
    returnRate() {
      return 2;
    }
  },
  methods: {
    // 搜索出货记录
    searchShipments() {
      // 模拟搜索
      this.$message.success('筛选成功');
    },
    
    // 获取状态类型
    getStatusType(status) {
      switch (status) {
        case 'pending': return 'warning';
        case 'shipped': return 'info';
        case 'completed': return 'success';
        default: return '';
      }
    },
    
    // 获取状态文本
    getStatusText(status) {
      switch (status) {
        case 'pending': return '待发货';
        case 'shipped': return '已发货';
        case 'completed': return '已完成';
        default: return '';
      }
    },
    
    // 查看出货详情
    viewShipment(row) {
      this.$message.info('查看出货详情功能开发中');
    },
    
    // 编辑出货信息
    editShipment(row) {
      this.$message.info('编辑出货信息功能开发中');
    },
    
    // 取消发货
    cancelShipment(row) {
      this.$message.confirm('确定要取消发货吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message.success('发货已取消');
      }).catch(() => {
        this.$message.info('已取消操作');
      });
    },
    
    // 批量导出
    batchExport() {
      this.$message.success('批量导出成功');
    },
    
    // 批量标记已完成
    batchMarkCompleted() {
      this.$message.success('批量标记已完成');
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
.shipment-list {
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

.filter-section {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
}

.filter-form {
  margin-top: 10px;
}

.search-btn {
  width: 100%;
  font-size: 16px;
  padding: 12px;
}

.dashboard-section {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.dashboard-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-top: 20px;
}

.dashboard-card {
  background-color: #f9f9f9;
  padding: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
}

.dashboard-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-color: #4A90E2;
}

.card-icon {
  font-size: 48px;
  flex-shrink: 0;
}

.card-content {
  flex: 1;
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
  flex: 1;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.action-buttons {
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

.el-select {
  font-size: 16px;
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

.el-date-picker {
  font-size: 16px;
}
</style>