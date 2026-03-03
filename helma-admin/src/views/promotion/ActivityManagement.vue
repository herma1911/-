<template>
  <div class="activity-management">
    <h2>活动管理</h2>
    
    <!-- 搜索和筛选 -->
    <div class="search-filter">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="活动名称">
          <el-input v-model="searchForm.name" placeholder="请输入活动名称"></el-input>
        </el-form-item>
        <el-form-item label="活动状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态">
            <el-option label="全部" value=""></el-option>
            <el-option label="未开始" value="pending"></el-option>
            <el-option label="进行中" value="active"></el-option>
            <el-option label="已结束" value="ended"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 活动列表 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <span>活动列表</span>
          <el-button type="primary" @click="addActivity">添加活动</el-button>
        </div>
      </template>
      <el-table :data="activityList" style="width: 100%">
        <el-table-column prop="id" label="活动ID" width="120"></el-table-column>
        <el-table-column prop="name" label="活动名称"></el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="180"></el-table-column>
        <el-table-column prop="endTime" label="结束时间" width="180"></el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag :type="getTagType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="participants" label="参与人数"></el-table-column>
        <el-table-column prop="conversions" label="转化数"></el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="viewActivity(scope.row)">查看</el-button>
            <el-button size="small" type="primary" @click="editActivity(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteActivity(scope.row)">删除</el-button>
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
    
    <!-- 添加/编辑活动对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="600px"
    >
      <el-form :model="form" :rules="rules" ref="formRef">
        <el-form-item label="活动名称" prop="name">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="活动时间" prop="timeRange">
          <el-date-picker
            v-model="form.timeRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 100%"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="活动规则" prop="rules">
          <el-input v-model="form.rules" type="textarea" rows="4"></el-input>
        </el-form-item>
        <el-form-item label="奖励内容" prop="rewards">
          <el-input v-model="form.rewards" type="textarea" rows="4"></el-input>
        </el-form-item>
        <el-form-item label="活动状态" prop="status">
          <el-select v-model="form.status">
            <el-option label="未开始" value="pending"></el-option>
            <el-option label="进行中" value="active"></el-option>
            <el-option label="已结束" value="ended"></el-option>
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
import { ElMessage, ElMessageBox } from 'element-plus'

const searchForm = reactive({
  name: '',
  status: ''
})

const activityList = ref([
  {
    id: 'A001',
    name: '春节拉新活动',
    startTime: '2024-01-20 00:00:00',
    endTime: '2024-02-10 23:59:59',
    status: 'active',
    participants: 1234,
    conversions: 456
  },
  {
    id: 'A002',
    name: '新年工厂招聘季',
    startTime: '2024-01-01 00:00:00',
    endTime: '2024-01-15 23:59:59',
    status: 'ended',
    participants: 890,
    conversions: 234
  },
  {
    id: 'A003',
    name: '春季招工专场',
    startTime: '2024-02-15 00:00:00',
    endTime: '2024-03-15 23:59:59',
    status: 'pending',
    participants: 0,
    conversions: 0
  }
])

const dialogVisible = ref(false)
const dialogTitle = ref('添加活动')
const formRef = ref(null)
const form = reactive({
  name: '',
  timeRange: [],
  rules: '',
  rewards: '',
  status: 'pending'
})

const rules = {
  name: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
  timeRange: [{ required: true, message: '请选择活动时间', trigger: 'change' }],
  rules: [{ required: true, message: '请输入活动规则', trigger: 'blur' }],
  rewards: [{ required: true, message: '请输入奖励内容', trigger: 'blur' }],
  status: [{ required: true, message: '请选择活动状态', trigger: 'change' }]
}

const getTagType = (status) => {
  switch (status) {
    case 'pending': return 'info'
    case 'active': return 'success'
    case 'ended': return 'warning'
    default: return ''
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'pending': return '未开始'
    case 'active': return '进行中'
    case 'ended': return '已结束'
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

const addActivity = () => {
  dialogTitle.value = '添加活动'
  Object.keys(form).forEach(key => {
    form[key] = key === 'status' ? 'pending' : key === 'timeRange' ? [] : ''
  })
  dialogVisible.value = true
}

const editActivity = (row) => {
  dialogTitle.value = '编辑活动'
  form.name = row.name
  form.timeRange = [new Date(row.startTime), new Date(row.endTime)]
  form.rules = row.rules || ''
  form.rewards = row.rewards || ''
  form.status = row.status
  dialogVisible.value = true
}

const viewActivity = (row) => {
  console.log('查看活动:', row)
  // 这里可以实现查看活动详情
}

const deleteActivity = (row) => {
  ElMessageBox.confirm('确定要删除这个活动吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    console.log('删除活动:', row)
    // 这里可以实现删除功能
    ElMessage.success('活动删除成功')
  }).catch(() => {
    // 取消删除
  })
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
.activity-management {
  padding: 20px;
}

.activity-management h2 {
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