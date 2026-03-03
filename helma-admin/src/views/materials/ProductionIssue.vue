<template>
  <div class="production-issue">
    <!-- 顶部标题 -->
    <div class="page-header">
      <h1 class="page-title">生产领料</h1>
      <p class="page-subtitle">根据工单领取所需物料，自动扣减库存</p>
    </div>
    
    <!-- 工单选择区 -->
    <div class="work-order-section">
      <h3 class="section-title">工单选择</h3>
      <el-form :model="form" label-width="120px" size="large" inline>
        <el-form-item label="工单号">
          <el-select v-model="form.workOrderNo" placeholder="选择工单" size="large" @change="loadMaterials">
            <el-option v-for="order in workOrders" :key="order.orderNo" :label="order.orderNo" :value="order.orderNo" />
          </el-select>
        </el-form-item>
        <el-form-item label="生产车间">
          <el-select v-model="form.workshop" placeholder="选择车间" size="large">
            <el-option label="一车间" value="workshop1" />
            <el-option label="二车间" value="workshop2" />
            <el-option label="三车间" value="workshop3" />
          </el-select>
        </el-form-item>
        <el-form-item label="领料人">
          <el-input v-model="form.operator" placeholder="输入领料人" size="large" />
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 物料清单 -->
    <div class="materials-section">
      <h3 class="section-title">物料清单</h3>
      <el-table :data="materialList" style="width: 100%" size="large">
        <el-table-column prop="materialCode" label="物料编码" width="150" />
        <el-table-column prop="materialName" label="物料名称" width="200" />
        <el-table-column prop="specification" label="规格" width="150" />
        <el-table-column prop="unit" label="单位" width="80" />
        <el-table-column prop="requiredQuantity" label="需领数量" width="120" />
        <el-table-column prop="availableQuantity" label="库存可用" width="120" />
        <el-table-column label="实际领料" width="150">
          <template #default="scope">
            <el-input-number 
              v-model="scope.row.actualQuantity" 
              :min="0" 
              :max="scope.row.availableQuantity" 
              size="large" 
              @change="checkQuantity(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="warehouseLocation" label="库位" width="120" />
      </el-table>
    </div>
    
    <!-- 领料信息 -->
    <div class="issue-info-section">
      <h3 class="section-title">领料信息</h3>
      <el-form :model="form" label-width="150px" size="large">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="领料日期">
              <el-date-picker v-model="form.issueDate" type="date" placeholder="选择日期" size="large" />
            </el-form-item>
            <el-form-item label="领料部门">
              <el-input v-model="form.department" placeholder="输入领料部门" size="large" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
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
    
    <!-- 底部操作按钮 -->
    <div class="action-buttons">
      <el-button type="primary" size="large" class="main-btn" @click="confirmIssue">确认领料并扣库存</el-button>
      <el-button type="info" size="large" @click="printIssueSheet">打印领料单</el-button>
      <el-button size="large" @click="goToDashboard">返回看板</el-button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 表单数据
      form: {
        workOrderNo: '',
        workshop: '',
        operator: '',
        issueDate: new Date(),
        department: '',
        warehouseLocation: '',
        remark: ''
      },
      // 模拟数据
      workOrders: [
        { orderNo: 'WO20260301001', productName: '牛仔裤', quantity: 1000 },
        { orderNo: 'WO20260302002', productName: 'T恤', quantity: 2000 },
        { orderNo: 'WO20260303003', productName: '休闲裤', quantity: 1500 }
      ],
      warehouseLocations: [
        { id: 1, name: '原料仓A区' },
        { id: 2, name: '原料仓B区' },
        { id: 3, name: '辅料仓' }
      ],
      // 物料列表
      materialList: []
    }
  },
  methods: {
    // 加载物料清单
    loadMaterials() {
      // 模拟加载物料
      this.materialList = [
        {
          materialCode: 'MAT001',
          materialName: '纯棉面料',
          specification: '21支',
          unit: '米',
          requiredQuantity: 2000,
          availableQuantity: 1200,
          actualQuantity: 1200,
          warehouseLocation: '原料仓A区'
        },
        {
          materialCode: 'MAT003',
          materialName: '拉链',
          specification: '5号',
          unit: '条',
          requiredQuantity: 1000,
          availableQuantity: 800,
          actualQuantity: 800,
          warehouseLocation: '辅料仓'
        },
        {
          materialCode: 'MAT004',
          materialName: '纽扣',
          specification: '15mm',
          unit: '个',
          requiredQuantity: 4000,
          availableQuantity: 10000,
          actualQuantity: 4000,
          warehouseLocation: '辅料仓'
        }
      ];
      this.$message.success('物料清单加载成功');
    },
    
    // 检查领料数量
    checkQuantity(row) {
      if (row.actualQuantity > row.availableQuantity) {
        this.$message.warning('领料数量不能超过库存可用数量');
        row.actualQuantity = row.availableQuantity;
      }
    },
    
    // 确认领料并扣库存
    confirmIssue() {
      if (!this.form.workOrderNo) {
        this.$message.warning('请选择工单');
        return;
      }
      this.$message.success('领料成功，库存已扣减');
    },
    
    // 打印领料单
    printIssueSheet() {
      this.$message.success('领料单已打印');
    },
    
    // 返回看板
    goToDashboard() {
      this.$router.push('/materials/inventory-dashboard');
    }
  }
}
</script>

<style scoped>
.production-issue {
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

.work-order-section {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.materials-section {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.issue-info-section {
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