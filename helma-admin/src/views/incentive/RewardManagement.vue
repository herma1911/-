<template>
  <div class="reward-management">
    <h2>奖励管理</h2>
    
    <!-- 搜索和筛选 -->
    <div class="search-filter">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="奖励名称">
          <el-input v-model="searchForm.name" placeholder="请输入奖励名称"></el-input>
        </el-form-item>
        <el-form-item label="奖励类型">
          <el-select v-model="searchForm.type" placeholder="请选择奖励类型">
            <el-option label="全部" value=""></el-option>
            <el-option label="现金红包" value="cash"></el-option>
            <el-option label="置顶卡" value="topCard"></el-option>
            <el-option label="免费套餐" value="freePackage"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 奖励列表 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <span>奖励列表</span>
          <el-button type="primary" @click="addReward">添加奖励</el-button>
        </div>
      </template>
      <el-table :data="rewardList" style="width: 100%">
        <el-table-column prop="id" label="奖励ID" width="120"></el-table-column>
        <el-table-column prop="name" label="奖励名称"></el-table-column>
        <el-table-column prop="type" label="奖励类型" width="120">
          <template #default="scope">
            <el-tag>{{ getTypeText(scope.row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="奖励金额/数量"></el-table-column>
        <el-table-column prop="condition" label="获取条件"></el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'warning'">
              {{ scope.row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="viewReward(scope.row)">查看</el-button>
            <el-button size="small" type="primary" @click="editReward(scope.row)">编辑</el-button>
            <el-button size="small" :type="scope.row.status === 'active' ? 'danger' : 'success'" @click="toggleStatus(scope.row)">
              {{ scope.row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
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
    
    <!-- 奖励发放记录 -->
    <el-card style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>奖励发放记录</span>
          <el-button type="primary" size="small" @click="exportRecords">导出记录</el-button>
        </div>
      </template>
      <el-table :data="rewardRecords" style="width: 100%">
        <el-table-column prop="id" label="记录ID" width="120"></el-table-column>
        <el-table-column prop="rewardName" label="奖励名称" width="150"></el-table-column>
        <el-table-column prop="userId" label="用户ID" width="120"></el-table-column>
        <el-table-column prop="userName" label="用户姓名" width="120"></el-table-column>
        <el-table-column prop="amount" label="发放金额/数量"></el-table-column>
        <el-table-column prop="发放时间" label="发放时间" width="180"></el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'success' ? 'success' : 'warning'">
              {{ scope.row.status === 'success' ? '已发放' : '待发放' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 添加/编辑奖励对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="600px"
    >
      <el-form :model="form" :rules="rules" ref="formRef">
        <el-form-item label="奖励名称" prop="name">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="奖励类型" prop="type">
          <el-select v-model="form.type">
            <el-option label="现金红包" value="cash"></el-option>
            <el-option label="置顶卡" value="topCard"></el-option>
            <el-option label="免费套餐" value="freePackage"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="奖励金额/数量" prop="amount">
          <el-input v-model="form.amount"></el-input>
        </el-form-item>
        <el-form-item label="获取条件" prop="condition">
          <el-input v-model="form.condition" type="textarea" rows="3"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status">
            <el-option label="启用" value="active"></el-option>
            <el-option label="禁用" value="inactive"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const searchForm = reactive({
  name: '',
  type: ''
})

const rewardList = ref([
  {
    id: 'R001',
    name: '新人注册红包',
    type: 'cash',
    amount: '¥10',
    condition: '新用户注册并完成实名认证',
    status: 'active'
  },
  {
    id: 'R002',
    name: '首单置顶卡',
    type: 'topCard',
    amount: '1张',
    condition: '首次发布岗位',
    status: 'active'
  },
  {
    id: 'R003',
    name: '拉新奖励套餐',
    type: 'freePackage',
    amount: '1个月',
    condition: '成功邀请3家工厂注册',
    status: 'active'
  }
])

const rewardRecords = ref([
  {
    id: 'RR001',
    rewardName: '新人注册红包',
    userId: 'U001',
    userName: '张三',
    amount: '¥10',
    发放时间: '2024-01-15 10:00:00',
    status: 'success'
  },
  {
    id: 'RR002',
    rewardName: '首单置顶卡',
    userId: 'F001',
    userName: '某某工厂',
    amount: '1张',
    发放时间: '2024-01-14 15:30:00',
    status: 'success'
  },
  {
    id: 'RR003',
    rewardName: '拉新奖励套餐',
    userId: 'F002',
    userName: '某某服装厂',
    amount: '1个月',
    发放时间: '2024-01-13 09:15:00',
    status: 'success'
  }
])

const dialogVisible = ref(false)
const dialogTitle = ref('添加奖励')
const formRef = ref(null)
const form = reactive({
  name: '',
  type: 'cash',
  amount: '',
  condition: '',
  status: 'active'
})

const rules = {
  name: [{ required: true, message: '请输入奖励名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择奖励类型', trigger: 'change' }],
  amount: [{ required: true, message: '请输入奖励金额/数量', trigger: 'blur' }],
  condition: [{ required: true, message: '请输入获取条件', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const getTypeText = (type) => {
  switch (type) {
    case 'cash': return '现金红包'
    case 'topCard': return '置顶卡'
    case 'freePackage': return '免费套餐'
    default: return ''
  }
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

const addReward = () => {
  dialogTitle.value = '添加奖励'
  Object.keys(form).forEach(key => {
    form[key] = key === 'type' ? 'cash' : key === 'status' ? 'active' : ''
  })
  dialogVisible.value = true
}

const editReward = (row) => {
  dialogTitle.value = '编辑奖励'
  Object.assign(form, row)
  dialogVisible.value = true
}

const viewReward = (row) => {
  console.log('查看奖励:', row)
  // 这里可以实现查看奖励详情
}

const toggleStatus = (row) => {
  row.status = row.status === 'active' ? 'inactive' : 'active'
  ElMessage.success(`奖励已${row.status === 'active' ? '启用' : '禁用'}`)
}

const exportRecords = () => {
  console.log('导出奖励发放记录')
  // 这里可以实现导出功能
  ElMessage.success('记录导出成功')
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      console.log('表单数据:', form)
      // 这里可以实现保存功能
      dialogVisible.value = false
      ElMessage.success('操作成功')
    }
  })
}
</script>

<style scoped>
.reward-management {
  padding: 20px;
}

.reward-management h2 {
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