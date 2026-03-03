<template>
  <div class="incoming-inspection">
    <!-- 顶部标题 -->
    <div class="page-header">
      <h1 class="page-title">来料检验</h1>
      <p class="page-subtitle">检验来料质量，生成检验报告</p>
    </div>
    
    <!-- 顶部筛选区 -->
    <div class="filter-section">
      <el-form :model="filterForm" label-width="120px" size="large" inline>
        <el-form-item label="收料单号">
          <el-select v-model="filterForm.receiptNo" placeholder="选择收料单" size="large">
            <el-option v-for="receipt in receipts" :key="receipt.receiptNo" :label="receipt.receiptNo" :value="receipt.receiptNo" />
          </el-select>
        </el-form-item>
        <el-form-item label="物料编码">
          <el-input v-model="filterForm.materialCode" placeholder="输入物料编码" size="large" />
        </el-form-item>
        <el-form-item label="检验状态">
          <el-select v-model="filterForm.inspectionStatus" placeholder="选择检验状态" size="large">
            <el-option label="待检验" value="pending" />
            <el-option label="已检验" value="completed" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" @click="searchMaterials">查询</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 待检验物料列表 -->
    <div class="materials-section">
      <h3 class="section-title">待检验物料</h3>
      <el-table :data="materialsList" style="width: 100%" size="large">
        <el-table-column prop="receiptNo" label="收料单号" width="180" />
        <el-table-column prop="materialCode" label="物料编码" width="150" />
        <el-table-column prop="materialName" label="物料名称" width="200" />
        <el-table-column prop="supplierName" label="供应商" width="180" />
        <el-table-column prop="quantity" label="来料数量" width="120" />
        <el-table-column prop="unit" label="单位" width="80" />
        <el-table-column prop="inspectionStatus" label="检验状态" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.inspectionStatus === 'pending' ? 'warning' : 'success'">
              {{ scope.row.inspectionStatus === 'pending' ? '待检验' : '已检验' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" type="primary" @click="inspectMaterial(scope.row)">检验</el-button>
            <el-button size="small" @click="viewDetail(scope.row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <!-- 检验结果录入区 -->
    <div class="inspection-section" v-if="selectedMaterial">
      <h3 class="section-title">检验结果录入</h3>
      <el-form :model="inspectionForm" label-width="150px" size="large">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="收料单号">
              <el-input v-model="inspectionForm.receiptNo" disabled size="large" />
            </el-form-item>
            <el-form-item label="物料信息">
              <el-input v-model="inspectionForm.materialInfo" disabled size="large" />
            </el-form-item>
            <el-form-item label="来料数量">
              <el-input v-model="inspectionForm.totalQuantity" disabled size="large" />
            </el-form-item>
            <el-form-item label="检验数量">
              <el-input-number v-model="inspectionForm.inspectionQuantity" :min="1" size="large" />
              <span class="quantity-hint">/ {{ inspectionForm.totalQuantity }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="合格数量">
              <el-input-number v-model="inspectionForm.qualifiedQuantity" :min="0" size="large" />
            </el-form-item>
            <el-form-item label="不合格数量">
              <el-input-number v-model="inspectionForm.unqualifiedQuantity" :min="0" size="large" />
            </el-form-item>
            <el-form-item label="检验结果">
              <el-select v-model="inspectionForm.inspectionResult" placeholder="选择检验结果" size="large">
                <el-option label="合格" value="qualified" />
                <el-option label="不合格" value="unqualified" />
                <el-option label="让步接收" value="concession" />
              </el-select>
            </el-form-item>
            <el-form-item label="不合格原因" v-if="inspectionForm.unqualifiedQuantity > 0">
              <el-select v-model="inspectionForm.unqualifiedReason" placeholder="选择不合格原因" size="large">
                <el-option label="面料破损" value="fabric_damage" />
                <el-option label="色差" value="color_difference" />
                <el-option label="尺寸不符" value="size_mismatch" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <!-- 检验项 -->
        <div class="inspection-items">
          <h4 class="item-title">检验项</h4>
          <div class="item-list">
            <el-checkbox-group v-model="inspectionForm.inspectionItems">
              <el-checkbox label="面料克重" size="large" />
              <el-checkbox label="色牢度" size="large" />
              <el-checkbox label="尺寸偏差" size="large" />
              <el-checkbox label="外观质量" size="large" />
              <el-checkbox label="物理性能" size="large" />
            </el-checkbox-group>
          </div>
        </div>
        
        <el-form-item label="检验备注">
          <el-input v-model="inspectionForm.remark" type="textarea" placeholder="请输入检验备注" size="large" :rows="3" />
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 底部操作按钮 -->
    <div class="action-buttons" v-if="selectedMaterial">
      <el-button type="success" size="large" @click="confirmInspection">确认检验并入库</el-button>
      <el-button type="danger" size="large" @click="markUnqualified">标记不合格并退货</el-button>
      <el-button type="info" size="large" @click="exportReport">导出检验报告</el-button>
      <el-button size="large" @click="resetInspection">重置</el-button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 筛选表单
      filterForm: {
        receiptNo: '',
        materialCode: '',
        inspectionStatus: ''
      },
      // 检验表单
      inspectionForm: {
        receiptNo: '',
        materialInfo: '',
        totalQuantity: '',
        inspectionQuantity: 1,
        qualifiedQuantity: 0,
        unqualifiedQuantity: 0,
        inspectionResult: '',
        unqualifiedReason: '',
        inspectionItems: [],
        remark: ''
      },
      // 选中的物料
      selectedMaterial: null,
      // 模拟数据
      receipts: [
        { receiptNo: 'RC20260301001' },
        { receiptNo: 'RC20260302002' },
        { receiptNo: 'RC20260303003' }
      ],
      materialsList: [
        {
          receiptNo: 'RC20260301001',
          materialCode: 'MAT001',
          materialName: '纯棉面料',
          supplierName: '广州面料供应商',
          quantity: 1000,
          unit: '米',
          inspectionStatus: 'pending'
        },
        {
          receiptNo: 'RC20260302002',
          materialCode: 'MAT003',
          materialName: '拉链',
          supplierName: '深圳辅料供应商',
          quantity: 5000,
          unit: '条',
          inspectionStatus: 'pending'
        },
        {
          receiptNo: 'RC20260303003',
          materialCode: 'MAT005',
          materialName: '标签',
          supplierName: '东莞包装材料供应商',
          quantity: 10000,
          unit: '个',
          inspectionStatus: 'completed'
        }
      ]
    }
  },
  methods: {
    // 搜索物料
    searchMaterials() {
      // 模拟搜索
      this.$message.success('查询成功');
    },
    
    // 检验物料
    inspectMaterial(material) {
      this.selectedMaterial = material;
      this.inspectionForm = {
        receiptNo: material.receiptNo,
        materialInfo: `${material.materialCode} - ${material.materialName}`,
        totalQuantity: material.quantity,
        inspectionQuantity: Math.min(100, material.quantity),
        qualifiedQuantity: 0,
        unqualifiedQuantity: 0,
        inspectionResult: '',
        unqualifiedReason: '',
        inspectionItems: [],
        remark: ''
      };
    },
    
    // 查看详情
    viewDetail(material) {
      this.$message.info('查看详情功能开发中');
    },
    
    // 确认检验并入库
    confirmInspection() {
      if (!this.inspectionForm.inspectionResult) {
        this.$message.warning('请选择检验结果');
        return;
      }
      this.$message.success('检验完成，物料已入库');
      this.resetInspection();
    },
    
    // 标记不合格并退货
    markUnqualified() {
      if (!this.inspectionForm.unqualifiedReason) {
        this.$message.warning('请选择不合格原因');
        return;
      }
      this.$message.success('已标记为不合格并触发退货流程');
      this.resetInspection();
    },
    
    // 导出检验报告
    exportReport() {
      this.$message.success('检验报告已导出');
    },
    
    // 重置检验表单
    resetInspection() {
      this.selectedMaterial = null;
      this.inspectionForm = {
        receiptNo: '',
        materialInfo: '',
        totalQuantity: '',
        inspectionQuantity: 1,
        qualifiedQuantity: 0,
        unqualifiedQuantity: 0,
        inspectionResult: '',
        unqualifiedReason: '',
        inspectionItems: [],
        remark: ''
      };
    }
  }
}
</script>

<style scoped>
.incoming-inspection {
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

.materials-section {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.inspection-section {
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

.item-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin: 20px 0 10px 0;
}

.item-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
}

.quantity-hint {
  margin-left: 10px;
  font-size: 16px;
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 30px;
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

.el-checkbox {
  margin-right: 20px;
  margin-bottom: 10px;
}

.el-checkbox__label {
  font-size: 16px;
}
</style>