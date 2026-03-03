<template>
  <div class="onboarding-management">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <span>入职闭环管理</span>
        </div>
      </template>
      
      <el-form :inline="true" class="search-form">
        <el-form-item label="邀约ID">
          <el-input v-model="searchForm.id" placeholder="请输入邀约ID" />
        </el-form-item>
        <el-form-item label="工厂名称">
          <el-input v-model="searchForm.factoryName" placeholder="请输入工厂名称" />
        </el-form-item>
        <el-form-item label="工人姓名">
          <el-input v-model="searchForm.workerName" placeholder="请输入工人姓名" />
        </el-form-item>
        <el-form-item label="邀约时间">
          <el-date-picker
            v-model="searchForm.inviteTime"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item label="确认状态">
          <el-select v-model="searchForm.confirmStatus" placeholder="请选择确认状态">
            <el-option label="待确认" value="pending" />
            <el-option label="已确认" value="confirmed" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item label="到岗状态">
          <el-select v-model="searchForm.arrivalStatus" placeholder="请选择到岗状态">
            <el-option label="待到岗" value="pending" />
            <el-option label="已到岗" value="arrived" />
            <el-option label="未到岗" value="no_show" />
          </el-select>
        </el-form-item>
        <el-form-item label="有效闭环">
          <el-select v-model="searchForm.isValid" placeholder="请选择是否有效">
            <el-option label="有效" value="true" />
            <el-option label="无效" value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetForm">重置</el-button>
          <el-button type="success" @click="exportData">导出</el-button>
        </el-form-item>
      </el-form>
      
      <el-table :data="onboardingList" style="width: 100%">
        <el-table-column prop="id" label="邀约ID" width="120" />
        <el-table-column prop="factoryName" label="工厂名称" width="150" />
        <el-table-column prop="workerName" label="工人姓名" width="120" />
        <el-table-column prop="workerPhone" label="联系电话" width="150" />
        <el-table-column prop="inviteTime" label="邀约时间" width="180" />
        <el-table-column prop="confirmStatus" label="确认状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.confirmStatus)">
              {{ getStatusText(scope.row.confirmStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="arrivalStatus" label="到岗状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.arrivalStatus)">
              {{ getStatusText(scope.row.arrivalStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="isValid" label="有效闭环" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.isValid ? 'success' : 'danger'">
              {{ scope.row.isValid ? '有效' : '无效' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="salaryStatus" label="薪资发放" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.salaryStatus ? 'success' : 'warning'">
              {{ scope.row.salaryStatus ? '已发放' : '未发放' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewDetail(scope.row)">查看详情</el-button>
            <el-button size="small" type="primary" @click="verify(scope.row)">核验</el-button>
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
      title="入职闭环详情"
      width="800px"
    >
      <el-form :model="currentOnboarding" label-width="120px">
        <el-form-item label="邀约ID">
          <span>{{ currentOnboarding.id }}</span>
        </el-form-item>
        <el-form-item label="工厂信息">
          <div>{{ currentOnboarding.factoryName }}</div>
          <div class="text-gray">{{ currentOnboarding.factoryContact }} {{ currentOnboarding.factoryPhone }}</div>
        </el-form-item>
        <el-form-item label="工人信息">
          <div>{{ currentOnboarding.workerName }} ({{ currentOnboarding.workerPhone }})</div>
        </el-form-item>
        <el-form-item label="邀约时间">
          <span>{{ currentOnboarding.inviteTime }}</span>
        </el-form-item>
        <el-form-item label="确认状态">
          <el-tag :type="getStatusType(currentOnboarding.confirmStatus)">
            {{ getStatusText(currentOnboarding.confirmStatus) }}
          </el-tag>
        </el-form-item>
        <el-form-item label="确认时间">
          <span>{{ currentOnboarding.confirmTime || '未确认' }}</span>
        </el-form-item>
        <el-form-item label="到岗状态">
          <el-tag :type="getStatusType(currentOnboarding.arrivalStatus)">
            {{ getStatusText(currentOnboarding.arrivalStatus) }}
          </el-tag>
        </el-form-item>
        <el-form-item label="到岗时间">
          <span>{{ currentOnboarding.arrivalTime || '未到岗' }}</span>
        </el-form-item>
        <el-form-item label="薪资发放">
          <el-tag :type="currentOnboarding.salaryStatus ? 'success' : 'warning'">
            {{ currentOnboarding.salaryStatus ? '已发放' : '未发放' }}
          </el-tag>
        </el-form-item>
        <el-form-item label="发放时间">
          <span>{{ currentOnboarding.salaryTime || '未发放' }}</span>
        </el-form-item>
        <el-form-item label="有效闭环">
          <el-tag :type="currentOnboarding.isValid ? 'success' : 'danger'">
            {{ currentOnboarding.isValid ? '有效' : '无效' }}
          </el-tag>
        </el-form-item>
        <el-form-item label="凭证信息">
          <div v-if="currentOnboarding.credentials && currentOnboarding.credentials.length > 0">
            <el-image
              v-for="(credential, index) in currentOnboarding.credentials"
              :key="index"
              :src="credential"
              fit="cover"
              style="width: 100px; height: 100px; margin-right: 10px;"
            />
          </div>
          <div v-else class="text-gray">无凭证</div>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="currentOnboarding.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="saveRemark">保存备注</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 核验弹窗 -->
    <el-dialog
      v-model="verifyDialogVisible"
      title="闭环核验"
      width="600px"
    >
      <el-form :model="verifyForm" label-width="100px">
        <el-form-item label="到岗状态">
          <el-select v-model="verifyForm.arrivalStatus" placeholder="请选择到岗状态">
            <el-option label="待到岗" value="pending" />
            <el-option label="已到岗" value="arrived" />
            <el-option label="未到岗" value="no_show" />
          </el-select>
        </el-form-item>
        <el-form-item label="到岗时间">
          <el-date-picker
            v-model="verifyForm.arrivalTime"
            type="datetime"
            placeholder="请选择到岗时间"
          />
        </el-form-item>
        <el-form-item label="薪资发放">
          <el-select v-model="verifyForm.salaryStatus" placeholder="请选择薪资发放状态">
            <el-option label="未发放" value="false" />
            <el-option label="已发放" value="true" />
          </el-select>
        </el-form-item>
        <el-form-item label="发放时间">
          <el-date-picker
            v-model="verifyForm.salaryTime"
            type="datetime"
            placeholder="请选择发放时间"
          />
        </el-form-item>
        <el-form-item label="有效闭环">
          <el-select v-model="verifyForm.isValid" placeholder="请选择是否有效">
            <el-option label="无效" value="false" />
            <el-option label="有效" value="true" />
          </el-select>
        </el-form-item>
        <el-form-item label="凭证上传">
          <el-upload
            class="upload-demo"
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            multiple
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">
                请上传薪资发放凭证（最多3张）
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="verifyDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmVerify">确认核验</el-button>
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
  id: '',
  factoryName: '',
  workerName: '',
  inviteTime: null,
  confirmStatus: '',
  arrivalStatus: '',
  isValid: ''
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 入职闭环列表
const onboardingList = ref([])

// 弹窗
const dialogVisible = ref(false)
const verifyDialogVisible = ref(false)
const currentOnboarding = ref({})
const verifyForm = reactive({
  arrivalStatus: '',
  arrivalTime: null,
  salaryStatus: false,
  salaryTime: null,
  isValid: false
})

// 模拟数据
const mockOnboarding = [
  {
    id: 'OB001',
    factoryName: '杭州服装厂',
    factoryContact: '张经理',
    factoryPhone: '138****1234',
    workerName: '张三',
    workerPhone: '139****5678',
    inviteTime: '2026-03-01 10:00:00',
    confirmStatus: 'confirmed',
    confirmTime: '2026-03-01 10:30:00',
    arrivalStatus: 'arrived',
    arrivalTime: '2026-03-02 08:00:00',
    salaryStatus: true,
    salaryTime: '2026-03-10 15:00:00',
    isValid: true,
    credentials: [
      'https://via.placeholder.com/100',
      'https://via.placeholder.com/100'
    ],
    remark: '已完成有效闭环'
  },
  {
    id: 'OB002',
    factoryName: '上海制衣厂',
    factoryContact: '李经理',
    factoryPhone: '137****9012',
    workerName: '李四',
    workerPhone: '136****3456',
    inviteTime: '2026-03-01 14:00:00',
    confirmStatus: 'confirmed',
    confirmTime: '2026-03-01 14:30:00',
    arrivalStatus: 'arrived',
    arrivalTime: '2026-03-02 08:00:00',
    salaryStatus: false,
    isValid: false,
    credentials: [],
    remark: '待薪资发放'
  },
  {
    id: 'OB003',
    factoryName: '广州服装厂',
    factoryContact: '王经理',
    factoryPhone: '135****7890',
    workerName: '王五',
    workerPhone: '134****2345',
    inviteTime: '2026-03-02 09:00:00',
    confirmStatus: 'pending',
    arrivalStatus: 'pending',
    salaryStatus: false,
    isValid: false,
    credentials: [],
    remark: '待确认'
  },
  {
    id: 'OB004',
    factoryName: '深圳制衣厂',
    factoryContact: '赵经理',
    factoryPhone: '133****6789',
    workerName: '赵六',
    workerPhone: '132****1234',
    inviteTime: '2026-03-02 11:00:00',
    confirmStatus: 'rejected',
    confirmTime: '2026-03-02 11:30:00',
    arrivalStatus: 'no_show',
    salaryStatus: false,
    isValid: false,
    credentials: [],
    remark: '工人拒绝入职'
  },
  {
    id: 'OB005',
    factoryName: '杭州服装厂',
    factoryContact: '张经理',
    factoryPhone: '138****1234',
    workerName: '孙七',
    workerPhone: '131****5678',
    inviteTime: '2026-03-02 15:00:00',
    confirmStatus: 'confirmed',
    confirmTime: '2026-03-02 15:30:00',
    arrivalStatus: 'arrived',
    arrivalTime: '2026-03-03 08:00:00',
    salaryStatus: false,
    isValid: false,
    credentials: [],
    remark: '已到岗，待薪资发放'
  }
]

// 状态类型
const getStatusType = (status) => {
  const typeMap = {
    pending: 'info',
    confirmed: 'success',
    rejected: 'danger',
    arrived: 'success',
    no_show: 'danger'
  }
  return typeMap[status] || 'info'
}

// 状态文本
const getStatusText = (status) => {
  const textMap = {
    pending: '待处理',
    confirmed: '已确认',
    rejected: '已拒绝',
    arrived: '已到岗',
    no_show: '未到岗'
  }
  return textMap[status] || '未知'
}

// 查询
const handleSearch = () => {
  // 模拟搜索
  const filtered = mockOnboarding.filter(item => {
    if (searchForm.id && !item.id.includes(searchForm.id)) return false
    if (searchForm.factoryName && !item.factoryName.includes(searchForm.factoryName)) return false
    if (searchForm.workerName && !item.workerName.includes(searchForm.workerName)) return false
    if (searchForm.confirmStatus && item.confirmStatus !== searchForm.confirmStatus) return false
    if (searchForm.arrivalStatus && item.arrivalStatus !== searchForm.arrivalStatus) return false
    if (searchForm.isValid && item.isValid.toString() !== searchForm.isValid) return false
    return true
  })
  onboardingList.value = filtered
  pagination.total = filtered.length
}

// 重置
const resetForm = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  searchForm.inviteTime = null
  handleSearch()
}

// 导出
const exportData = () => {
  ElMessage.success('数据导出成功')
}

// 查看详情
const viewDetail = (row) => {
  currentOnboarding.value = { ...row }
  dialogVisible.value = true
}

// 保存备注
const saveRemark = () => {
  ElMessage.success('备注保存成功')
  dialogVisible.value = false
}

// 核验
const verify = (row) => {
  currentOnboarding.value = { ...row }
  verifyForm.arrivalStatus = row.arrivalStatus
  verifyForm.arrivalTime = row.arrivalTime
  verifyForm.salaryStatus = row.salaryStatus
  verifyForm.salaryTime = row.salaryTime
  verifyForm.isValid = row.isValid
  verifyDialogVisible.value = true
}

// 文件上传
const handleFileChange = (file, fileList) => {
  // 模拟文件上传
  ElMessage.success('文件上传成功')
}

// 确认核验
const confirmVerify = () => {
  ElMessage.success('核验成功')
  verifyDialogVisible.value = false
  handleSearch()
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
.onboarding-management {
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

.upload-demo {
  margin-top: 10px;
}
</style>