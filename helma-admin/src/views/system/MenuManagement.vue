<template>
  <div class="menu-management">
    <h2>菜单管理</h2>
    
    <!-- 操作按钮 -->
    <div class="action-buttons">
      <el-button type="primary" @click="addMenu">添加菜单</el-button>
      <el-button @click="refreshMenu">刷新菜单</el-button>
    </div>
    
    <!-- 菜单树 -->
    <el-card style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>菜单树</span>
        </div>
      </template>
      <el-tree
        :data="menuTree"
        node-key="id"
        default-expand-all
        @node-click="handleNodeClick"
      >
        <template #default="{ node, data }">
          <span class="menu-node">
            <span>{{ node.label }}</span>
            <span class="menu-actions">
              <el-button size="small" @click.stop="editMenu(data)">编辑</el-button>
              <el-button size="small" type="danger" @click.stop="deleteMenu(data)">删除</el-button>
            </span>
          </span>
        </template>
      </el-tree>
    </el-card>
    
    <!-- 添加/编辑菜单对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form :model="form" :rules="rules" ref="formRef">
        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="菜单路径" prop="path">
          <el-input v-model="form.path"></el-input>
        </el-form-item>
        <el-form-item label="组件路径" prop="component">
          <el-input v-model="form.component"></el-input>
        </el-form-item>
        <el-form-item label="父菜单">
          <el-select v-model="form.parentId" placeholder="请选择父菜单">
            <el-option label="根菜单" value="0"></el-option>
            <el-option
              v-for="menu in menuOptions"
              :key="menu.id"
              :label="menu.name"
              :value="menu.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input v-model.number="form.sort" type="number"></el-input>
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
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const menuTree = ref([
  {
    id: '1',
    name: '首页看板',
    path: '/dashboard',
    component: 'views/dashboard/Dashboard.vue',
    sort: 1,
    status: 'active',
    children: []
  },
  {
    id: '2',
    name: '工人管理',
    path: '/worker',
    component: '',
    sort: 2,
    status: 'active',
    children: [
      {
        id: '2-1',
        name: '工人列表',
        path: '/worker/list',
        component: 'views/worker/WorkerList.vue',
        sort: 1,
        status: 'active'
      },
      {
        id: '2-2',
        name: '标签管理',
        path: '/worker/tags',
        component: 'views/worker/WorkerTags.vue',
        sort: 2,
        status: 'active'
      }
    ]
  },
  {
    id: '3',
    name: '工厂管理',
    path: '/factory',
    component: '',
    sort: 3,
    status: 'active',
    children: [
      {
        id: '3-1',
        name: '工厂列表',
        path: '/factory/list',
        component: 'views/factory/FactoryList.vue',
        sort: 1,
        status: 'active'
      },
      {
        id: '3-2',
        name: '认证管理',
        path: '/factory/certification',
        component: 'views/factory/FactoryCertification.vue',
        sort: 2,
        status: 'active'
      }
    ]
  },
  {
    id: '4',
    name: '物料管理',
    path: '/materials',
    component: '',
    sort: 4,
    status: 'active',
    children: [
      {
        id: '4-1',
        name: '库存看板',
        path: '/materials/inventory-dashboard',
        component: 'views/materials/InventoryDashboard.vue',
        sort: 1,
        status: 'active'
      },
      {
        id: '4-2',
        name: '来料登记',
        path: '/materials/incoming-registration',
        component: 'views/materials/IncomingRegistration.vue',
        sort: 2,
        status: 'active'
      },
      {
        id: '4-3',
        name: '来料检验',
        path: '/materials/incoming-inspection',
        component: 'views/materials/IncomingInspection.vue',
        sort: 3,
        status: 'active'
      },
      {
        id: '4-4',
        name: '来料管理列表',
        path: '/materials/incoming-list',
        component: 'views/materials/IncomingList.vue',
        sort: 4,
        status: 'active'
      },
      {
        id: '4-5',
        name: '库存盘点',
        path: '/materials/inventory-count',
        component: 'views/materials/InventoryCounting.vue',
        sort: 5,
        status: 'active'
      },
      {
        id: '4-6',
        name: '物料批次追溯',
        path: '/materials/batch-traceability',
        component: 'views/materials/BatchTraceability.vue',
        sort: 6,
        status: 'active'
      },
      {
        id: '4-7',
        name: '生产领料',
        path: '/materials/production-issue',
        component: 'views/materials/ProductionIssue.vue',
        sort: 7,
        status: 'active'
      },
      {
        id: '4-8',
        name: '订单匹配',
        path: '/materials/order-matching',
        component: 'views/materials/OrderMatching.vue',
        sort: 8,
        status: 'active'
      },
      {
        id: '4-9',
        name: '发货跟踪',
        path: '/materials/shipment-tracking',
        component: 'views/materials/ShipmentTracking.vue',
        sort: 9,
        status: 'active'
      },
      {
        id: '4-10',
        name: '出货管理列表',
        path: '/materials/shipment-list',
        component: 'views/materials/ShipmentList.vue',
        sort: 10,
        status: 'active'
      }
    ]
  }
])

const menuOptions = computed(() => {
  const options = []
  const traverse = (menu) => {
    if (menu.id !== '0') {
      options.push({ id: menu.id, name: menu.name })
    }
    if (menu.children) {
      menu.children.forEach(child => traverse(child))
    }
  }
  menuTree.value.forEach(menu => traverse(menu))
  return options
})

const dialogVisible = ref(false)
const dialogTitle = ref('添加菜单')
const formRef = ref(null)
const form = reactive({
  name: '',
  path: '',
  component: '',
  parentId: '0',
  sort: 0,
  status: 'active'
})

const rules = {
  name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  path: [{ required: true, message: '请输入菜单路径', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入排序', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const handleNodeClick = (data) => {
  console.log('点击节点:', data)
}

const addMenu = () => {
  dialogTitle.value = '添加菜单'
  Object.keys(form).forEach(key => {
    form[key] = key === 'parentId' ? '0' : key === 'sort' ? 0 : key === 'status' ? 'active' : ''
  })
  dialogVisible.value = true
}

const editMenu = (data) => {
  dialogTitle.value = '编辑菜单'
  Object.assign(form, data)
  dialogVisible.value = true
}

const deleteMenu = (data) => {
  ElMessageBox.confirm('确定要删除这个菜单吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    console.log('删除菜单:', data)
    // 这里可以实现删除功能
    ElMessage.success('菜单删除成功')
  }).catch(() => {
    // 取消删除
  })
}

const refreshMenu = () => {
  console.log('刷新菜单')
  // 这里可以实现刷新功能
  ElMessage.success('菜单刷新成功')
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
.menu-management {
  padding: 20px;
}

.menu-management h2 {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.action-buttons {
  margin-bottom: 20px;
}

.action-buttons .el-button {
  margin-right: 10px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
  color: #333;
}

.menu-node {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.menu-actions {
  opacity: 0;
  transition: opacity 0.3s;
}

.menu-node:hover .menu-actions {
  opacity: 1;
}

.dialog-footer {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>