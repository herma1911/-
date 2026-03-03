<template>
  <div class="custom-reports-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>自定义报表</span>
          <el-button type="primary" @click="createReport">创建报表</el-button>
        </div>
      </template>
      
      <!-- 报表列表 -->
      <el-table :data="reportTemplates" style="width: 100%">
        <el-table-column prop="id" label="报表ID" width="100" />
        <el-table-column prop="name" label="报表名称" />
        <el-table-column prop="description" label="报表描述" />
        <el-table-column prop="creator" label="创建人" width="120" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="lastModified" label="最后修改" width="180" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="editReport(scope.row)">编辑</el-button>
            <el-button size="small" type="primary" @click="generateReport(scope.row)">生成</el-button>
            <el-button size="small" type="danger" @click="deleteReport(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pagination.currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
        />
      </div>
    </el-card>
    
    <!-- 创建/编辑报表对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
    >
      <el-form :model="reportForm" label-width="120px">
        <el-form-item label="报表名称">
          <el-input v-model="reportForm.name" />
        </el-form-item>
        <el-form-item label="报表描述">
          <el-input v-model="reportForm.description" type="textarea" />
        </el-form-item>
        <el-form-item label="数据维度">
          <el-checkbox-group v-model="reportForm.dimensions">
            <el-checkbox label="时间">时间</el-checkbox>
            <el-checkbox label="地区">地区</el-checkbox>
            <el-checkbox label="用户类型">用户类型</el-checkbox>
            <el-checkbox label="业务模块">业务模块</el-checkbox>
            <el-checkbox label="工厂类型">工厂类型</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="指标选择">
          <el-checkbox-group v-model="reportForm.metrics">
            <el-checkbox label="注册用户数">注册用户数</el-checkbox>
            <el-checkbox label="活跃用户数">活跃用户数</el-checkbox>
            <el-checkbox label="岗位发布数">岗位发布数</el-checkbox>
            <el-checkbox label="投递数">投递数</el-checkbox>
            <el-checkbox label="到岗闭环数">到岗闭环数</el-checkbox>
            <el-checkbox label="营收金额">营收金额</el-checkbox>
            <el-checkbox label="付费转化率">付费转化率</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="报表类型">
          <el-select v-model="reportForm.type" placeholder="请选择">
            <el-option label="表格" value="table" />
            <el-option label="折线图" value="line" />
            <el-option label="柱状图" value="bar" />
            <el-option label="饼图" value="pie" />
            <el-option label="组合图" value="combo" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveReport">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 20
})

// 报表模板数据
const reportTemplates = ref([
  {
    id: 1,
    name: '用户增长报表',
    description: '分析用户注册和活跃情况',
    creator: 'admin',
    createTime: '2024-01-10 10:30:00',
    lastModified: '2024-01-15 14:20:00'
  },
  {
    id: 2,
    name: '招聘效果报表',
    description: '分析岗位发布和投递情况',
    creator: 'helma123',
    createTime: '2024-01-08 09:15:00',
    lastModified: '2024-01-12 11:45:00'
  },
  {
    id: 3,
    name: '营收分析报表',
    description: '分析平台营收和付费情况',
    creator: 'admin',
    createTime: '2024-01-05 16:40:00',
    lastModified: '2024-01-14 10:10:00'
  }
])

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('创建报表')

// 报表表单
const reportForm = reactive({
  id: '',
  name: '',
  description: '',
  dimensions: [],
  metrics: [],
  type: 'table'
})

// 创建报表
const createReport = () => {
  dialogTitle.value = '创建报表'
  reportForm.id = ''
  reportForm.name = ''
  reportForm.description = ''
  reportForm.dimensions = []
  reportForm.metrics = []
  reportForm.type = 'table'
  dialogVisible.value = true
}

// 编辑报表
const editReport = (row) => {
  dialogTitle.value = '编辑报表'
  reportForm.id = row.id
  reportForm.name = row.name
  reportForm.description = row.description
  // 模拟数据
  reportForm.dimensions = ['时间', '地区']
  reportForm.metrics = ['注册用户数', '活跃用户数']
  reportForm.type = 'line'
  dialogVisible.value = true
}

// 保存报表
const saveReport = () => {
  ElMessage.success('报表保存成功')
  dialogVisible.value = false
}

// 生成报表
const generateReport = (row) => {
  ElMessage.success('报表生成成功')
}

// 删除报表
const deleteReport = (id) => {
  ElMessage.success('报表删除成功')
}

// 分页大小变化
const handleSizeChange = (size) => {
  pagination.pageSize = size
}

// 当前页码变化
const handleCurrentChange = (current) => {
  pagination.currentPage = current
}
</script>

<style scoped>
.custom-reports-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
  color: #333;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.dialog-footer {
  width: 100%;
  display: flex;
  justify-content: flex-end;
}
</style>