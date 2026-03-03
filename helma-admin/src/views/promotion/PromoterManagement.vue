<template>
  <div class="promoter-management">
    <h2>推广员管理</h2>
    
    <!-- 搜索和筛选 -->
    <div class="search-filter">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="推广员ID">
          <el-input v-model="searchForm.promoterId" placeholder="请输入推广员ID"></el-input>
        </el-form-item>
        <el-form-item label="推广员姓名">
          <el-input v-model="searchForm.name" placeholder="请输入推广员姓名"></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态">
            <el-option label="全部" value=""></el-option>
            <el-option label="正常" value="active"></el-option>
            <el-option label="封禁" value="banned"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 推广员列表 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <span>推广员列表</span>
          <el-button type="primary" @click="addPromoter">添加推广员</el-button>
        </div>
      </template>
      <el-table :data="promoterList" style="width: 100%">
        <el-table-column prop="id" label="推广员ID" width="120"></el-table-column>
        <el-table-column prop="name" label="姓名" width="120"></el-table-column>
        <el-table-column prop="phone" label="手机号" width="150"></el-table-column>
        <el-table-column prop="registerTime" label="注册时间" width="180"></el-table-column>
        <el-table-column prop="level" label="等级" width="100"></el-table-column>
        <el-table-column prop="totalPromotions" label="累计推广数"></el-table-column>
        <el-table-column prop="totalCommission" label="累计佣金"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
              {{ scope.row.status === 'active' ? '正常' : '封禁' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="viewPromoter(scope.row)">查看</el-button>
            <el-button size="small" type="primary" @click="editPromoter(scope.row)">编辑</el-button>
            <el-button size="small" :type="scope.row.status === 'active' ? 'danger' : 'success'" @click="toggleStatus(scope.row)">
              {{ scope.row.status === 'active' ? '封禁' : '解封' }}
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
    
    <!-- 添加/编辑推广员对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form :model="form" :rules="rules" ref="formRef">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone"></el-input>
        </el-form-item>
        <el-form-item label="等级" prop="level">
          <el-select v-model="form.level">
            <el-option label="初级" value="初级"></el-option>
            <el-option label="中级" value="中级"></el-option>
            <el-option label="高级" value="高级"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status">
            <el-option label="正常" value="active"></el-option>
            <el-option label="封禁" value="banned"></el-option>
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
  promoterId: '',
  name: '',
  status: ''
})

const promoterList = ref([
  {
    id: 'P001',
    name: '张三',
    phone: '138****1234',
    registerTime: '2024-01-01 10:00:00',
    level: '高级',
    totalPromotions: 123,
    totalCommission: '¥12,345',
    status: 'active'
  },
  {
    id: 'P002',
    name: '李四',
    phone: '139****5678',
    registerTime: '2024-01-02 11:00:00',
    level: '中级',
    totalPromotions: 89,
    totalCommission: '¥8,923',
    status: 'active'
  },
  {
    id: 'P003',
    name: '王五',
    phone: '137****9012',
    registerTime: '2024-01-03 12:00:00',
    level: '初级',
    totalPromotions: 45,
    totalCommission: '¥4,567',
    status: 'banned'
  }
])

const dialogVisible = ref(false)
const dialogTitle = ref('添加推广员')
const formRef = ref(null)
const form = reactive({
  name: '',
  phone: '',
  level: '初级',
  status: 'active'
})

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  level: [{ required: true, message: '请选择等级', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
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

const addPromoter = () => {
  dialogTitle.value = '添加推广员'
  Object.keys(form).forEach(key => {
    form[key] = key === 'level' ? '初级' : key === 'status' ? 'active' : ''
  })
  dialogVisible.value = true
}

const editPromoter = (row) => {
  dialogTitle.value = '编辑推广员'
  Object.assign(form, row)
  dialogVisible.value = true
}

const viewPromoter = (row) => {
  console.log('查看推广员:', row)
  // 这里可以实现查看推广员详情
}

const toggleStatus = (row) => {
  row.status = row.status === 'active' ? 'banned' : 'active'
  ElMessage.success(`推广员已${row.status === 'active' ? '解封' : '封禁'}`)
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
.promoter-management {
  padding: 20px;
}

.promoter-management h2 {
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