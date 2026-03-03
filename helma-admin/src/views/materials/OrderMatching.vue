<template>
  <div class="order-matching">
    <!-- 顶部标题 -->
    <div class="page-header">
      <h1 class="page-title">订单匹配</h1>
      <p class="page-subtitle">匹配销售订单与库存，生成拣货单</p>
    </div>
    
    <!-- 客户/订单筛选区 -->
    <div class="filter-section">
      <h3 class="section-title">订单筛选</h3>
      <div class="filter-form">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-select v-model="filterParams.customer" placeholder="客户" size="large" style="width: 100%">
              <el-option label="全部客户" value="" />
              <el-option label="张三贸易公司" value="customer1" />
              <el-option label="李四服装厂" value="customer2" />
              <el-option label="王五服饰" value="customer3" />
            </el-select>
          </el-col>
          <el-col :span="10">
            <el-select v-model="filterParams.orderNo" placeholder="销售订单号" size="large" style="width: 100%">
              <el-option label="全部订单" value="" />
              <el-option label="SO20260301001" value="SO20260301001" />
              <el-option label="SO20260302001" value="SO20260302001" />
              <el-option label="SO20260303001" value="SO20260303001" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-button type="primary" size="large" class="search-btn" @click="searchOrders">
              筛选
            </el-button>
          </el-col>
        </el-row>
      </div>
    </div>
    
    <!-- 订单-库存匹配列表 -->
    <div class="matching-section">
      <div class="section-header">
        <h3 class="section-title">订单-库存匹配</h3>
        <div class="action-buttons">
          <el-button type="primary" size="large" @click="generateAllPickLists">
            批量生成拣货单
          </el-button>
        </div>
      </div>
      
      <el-table :data="orderMatchingList" style="width: 100%" size="large">
        <el-table-column prop="orderNo" label="销售订单号" width="180" />
        <el-table-column prop="customer" label="客户" width="150" />
        <el-table-column prop="productCode" label="成品编码" width="150" />
        <el-table-column prop="productName" label="成品名称" width="200" />
        <el-table-column prop="specification" label="规格" width="120" />
        <el-table-column prop="orderQuantity" label="订单数量" width="120" />
        <el-table-column prop="availableQuantity" label="库存可用数" width="120">
          <template #default="scope">
            <span :class="{ 'low-stock': scope.row.availableQuantity < scope.row.orderQuantity }">
              {{ scope.row.availableQuantity }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="shippableQuantity" label="可发数量" width="120">
          <template #default="scope">
            <el-input-number 
              v-model="scope.row.shippableQuantity" 
              :min="0" 
              :max="scope.row.availableQuantity"
              size="large" 
              @change="updateShippableQuantity(scope.row)"
              style="width: 100%"
            />
          </template>
        </el-table-column>
        <el-table-column label="发货批次" width="180">
          <template #default="scope">
            <el-select v-model="scope.row.batchNo" placeholder="选择批次" size="large" style="width: 100%">
              <el-option 
                v-for="batch in scope.row.availableBatches" 
                :key="batch.batchNo"
                :label="batch.batchNo + ' (' + batch.quantity + ')'"
                :value="batch.batchNo"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button type="primary" size="small" @click="generatePickList(scope.row)">
              生成拣货单
            </el-button>
            <el-button type="info" size="small" @click="viewOrderDetail(scope.row)">
              查看详情
            </el-button>
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
        customer: '',
        orderNo: ''
      },
      // 分页
      currentPage: 1,
      pageSize: 20,
      total: 0,
      // 模拟数据
      orderMatchingList: [
        {
          orderNo: 'SO20260301001',
          customer: '张三贸易公司',
          productCode: 'FP001',
          productName: '牛仔裤成品',
          specification: '32码',
          orderQuantity: 500,
          availableQuantity: 600,
          shippableQuantity: 500,
          batchNo: '20260301-001',
          availableBatches: [
            { batchNo: '20260301-001', quantity: 300 },
            { batchNo: '20260302-001', quantity: 200 },
            { batchNo: '20260303-001', quantity: 100 }
          ]
        },
        {
          orderNo: 'SO20260301001',
          customer: '张三贸易公司',
          productCode: 'FP002',
          productName: 'T恤成品',
          specification: 'M码',
          orderQuantity: 1000,
          availableQuantity: 800,
          shippableQuantity: 800,
          batchNo: '20260301-002',
          availableBatches: [
            { batchNo: '20260301-002', quantity: 500 },
            { batchNo: '20260302-002', quantity: 300 }
          ]
        },
        {
          orderNo: 'SO20260302001',
          customer: '李四服装厂',
          productCode: 'FP003',
          productName: '衬衫成品',
          specification: 'L码',
          orderQuantity: 300,
          availableQuantity: 400,
          shippableQuantity: 300,
          batchNo: '20260301-003',
          availableBatches: [
            { batchNo: '20260301-003', quantity: 400 }
          ]
        },
        {
          orderNo: 'SO20260303001',
          customer: '王五服饰',
          productCode: 'FP001',
          productName: '牛仔裤成品',
          specification: '34码',
          orderQuantity: 200,
          availableQuantity: 150,
          shippableQuantity: 150,
          batchNo: '20260302-001',
          availableBatches: [
            { batchNo: '20260302-001', quantity: 150 }
          ]
        }
      ]
    }
  },
  computed: {
    total() {
      return this.orderMatchingList.length;
    }
  },
  methods: {
    // 搜索订单
    searchOrders() {
      // 模拟搜索
      this.$message.success('筛选成功');
    },
    
    // 更新可发数量
    updateShippableQuantity(row) {
      if (row.shippableQuantity > row.availableQuantity) {
        row.shippableQuantity = row.availableQuantity;
        this.$message.warning('可发数量不能超过库存可用数');
      }
    },
    
    // 生成拣货单
    generatePickList(row) {
      this.$message.success(`拣货单已生成，订单号：${row.orderNo}`);
    },
    
    // 批量生成拣货单
    generateAllPickLists() {
      this.$message.success('批量拣货单已生成');
    },
    
    // 查看订单详情
    viewOrderDetail(row) {
      this.$message.info('查看订单详情功能开发中');
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
.order-matching {
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

.matching-section {
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

.low-stock {
  color: #f56c6c;
  font-weight: bold;
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

.el-input-number {
  font-size: 16px;
}
</style>