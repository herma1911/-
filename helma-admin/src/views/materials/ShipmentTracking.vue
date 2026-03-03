<template>
  <div class="shipment-tracking">
    <!-- 顶部标题 -->
    <div class="page-header">
      <h1 class="page-title">发货跟踪</h1>
      <p class="page-subtitle">录入物流信息，跟踪发货状态</p>
    </div>
    
    <!-- 拣货单筛选区 -->
    <div class="filter-section">
      <h3 class="section-title">拣货单筛选</h3>
      <div class="filter-form">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-select v-model="filterParams.pickListNo" placeholder="拣货单号" size="large" style="width: 100%">
              <el-option label="全部拣货单" value="" />
              <el-option label="PK20260301001" value="PK20260301001" />
              <el-option label="PK20260302001" value="PK20260302001" />
              <el-option label="PK20260303001" value="PK20260303001" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="filterParams.status" placeholder="发货状态" size="large" style="width: 100%">
              <el-option label="全部状态" value="" />
              <el-option label="待发货" value="pending" />
              <el-option label="已发货" value="shipped" />
              <el-option label="已完成" value="completed" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-button type="primary" size="large" class="search-btn" @click="searchPickLists">
              筛选
            </el-button>
          </el-col>
        </el-row>
      </div>
    </div>
    
    <!-- 发货信息录入区 -->
    <div class="shipment-section" v-if="selectedPickList">
      <h3 class="section-title">发货信息</h3>
      <div class="shipment-form">
        <el-form :model="shipmentInfo" label-width="120px" size="large">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="拣货单号">
                <el-input v-model="shipmentInfo.pickListNo" disabled size="large" />
              </el-form-item>
              <el-form-item label="销售订单号">
                <el-input v-model="shipmentInfo.orderNo" disabled size="large" />
              </el-form-item>
              <el-form-item label="客户">
                <el-input v-model="shipmentInfo.customer" disabled size="large" />
              </el-form-item>
              <el-form-item label="发货日期">
                <el-date-picker v-model="shipmentInfo.shipmentDate" type="date" placeholder="选择日期" size="large" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="物流公司">
                <el-select v-model="shipmentInfo.logisticsCompany" placeholder="请选择物流公司" size="large" style="width: 100%">
                  <el-option label="顺丰速运" value="sf" />
                  <el-option label="中通快递" value="zt" />
                  <el-option label="圆通快递" value="yt" />
                  <el-option label="专线物流" value="line" />
                </el-select>
              </el-form-item>
              <el-form-item label="物流单号">
                <el-input v-model="shipmentInfo.logisticsNo" placeholder="请输入物流单号" size="large">
                  <template #append>
                    <el-button @click="scanLogisticsNo">扫码</el-button>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item label="发货人">
                <el-input v-model="shipmentInfo.shipper" size="large" />
              </el-form-item>
              <el-form-item label="备注">
                <el-input v-model="shipmentInfo.remark" type="textarea" placeholder="请输入备注信息" rows="2" size="large" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      
      <!-- 货物明细 -->
      <div class="goods-section">
        <h4 class="goods-title">货物明细</h4>
        <el-table :data="shipmentInfo.goodsList" style="width: 100%" size="large">
          <el-table-column prop="productCode" label="成品编码" width="150" />
          <el-table-column prop="productName" label="成品名称" width="200" />
          <el-table-column prop="specification" label="规格" width="120" />
          <el-table-column prop="quantity" label="数量" width="100" />
          <el-table-column prop="unit" label="单位" width="80" />
        </el-table>
      </div>
    </div>
    
    <!-- 底部操作按钮 -->
    <div class="action-buttons" v-if="selectedPickList">
      <el-button type="primary" size="large" class="main-btn" @click="confirmShipment">
        确认发货并通知客户
      </el-button>
      <el-button type="success" size="large" class="secondary-btn" @click="printShipmentOrder">
        打印发货单
      </el-button>
      <el-button type="info" size="large" class="secondary-btn" @click="viewLogistics">
        查看物流
      </el-button>
      <el-button type="warning" size="large" class="secondary-btn" @click="resetForm">
        重置
      </el-button>
    </div>
    
    <!-- 无数据提示 -->
    <div class="no-data" v-if="!selectedPickList">
      <div class="no-data-icon">📦</div>
      <div class="no-data-text">请选择拣货单查看发货信息</div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 筛选参数
      filterParams: {
        pickListNo: '',
        status: ''
      },
      // 选中的拣货单
      selectedPickList: null,
      // 发货信息
      shipmentInfo: {
        pickListNo: '',
        orderNo: '',
        customer: '',
        shipmentDate: new Date(),
        logisticsCompany: '',
        logisticsNo: '',
        shipper: '当前登录人',
        remark: '',
        goodsList: []
      }
    }
  },
  methods: {
    // 搜索拣货单
    searchPickLists() {
      if (this.filterParams.pickListNo) {
        // 模拟数据
        this.selectedPickList = this.filterParams.pickListNo;
        this.shipmentInfo = {
          pickListNo: this.filterParams.pickListNo,
          orderNo: 'SO20260301001',
          customer: '张三贸易公司',
          shipmentDate: new Date(),
          logisticsCompany: '',
          logisticsNo: '',
          shipper: '当前登录人',
          remark: '',
          goodsList: [
            {
              productCode: 'FP001',
              productName: '牛仔裤成品',
              specification: '32码',
              quantity: 500,
              unit: '条'
            },
            {
              productCode: 'FP002',
              productName: 'T恤成品',
              specification: 'M码',
              quantity: 800,
              unit: '件'
            }
          ]
        };
        this.$message.success('拣货单已加载');
      } else {
        this.$message.warning('请选择拣货单号');
      }
    },
    
    // 扫码输入物流单号
    scanLogisticsNo() {
      // 模拟扫码功能
      this.shipmentInfo.logisticsNo = 'SF1234567890';
      this.$message.success('扫码成功');
    },
    
    // 确认发货
    confirmShipment() {
      if (!this.shipmentInfo.logisticsCompany || !this.shipmentInfo.logisticsNo) {
        this.$message.warning('请填写物流信息');
        return;
      }
      this.$message.success('发货成功，已通知客户');
    },
    
    // 打印发货单
    printShipmentOrder() {
      this.$message.success('发货单已打印');
    },
    
    // 查看物流
    viewLogistics() {
      if (!this.shipmentInfo.logisticsNo) {
        this.$message.warning('请填写物流单号');
        return;
      }
      this.$message.info('跳转到物流官网查看');
    },
    
    // 重置
    resetForm() {
      this.shipmentInfo = {
        pickListNo: this.shipmentInfo.pickListNo,
        orderNo: this.shipmentInfo.orderNo,
        customer: this.shipmentInfo.customer,
        shipmentDate: new Date(),
        logisticsCompany: '',
        logisticsNo: '',
        shipper: '当前登录人',
        remark: '',
        goodsList: this.shipmentInfo.goodsList
      };
      this.$message.success('表单已重置');
    }
  }
}
</script>

<style scoped>
.shipment-tracking {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 36px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.page-subtitle {
  font-size: 18px;
  color: #666;
}

.filter-section {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
}

.filter-form {
  margin-top: 10px;
}

.search-btn {
  width: 100%;
  font-size: 16px;
  padding: 12px;
}

.shipment-section {
  flex: 1;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.shipment-form {
  margin-top: 20px;
}

.goods-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.goods-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 20px;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.main-btn {
  font-size: 18px;
  padding: 15px 30px;
  min-width: 200px;
}

.secondary-btn {
  font-size: 16px;
  padding: 12px 24px;
  min-width: 150px;
}

.no-data {
  background-color: #fff;
  padding: 60px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  text-align: center;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.no-data-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.no-data-text {
  font-size: 16px;
  color: #999;
}

.el-button {
  font-size: 16px;
  padding: 12px 24px;
}

.el-select {
  font-size: 16px;
}

.el-input__inner {
  font-size: 16px;
  height: 48px;
}

.el-table {
  margin-top: 15px;
}

.el-table th {
  font-size: 14px;
  font-weight: 600;
}

.el-table td {
  font-size: 14px;
}
</style>