<template>
  <div class="batch-traceability">
    <!-- 顶部标题 -->
    <div class="page-header">
      <h1 class="page-title">物料批次追溯</h1>
      <p class="page-subtitle">全程追踪物料流转，确保质量可追溯</p>
    </div>
    
    <!-- 顶部搜索框 -->
    <div class="search-section">
      <div class="search-form">
        <el-row :gutter="20">
          <el-col :span="10">
            <el-input
              v-model="searchParams.materialCode"
              placeholder="物料编码"
              size="large"
              prefix-icon="el-icon-search"
              @keyup.enter="searchTraceability"
            />
          </el-col>
          <el-col :span="10">
            <el-input
              v-model="searchParams.batchNo"
              placeholder="批次号"
              size="large"
              prefix-icon="el-icon-search"
              @keyup.enter="searchTraceability"
            />
          </el-col>
          <el-col :span="4">
            <el-button type="primary" size="large" class="search-btn" @click="searchTraceability">
              搜索
            </el-button>
          </el-col>
        </el-row>
      </div>
    </div>
    
    <!-- 物料基本信息 -->
    <div class="material-info" v-if="materialInfo">
      <h3 class="info-title">物料信息</h3>
      <div class="info-content">
        <el-descriptions :column="4" border size="large">
          <el-descriptions-item label="物料编码">{{ materialInfo.materialCode }}</el-descriptions-item>
          <el-descriptions-item label="物料名称">{{ materialInfo.materialName }}</el-descriptions-item>
          <el-descriptions-item label="规格">{{ materialInfo.specification }}</el-descriptions-item>
          <el-descriptions-item label="单位">{{ materialInfo.unit }}</el-descriptions-item>
          <el-descriptions-item label="批次号">{{ materialInfo.batchNo }}</el-descriptions-item>
          <el-descriptions-item label="入库时间">{{ materialInfo.inboundDate }}</el-descriptions-item>
          <el-descriptions-item label="供应商">{{ materialInfo.supplier }}</el-descriptions-item>
          <el-descriptions-item label="当前状态">{{ materialInfo.status }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </div>
    
    <!-- 可视化流程图 -->
    <div class="flow-section" v-if="traceabilityFlow.length > 0">
      <h3 class="section-title">流转流程</h3>
      <div class="flow-diagram">
        <div class="flow-steps">
          <div 
            v-for="(step, index) in traceabilityFlow" 
            :key="step.id"
            class="flow-step"
            :class="{ 'active': step.status === 'completed' }"
          >
            <div class="step-icon">{{ step.icon }}</div>
            <div class="step-content">
              <div class="step-title">{{ step.title }}</div>
              <div class="step-info">{{ step.time }}</div>
              <div class="step-info">{{ step.operator }}</div>
            </div>
            <div class="step-arrow" v-if="index < traceabilityFlow.length - 1">→</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 详细记录列表 -->
    <div class="records-section" v-if="traceabilityRecords.length > 0">
      <div class="section-header">
        <h3 class="section-title">详细记录</h3>
        <div class="action-buttons">
          <el-button type="primary" size="large" @click="exportReport">
            导出追溯报告
          </el-button>
          <el-button type="info" size="large" @click="backToDashboard">
            返回看板
          </el-button>
        </div>
      </div>
      
      <el-table :data="traceabilityRecords" style="width: 100%" size="large">
        <el-table-column prop="operationType" label="操作类型" width="150" />
        <el-table-column prop="operationTime" label="操作时间" width="180" />
        <el-table-column prop="documentNo" label="单号" width="180" />
        <el-table-column prop="quantity" label="数量" width="100" />
        <el-table-column prop="operator" label="操作人" width="120" />
        <el-table-column prop="location" label="库位" width="120" />
        <el-table-column prop="remark" label="备注" />
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
    
    <!-- 无数据提示 -->
    <div class="no-data" v-if="!materialInfo && traceabilityFlow.length === 0">
      <div class="no-data-icon">🔍</div>
      <div class="no-data-text">请输入物料编码或批次号进行搜索</div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 搜索参数
      searchParams: {
        materialCode: '',
        batchNo: ''
      },
      // 分页
      currentPage: 1,
      pageSize: 20,
      total: 0,
      // 物料信息
      materialInfo: null,
      // 流转流程
      traceabilityFlow: [],
      // 详细记录
      traceabilityRecords: []
    }
  },
  methods: {
    // 搜索追溯信息
    searchTraceability() {
      if (!this.searchParams.materialCode && !this.searchParams.batchNo) {
        this.$message.warning('请输入物料编码或批次号');
        return;
      }
      
      // 模拟数据
      this.materialInfo = {
        materialCode: 'MAT001',
        materialName: '纯棉面料',
        specification: '21支',
        unit: '米',
        batchNo: '20260301-001',
        inboundDate: '2026-03-01',
        supplier: '优质纺织有限公司',
        status: '已使用'
      };
      
      this.traceabilityFlow = [
        {
          id: 1,
          title: '采购收料',
          icon: '📦',
          time: '2026-03-01 10:00',
          operator: '张三',
          status: 'completed'
        },
        {
          id: 2,
          title: '检验入库',
          icon: '✅',
          time: '2026-03-01 14:30',
          operator: '李四',
          status: 'completed'
        },
        {
          id: 3,
          title: '生产领料',
          icon: '🔧',
          time: '2026-03-02 09:15',
          operator: '王五',
          status: 'completed'
        },
        {
          id: 4,
          title: '成品入库',
          icon: '🏭',
          time: '2026-03-05 16:45',
          operator: '赵六',
          status: 'completed'
        },
        {
          id: 5,
          title: '出货',
          icon: '🚚',
          time: '2026-03-06 11:20',
          operator: '孙七',
          status: 'completed'
        }
      ];
      
      this.traceabilityRecords = [
        {
          operationType: '采购收料',
          operationTime: '2026-03-01 10:00',
          documentNo: 'IN20260301001',
          quantity: 1000,
          operator: '张三',
          location: '原料仓A区',
          remark: '采购订单PO20260228001'
        },
        {
          operationType: '检验入库',
          operationTime: '2026-03-01 14:30',
          documentNo: 'QI20260301001',
          quantity: 1000,
          operator: '李四',
          location: '原料仓A区',
          remark: '检验合格'
        },
        {
          operationType: '生产领料',
          operationTime: '2026-03-02 09:15',
          documentNo: 'OUT20260302001',
          quantity: 500,
          operator: '王五',
          location: '生产车间',
          remark: '工单WO20260301001'
        },
        {
          operationType: '生产领料',
          operationTime: '2026-03-03 10:30',
          documentNo: 'OUT20260303001',
          quantity: 300,
          operator: '王五',
          location: '生产车间',
          remark: '工单WO20260302001'
        },
        {
          operationType: '成品入库',
          operationTime: '2026-03-05 16:45',
          documentNo: 'FIN20260305001',
          quantity: 750,
          operator: '赵六',
          location: '成品仓',
          remark: '成品率93.75%'
        },
        {
          operationType: '出货',
          operationTime: '2026-03-06 11:20',
          documentNo: 'SHIP20260306001',
          quantity: 500,
          operator: '孙七',
          location: '物流中心',
          remark: '销售订单SO20260301001'
        }
      ];
      
      this.total = this.traceabilityRecords.length;
    },
    
    // 导出追溯报告
    exportReport() {
      this.$message.success('追溯报告已导出');
    },
    
    // 返回看板
    backToDashboard() {
      this.$router.push('/materials/inventory-dashboard');
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
.batch-traceability {
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

.search-section {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.search-form {
  margin-top: 10px;
}

.search-btn {
  width: 100%;
  font-size: 16px;
  padding: 12px;
}

.material-info {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.info-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
}

.flow-section {
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

.flow-diagram {
  margin-top: 30px;
}

.flow-steps {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  padding: 0 20px;
}

.flow-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
}

.flow-step.active .step-icon {
  background-color: #4A90E2;
  color: white;
  transform: scale(1.1);
}

.flow-step.active .step-content {
  color: #4A90E2;
  font-weight: bold;
}

.step-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 15px;
  transition: all 0.3s ease;
}

.step-content {
  text-align: center;
  font-size: 14px;
  color: #666;
  transition: all 0.3s ease;
}

.step-title {
  font-weight: bold;
  margin-bottom: 5px;
  font-size: 16px;
}

.step-info {
  font-size: 12px;
  margin-bottom: 3px;
}

.step-arrow {
  position: absolute;
  top: 30px;
  right: -25px;
  font-size: 24px;
  color: #999;
  z-index: 1;
}

.records-section {
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

.no-data {
  background-color: #fff;
  padding: 60px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  text-align: center;
}

.no-data-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.no-data-text {
  font-size: 16px;
  color: #999;
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

.el-descriptions {
  margin-top: 10px;
}

.el-descriptions__label {
  font-weight: 600;
  font-size: 14px;
}

.el-descriptions__content {
  font-size: 14px;
}
</style>