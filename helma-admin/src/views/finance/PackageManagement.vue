<template>
  <div class="package-management">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <span>套餐管理</span>
          <el-button type="primary" @click="addPackage">新增套餐</el-button>
        </div>
      </template>
      
      <el-form :inline="true" class="search-form">
        <el-form-item label="套餐名称">
          <el-input v-model="searchForm.name" placeholder="请输入套餐名称" />
        </el-form-item>
        <el-form-item label="套餐类型">
          <el-select v-model="searchForm.type" placeholder="请选择套餐类型">
            <el-option label="招聘招工模块" value="recruitment" />
            <el-option label="薪资对账模块" value="finance" />
            <el-option label="生产MES模块" value="mes" />
            <el-option label="运营增长模块" value="operation" />
            <el-option label="效率工具模块" value="tools" />
            <el-option label="组合套餐" value="combo" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态">
            <el-option label="上架" value="active" />
            <el-option label="下架" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetForm">重置</el-button>
          <el-button type="success" @click="exportData">导出</el-button>
        </el-form-item>
      </el-form>
      
      <el-table :data="packageList" style="width: 100%">
        <el-table-column prop="id" label="套餐ID" width="120" />
        <el-table-column prop="name" label="套餐名称" width="150" />
        <el-table-column prop="type" label="套餐类型" width="120">
          <template #default="scope">
            <el-tag :type="getTypeTag(scope.row.type)">
              {{ getTypeText(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="100">
          <template #default="scope">
            ¥{{ scope.row.price.toFixed(2) }}/{{ scope.row.period }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="套餐描述" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'">
              {{ scope.row.status === 'active' ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewDetail(scope.row)">查看详情</el-button>
            <el-button size="small" type="primary" @click="editPackage(scope.row)">编辑</el-button>
            <el-button size="small" :type="scope.row.status === 'active' ? 'warning' : 'success'" @click="toggleStatus(scope.row)">
              {{ scope.row.status === 'active' ? '下架' : '上架' }}
            </el-button>
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
      :title="dialogTitle"
      width="800px"
    >
      <el-form :model="packageForm" label-width="120px">
        <el-form-item label="套餐名称" prop="name">
          <el-input v-model="packageForm.name" placeholder="请输入套餐名称" />
        </el-form-item>
        <el-form-item label="套餐类型" prop="type">
          <el-select v-model="packageForm.type" placeholder="请选择套餐类型">
            <el-option label="招聘招工模块" value="recruitment" />
            <el-option label="薪资对账模块" value="finance" />
            <el-option label="生产MES模块" value="mes" />
            <el-option label="运营增长模块" value="operation" />
            <el-option label="效率工具模块" value="tools" />
            <el-option label="组合套餐" value="combo" />
          </el-select>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input v-model.number="packageForm.price" placeholder="请输入价格" />
        </el-form-item>
        <el-form-item label="周期" prop="period">
          <el-select v-model="packageForm.period" placeholder="请选择周期">
            <el-option label="月" value="月" />
            <el-option label="季" value="季" />
            <el-option label="年" value="年" />
          </el-select>
        </el-form-item>
        <el-form-item label="套餐描述" prop="description">
          <el-input
            v-model="packageForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入套餐描述"
          />
        </el-form-item>
        <el-form-item label="包含功能" prop="features">
          <el-checkbox-group v-model="packageForm.features">
            <el-checkbox label="岗位发布" />
            <el-checkbox label="简历筛选" />
            <el-checkbox label="线上入职" />
            <el-checkbox label="薪资对账" />
            <el-checkbox label="记工管理" />
            <el-checkbox label="数据分析" />
            <el-checkbox label="岗位置顶" />
            <el-checkbox label="精准推荐" />
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="packageForm.status" placeholder="请选择状态">
            <el-option label="上架" value="active" />
            <el-option label="下架" value="inactive" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="savePackage">保存</el-button>
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
  name: '',
  type: '',
  status: ''
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 套餐列表
const packageList = ref([])

// 弹窗
const dialogVisible = ref(false)
const dialogTitle = ref('新增套餐')
const packageForm = reactive({
  id: '',
  name: '',
  type: '',
  price: 0,
  period: '月',
  description: '',
  features: [],
  status: 'active'
})

// 模拟数据
const mockPackages = [
  {
    id: 'P001',
    name: '招聘招工基础包',
    type: 'recruitment',
    price: 99,
    period: '月',
    description: '包含岗位发布、简历筛选、线上入职等基础功能',
    features: ['岗位发布', '简历筛选', '线上入职'],
    status: 'active',
    createTime: '2026-03-01 10:00:00'
  },
  {
    id: 'P002',
    name: '招聘招工进阶包',
    type: 'recruitment',
    price: 199,
    period: '月',
    description: '包含基础包所有功能，额外增加岗位置顶、精准推荐等功能',
    features: ['岗位发布', '简历筛选', '线上入职', '岗位置顶', '精准推荐'],
    status: 'active',
    createTime: '2026-03-01 11:00:00'
  },
  {
    id: 'P003',
    name: '薪资对账基础包',
    type: 'finance',
    price: 149,
    period: '月',
    description: '包含薪资对账、记工管理等基础功能',
    features: ['薪资对账', '记工管理'],
    status: 'active',
    createTime: '2026-03-01 12:00:00'
  },
  {
    id: 'P004',
    name: '生产MES标准版',
    type: 'mes',
    price: 299,
    period: '月',
    description: '包含生产排程、物料管理等功能',
    features: ['生产排程', '物料管理', '数据分析'],
    status: 'inactive',
    createTime: '2026-03-01 13:00:00'
  },
  {
    id: 'P005',
    name: '企业综合包',
    type: 'combo',
    price: 499,
    period: '月',
    description: '包含所有模块的核心功能',
    features: ['岗位发布', '简历筛选', '线上入职', '薪资对账', '记工管理', '数据分析', '岗位置顶'],
    status: 'active',
    createTime: '2026-03-01 14:00:00'
  }
]

// 获取类型标签
const getTypeTag = (type) => {
  const typeMap = {
    recruitment: 'info',
    finance: 'success',
    mes: 'warning',
    operation: 'danger',
    tools: 'primary',
    combo: 'purple'
  }
  return typeMap[type] || 'info'
}

// 获取类型文本
const getTypeText = (type) => {
  const typeMap = {
    recruitment: '招聘招工',
    finance: '薪资对账',
    mes: '生产MES',
    operation: '运营增长',
    tools: '效率工具',
    combo: '组合套餐'
  }
  return typeMap[type] || '未知'
}

// 查询
const handleSearch = () => {
  // 模拟搜索
  const filtered = mockPackages.filter(item => {
    if (searchForm.name && !item.name.includes(searchForm.name)) return false
    if (searchForm.type && item.type !== searchForm.type) return false
    if (searchForm.status && item.status !== searchForm.status) return false
    return true
  })
  packageList.value = filtered
  pagination.total = filtered.length
}

// 重置
const resetForm = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  handleSearch()
}

// 导出
const exportData = () => {
  ElMessage.success('数据导出成功')
}

// 新增套餐
const addPackage = () => {
  dialogTitle.value = '新增套餐'
  Object.keys(packageForm).forEach(key => {
    packageForm[key] = ''
  })
  packageForm.price = 0
  packageForm.period = '月'
  packageForm.features = []
  packageForm.status = 'active'
  dialogVisible.value = true
}

// 编辑套餐
const editPackage = (row) => {
  dialogTitle.value = '编辑套餐'
  Object.assign(packageForm, row)
  dialogVisible.value = true
}

// 查看详情
const viewDetail = (row) => {
  dialogTitle.value = '套餐详情'
  Object.assign(packageForm, row)
  dialogVisible.value = true
}

// 保存套餐
const savePackage = () => {
  ElMessage.success('保存成功')
  dialogVisible.value = false
  handleSearch()
}

// 切换状态
const toggleStatus = (row) => {
  row.status = row.status === 'active' ? 'inactive' : 'active'
  ElMessage.success(row.status === 'active' ? '上架成功' : '下架成功')
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
.package-management {
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

.dialog-footer {
  text-align: right;
}
</style>