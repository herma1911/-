<template>
  <div class="incoming-registration">
    <!-- 顶部标题 -->
    <div class="page-header">
      <h1 class="page-title">来料登记</h1>
      <p class="page-subtitle">快速登记来料信息，生成收料单</p>
    </div>
    
    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 左侧查询区 -->
      <div class="query-section">
        <h3 class="section-title">历史订单查询</h3>
        <div class="query-form">
          <el-form :model="queryForm" label-width="120px">
            <el-form-item label="订单日期范围">
              <el-date-picker
                v-model="queryForm.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                size="large"
              />
            </el-form-item>
            <el-form-item label="供应商">
              <el-select v-model="queryForm.supplier" placeholder="选择供应商" size="large">
                <el-option v-for="supplier in suppliers" :key="supplier.id" :label="supplier.name" :value="supplier.id" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" size="large" @click="searchOrders">查询</el-button>
            </el-form-item>
          </el-form>
        </div>
        
        <!-- 历史订单列表 -->
        <div class="order-list">
          <h4 class="list-title">最近订单</h4>
          <el-table :data="recentOrders" style="width: 100%" size="large">
            <el-table-column prop="orderNo" label="订单号" width="180" />
            <el-table-column prop="supplierName" label="供应商" width="200" />
            <el-table-column prop="materialCount" label="物料种类" width="120" />
            <el-table-column prop="orderDate" label="订单日期" width="180" />
            <el-table-column label="操作" width="120">
              <template #default="scope">
                <el-button size="small" type="primary" @click="selectOrder(scope.row)">选择</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      
      <!-- 中间核心录入区 -->
      <div class="input-section">
        <h3 class="section-title">来料信息录入</h3>
        <el-form :model="form" label-width="150px" size="large">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="采购订单号">
                <el-select v-model="form.purchaseOrderNo" placeholder="选择采购订单" size="large">
                  <el-option v-for="order in purchaseOrders" :key="order.orderNo" :label="order.orderNo" :value="order.orderNo" />
                </el-select>
              </el-form-item>
              <el-form-item label="供应商名称">
                <el-select v-model="form.supplierId" placeholder="选择供应商" size="large">
                  <el-option v-for="supplier in suppliers" :key="supplier.id" :label="supplier.name" :value="supplier.id" />
                </el-select>
              </el-form-item>
              <el-form-item label="物料编码/名称">
                <el-select v-model="form.materialId" placeholder="选择物料" size="large" filterable>
                  <el-option v-for="material in materials" :key="material.id" :label="`${material.code} - ${material.name}`" :value="material.id" />
                </el-select>
              </el-form-item>
              <el-form-item label="来料数量">
                <el-input-number v-model="form.quantity" :min="1" size="large" style="width: 80%" />
                <el-select v-model="form.unit" placeholder="单位" size="large" style="width: 20%; margin-left: 10px">
                  <el-option label="米" value="米" />
                  <el-option label="件" value="件" />
                  <el-option label="卷" value="卷" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="来料批次号">
                <el-input v-model="form.batchNo" placeholder="自动生成，可修改" size="large" />
              </el-form-item>
              <el-form-item label="送货日期">
                <el-date-picker v-model="form.deliveryDate" type="date" placeholder="选择日期" size="large" />
              </el-form-item>
              <el-form-item label="库位">
                <el-select v-model="form.warehouseLocation" placeholder="选择库位" size="large">
                  <el-option v-for="location in warehouseLocations" :key="location.id" :label="location.name" :value="location.id" />
                </el-select>
              </el-form-item>
              <el-form-item label="备注">
                <el-input v-model="form.remark" type="textarea" placeholder="请输入备注信息" size="large" :rows="3" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </div>
    
    <!-- 底部操作按钮区 -->
    <div class="action-buttons">
      <el-button type="primary" size="large" class="main-btn" @click="saveAndPrint">保存并打印标签</el-button>
      <el-button type="info" size="large" @click="saveDraft">保存暂存</el-button>
      <el-button size="large" @click="resetForm">重置</el-button>
      <el-button size="large" @click="goToList">返回列表</el-button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询表单
      queryForm: {
        dateRange: null,
        supplier: ''
      },
      // 来料登记表单
      form: {
        purchaseOrderNo: '',
        supplierId: '',
        materialId: '',
        quantity: 1,
        unit: '件',
        batchNo: '',
        deliveryDate: new Date(),
        warehouseLocation: '',
        remark: ''
      },
      // 模拟数据
      suppliers: [
        { id: 1, name: '广州面料供应商' },
        { id: 2, name: '深圳辅料供应商' },
        { id: 3, name: '东莞包装材料供应商' }
      ],
      purchaseOrders: [
        { orderNo: 'PO20260301001', supplierId: 1, supplierName: '广州面料供应商', materialCount: 3, orderDate: '2026-03-01' },
        { orderNo: 'PO20260302002', supplierId: 2, supplierName: '深圳辅料供应商', materialCount: 5, orderDate: '2026-03-02' },
        { orderNo: 'PO20260303003', supplierId: 3, supplierName: '东莞包装材料供应商', materialCount: 2, orderDate: '2026-03-03' }
      ],
      materials: [
        { id: 1, code: 'MAT001', name: '纯棉面料' },
        { id: 2, code: 'MAT002', name: '涤纶面料' },
        { id: 3, code: 'MAT003', name: '拉链' },
        { id: 4, code: 'MAT004', name: '纽扣' },
        { id: 5, code: 'MAT005', name: '标签' }
      ],
      warehouseLocations: [
        { id: 1, name: '原料仓A区' },
        { id: 2, name: '原料仓B区' },
        { id: 3, name: '辅料仓' }
      ],
      recentOrders: []
    }
  },
  mounted() {
    // 初始化数据
    this.recentOrders = this.purchaseOrders;
    // 生成默认批次号
    this.generateBatchNo();
  },
  methods: {
    // 生成批次号
    generateBatchNo() {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      this.form.batchNo = `${year}${month}${day}-${random}`;
    },
    
    // 搜索订单
    searchOrders() {
      // 模拟搜索
      this.recentOrders = this.purchaseOrders;
      this.$message.success('查询成功');
    },
    
    // 选择订单
    selectOrder(order) {
      this.form.purchaseOrderNo = order.orderNo;
      this.form.supplierId = order.supplierId;
      this.$message.success('订单已选择');
    },
    
    // 保存并打印标签
    saveAndPrint() {
      // 模拟保存
      this.$message.success('保存成功，标签已打印');
      // 重置表单
      this.resetForm();
    },
    
    // 保存暂存
    saveDraft() {
      this.$message.success('已保存暂存');
    },
    
    // 重置表单
    resetForm() {
      this.form = {
        purchaseOrderNo: '',
        supplierId: '',
        materialId: '',
        quantity: 1,
        unit: '件',
        batchNo: '',
        deliveryDate: new Date(),
        warehouseLocation: '',
        remark: ''
      };
      this.generateBatchNo();
    },
    
    // 返回列表
    goToList() {
      this.$router.push('/materials/incoming-list');
    }
  }
}
</script>

<style scoped>
.incoming-registration {
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

.main-content {
  display: flex;
  gap: 30px;
  margin-bottom: 40px;
}

.query-section {
  flex: 1;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.input-section {
  flex: 2;
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

.list-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin: 20px 0 10px 0;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}

.main-btn {
  min-width: 200px;
  font-size: 18px;
  padding: 15px 30px;
}

.el-button {
  font-size: 16px;
  padding: 12px 24px;
}

.el-form-item {
  margin-bottom: 20px;
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