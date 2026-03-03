<template>
  <div class="commission-management">
    <h2>佣金结算</h2>
    
    <!-- 搜索和筛选 -->
    <div class="search-filter">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="推广员ID">
          <el-input v-model="searchForm.promoterId" placeholder="请输入推广员ID"></el-input>
        </el-form-item>
        <el-form-item label="结算状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态">
            <el-option label="全部" value=""></el-option>
            <el-option label="待结算" value="pending"></el-option>
            <el-option label="已结算" value="completed"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 佣金结算列表 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <span>佣金结算列表</span>
          <el-button type="primary" @click="generateSettlement">生成结算单</el-button>
        </div>
      </template>
      <el-table :data="commissionList" style="width: 100%">
        <el-table-column prop="id" label="结算单ID" width="150"></el-table-column>
        <el-table-column prop="promoterId" label="推广员ID" width="120"></el-table-column>
        <el-table-column prop="promoterName" label="推广员姓名" width="120"></el-table-column>
        <el-table-column prop="settlementPeriod" label="结算周期" width="200"></el-table-column>
        <el-table-column prop="amount" label="结算金额"></el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'pending' ? 'warning' : 'success'">
              {{ scope.row.status === 'pending' ? '待结算' : '已结算' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
        <el-table-column prop="settlementTime" label="结算时间" width="180"></el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="viewSettlement(scope.row)">查看</el-button>
            <el-button size="small" type="primary" v-if="scope.row.status === 'pending'" @click="processSettlement(scope.row)">处理</el-button>
            <el-button size="small" @click="exportSettlement(scope.row)">导出</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination
          layout="prev, pager, next"
          :total="100"
          :page-size="10"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </el-card>
    
    <!-- 处理结算对话框 -->
    <el-dialog
      title="处理结算"
      v-model="processDialogVisible"
      width="500px"
    >
      <el-form :model="processForm" :rules="processRules" ref="processFormRef">
        <el-form-item label="结算金额" prop="amount">
          <el-input v-model="processForm.amount" disabled></el-input>
        </el-form-item>
        <el-form-item label="结算方式" prop="paymentMethod">
          <el-select v-model="processForm.paymentMethod">
            <el-option label="微信" value="wechat"></el-option>
            <el-option label="支付宝" value="alipay"></el-option>
            <el-option label="银行转账" value="bank"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="processForm.remark" type="textarea"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="processDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitProcess">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const searchForm = reactive({
  promoterId: '',
  status: ''
})

const commissionList = ref([
  {
    id: 'S001',
    promoterId: 'P001',
    promoterName: '张三',
    settlementPeriod: '2024-01-01 至 2024-01-15',
    amount: '¥3,456',
    status: 'pending',
    createTime: '2024-01-16 10:00:00',
    settlementTime: ''
  },
  {
    id: 'S002',
    promoterId: 'P002',
    promoterName: '李四',
    settlementPeriod: '2024-01-01 至 2024-01-15',
    amount: '¥2,345',
    status: 'pending',
    createTime: '2024-01-16 10:00:00',
    settlementTime: ''
  },
  {
    id: 'S003',
    promoterId: 'P003',
    promoterName: '王五',
    settlementPeriod: '2023-12-16 至 2023-12-31',
    amount: '¥1,234',
    status: 'completed',
    createTime: '2024-01-01 10:00:00',
    settlementTime: '2024-01-02 15:00:00'
  }
])

const processDialogVisible = ref(false)
const processFormRef = ref(null)
const processForm = reactive({
  amount: '',
  paymentMethod: 'wechat',
  remark: ''
})

const processRules = {
  paymentMethod: [{ required: true, message: '请选择结算方式', trigger: 'change' }]
}

const handleSearch = () => {
  console.log('搜索条件:', searchForm)
  // 这里可以实现搜索功能
}

const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
}

const handleCurrentChange = (currentPage) => {
  console.log('当前页码:', currentPage)
  // 这里可以实现分页功能
}

const generateSettlement = () => {
  console.log('生成结算单')
  // 这里可以实现生成结算单功能
  ElMessage.success('结算单生成成功')
}

const viewSettlement = (row) => {
  console.log('查看结算单:', row)
  // 这里可以实现查看结算单详情
}

const processSettlement = (row) => {
  processForm.amount = row.amount
  processDialogVisible.value = true
}

const exportSettlement = (row) => {
  console.log('导出结算单:', row)
  // 这里可以实现导出结算单功能
  ElMessage.success('结算单导出成功')
}

const submitProcess = async () => {
  if (!processFormRef.value) return
  await processFormRef.value.validate(async (valid) => {
    if (valid) {
      console.log('处理结算:', processForm)
      // 这里可以实现处理结算功能
      processDialogVisible.value = false
      ElMessage.success('结算处理成功')
    }
  })
}
</script>

<style scoped>
.commission-management {
  padding: 20px;
}

.commission-management h2 {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.search-filter {
  margin-bottom: 20px;
}

.search-form {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
  color: #333;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>