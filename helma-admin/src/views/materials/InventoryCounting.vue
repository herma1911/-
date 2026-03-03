<template>
  <div class="inventory-counting">
    <!-- 顶部标题 -->
    <div class="page-header">
      <h1 class="page-title">库存盘点</h1>
      <p class="page-subtitle">准确记录库存实际数量，确保库存数据准确性</p>
    </div>
    
    <!-- 盘点任务创建区 -->
    <div class="task-creation-section">
      <h3 class="section-title">创建盘点任务</h3>
      <div class="creation-form">
        <el-form :model="countingTask" label-width="120px" size="large">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="盘点范围">
                <el-select v-model="countingTask.scope" placeholder="请选择盘点范围" size="large" style="width: 100%">
                  <el-option label="全库" value="all" />
                  <el-option label="指定库位" value="location" />
                  <el-option label="指定物料" value="material" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="盘点仓库">
                <el-select v-model="countingTask.warehouse" placeholder="请选择仓库" size="large" style="width: 100%">
                  <el-option label="原料仓" value="raw" />
                  <el-option label="辅料仓" value="accessory" />
                  <el-option label="半成品仓" value="semi" />
                  <el-option label="成品仓" value="finished" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="盘点日期">
                <el-date-picker v-model="countingTask.date" type="date" placeholder="选择日期" size="large" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="16">
              <el-form-item label="备注">
                <el-input v-model="countingTask.remark" type="textarea" placeholder="请输入备注信息" rows="2" size="large" />
              </el-form-item>
            </el-col>
            <el-col :span="8" style="display: flex; align-items: flex-end;">
              <el-button type="primary" size="large" class="create-task-btn" @click="createCountingTask">
                生成盘点表
              </el-button>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </div>
    
    <!-- 盘点列表 -->
    <div class="counting-section">
      <div class="section-header">
        <h3 class="section-title">盘点清单</h3>
        <div class="search-box">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索物料名称/编码"
            size="large"
            prefix-icon="el-icon-search"
            @keyup.enter="searchMaterials"
          />
        </div>
      </div>
      
      <el-table :data="countingList" style="width: 100%" size="large">
        <el-table-column prop="materialCode" label="物料编码" width="150" />
        <el-table-column prop="materialName" label="物料名称" width="200" />
        <el-table-column prop="specification" label="规格" width="150" />
        <el-table-column prop="unit" label="单位" width="80" />
        <el-table-column prop="systemQuantity" label="系统库存" width="120">
          <template #default="scope">
            <span>{{ scope.row.systemQuantity }}</span>
          </template>
        </el-table-column>
        <el-table-column label="实际盘点数" width="150">
          <template #default="scope">
            <el-input-number 
              v-model="scope.row.actualQuantity" 
              :min="0" 
              size="large" 
              @change="calculateDiff(scope.row)"
              style="width: 100%"
            />
          </template>
        </el-table-column>
        <el-table-column prop="diffQuantity" label="差异数" width="120">
          <template #default="scope">
            <span :class="{ 'diff-negative': scope.row.diffQuantity < 0, 'diff-positive': scope.row.diffQuantity > 0 }">
              {{ scope.row.diffQuantity }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="差异原因" width="200">
          <template #default="scope">
            <el-select v-model="scope.row.diffReason" placeholder="请选择" size="large" style="width: 100%">
              <el-option label="漏盘" value="miss" />
              <el-option label="错盘" value="error" />
              <el-option label="损耗" value="loss" />
              <el-option label="其他" value="other" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="warehouseLocation" label="库位" width="120" />
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
    
    <!-- 底部操作按钮 -->
    <div class="action-buttons">
      <el-button type="primary" size="large" class="main-btn" @click="confirmCounting">
        确认盘点并调整库存
      </el-button>
      <el-button type="success" size="large" class="secondary-btn" @click="exportDiffReport">
        导出差异表
      </el-button>
      <el-button type="info" size="large" class="secondary-btn" @click="printCountingSheet">
        打印盘点表
      </el-button>
      <el-button type="warning" size="large" class="secondary-btn" @click="resetCounting">
        重置
      </el-button>
    </div>
    
    <!-- 审批弹窗 -->
    <el-dialog
      title="库存调整审批"
      v-model="approvalDialogVisible"
      width="500px"
      center
    >
      <div class="approval-content">
        <p class="approval-message">
          本次盘点共发现 <span class="diff-count">{{ totalDiffCount }}</span> 项差异，
          总差异数量为 <span class="diff-total">{{ totalDiffQuantity }}</span>。
        </p>
        <p class="approval-note">
          确认调整库存需要厂长审批，是否继续？
        </p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="approvalDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitApproval">
            提交审批
          </el-button>
        </span>
      </template>
    </el-dialog>
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
      // 盘点任务
      countingTask: {
        scope: 'all',
        warehouse: '',
        date: new Date(),
        remark: ''
      },
      // 审批弹窗
      approvalDialogVisible: false,
      // 模拟数据
      countingList: [
        {
          materialCode: 'MAT001',
          materialName: '纯棉面料',
          specification: '21支',
          unit: '米',
          systemQuantity: 800,
          actualQuantity: 800,
          diffQuantity: 0,
          diffReason: '',
          warehouseLocation: '原料仓A区'
        },
        {
          materialCode: 'MAT002',
          materialName: '涤纶面料',
          specification: '32支',
          unit: '米',
          systemQuantity: 1200,
          actualQuantity: 1180,
          diffQuantity: -20,
          diffReason: '损耗',
          warehouseLocation: '原料仓A区'
        },
        {
          materialCode: 'MAT003',
          materialName: '拉链',
          specification: '5号',
          unit: '条',
          systemQuantity: 300,
          actualQuantity: 290,
          diffQuantity: -10,
          diffReason: '漏盘',
          warehouseLocation: '辅料仓'
        },
        {
          materialCode: 'MAT004',
          materialName: '纽扣',
          specification: '15mm',
          unit: '个',
          systemQuantity: 10000,
          actualQuantity: 10050,
          diffQuantity: 50,
          diffReason: '错盘',
          warehouseLocation: '辅料仓'
        },
        {
          materialCode: 'MAT005',
          materialName: '标签',
          specification: '8x4cm',
          unit: '个',
          systemQuantity: 5000,
          actualQuantity: 5000,
          diffQuantity: 0,
          diffReason: '',
          warehouseLocation: '辅料仓'
        }
      ]
    }
  },
  computed: {
    // 总差异项数
    totalDiffCount() {
      return this.countingList.filter(item => item.diffQuantity !== 0).length;
    },
    // 总差异数量
    totalDiffQuantity() {
      return this.countingList.reduce((sum, item) => sum + item.diffQuantity, 0);
    }
  },
  methods: {
    // 创建盘点任务
    createCountingTask() {
      this.$message.success('盘点表已生成');
    },
    
    // 搜索物料
    searchMaterials() {
      // 模拟搜索
      this.$message.success('搜索成功');
    },
    
    // 计算差异
    calculateDiff(row) {
      row.diffQuantity = row.actualQuantity - row.systemQuantity;
    },
    
    // 确认盘点
    confirmCounting() {
      if (this.totalDiffCount > 0) {
        this.approvalDialogVisible = true;
      } else {
        this.$message.success('盘点完成，库存数据一致');
      }
    },
    
    // 提交审批
    submitApproval() {
      this.$message.success('审批已提交，等待厂长批准');
      this.approvalDialogVisible = false;
    },
    
    // 导出差异表
    exportDiffReport() {
      this.$message.success('差异表已导出');
    },
    
    // 打印盘点表
    printCountingSheet() {
      this.$message.success('盘点表已打印');
    },
    
    // 重置
    resetCounting() {
      this.countingList.forEach(item => {
        item.actualQuantity = item.systemQuantity;
        item.diffQuantity = 0;
        item.diffReason = '';
      });
      this.$message.success('已重置盘点数据');
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
.inventory-counting {
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

.task-creation-section {
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

.creation-form {
  margin-top: 20px;
}

.create-task-btn {
  width: 100%;
  font-size: 16px;
  padding: 12px;
}

.counting-section {
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

.search-box {
  width: 300px;
}

.diff-negative {
  color: #f56c6c;
  font-weight: bold;
}

.diff-positive {
  color: #52c41a;
  font-weight: bold;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 20px;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.main-btn {
  font-size: 18px;
  padding: 15px 30px;
  min-width: 200px;
}

.secondary-btn {
  font-size: 16px;
  padding: 12px 24px;
  min-width: 150px;
}

.approval-content {
  padding: 20px;
}

.approval-message {
  font-size: 16px;
  margin-bottom: 20px;
  line-height: 1.5;
}

.diff-count {
  color: #f56c6c;
  font-weight: bold;
  font-size: 18px;
}

.diff-total {
  color: #f56c6c;
  font-weight: bold;
  font-size: 18px;
}

.approval-note {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
}

.el-button {
  font-size: 16px;
  padding: 12px 24px;
}

.el-input__inner {
  font-size: 16px;
  height: 48px;
}

.el-select {
  font-size: 16px;
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