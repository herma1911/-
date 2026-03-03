<template>
  <div class="worker-tags-container">
    <h2>标签管理</h2>
    <el-card>
      <template #header>
        <div class="card-header">
          <span>工人标签管理</span>
          <el-button type="primary" size="small" @click="addTag">添加标签</el-button>
        </div>
      </template>
      <el-table :data="tagList" style="width: 100%">
        <el-table-column prop="id" label="标签ID" width="100" />
        <el-table-column prop="name" label="标签名称" width="150" />
        <el-table-column prop="description" label="标签描述" />
        <el-table-column prop="count" label="使用次数" width="100" />
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button size="small" @click="editTag(scope.row.id)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteTag(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination
          layout="prev, pager, next"
          :total="total"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 批量打标签 -->
    <el-card class="mt-20">
      <template #header>
        <div class="card-header">
          <span>批量打标签</span>
        </div>
      </template>
      <el-form :model="batchForm" label-width="120px">
        <el-form-item label="选择工人">
          <el-select v-model="batchForm.workerIds" multiple placeholder="请选择工人">
            <el-option
              v-for="worker in workerList"
              :key="worker.id"
              :label="worker.name"
              :value="worker.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="选择标签">
          <el-select v-model="batchForm.tagIds" multiple placeholder="请选择标签">
            <el-option
              v-for="tag in tagList"
              :key="tag.id"
              :label="tag.name"
              :value="tag.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="batchAddTags">批量添加标签</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 模拟标签数据
const tagList = ref([
  {
    id: 1,
    name: '优质熟手',
    description: '技能熟练，经验丰富的工人',
    count: 15
  },
  {
    id: 2,
    name: '高活跃',
    description: '经常活跃的工人',
    count: 20
  },
  {
    id: 3,
    name: '风险用户',
    description: '存在风险行为的工人',
    count: 5
  }
])

// 模拟工人数据
const workerList = ref([
  {
    id: 1,
    name: '张三'
  },
  {
    id: 2,
    name: '李四'
  },
  {
    id: 3,
    name: '王五'
  }
])

const total = ref(100)
const pageSize = ref(10)
const currentPage = ref(1)

// 批量打标签表单
const batchForm = ref({
  workerIds: [],
  tagIds: []
})

// 分页处理
const handleCurrentChange = (page) => {
  currentPage.value = page
  // 这里可以调用API获取对应页的数据
}

// 添加标签
const addTag = () => {
  ElMessage.success('添加标签功能开发中')
}

// 编辑标签
const editTag = (id) => {
  ElMessage.success('编辑标签功能开发中')
}

// 删除标签
const deleteTag = (id) => {
  ElMessage.success('删除标签功能开发中')
}

// 批量添加标签
const batchAddTags = () => {
  if (batchForm.value.workerIds.length === 0) {
    ElMessage.warning('请选择工人')
    return
  }
  if (batchForm.value.tagIds.length === 0) {
    ElMessage.warning('请选择标签')
    return
  }
  ElMessage.success('批量添加标签功能开发中')
}

onMounted(() => {
  // 这里可以调用API获取标签列表数据
})
</script>

<style scoped>
.worker-tags-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.mt-20 {
  margin-top: 20px;
}
</style>