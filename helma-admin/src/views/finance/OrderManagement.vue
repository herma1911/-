<template>
  <div class="order-management">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <span>订单管理</span>
        </div>
      </template>
      
      <el-form :inline="true" class="search-form">
        <el-form-item label="订单号">
          <el-input v-model="searchForm.orderNo" placeholder="请输入订单号" />
        </el-form-item>
        <el-form-item label="工厂名称">
          <el-input v-model="searchForm.factoryName" placeholder="请输入工厂名称" />
        </el-form-item>
        <el-form-item label="套餐名称">
          <el-input v-model="searchForm.packageName" placeholder="请输入套餐名称" />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="searchForm.status" placeholder="请选择订单状态">
            <el-option label="待支付" value="pending" />
            <el-option label="已支付" value="paid" />
            <el-option label="已退款" value="refunded" />
            <el-option label="已过期" value="expired" />
          </el-select>
        </el-form-item>
        <el-form-item label="支付时间">
          <el-date-picker
            v-model="searchForm.payTime"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetForm">重置</el-button>
          <el-button type="success" @click="exportData">导出</el-button>
        </el-form-item>
      </el-form>
      
      <el-table :data="orderList" style="width: 100%">
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="factoryName" label="工厂名称" width="150" />
        <el-table-column prop="packageName" label="套餐名称" width="150" />
        <el-table-column prop="amount" label="实付金额" width="120">
          <template #default="scope">
            ¥{{ scope.row.amount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="订单状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="payTime" label="支付时间" width="180" />
        <el-table-column prop="expireTime" label="到期时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewDetail(scope.row)">查看详情</el-button>
            <el-button size="small" type="primary" @click="refundOrder(scope.row)" v-if="scope.row.status === 'paid'">退款</el-button>
            <el-button size="small" type="success" @click="exportInvoice(scope.row)">导出发票</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 详情弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      title="订单详情"
      width="800px"
    >
      <el-form :model="currentOrder" label-width="120px">
        <el-form-item label="订单号">
          <span>{{ currentOrder.orderNo }}</span>
        </el-form-item>
        <el-form-item label="工厂信息">
          <div>{{ currentOrder.factoryName }} ({{ currentOrder.factoryContact }})</div>
        </el-form-item>
        <el-form-item label="套餐信息">
          <div>{{ currentOrder.packageName }}</div>
          <div class="text-gray">{{ currentOrder.packageType }} | ¥{{ currentOrder.amount.toFixed(2) }}</div>
        </el-form-item>
        <el-form-item label="订单状态">
          <el-tag :type="getStatusType(currentOrder.status)">
            {{ getStatusText(currentOrder.status) }}
          </el-tag>
        </el-form-item>
        <el-form-item label="支付时间">
          <span v-if="currentOrder.payTime">{{ currentOrder.payTime }}</span>
          <span v-else class="text-gray">未支付</span>
        </el-form-item>
        <el-form-item label="到期时间">
          <span>{{ currentOrder.expireTime }}</span>
        </el-form-item>
        <el-form-item label="支付方式">
          <span>{{ currentOrder.payMethod || '未支付' }}</span>
        </el-form-item>
        <el-form-item label="交易流水号">
          <span v-if="currentOrder.transactionId">{{ currentOrder.transactionId }}</span>
          <span v-else class="text-gray">无</span>
        </el-form-item>
        <el-form-item label="备注">
          <div>{{ currentOrder.remark || '无' }}</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 退款弹窗 -->
    <el-dialog
      v-model="refundDialogVisible"
      title="退款操作"
      width="600px"
    >
      <el-form :model="refundForm" label-width="100px">
        <el-form-item label="退款金额">
          <span>¥{{ refundForm.amount.toFixed(2) }}</span>
        </el-form-item>
        <el-form-item label="退款原因">
          <el-input
            v-model="refundForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入退款原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="refundDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmRefund">确认退款</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 搜索表单
const searchForm = reactive({
  orderNo: '',
  factoryName: '',
  packageName: '',
  status: '',
  payTime: null
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 订单列表
const orderList = ref([])

// 弹窗
const dialogVisible = ref(false)
const refundDialogVisible = ref(false)
const currentOrder = ref({})
const refundForm = reactive({
  amount: 0,
  reason: ''
})

// 模拟数据
const mockOrders = [
  {
    orderNo: 'ORD202603010001',
    factoryName: '杭州服装厂',
    factoryContact: '张经理',
    packageName: '招聘招工基础包',
    packageType: '月付',
    amount: 99,
    status: 'paid',
    payTime: '2026-03-01 10:00:00',
    expireTime: '2026-04-01 10:00:00',
    payMethod: '微信支付',
    transactionId: 'TXN1234567890',
    remark: '首次购买'
  },
  {
    orderNo: 'ORD202603010002',
    factoryName: '上海制衣厂',
    factoryContact: '李经理',
    packageName: '招聘招工进阶包',
    packageType: '月付',
    amount: 199,
    status: 'paid',
    payTime: '2026-03-01 11:00:00',
    expireTime: '2026-04-01 11:00:00',
    payMethod: '支付宝',
    transactionId: 'TXN0987654321',
    remark: '升级套餐'
  },
  {
    orderNo: 'ORD202603010003',
    factoryName: '广州服装厂',
    factoryContact: '王经理',
    packageName: '薪资对账基础包',
    packageType: '月付',
    amount: 149,
    status: 'pending',
    payTime: null,
    expireTime: '2026-03-08 12:00:00',
    payMethod: null,
    transactionId: null,
    remark: '待支付'
  },
  {
    orderNo: 'ORD202603010004',
    factoryName: '深圳制衣厂',
    factoryContact: '赵经理',
    packageName: '企业综合包',
    packageType: '年付',
    amount: 4999,
    status: 'paid',
    payTime: '2026-03-01 13:00:00',
    expireTime: '2027-03-01 13:00:00',
    payMethod: '银行转账',
    transactionId: 'TXN5678123456',
    remark: '年度套餐'
  },
  {
    orderNo: 'ORD202603010005',
    factoryName: '宁波服装厂',
    factoryContact: '孙经理',
    packageName: '招聘招工基础包',
    packageType: '月付',
    amount: 99,
    status: 'refunded',
    payTime: '2026-03-01 14:00:00',
    expireTime: '2026-04-01 14:00:00',
    payMethod: '微信支付',
    transactionId: 'TXN9876543210',
    remark: '退款'
  }
]

// 状态类型
const getStatusType = (status) => {
  const typeMap = {
    pending: 'warning',
    paid: 'success',
    refunded: 'info',
    expired: 'danger'
  }
  return typeMap[status] || 'info'
}

// 状态文本
const getStatusText = (status) => {
  const textMap = {
    pending: '待支付',
    paid: '已支付',
    refunded: '已退款',
    expired: '已过期'
  }
  return textMap[status] || '未知'
}

// 查询
const handleSearch = () => {
  // 模拟搜索
  const filtered = mockOrders.filter(item => {
    if (searchForm.orderNo && !item.orderNo.includes(searchForm.orderNo)) return false
    if (searchForm.factoryName && !item.factoryName.includes(searchForm.factoryName)) return false
    if (searchForm.packageName && !item.packageName.includes(searchForm.packageName)) return false
    if (searchForm.status && item.status !== searchForm.status) return false
    return true
  })
  orderList.value = filtered
  pagination.total = filtered.length
}

// 重置
const resetForm = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  searchForm.payTime = null
  handleSearch()
}

// 导出
const exportData = () => {
  ElMessage.success('数据导出成功')
}

// 查看详情
const viewDetail = (row) => {
  currentOrder.value = { ...row }
  dialogVisible.value = true
}

// 退款
const refundOrder = (row) => {
  currentOrder.value = { ...row }
  refundForm.amount = row.amount
  refundForm.reason = ''
  refundDialogVisible.value = true
}

// 确认退款
const confirmRefund = () => {
  ElMessage.success('退款成功')
  refundDialogVisible.value = false
  handleSearch()
}

// 导出发票
const exportInvoice = (row) => {
  ElMessage.success('发票导出成功')
}

// 分页
const handleSizeChange = (size) => {
  pagination.pageSize = size
  handleSearch()
}

const handleCurrentChange = (current) => {
  pagination.currentPage = current
  handleSearch()
}

// 初始化
onMounted(() => {
  handleSearch()
})
</script>

<style scoped>
.order-management {
  padding: 20px;
}

.page-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.text-gray {
  color: #909399;
  font-size: 14px;
  margin-top: 5px;
}

.dialog-footer {
  text-align: right;
}
</style>