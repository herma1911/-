<template>
  <div class="scheduled-reports-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>定时报表</span>
          <el-button type="primary" @click="createSchedule">创建定时报表</el-button>
        </div>
      </template>
      
      <!-- 定时报表列表 -->
      <el-table :data="scheduledReports" style="width: 100%">
        <el-table-column prop="id" label="报表ID" width="100" />
        <el-table-column prop="name" label="报表名称" />
        <el-table-column prop="type" label="报表类型" width="120" />
        <el-table-column prop="frequency" label="发送频率" width="120" />
        <el-table-column prop="recipients" label="接收人" />
        <el-table-column prop="nextSendTime" label="下次发送时间" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === '启用' ? 'success' : 'info'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="editSchedule(scope.row)">编辑</el-button>
            <el-button size="small" type="primary" @click="sendNow(scope.row)">立即发送</el-button>
            <el-button size="small" type="danger" @click="deleteSchedule(scope.row.id)">删除</el-button>
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
    
    <!-- 创建/编辑定时报表对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
    >
      <el-form :model="scheduleForm" label-width="120px">
        <el-form-item label="报表名称">
          <el-input v-model="scheduleForm.name" />
        </el-form-item>
        <el-form-item label="报表类型">
          <el-select v-model="scheduleForm.type" placeholder="请选择">
            <el-option label="运营报表" value="operation" />
            <el-option label="财务报表" value="finance" />
            <el-option label="招聘报表" value="recruitment" />
            <el-option label="用户报表" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item label="发送频率">
          <el-select v-model="scheduleForm.frequency" placeholder="请选择">
            <el-option label="每天" value="daily" />
            <el-option label="每周" value="weekly" />
            <el-option label="每月" value="monthly" />
          </el-select>
        </el-form-item>
        <el-form-item label="发送时间">
          <el-time-picker
            v-model="scheduleForm.sendTime"
            placeholder="选择发送时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="接收人邮箱">
          <el-input v-model="scheduleForm.recipients" type="textarea" placeholder="多个邮箱用逗号分隔" />
        </el-form-item>
        <el-form-item label="报表内容">
          <el-checkbox-group v-model="scheduleForm.content">
            <el-checkbox label="用户数据">用户数据</el-checkbox>
            <el-checkbox label="招聘数据">招聘数据</el-checkbox>
            <el-checkbox label="财务数据">财务数据</el-checkbox>
            <el-checkbox label="运营数据">运营数据</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="scheduleForm.status" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveSchedule">保存</el-button>
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
  total: 15
})

// 定时报表数据
const scheduledReports = ref([
  {
    id: 1,
    name: '每日运营报表',
    type: '运营报表',
    frequency: '每天',
    recipients: 'admin@helma.com, operation@helma.com',
    nextSendTime: '2024-01-16 08:00:00',
    status: '启用'
  },
  {
    id: 2,
    name: '每周财务报表',
    type: '财务报表',
    frequency: '每周',
    recipients: 'finance@helma.com, admin@helma.com',
    nextSendTime: '2024-01-20 09:00:00',
    status: '启用'
  },
  {
    id: 3,
    name: '每月招聘报表',
    type: '招聘报表',
    frequency: '每月',
    recipients: 'hr@helma.com, admin@helma.com',
    nextSendTime: '2024-02-01 10:00:00',
    status: '启用'
  }
])

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('创建定时报表')

// 定时报表表单
const scheduleForm = reactive({
  id: '',
  name: '',
  type: '',
  frequency: 'daily',
  sendTime: '',
  recipients: '',
  content: [],
  status: true
})

// 创建定时报表
const createSchedule = () => {
  dialogTitle.value = '创建定时报表'
  scheduleForm.id = ''
  scheduleForm.name = ''
  scheduleForm.type = ''
  scheduleForm.frequency = 'daily'
  scheduleForm.sendTime = ''
  scheduleForm.recipients = ''
  scheduleForm.content = []
  scheduleForm.status = true
  dialogVisible.value = true
}

// 编辑定时报表
const editSchedule = (row) => {
  dialogTitle.value = '编辑定时报表'
  scheduleForm.id = row.id
  scheduleForm.name = row.name
  scheduleForm.type = row.type === '运营报表' ? 'operation' : row.type === '财务报表' ? 'finance' : row.type === '招聘报表' ? 'recruitment' : 'user'
  scheduleForm.frequency = row.frequency === '每天' ? 'daily' : row.frequency === '每周' ? 'weekly' : 'monthly'
  scheduleForm.sendTime = ''
  scheduleForm.recipients = row.recipients
  scheduleForm.content = ['用户数据', '运营数据']
  scheduleForm.status = row.status === '启用'
  dialogVisible.value = true
}

// 保存定时报表
const saveSchedule = () => {
  ElMessage.success('定时报表保存成功')
  dialogVisible.value = false
}

// 立即发送
const sendNow = (row) => {
  ElMessage.success('报表发送成功')
}

// 删除定时报表
const deleteSchedule = (id) => {
  ElMessage.success('定时报表删除成功')
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
.scheduled-reports-container {
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