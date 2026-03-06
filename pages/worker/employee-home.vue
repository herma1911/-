<template>
  <view class="home-page" @tap="handleHomePageTap">
    <!-- 语音助手 -->
    <voice-assistant />

    
    <!-- 顶部极简信息区 -->
    <view class="nav-header">
      <view class="user-info" @tap="goToMy">
        <view class="user-avatar">
          <image v-if="userInfo.avatar" :src="userInfo.avatar" mode="aspectFill" class="avatar-image"></image>
          <text v-else class="avatar-icon">👤</text>
        </view>
        <text class="user-nickname">{{ userInfo.nickname || '未登录' }}</text>
      </view>
      <view class="header-center"></view>
      <text class="add-module-btn" @tap="openAddModuleModal">+</text>
    </view>
    
    <!-- 首屏核心：收入看板区 -->
    <view class="dual-card-section">
      <!-- 左侧本月预计卡片 -->
      <view class="monthly-card expected-card">
        <text class="card-label">本月预计纯收入</text>
        <text class="card-value">¥{{ monthlyIncome - monthlyExpense }}</text>
        <text class="card-sub">总收入¥{{ monthlyIncome }} - 总支出¥{{ monthlyExpense }}</text>
        <text class="card-sub">未结算·实时更新</text>
      </view>
      <!-- 中间分隔线 -->
      <view class="card-divider"></view>
      <!-- 右侧上月实际卡片 -->
      <view class="monthly-card actual-card">
        <text class="card-label">上月实际到手</text>
        <text class="card-value">¥{{ lastMonthNetIncome }}</text>
        <text class="card-sub">已结算·工资到账</text>
        <text class="card-sub">总收入¥{{ lastMonthIncome }} - 总支出¥{{ lastMonthExpense }}</text>
      </view>
    </view>
    
    <!-- 首屏核心：快捷记账操作区 -->
    <view class="core-action-section">
      <!-- 计时计薪模式 -->
      <template v-if="currentMode === 'time-tracking'">
        <!-- 记计件按钮 -->
        <view class="main-action-btn" @tap="openPieceworkModal">
          <text class="main-btn-icon">📝</text>
          <text class="main-btn-text">记计件</text>
        </view>
        
        <!-- 记考勤按钮 -->
        <view class="main-action-btn" @tap="openAttendanceModal">
          <text class="main-btn-icon">⏱️</text>
          <text class="main-btn-text">记考勤</text>
        </view>
        
        <!-- 记支出按钮 -->
        <view class="expense-action-btn" @tap="openExpenseModal">
          <text class="btn-icon">💰</text>
          <text class="btn-text">记支出</text>
        </view>
      </template>
      
      <!-- 纯记账模式 -->
      <template v-else>
        <!-- 收入按钮 -->
        <view class="main-action-btn income-btn" @tap="openIncomeModal">
          <text class="main-btn-icon">📈</text>
          <text class="main-btn-text">记收入</text>
        </view>
        
        <!-- 支出按钮 -->
        <view class="expense-action-btn" @tap="openExpenseModal">
          <text class="btn-icon">💰</text>
          <text class="btn-text">记支出</text>
        </view>
      </template>
    </view>
    
    <!-- 可自定义模块区 -->
    <view v-for="(module, index) in customizableModules" :key="module.id" v-if="module.visible">
      <!-- 模块容器，根据size调整大小 -->
      <view 
        :class="['module-container', 'size-' + module.size]"
        :style="{ flex: module.size }"
      >
        <view 
          class="module-wrapper"
          :class="{ 'editing': editMode, 'dragging': draggingModuleId === module.id }"
          @touchstart="handleTouchStart($event, module, index)"
          @touchmove="drag($event, module.id)"
          @touchend="handleTouchEnd"
          :style="getModuleStyle(module.id)"
        >
          <text v-if="editMode" class="delete-icon" @tap.stop="toggleModuleVisibility(module.id)">×</text>
          
          <!-- 收支趋势图表区 -->
          <view v-if="module.component === 'chart'" class="chart-section">
            <view class="chart-header">
              <text class="chart-title">最近7天收支趋势</text>
            </view>
            <view class="chart-container">
              <view class="chart-grid">
                <view class="chart-row" v-for="(record, index) in recentRecords" :key="index">
                  <text class="chart-date">{{ record.date.substring(5) }}</text>
                  <view class="chart-bars">
                    <view class="chart-bar income-bar" :style="{ height: (record.income / 1000) * 100 + '%' }"></view>
                    <view class="chart-bar expense-bar" :style="{ height: (record.expense / 300) * 100 + '%' }"></view>
                  </view>
                  <text class="chart-balance">¥{{ record.balance }}</text>
                </view>
              </view>
              <view class="chart-legend">
                <view class="legend-item">
                  <view class="legend-color income-color"></view>
                  <text class="legend-text">收入</text>
                </view>
                <view class="legend-item">
                  <view class="legend-color expense-color"></view>
                  <text class="legend-text">支出</text>
                </view>
              </view>
            </view>
          </view>

          <!-- 次屏核心：记工日历看板区 -->
          <view v-if="module.component === 'calendar' && currentMode === 'time-tracking'" class="calendar-section">
            <view class="calendar-header">
              <text class="calendar-title">{{ currentYear }}年 {{ currentMonth }}月</text>
              <text class="calendar-stats">当月已记工{{ checkinDays }}天 | 连续记工{{ continuousDays }}天</text>
            </view>
            
            <!-- 星期标题 -->
            <view class="week-row">
              <text class="week-day">日</text>
              <text class="week-day">一</text>
              <text class="week-day">二</text>
              <text class="week-day">三</text>
              <text class="week-day">四</text>
              <text class="week-day">五</text>
              <text class="week-day">六</text>
            </view>
            
            <!-- 日历网格 -->
            <view class="calendar-grid">
              <view 
                v-for="day in calendarDays" 
                :key="day.date"
                :class="[
                  'calendar-day',
                  { 
                    'empty-day': !day.date, 
                    'today': day.isToday, 
                    'sunday': day.isSunday, 
                    'has-checkin': day.hasCheckin,
                    'has-expense': day.hasExpense,
                    'continuous': day.isContinuous
                  }
                ]"
                @tap="handleDayTap(day)"
              >
                <text class="day-number">{{ day.date || '' }}</text>
                <text v-if="day.isSunday" class="day-icon">😴</text>
                <text v-else-if="day.hasCheckin" class="day-icon">✅</text>
                <text v-else-if="day.hasExpense" class="day-icon">💸</text>
                <text v-else-if="day.isContinuous" class="day-icon">🔥</text>
              </view>
            </view>
          </view>
          
          <!-- 底部极简辅助入口区 -->
          <view v-if="module.component === 'auxiliary' && currentMode === 'time-tracking'" class="auxiliary-entry-section">
            <view class="auxiliary-card" @tap="goToWechatLedger">
              <text class="auxiliary-icon">💬</text>
              <text class="auxiliary-title">微信确认账本</text>
              <text class="auxiliary-desc">对账结算·官方凭证</text>
            </view>
            <view class="auxiliary-card" @tap="goToLedger">
              <text class="auxiliary-icon">📊</text>
              <text class="auxiliary-title">查看完整账本</text>
              <text class="auxiliary-desc">详细账单·数据图表</text>
            </view>
            <view class="auxiliary-card" @tap="openInviteCodeModal">
              <text class="auxiliary-icon">🔗</text>
              <text class="auxiliary-title">绑定班组</text>
              <text class="auxiliary-desc">输入邀请码·关联工价</text>
            </view>
          </view>
          
          <!-- 自定义模块区 -->
          <view v-if="module.component === 'custom'" class="custom-modules-section">
            <view 
              v-for="(customModule, customIndex) in customModules" 
              :key="customModule.id"
              class="custom-module-card"
              :class="{ 'editing': editMode, 'dragging': draggingModuleId === customModule.id }"
              @tap="handleModuleTap(customModule)"
              @touchstart="handleTouchStart($event, customModule, customIndex)"
              @touchmove="drag($event, customModule.id)"
              @touchend="handleTouchEnd"
              :style="getModuleStyle(customModule.id)"
            >
              <text class="module-icon">{{ customModule.icon }}</text>
              <text class="module-title">{{ customModule.name }}</text>
              <text class="module-desc">{{ customModule.description }}</text>
              <text v-if="editMode" class="delete-icon" @tap.stop="deleteModule(customModule.id)">×</text>
            </view>
            <!-- 添加模块按钮 -->
            <view class="add-module-card" @tap="openAddModuleModal">
              <text class="add-module-icon">➕</text>
              <text class="add-module-text">添加模块</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 模块操作菜单 -->
    <view v-if="moduleOperations.activeModule" class="module-menu-overlay" @tap="hideModuleMenu">
      <view class="module-menu" @tap.stop>
        <view class="menu-header">
          <text class="menu-title">{{ moduleOperations.activeModule.name }}</text>
        </view>
        <view class="menu-content">
          <!-- 大小调整预览 -->
          <view class="size-preview-section">
            <text class="preview-label">调整大小</text>
            <view class="size-preview-container">
              <view 
                v-for="size in moduleOperations.previewSizes" 
                :key="size"
                class="size-preview"
                :class="{ 'active': size === moduleOperations.currentPreviewSize }"
                @tap="selectModuleSize(size)"
              >
                <view class="preview-box" :style="{ flex: size }"></view>
                <text class="size-text">{{ size }}x</text>
              </view>
            </view>
          </view>
          <!-- 操作按钮 -->
          <view class="menu-actions">
            <view class="action-item" @tap="shareModule">
              <text class="action-icon">📤</text>
              <text class="action-text">分享</text>
            </view>
            <view class="action-item" @tap="moreActions">
              <text class="action-icon">⋯</text>
              <text class="action-text">更多</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 编辑模式提示 -->
    <view v-if="editMode" class="edit-mode-hint">
      <text>长按拖动调整位置，点击 × 隐藏模块</text>
    </view>
    
    <!-- 添加模块模态框 -->
    <view v-if="showAddModuleModal" class="modal-overlay" @tap="closeAddModuleModal">
      <view class="modal-content" @tap.stop>
        <text class="modal-title">添加模块</text>
        <text class="modal-subtitle">选择要添加的核心功能</text>
        <view class="core-modules-list">
          <view 
            v-for="module in coreModules" 
            :key="module.id"
            class="core-module-item"
            @tap="selectCoreModule(module)"
          >
            <text class="module-icon">{{ module.icon }}</text>
            <view class="module-info">
              <text class="module-name">{{ module.name }}</text>
              <text class="module-desc">{{ module.description }}</text>
            </view>
            <text class="add-icon">+</text>
          </view>
        </view>
        <view class="modal-actions">
          <button class="modal-btn secondary" @tap="closeAddModuleModal">取消</button>
        </view>
      </view>
    </view>
    
    <!-- 底部固定操作栏 -->
    <view class="bottom-action-bar">
      <view 
        v-for="(button, index) in bottomNavButtons" 
        :key="button.id"
        v-if="!button.condition || button.condition === currentMode"
        class="action-btn"
        :class="{ 'editing': editMode, 'dragging': draggingModuleId === button.id }"
        @tap="handleBottomNavTap(button)"
        @touchstart="handleTouchStart($event, button, index)"
        @touchmove="drag($event, button.id)"
        @touchend="handleTouchEnd"
        :style="getModuleStyle(button.id)"
      >
        <text class="btn-icon">{{ button.icon }}</text>
        <text class="btn-text">{{ button.name }}</text>
        <text v-if="editMode" class="delete-icon" @tap.stop="removeBottomNavButton(button.id)">×</text>
      </view>
    </view>
    
    <!-- 记账弹窗 -->
    <view v-if="showPieceworkModal" class="modal-overlay" @tap="closeModal">
      <view class="modal-content" @tap.stop>
        <text class="modal-title">记计件</text>
        <view class="form-group">
          <text class="form-label">工作日期</text>
          <input type="date" v-model="pieceworkData.date" class="form-input" />
        </view>
        <!-- 邀请码输入 -->
        <view class="form-group">
          <input 
            type="text" 
            v-model="inviteCode" 
            class="form-input invite-code-input" 
            placeholder="输入邀请码获得工价" 
          />
        </view>
        <!-- 款号选择 -->
        <view class="form-group">
          <view class="dropdown-container" style="display: flex; align-items: center;">
            <input 
              type="text" 
              v-model="pieceworkData.styleNumber" 
              class="form-input" 
              placeholder="请输入款号" 
              @tap="toggleStyleDropdown"
              readonly
              style="flex: 1;"
            />
            <view class="upload-btn" @tap="uploadStyleImage">
              <text class="upload-icon">📷</text>
            </view>
            <!-- 款号下拉菜单 -->
            <view v-if="showDropdown === 'add-style'" class="dropdown-menu" style="z-index: 9999;">
              <view class="dropdown-item" v-for="style in styleHistory" :key="style" @tap="selectStyle(style)">
                {{ style }}
              </view>
            </view>
          </view>
        </view>
        <!-- 工序选择 -->
        <view class="form-group">
          <text class="form-label">工序</text>
          <input 
            type="text" 
            v-model="pieceworkData.processName" 
            class="form-input" 
            placeholder="请输入工序（例如：整件，平车开口袋）" 
            @tap="toggleProcessDropdown"
            :disabled="!pieceworkData.styleNumber"
            readonly
          />
          <!-- 工序下拉菜单 -->
          <view v-if="showDropdown === 'add-process' && pieceworkData.styleNumber" class="dropdown-menu" style="z-index: 9999;">
            <view 
              v-for="process in getProcessHistory(pieceworkData.styleNumber)" 
              :key="process.processName"
              class="dropdown-item"
              @tap="selectProcess(process)"
            >
              {{ process.processName }} (¥{{ process.unitPrice }})
            </view>
          </view>
        </view>
        <!-- 单价和数量 -->
        <view class="form-group price-quantity-group">
          <div class="price-quantity-row">
            <div class="price-quantity-item">
              <text class="form-label">单价</text>
              <input type="number" v-model.number="pieceworkData.unitPrice" class="form-input" placeholder="0" />
            </div>
            <div class="price-quantity-item">
              <text class="form-label">数量</text>
              <input type="number" v-model.number="pieceworkData.quantity" class="form-input" placeholder="0" />
            </div>
          </div>
        </view>
        <!-- 金额显示 -->
        <view class="form-group">
          <text class="form-label">金额</text>
          <text class="amount-display">{{ (pieceworkData.quantity * pieceworkData.unitPrice).toFixed(2) }}元</text>
        </view>
        <!-- 工价参考 -->
        <view v-if="showPriceReference && priceReference" class="price-reference">
          <view class="price-reference-header" @tap="togglePriceReferenceExpansion">
            <text class="price-reference-text">参考行情：全国平均{{ priceReference.national.avgPrice.toFixed(2) }}元/件 | {{ priceReference.city.regionName }}本地{{ priceReference.city.minPrice.toFixed(2) }}-{{ priceReference.city.maxPrice.toFixed(2) }}元/件</text>
            <text class="price-reference-expand">{{ expandedPriceReference ? '收起' : '展开' }}</text>
          </view>
          <view v-if="expandedPriceReference" class="price-reference-details">
            <view class="price-reference-item">
              <text class="price-reference-label">全国平均：</text>
              <text class="price-reference-value">{{ priceReference.national.avgPrice.toFixed(2) }}元/件（样本量：{{ priceReference.national.sampleCount }}）</text>
            </view>
            <view class="price-reference-item">
              <text class="price-reference-label">{{ priceReference.city.regionName }}本地区间：</text>
              <text class="price-reference-value">{{ priceReference.city.minPrice.toFixed(2) }}-{{ priceReference.city.maxPrice.toFixed(2) }}元/件（样本量：{{ priceReference.city.sampleCount }}）</text>
            </view>
            <view class="price-reference-feedback">
              <text class="feedback-label">反馈：</text>
              <view class="feedback-buttons">
                <button class="feedback-btn" @tap="feedbackPriceReference('偏高')">偏高</button>
                <button class="feedback-btn" @tap="feedbackPriceReference('偏低')">偏低</button>
                <button class="feedback-btn" @tap="feedbackPriceReference('准确')">准确</button>
              </view>
            </view>
          </view>
        </view>
        <!-- 添加按钮 -->
        <view class="add-buttons">
          <button class="add-button" @tap="addProcess">+ 添加工序</button>
          <button class="add-button" @tap="addStyle">+ 添加款号</button>
        </view>
        <view class="form-group">
          <text class="form-label">备注</text>
          <input type="text" v-model="pieceworkData.note" class="form-input" placeholder="请输入备注" />
        </view>
        <!-- 标准工价提示 -->
        <view v-if="standardPriceHint" class="standard-price-hint">
          {{ standardPriceHint }}
        </view>
        <!-- 细分品类提示条 -->
        <view v-if="showCategoryHint && !boundCompany" class="category-hint">
          <text class="hint-text">要不要选个款式？选了能帮你更准记工价哦～</text>
          <view class="hint-buttons">
            <button class="hint-btn primary" @tap="directSave">直接保存</button>
            <button class="hint-btn secondary" @tap="showCategorySelection">选款式</button>
          </view>
        </view>
        <view class="modal-actions">
          <button class="modal-btn secondary" @tap="closeModal">取消</button>
          <button class="modal-btn primary" @tap="checkCategoryHint">保存</button>
        </view>
      </view>
    </view>
    
    <view v-if="showHourlyModal" class="modal-overlay" @tap="closeModal">
      <view class="modal-content" @tap.stop>
        <text class="modal-title">记计时</text>
        <view class="form-group">
          <text class="form-label">工作日期</text>
          <input type="date" v-model="hourlyData.date" class="form-input" />
        </view>
        <view class="form-group">
          <text class="form-label">工作时长（小时）</text>
          <input type="number" v-model.number="hourlyData.hours" class="form-input" placeholder="请输入工作时长" />
        </view>
        <view class="form-group">
          <text class="form-label"> hourly wage（元/小时）</text>
          <input type="number" v-model.number="hourlyData.wage" class="form-input" placeholder="请输入 hourly wage" />
        </view>
        <view class="form-group">
          <text class="form-label">备注</text>
          <input type="text" v-model="hourlyData.note" class="form-input" placeholder="请输入备注" />
        </view>
        <view class="modal-actions">
          <button class="modal-btn secondary" @tap="closeModal">取消</button>
          <button class="modal-btn primary" @tap="saveHourlyRecord">保存</button>
        </view>
      </view>
    </view>
    
    <!-- 收入记录弹窗 -->
    <view v-if="showIncomeModal" class="modal-overlay" @tap="closeModal">
      <view class="modal-content" @tap.stop>
        <text class="modal-title">记收入</text>
        <view class="form-group">
          <text class="form-label">收入日期</text>
          <input type="date" v-model="incomeData.date" class="form-input" />
        </view>
        <view class="form-group">
          <text class="form-label">收入金额（元）</text>
          <input type="number" v-model.number="incomeData.amount" class="form-input" placeholder="请输入收入金额" />
        </view>
        <view class="form-group">
          <text class="form-label">收入类别</text>
          <picker v-model="incomeData.category" :range="['工资', '兼职', '奖金', '投资', '其他']" class="form-picker">
            <text class="form-picker-text">{{ incomeData.category || '请选择类别' }}</text>
          </picker>
        </view>
        <view class="form-group">
          <text class="form-label">备注</text>
          <input type="text" v-model="incomeData.note" class="form-input" placeholder="请输入备注" />
        </view>
        <view class="modal-actions">
          <button class="modal-btn secondary" @tap="closeModal">取消</button>
          <button class="modal-btn primary" @tap="saveIncomeRecord">保存</button>
        </view>
      </view>
    </view>
    

    
    <!-- 日期明细弹窗 -->
    <view v-if="showDayDetailModal" class="modal-overlay" @tap="closeDayDetailModal">
      <view class="modal-content" @tap.stop>
        <text class="modal-title">{{ selectedDate }}日明细</text>
        <text class="modal-desc" v-if="!selectedDayData.length">当日无记录</text>
        <view v-else class="day-detail-list">
          <view class="day-detail-item" v-for="(item, index) in selectedDayData" :key="index">
            <text class="item-type">{{ item.type }}</text>
            <text class="item-amount">¥{{ item.amount }}</text>
          </view>
        </view>
        <button class="modal-btn" @tap="closeDayDetailModal">关闭</button>
      </view>
    </view>
    
    <!-- 计薪模式选择弹窗 -->
    <view v-if="showWageModeModal" class="modal-overlay" @tap="showWageModeModal = false">
      <view class="modal-content" @tap.stop>
        <text class="modal-title">您平时主要怎么算工资？</text>
        <view class="wage-mode-options">
          <view class="wage-mode-option" @tap="selectWageMode('piecework')">
            <text class="option-radio">{{ wageMode === 'piecework' ? '●' : '○' }}</text>
            <text class="option-text">按件算钱（计件，做一件拿一件的钱）</text>
          </view>
          <view class="wage-mode-option" @tap="selectWageMode('hourly')">
            <text class="option-radio">{{ wageMode === 'hourly' ? '●' : '○' }}</text>
            <text class="option-text">按时算钱（计时，按小时/天算钱）</text>
          </view>
        </view>
        <text class="modal-subtext">后续可随时切换，不影响使用</text>
        <button class="modal-btn" @tap="showWageModeModal = false">暂不设置</button>
      </view>
    </view>
    
    <!-- 邀请码绑定弹窗 -->
    <view v-if="showInviteCodeModal" class="modal-overlay" @tap="showInviteCodeModal = false">
      <view class="modal-content" @tap.stop>
        <text class="modal-title">绑定班组</text>
        <view class="form-group">
          <text class="modal-desc">点击下方按钮输入邀请码，系统将显示对应班组信息</text>
        </view>
        <view class="modal-actions">
          <button class="modal-btn secondary" @tap="showInviteCodeModal = false">取消</button>
          <button class="modal-btn primary" @tap="goToInviteInput">输入邀请码</button>
        </view>
      </view>
    </view>
    
    <!-- 细分品类选择面板 -->
    <view v-if="showCategoryPanel" class="category-panel-overlay" @tap="hideCategoryPanel">
      <view class="category-panel" @tap.stop>
        <view class="category-panel-header">
          <button class="category-panel-close" @tap="hideCategoryPanel">取消</button>
        </view>
        <view class="category-panel-content">
          <view v-for="group in garmentCategories" :key="group.category" class="category-group">
            <text class="category-group-title">{{ group.category }}</text>
            <view class="category-items">
              <view 
                v-for="item in group.items" 
                :key="item.id"
                class="category-item"
                @tap="selectCategoryItem(item)"
              >
                <text class="category-item-icon">{{ item.icon }}</text>
                <text class="category-item-name">{{ item.name }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import voiceAssistant from '../../components/voice-assistant.vue'

export default {
  components: {
    voiceAssistant
  },
  data() {
    return {
      currentMode: 'time-tracking',
      wageMode: 'piecework', // 默认计件模式
      userInfo: {
        username: '',
        role: '个人',
        avatar: '',
        nickname: ''
      },
      // 模拟数据
      monthlyIncome: 10800,
      monthlyExpense: 2300,
      continuousDays: 15,
      todayExpensed: 150,
      currentYear: new Date().getFullYear(),
      currentMonth: new Date().getMonth() + 1,
      checkinDays: 12,
      calendarDays: [],
      // 上月数据
      lastMonthIncome: 9600,
      lastMonthExpense: 2100,
      lastMonthNetIncome: 7500,
      // 示例数据：最近7天的收支记录
      recentRecords: [
        { date: '2026-03-01', income: 800, expense: 150, balance: 650 },
        { date: '2026-03-02', income: 900, expense: 200, balance: 700 },
        { date: '2026-03-03', income: 750, expense: 180, balance: 570 },
        { date: '2026-03-04', income: 850, expense: 120, balance: 730 },
        { date: '2026-03-05', income: 950, expense: 250, balance: 700 },
        { date: '2026-03-06', income: 820, expense: 160, balance: 660 },
        { date: '2026-03-07', income: 880, expense: 190, balance: 690 }
      ],
      // 弹窗状态
      showPieceworkModal: false,
      showHourlyModal: false,
      showExpenseModal: false,
      showDayDetailModal: false,
      showWageModeModal: false,
      selectedDate: '',
      selectedDayData: [],
      // 绑定状态
      boundCompany: null,
      styleProcessMap: {},
      styleHistory: [],
      showDropdown: null,
      // 细分品类相关
      showCategoryHint: false,
      showCategoryPanel: false,
      selectedCategory: '',
      garmentCategories: [
        {
          category: '针织上衣',
          items: [
            { id: 'knit_t_shirt', name: '圆领T恤', icon: '👕' },
            { id: 'knit_polo', name: ' Polo衫', icon: '👔' },
            { id: 'knit_sweater', name: '毛衣', icon: '🧥' },
            { id: 'knit_hoodie', name: '连帽卫衣', icon: '🧢' }
          ]
        },
        {
          category: '针织下装',
          items: [
            { id: 'knit_pants', name: '针织裤', icon: '👖' },
            { id: 'knit_shorts', name: '针织短裤', icon: '🩳' },
            { id: 'knit_skirt', name: '针织裙', icon: '👗' }
          ]
        },
        {
          category: '梭织上衣',
          items: [
            { id: 'woven_shirt', name: '衬衫', icon: '👔' },
            { id: 'woven_jacket', name: '夹克', icon: '🧥' },
            { id: 'woven_coat', name: '外套', icon: '🧥' }
          ]
        },
        {
          category: '梭织下装',
          items: [
            { id: 'woven_pants', name: '西裤', icon: '👖' },
            { id: 'woven_shorts', name: '梭织短裤', icon: '🩳' }
          ]
        },
        {
          category: '裙装',
          items: [
            { id: 'dress_casual', name: '休闲裙', icon: '👗' },
            { id: 'dress_formal', name: '正装裙', icon: '👗' }
          ]
        },
        {
          category: '通用',
          items: [
            { id: 'other_garment', name: '其他服装', icon: '👕' },
            { id: 'accessory', name: '配饰', icon: '👜' }
          ]
        }
      ],
      // 标准工价提示
      standardPriceHint: '',
      // 工价参考相关
      priceReference: null,
      showPriceReference: false,
      expandedPriceReference: false,
      // 记工数据
      hourlyData: {
        date: new Date().toISOString().split('T')[0],
        hours: 8,
        wage: 20,
        note: ''
      },
      pieceworkData: {
        date: new Date().toISOString().split('T')[0],
        styleNumber: '',
        processName: '',
        quantity: 0,
        unitPrice: 0,
        product: '',
        price: 0,
        note: ''
      },
      // 收入数据
      incomeData: {
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        category: '',
        note: ''
      },
      // 支出类别
      expenseCategories: ['餐饮', '交通', '住宿', '购物', '房租/房贷', '水电费', '燃气费', '手机话费', '宽带费', '物业费', '交通费', '保险费', '子女教育费', '车贷', '其他'],
      // 快捷选项编辑
      editingQuickOptions: false,
      customQuickOptions: [],
      // 带金额的快捷选项
      quickExpenseItems: [],
      // 弹窗状态
      showIncomeModal: false,
      // 邀请码绑定
      showInviteCodeModal: false,
      inviteCode: '',
      // 自定义模块
      customModules: [
        { id: 1, name: '搞钱地图', icon: '🗺️', description: '基于成长等级的旺季推荐地图', route: '/pages/worker/money-map' },
        { id: 2, name: '固定支出', icon: '📋', description: '管理固定支出提醒', route: '/pages/worker/fixed-expenses' },
        { id: 3, name: '收支分析', icon: '📊', description: '查看收入支出情况', route: '/pages/worker/data-report' },
        { id: 4, name: '技能档案', icon: '💼', description: '完善个人技能信息', route: '/pages/worker/skill-profile' },
        { id: 5, name: '测收入', icon: '⏱️', description: '计算预计收入', route: '/pages/worker/income-calculator' },
        { id: 6, name: '提收入', icon: '📹', description: '分享技巧，提升效率', route: '/pages/worker/income-boost' },
        { id: 7, name: '找工记录', icon: '🔍', description: '查看找工历史记录', route: '/pages/worker/job-records' }
      ],
      // 编辑模式状态
      editMode: false,
      // 拖动状态
      draggingModuleId: null,
      // 初始位置
      initialPositions: {},
      // 长按计时器
      longPressTimer: null,
      // 可自定义模块
      customizableModules: [
        { id: 'chart', name: '收支趋势', icon: '📊', visible: true, component: 'chart', size: 1 },
        { id: 'calendar', name: '记工日历', icon: '📅', visible: true, component: 'calendar', size: 4 },
        { id: 'auxiliary', name: '辅助入口', icon: '🔗', visible: true, component: 'auxiliary', size: 1 },
        { id: 'custom', name: '自定义模块', icon: '📋', visible: true, component: 'custom', size: 2 }
      ],
      // 模块操作状态
      moduleOperations: {
        activeModule: null,
        showPreview: false,
        previewSizes: [1, 2, 4],
        currentPreviewSize: 1
      },
      // 添加模块模态框
      showAddModuleModal: false,
      // 新模块数据
      newModule: {
        name: '',
        icon: '📋',
        description: '',
        route: ''
      },
      // 核心功能模块列表
      coreModules: [
        { id: 1, name: '搞钱地图', icon: '🗺️', description: '基于成长等级的旺季推荐地图', route: '/pages/worker/money-map' },
        { id: 2, name: '固定支出', icon: '📋', description: '管理固定支出提醒', route: '/pages/worker/fixed-expenses' },
        { id: 3, name: '收支分析', icon: '📊', description: '查看收入支出情况', route: '/pages/worker/data-report' },
        { id: 4, name: '技能档案', icon: '💼', description: '完善个人技能信息', route: '/pages/worker/skill-profile' },
        { id: 5, name: '测收入', icon: '⏱️', description: '计算预计收入', route: '/pages/worker/income-calculator' },
        { id: 6, name: '提收入', icon: '📹', description: '分享技巧，提升效率', route: '/pages/worker/income-boost' },
        { id: 7, name: '找工记录', icon: '🔍', description: '查看找工历史记录', route: '/pages/worker/job-records' },
        { id: 8, name: '微信确认账本', icon: '💬', description: '对账结算·官方凭证', route: '/pages/worker/wechat-ledger' },
        { id: 9, name: '完整账本', icon: '📅', description: '详细账单·数据图表', route: '/pages/worker/ledger' },
        { id: 10, name: '记工历史', icon: '📝', description: '查看历史记工记录', route: '/pages/worker/wage-history' }
      ],
      // 底部导航栏按钮
      bottomNavButtons: [
        { id: 'home', name: '首页', icon: '🏠', action: 'goToHome' },
        { id: 'job', name: '找工作', icon: '🔍', action: 'goToJob', condition: 'time-tracking' },
        { id: 'message', name: '消息', icon: '💬', action: 'goToMessage', condition: 'time-tracking' },
        { id: 'my', name: '我的', icon: '👤', action: 'goToMy' }
      ],
    }
  },
  computed: {
    isBound() {
      console.log('isBound computed:', !!this.boundCompany, 'boundCompany:', this.boundCompany)
      return !!this.boundCompany
    },
    currentDateText() {
      const date = new Date()
      return `${date.getMonth() + 1}月${date.getDate()}日`
    }
  },
  onLoad() {
    this.loadUserInfo()
    this.loadCurrentMode()
    this.loadWageMode()
    this.generateCalendar()
    this.checkFixedExpenseReminders()
  },
  methods: {
    loadUserInfo() {
      const userInfo = uni.getStorageSync('userInfo') || {}
      console.log('Raw userInfo from storage:', userInfo)
      this.userInfo = {
        username: '',
        role: '个人',
        avatar: userInfo.avatar || userInfo.wechatInfo?.avatar || '',
        nickname: userInfo.nickname || userInfo.wechatInfo?.nickname || '',
        status: '',
        ...userInfo
      }
      // 加载快捷支出项
      this.loadQuickExpenseItems()
      // 加载绑定状态
      const storedBoundCompany = uni.getStorageSync('boundCompany')
      console.log('Stored boundCompany:', storedBoundCompany)
      // 从本地存储加载绑定数据
      this.boundCompany = storedBoundCompany && Object.keys(storedBoundCompany).length > 0 ? storedBoundCompany : null
      
      // 加载款号工序映射
      const storedStyleProcessMap = uni.getStorageSync('styleProcessMap')
      console.log('Stored styleProcessMap:', storedStyleProcessMap)
      // 从本地存储加载款号工序映射
      this.styleProcessMap = storedStyleProcessMap && Object.keys(storedStyleProcessMap).length > 0 ? storedStyleProcessMap : {}
      
      // 加载历史款号
      const storedStyleHistory = uni.getStorageSync('styleHistory')
      console.log('Stored styleHistory:', storedStyleHistory)
      // 从本地存储加载历史款号
      this.styleHistory = storedStyleHistory && storedStyleHistory.length > 0 ? storedStyleHistory : []
      
      console.log('After loadUserInfo - boundCompany:', this.boundCompany, 'isBound:', this.isBound)
      console.log('After loadUserInfo - styleProcessMap:', this.styleProcessMap)
      console.log('After loadUserInfo - styleHistory:', this.styleHistory)
      console.log('After loadUserInfo - boundCompany:', this.boundCompany, 'isBound:', this.isBound)
    },

    loadQuickExpenseItems() {
      // 尝试从本地存储加载带金额的快捷选项
      const quickItems = uni.getStorageSync('quickExpenseItems') || []
      if (quickItems.length > 0) {
        this.quickExpenseItems = quickItems
      } else {
        // 默认带金额的快捷选项
        this.quickExpenseItems = [
          { name: '餐饮', amount: 30 },
          { name: '交通', amount: 10 },
          { name: '购物', amount: 50 },
          { name: '其他', amount: 20 }
        ]
      }
    },
    // 切换快捷选项编辑模式
    toggleEditQuickOptions() {
      this.editingQuickOptions = true
      // 复制当前快捷选项到编辑数组
      this.customQuickOptions = [...this.quickExpenseItems]
    },
    // 添加新快捷选项
    addQuickOption() {
      this.customQuickOptions.push('')
    },
    // 删除快捷选项
    deleteQuickOption(index) {
      this.customQuickOptions.splice(index, 1)
    },

    // 取消快捷选项编辑
    cancelEditQuickOptions() {
      this.editingQuickOptions = false
      this.customQuickOptions = []
    },
    // 选择带金额的快捷记账项
    selectQuickExpenseItem(item) {
      this.expenseData.amount = item.amount
      this.expenseData.note = item.name
      this.expenseData.category = item.name
      uni.showToast({
        title: '已选择快捷记账',
        icon: 'success'
      })
    },
    // 切换快捷记账编辑模式
    toggleEditQuickExpenseItems() {
      this.editingQuickOptions = true
    },
    // 添加新快捷记账项
    addQuickExpenseItem() {
      this.quickExpenseItems.push({ name: '', amount: 0 })
    },
    // 删除快捷记账项
    deleteQuickExpenseItem(index) {
      this.quickExpenseItems.splice(index, 1)
    },
    // 保存快捷记账项编辑
    saveQuickExpenseItems() {
      // 过滤空选项
      const filteredItems = this.quickExpenseItems.filter(item => item.name.trim() && item.amount > 0)
      if (filteredItems.length === 0) {
        uni.showToast({
          title: '至少保留一个快捷记账项',
          icon: 'none'
        })
        return
      }
      // 保存到本地存储
      uni.setStorageSync('quickExpenseItems', filteredItems)
      // 更新快捷记账项
      this.quickExpenseItems = filteredItems
      this.editingQuickOptions = false
      uni.showToast({
        title: '快捷记账保存成功',
        icon: 'success'
      })
    },
    // 取消快捷记账编辑
    cancelEditQuickExpenseItems() {
      this.editingQuickOptions = false
      this.loadQuickExpenseItems()
    },
    loadCurrentMode() {
      // 从本地存储加载模式
      const savedMode = uni.getStorageSync('appMode')
      this.currentMode = savedMode || 'time-tracking'
      console.log('loadCurrentMode - currentMode set to:', this.currentMode)
    },
    loadWageMode() {
      const savedWageMode = uni.getStorageSync('wageMode')
      if (savedWageMode) {
        this.wageMode = savedWageMode
      } else {
        // 首次启动，显示计薪模式选择弹窗
        this.showWageModeModal = true
      }
    },
    // 生成日历数据
    generateCalendar() {
      console.log('Generating calendar for:', this.currentYear, '年', this.currentMonth, '月')
      const year = this.currentYear
      const month = this.currentMonth
      const daysInMonth = new Date(year, month, 0).getDate()
      const firstDayOfMonth = new Date(year, month - 1, 1).getDay()
      const today = new Date()
      const todayDate = today.getDate()
      const todayMonth = today.getMonth() + 1
      const todayYear = today.getFullYear()
      
      // 从本地存储加载实际的工作记录
      const records = uni.getStorageSync('workRecords') || []
      console.log('Loaded records:', records.length)
      
      // 过滤出当月的支出记录
      const monthlyExpenses = records.filter(record => {
        if (record.type !== 'expense') return false
        const recordDate = new Date(record.date)
        return recordDate.getFullYear() === year && recordDate.getMonth() + 1 === month
      })
      console.log('Monthly expenses:', monthlyExpenses.length)
      
      // 提取有支出的日期
      const expenseDays = new Set()
      monthlyExpenses.forEach(record => {
        const recordDate = new Date(record.date)
        expenseDays.add(recordDate.getDate())
      })
      console.log('Expense days:', Array.from(expenseDays))
      
      // 过滤出当月的记工记录
      const monthlyCheckins = records.filter(record => {
        if (record.type === 'expense') return false
        const recordDate = new Date(record.date)
        return recordDate.getFullYear() === year && recordDate.getMonth() + 1 === month
      })
      console.log('Monthly checkins:', monthlyCheckins.length)
      
      // 提取有记工的日期
      const checkinDays = new Set()
      monthlyCheckins.forEach(record => {
        const recordDate = new Date(record.date)
        checkinDays.add(recordDate.getDate())
      })
      console.log('Checkin days:', Array.from(checkinDays))
      
      const days = []
      
      // 添加上个月的占位日期
      for (let i = 0; i < firstDayOfMonth; i++) {
        days.push({ date: null, isToday: false, isSunday: false, hasCheckin: false, hasExpense: false, isContinuous: false })
      }
      
      // 添加当月日期
      for (let i = 1; i <= daysInMonth; i++) {
        const isToday = i === todayDate && month === todayMonth && year === todayYear
        const isSunday = new Date(year, month - 1, i).getDay() === 0
        const hasCheckin = checkinDays.has(i)
        const hasExpense = expenseDays.has(i)
        const isContinuous = false // 可以根据实际需要计算连续记工天数
        
        days.push({
          date: i,
          isToday,
          isSunday,
          hasCheckin,
          hasExpense,
          isContinuous
        })
      }
      
      this.calendarDays = days
      console.log('Calendar generated with', days.length, 'days')
    },
    
    // 页面跳转方法
    goToMy() {
      uni.navigateTo({ url: '/pages/worker/my-page' })
    },
    goToHistory() {
      uni.navigateTo({ url: '/pages/worker/wage-history' })
    },
    
    // 按钮点击处理方法
    handleMainButtonTap() {
      console.log('Main button tapped, wageMode:', this.wageMode)
      if (this.wageMode === 'piecework') {
        this.openPieceworkModal();
      } else {
        this.openHourlyModal();
      }
    },

    // 弹窗控制方法
    openPieceworkModal() {
      console.log('Opening piecework modal')
      this.showPieceworkModal = true;
    },
    openHourlyModal() {
      console.log('Opening hourly modal')
      this.showHourlyModal = true;
    },
    openExpenseModal() {
      console.log('Opening expense page')
      uni.navigateTo({ url: '/pages/expense/quickAdd' })
    },
    openAttendanceModal() {
      console.log('Opening attendance page')
      uni.navigateTo({ url: '/pages/worker/attendance' })
    },

    closeModal() {
      this.showPieceworkModal = false;
      this.showHourlyModal = false;
      this.showExpenseModal = false;
      this.showIncomeModal = false;
    },
    
    // 处理日期点击
    handleDayTap(day) {
      if (!day.date) return
      
      this.selectedDate = day.date
      this.selectedDayData = []
      
      if (day.hasCheckin) {
        this.selectedDayData.push({ type: '记工', amount: 800 })
      }
      if (day.hasExpense) {
        this.selectedDayData.push({ type: '支出', amount: 150 })
      }
      
      this.showDayDetailModal = true
    },
    
    closeDayDetailModal() {
      this.showDayDetailModal = false
    },
    
    // 跳转到微信确认账本
    goToWechatLedger() {
      uni.navigateTo({
        url: '/pages/worker/wechat-ledger',
        success: () => {
          console.log('跳转到微信确认账本成功')
        },
        fail: (err) => {
          console.error('跳转到微信确认账本失败：', err)
        }
      })
    },
    
    // 跳转到完整账本
    goToLedger() {
      uni.navigateTo({
        url: '/pages/worker/ledger',
        success: () => {
          console.log('跳转到完整账本成功')
        },
        fail: (err) => {
          console.error('跳转到完整账本失败：', err)
        }
      })
    },
    // 跳转到邀请码输入页面
    goToInviteInput() {
      console.log('跳转到邀请码输入页面')
      uni.navigateTo({
        url: '/pages/worker/invite-code-input',
        success: (res) => {
          console.log('跳转到邀请码输入页面成功:', res)
          this.showInviteCodeModal = false
        },
        fail: (err) => {
          console.error('跳转到邀请码输入页面失败:', err)
          uni.showToast({
            title: '跳转失败，请重试',
            icon: 'none'
          })
          this.showInviteCodeModal = false
        }
      })
    },
    
    // 底部导航栏方法
    goToHome() {
      uni.reLaunch({ url: '/pages/worker/employee-home' })
    },
    goToJob() {
      uni.navigateTo({ url: '/pages/social/recruitment-list' })
    },
    goToMessage() {
      uni.navigateTo({ url: '/pages/worker/messages' })
    },
    goToMy() {
      uni.navigateTo({ url: '/pages/worker/my-page' })
    },
    // 处理模块点击
    handleModuleTap(module) {
      if (this.editMode) {
        // 编辑模式下，尝试添加到底部导航栏
        this.addToBottomNav(module)
      } else {
        // 否则导航到模块
        console.log('导航到模块:', module.name, module.route)
        if (module.route) {
          uni.navigateTo({
            url: module.route,
            success: () => {
              console.log('导航成功')
            },
            fail: (err) => {
              console.error('导航失败:', err)
              uni.showToast({
                title: '导航失败，请检查路径',
                icon: 'none'
              })
            }
          })
        } else {
          uni.showToast({
            title: '模块路径未设置',
            icon: 'none'
          })
        }
      }
    },
    // 处理底部导航栏按钮点击
    handleBottomNavTap(button) {
      if (this.editMode) {
        return
      }
      if (button.action) {
        this[button.action]()
      } else if (button.route) {
        uni.navigateTo({
          url: button.route
        })
      }
    },
    // 添加模块到底部导航栏
    addToBottomNav(module) {
      // 检查底部导航栏是否已满
      const visibleButtons = this.bottomNavButtons.filter(btn => !btn.condition || btn.condition === this.currentMode)
      if (visibleButtons.length >= 4) {
        uni.showToast({
          title: '底部导航栏最多只能添加4个功能',
          icon: 'none'
        })
        return
      }
      
      // 检查模块是否已在底部导航栏
      const exists = this.bottomNavButtons.some(btn => btn.id === module.id)
      if (exists) {
        uni.showToast({
          title: '该功能已在底部导航栏',
          icon: 'none'
        })
        return
      }
      
      // 添加到底部导航栏
      const newButton = {
        id: module.id,
        name: module.name,
        icon: module.icon,
        route: module.route
      }
      this.bottomNavButtons.push(newButton)
      
      uni.showToast({
        title: '已添加到底部导航栏',
        icon: 'success'
      })
    },
    // 从底部导航栏移除按钮
    removeBottomNavButton(buttonId) {
      // 保留默认的首页和我的按钮
      if (buttonId === 'home' || buttonId === 'my') {
        uni.showToast({
          title: '首页和我的按钮不可删除',
          icon: 'none'
        })
        return
      }
      
      this.bottomNavButtons = this.bottomNavButtons.filter(btn => btn.id !== buttonId)
      uni.showToast({
        title: '已从底部导航栏移除',
        icon: 'success'
      })
    },
    // 显示模块操作菜单
    showModuleMenu(module) {
      this.moduleOperations.activeModule = module
      this.moduleOperations.currentPreviewSize = module.size || 1
      this.editMode = true
    },
    // 隐藏模块操作菜单
    hideModuleMenu() {
      this.moduleOperations.activeModule = null
      this.moduleOperations.showPreview = false
    },
    // 选择模块大小
    selectModuleSize(size) {
      if (this.moduleOperations.activeModule) {
        this.moduleOperations.currentPreviewSize = size
        // 更新模块大小
        const moduleIndex = this.customizableModules.findIndex(m => m.id === this.moduleOperations.activeModule.id)
        if (moduleIndex !== -1) {
          this.customizableModules[moduleIndex].size = size
        } else {
          const customModuleIndex = this.customModules.findIndex(m => m.id === this.moduleOperations.activeModule.id)
          if (customModuleIndex !== -1) {
            this.customModules[customModuleIndex].size = size
          }
        }
        uni.showToast({
          title: `已调整为${size}倍大小`,
          icon: 'success'
        })
      }
    },
    // 分享模块
    shareModule() {
      if (this.moduleOperations.activeModule) {
        uni.showActionSheet({
          itemList: ['分享到微信', '分享到企业微信', '分享到钉钉', '分享到QQ'],
          success: (res) => {
            switch (res.tapIndex) {
              case 0:
                uni.showToast({ title: '分享到微信', icon: 'success' })
                break
              case 1:
                uni.showToast({ title: '分享到企业微信', icon: 'success' })
                break
              case 2:
                uni.showToast({ title: '分享到钉钉', icon: 'success' })
                break
              case 3:
                uni.showToast({ title: '分享到QQ', icon: 'success' })
                break
            }
          },
          fail: (err) => {
            console.log('分享失败', err)
          }
        })
      }
    },
    // 更多操作
    moreActions() {
      uni.showToast({
        title: '更多操作功能开发中',
        icon: 'none'
      })
    },
    // 进入编辑模式
    enterEditMode() {
      this.editMode = true
      // 10秒后自动退出编辑模式
      setTimeout(() => {
        this.editMode = false
        this.draggingModuleId = null
      }, 10000)
    },
    // 处理长按事件
    handleLongPress(module) {
      if (!this.editMode) {
        this.enterEditMode()
        if (module) {
          this.showModuleMenu(module)
        }
      }
    },
    // 触摸开始
    handleTouchStart(event, module, index) {
      // 清除之前的计时器
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer)
      }
      // 设置长按计时器
      this.longPressTimer = setTimeout(() => {
        this.handleLongPress(module)
      }, 1000) // 1秒触发
      // 记录初始位置
      this.initialPositions[module.id] = {
        index: index,
        startX: event.touches[0].clientX,
        startY: event.touches[0].clientY
      }
    },
    // 触摸结束
    handleTouchEnd() {
      // 清除计时器
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer)
        this.longPressTimer = null
      }
      // 结束拖动
      this.draggingModuleId = null
      this.initialPositions = {}
    },
    // 开始拖动
    startDrag(event, moduleId, index) {
      if (!this.editMode) return
      
      this.draggingModuleId = moduleId
      this.initialPositions[moduleId] = {
        index: index,
        startX: event.touches[0].clientX,
        startY: event.touches[0].clientY
      }
    },
    // 拖动中
    drag(event, moduleId) {
      if (!this.editMode || this.draggingModuleId !== moduleId) return
      
      const currentX = event.touches[0].clientX
      const currentY = event.touches[0].clientY
      const initial = this.initialPositions[moduleId]
      
      if (initial) {
        const deltaX = currentX - initial.startX
        const deltaY = currentY - initial.startY
        
        // 检查是否达到拖动阈值
        if (Math.abs(deltaX) > 30 || Math.abs(deltaY) > 30) {
          // 标记为拖动中
          this.draggingModuleId = moduleId
          
          // 计算新位置
          const newIndex = this.calculateNewIndex(initial.index, deltaX, deltaY)
          if (newIndex !== initial.index && newIndex >= 0 && newIndex < this.customModules.length) {
            // 重新排序模块
            this.reorderModules(initial.index, newIndex)
            // 更新初始位置
            this.initialPositions[moduleId].index = newIndex
            this.initialPositions[moduleId].startX = currentX
            this.initialPositions[moduleId].startY = currentY
          }
        }
      }
    },
    // 结束拖动
    endDrag() {
      this.draggingModuleId = null
      this.initialPositions = {}
    },
    // 计算新位置
    calculateNewIndex(currentIndex, deltaX, deltaY) {
      const threshold = 50 // 拖动阈值
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // 水平拖动
        if (deltaX > threshold) {
          return Math.max(0, currentIndex - 1)
        } else if (deltaX < -threshold) {
          return Math.min(this.customModules.length - 1, currentIndex + 1)
        }
      } else {
        // 垂直拖动
        if (deltaY > threshold) {
          // 向下拖动，增加索引
          return Math.min(this.customModules.length - 1, currentIndex + 1)
        } else if (deltaY < -threshold) {
          // 向上拖动，减少索引
          return Math.max(0, currentIndex - 1)
        }
      }
      return currentIndex
    },
    // 获取模块样式
    getModuleStyle(moduleId) {
      if (this.draggingModuleId === moduleId) {
        return {
          opacity: '0.5',
          transform: 'scale(1.05)',
          zIndex: '10'
        }
      }
      if (this.editMode) {
        return {
          animation: 'shake 0.5s infinite'
        }
      }
      return {}
    },
    // 重新排序模块
    reorderModules(fromIndex, toIndex) {
      // 检查是自定义模块、可自定义模块还是底部导航栏按钮
      if (typeof fromIndex === 'number' && typeof toIndex === 'number') {
        // 检查是否是自定义模块内的排序
        if (fromIndex < this.customModules.length && toIndex < this.customModules.length) {
          const module = this.customModules.splice(fromIndex, 1)[0]
          this.customModules.splice(toIndex, 0, module)
        } else if (fromIndex < this.customizableModules.length && toIndex < this.customizableModules.length) {
          // 可自定义模块排序
          const module = this.customizableModules.splice(fromIndex, 1)[0]
          this.customizableModules.splice(toIndex, 0, module)
        } else if (fromIndex < this.bottomNavButtons.length && toIndex < this.bottomNavButtons.length) {
          // 底部导航栏按钮排序
          const button = this.bottomNavButtons.splice(fromIndex, 1)[0]
          this.bottomNavButtons.splice(toIndex, 0, button)
        }
      }
    },
    // 获取模块样式
    getModuleStyle(moduleId) {
      if (this.draggingModuleId === moduleId) {
        return {
          transform: 'scale(1.05)',
          zIndex: 10
        }
      }
      return {}
    },
    // 删除模块
    deleteModule(moduleId) {
      this.customModules = this.customModules.filter(module => module.id !== moduleId)
      uni.showToast({
        title: '模块已删除',
        icon: 'success'
      })
    },
    // 切换模块显示/隐藏
    toggleModuleVisibility(moduleId) {
      const module = this.customizableModules.find(m => m.id === moduleId)
      if (module) {
        module.visible = !module.visible
        uni.showToast({
          title: module.visible ? '模块已显示' : '模块已隐藏',
          icon: 'success'
        })
      }
    },
    // 打开添加模块模态框
    openAddModuleModal() {
      // 重置新模块数据
      this.newModule = {
        name: '',
        icon: '📋',
        description: '',
        route: ''
      }
      this.showAddModuleModal = true
    },
    // 关闭添加模块模态框
    closeAddModuleModal() {
      this.showAddModuleModal = false
    },
    // 选择核心模块
    selectCoreModule(module) {
      // 检查模块是否已存在
      const existingModule = this.customModules.find(m => m.name === module.name)
      if (existingModule) {
        uni.showToast({
          title: '该模块已存在',
          icon: 'none'
        })
        return
      }
      
      // 创建新模块
      const newModule = {
        id: Date.now(),
        name: module.name,
        icon: module.icon,
        description: module.description,
        route: module.route
      }
      
      // 添加到自定义模块列表
      this.customModules.push(newModule)
      this.showAddModuleModal = false
      
      uni.showToast({
        title: '模块添加成功',
        icon: 'success'
      })
    },
    // 保存新模块（保留原有功能）
    saveNewModule() {
      if (!this.newModule.name || !this.newModule.route) {
        uni.showToast({
          title: '请填写模块名称和跳转路径',
          icon: 'none'
        })
        return
      }
      
      // 创建新模块
      const newModule = {
        id: Date.now(),
        name: this.newModule.name,
        icon: this.newModule.icon,
        description: this.newModule.description,
        route: this.newModule.route
      }
      
      // 添加到自定义模块列表
      this.customModules.push(newModule)
      this.showAddModuleModal = false
      
      uni.showToast({
        title: '模块添加成功',
        icon: 'success'
      })
    },

    // 切换款号下拉菜单
    toggleStyleDropdown() {
      console.log('=== toggleStyleDropdown called ===')
      console.log('Before - showDropdown:', this.showDropdown)
      if (this.showDropdown === 'add-style') {
        this.showDropdown = null
        console.log('After - showDropdown set to null')
      } else {
        this.showDropdown = 'add-style'
        console.log('After - showDropdown set to add-style')
      }
      console.log('Final showDropdown:', this.showDropdown)
      console.log('styleHistory length:', this.styleHistory.length)
      console.log('styleHistory:', this.styleHistory)
    },
    // 切换工序下拉菜单
    toggleProcessDropdown() {
      console.log('=== toggleProcessDropdown called ===')
      console.log('Before - showDropdown:', this.showDropdown)
      if (this.showDropdown === 'add-process') {
        this.showDropdown = null
        console.log('After - showDropdown set to null')
      } else {
        this.showDropdown = 'add-process'
        console.log('After - showDropdown set to add-process')
      }
      console.log('Final showDropdown:', this.showDropdown)
      console.log('pieceworkData.styleNumber:', this.pieceworkData.styleNumber)
      const processes = this.getProcessHistory(this.pieceworkData.styleNumber)
      console.log('getProcessHistory result length:', processes.length)
      console.log('getProcessHistory result:', processes)
    },
    // 获取工序历史
    getProcessHistory(styleNumber) {
      return this.styleProcessMap[styleNumber] || []
    },
    // 选择款号
    selectStyle(style) {
      console.log('=== selectStyle called ===')
      console.log('Selected style:', style)
      this.pieceworkData.styleNumber = style
      this.pieceworkData.processName = '' // 重置工序
      this.pieceworkData.unitPrice = 0 // 重置单价
      this.showDropdown = null
      console.log('After selectStyle - pieceworkData:', this.pieceworkData)
    },
    // 选择工序
    selectProcess(process) {
      console.log('=== selectProcess called ===')
      console.log('Selected process:', process)
      this.pieceworkData.processName = process.processName
      this.pieceworkData.unitPrice = process.unitPrice
      this.showDropdown = null
      console.log('After selectProcess - pieceworkData:', this.pieceworkData)
    },
    // 上传款号图片
    uploadStyleImage() {
      console.log('=== uploadStyleImage called ===')
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['camera', 'album'],
        success: (res) => {
          console.log('Image selected:', res.tempFilePaths[0])
          // 这里可以添加上传图片的逻辑
          uni.showToast({
            title: '图片选择成功',
            icon: 'success'
          })
        },
        fail: (err) => {
          console.error('Failed to select image:', err)
        }
      })
    },
    addProcess() {
      // 添加工序逻辑
      uni.showToast({
        title: '添加工序功能开发中',
        icon: 'none'
      })
    },
    addStyle() {
      // 添加款号逻辑
      uni.showToast({
        title: '添加款号功能开发中',
        icon: 'none'
      })
    },
    // 选择计薪模式
    selectWageMode(mode) {
      this.wageMode = mode
      uni.setStorageSync('wageMode', mode)
      this.showWageModeModal = false
      uni.showToast({
        title: '计薪模式设置成功',
        icon: 'success'
      })
    },

    // 保存计时记录
    saveHourlyRecord() {
      if (!this.hourlyData.hours || !this.hourlyData.wage) {
        uni.showToast({
          title: '请填写工作时长和工资',
          icon: 'none'
        })
        return
      }
      
      const record = {
        id: Date.now(),
        type: 'hourly',
        date: this.hourlyData.date,
        hours: this.hourlyData.hours,
        wage: this.hourlyData.wage,
        amount: this.hourlyData.hours * this.hourlyData.wage,
        note: this.hourlyData.note,
        createdAt: new Date().toISOString()
      }
      
      this.saveRecord(record)
      this.closeModal()
      
      // 重置表单
      this.hourlyData = {
        date: new Date().toISOString().split('T')[0],
        hours: 8,
        wage: 20,
        note: ''
      }
      
      // 重新生成日历，更新记工记录显示
      this.generateCalendar()
    },
    // 检查是否需要显示细分品类提示
    checkCategoryHint() {
      if (!this.boundCompany && this.pieceworkData.styleNumber && this.pieceworkData.processName) {
        this.showCategoryHint = true
        // 10秒后自动隐藏提示
        setTimeout(() => {
          this.showCategoryHint = false
        }, 10000)
      } else {
        this.directSave()
      }
    },
    
    // 直接保存
    directSave() {
      this.showCategoryHint = false
      this.savePieceworkRecord()
    },
    
    // 显示细分品类选择
    showCategorySelection() {
      this.showCategoryHint = false
      this.showCategoryPanel = true
    },
    
    // 隐藏细分品类选择面板
    hideCategoryPanel() {
      this.showCategoryPanel = false
    },
    
    // 选择细分品类
    selectCategoryItem(item) {
      this.selectedCategory = item.name
      this.showCategoryPanel = false
      // 关联IE库，显示标准工价提示
      this.calculateStandardPrice()
    },
    
    // 计算标准工价
    calculateStandardPrice() {
      // 模拟IE库数据
      const standardProcesses = {
        '圆领T恤': {
          '开口袋': { standardTime: 120, difficultyCoefficient: 1.1 },
          '上领': { standardTime: 90, difficultyCoefficient: 1.2 },
          '车缝': { standardTime: 60, difficultyCoefficient: 1.0 }
        },
        '衬衫': {
          '开口袋': { standardTime: 150, difficultyCoefficient: 1.3 },
          '上领': { standardTime: 120, difficultyCoefficient: 1.4 },
          '车缝': { standardTime: 80, difficultyCoefficient: 1.1 }
        }
      }
      
      const categoryProcesses = standardProcesses[this.selectedCategory]
      if (categoryProcesses) {
        // 模糊匹配工序
        let matchedProcess = null
        for (const processName in categoryProcesses) {
          if (this.pieceworkData.processName.includes(processName)) {
            matchedProcess = categoryProcesses[processName]
            break
          }
        }
        
        if (matchedProcess) {
          const standardTime = matchedProcess.standardTime
          const difficultyCoefficient = matchedProcess.difficultyCoefficient
          const basePrice = (standardTime / 3600) * 18 * difficultyCoefficient
          this.standardPriceHint = `已匹配标准工价：${basePrice.toFixed(2)}元/件`
          // 获取工价参考
          this.fetchPriceReference()
        }
      }
    },
    
    // 获取工价参考数据
    fetchPriceReference() {
      // 模拟工价参考数据
      this.priceReference = {
        national: {
          avgPrice: 0.10,
          minPrice: 0.08,
          maxPrice: 0.12,
          sampleCount: 2300
        },
        city: {
          regionName: '昆山',
          avgPrice: 0.09,
          minPrice: 0.07,
          maxPrice: 0.11,
          sampleCount: 126
        }
      }
      this.showPriceReference = true
    },
    
    // 切换工价参考展开/收起状态
    togglePriceReferenceExpansion() {
      this.expandedPriceReference = !this.expandedPriceReference
    },
    
    // 反馈工价参考
    feedbackPriceReference(feedback) {
      uni.showToast({
        title: `已反馈：${feedback}`,
        icon: 'success'
      })
    },
    
    // 保存计件记录
    savePieceworkRecord() {
      if (this.isBound) {
        if (!this.pieceworkData.styleNumber || !this.pieceworkData.processName || !this.pieceworkData.quantity || !this.pieceworkData.unitPrice) {
          uni.showToast({
            title: '请填写款号、工序、数量和单价',
            icon: 'none'
          })
          return
        }
        
        const record = {
          id: Date.now(),
          type: 'piecework',
          date: this.pieceworkData.date,
          styleNumber: this.pieceworkData.styleNumber,
          processName: this.pieceworkData.processName,
          quantity: this.pieceworkData.quantity,
          unitPrice: this.pieceworkData.unitPrice,
          amount: this.pieceworkData.quantity * this.pieceworkData.unitPrice,
          note: this.pieceworkData.note,
          sub_category_optional: this.selectedCategory,
          createdAt: new Date().toISOString()
        }
        
        // 保存记录
        this.saveRecord(record)
        
        // 更新历史款号
        if (this.pieceworkData.styleNumber && !this.styleHistory.includes(this.pieceworkData.styleNumber)) {
          this.styleHistory.unshift(this.pieceworkData.styleNumber)
          // 限制历史记录数量为10条
          if (this.styleHistory.length > 10) {
            this.styleHistory = this.styleHistory.slice(0, 10)
          }
          // 保存到本地存储
          uni.setStorageSync('styleHistory', this.styleHistory)
          console.log('Updated styleHistory:', this.styleHistory)
        }
        
        // 更新款号工序映射
        if (this.pieceworkData.styleNumber && this.pieceworkData.processName) {
          if (!this.styleProcessMap[this.pieceworkData.styleNumber]) {
            this.styleProcessMap[this.pieceworkData.styleNumber] = []
          }
          // 检查工序是否已存在
          const processExists = this.styleProcessMap[this.pieceworkData.styleNumber].some(
            process => process.processName === this.pieceworkData.processName
          )
          if (!processExists) {
            this.styleProcessMap[this.pieceworkData.styleNumber].push({
              processName: this.pieceworkData.processName,
              unitPrice: this.pieceworkData.unitPrice
            })
            // 保存到本地存储
            uni.setStorageSync('styleProcessMap', this.styleProcessMap)
            console.log('Updated styleProcessMap:', this.styleProcessMap)
          }
        }
        
        this.closeModal()
        
        // 重置表单
        this.resetPieceworkForm()
        
        // 重新生成日历，更新记工记录显示
        this.generateCalendar()
      } else {
        if (!this.pieceworkData.styleNumber || !this.pieceworkData.processName || !this.pieceworkData.quantity || !this.pieceworkData.unitPrice) {
          uni.showToast({
            title: '请填写款号、工序、数量和单价',
            icon: 'none'
          })
          return
        }
        
        const record = {
          id: Date.now(),
          type: 'piecework',
          date: this.pieceworkData.date,
          styleNumber: this.pieceworkData.styleNumber,
          processName: this.pieceworkData.processName,
          quantity: this.pieceworkData.quantity,
          unitPrice: this.pieceworkData.unitPrice,
          amount: this.pieceworkData.quantity * this.pieceworkData.unitPrice,
          note: this.pieceworkData.note,
          sub_category_optional: this.selectedCategory,
          createdAt: new Date().toISOString()
        }
        
        // 保存记录
        this.saveRecord(record)
        
        // 更新历史款号
        if (this.pieceworkData.styleNumber && !this.styleHistory.includes(this.pieceworkData.styleNumber)) {
          this.styleHistory.unshift(this.pieceworkData.styleNumber)
          // 限制历史记录数量为10条
          if (this.styleHistory.length > 10) {
            this.styleHistory = this.styleHistory.slice(0, 10)
          }
          // 保存到本地存储
          uni.setStorageSync('styleHistory', this.styleHistory)
          console.log('Updated styleHistory:', this.styleHistory)
        }
        
        // 更新款号工序映射
        if (this.pieceworkData.styleNumber && this.pieceworkData.processName) {
          if (!this.styleProcessMap[this.pieceworkData.styleNumber]) {
            this.styleProcessMap[this.pieceworkData.styleNumber] = []
          }
          // 检查工序是否已存在
          const processExists = this.styleProcessMap[this.pieceworkData.styleNumber].some(
            process => process.processName === this.pieceworkData.processName
          )
          if (!processExists) {
            this.styleProcessMap[this.pieceworkData.styleNumber].push({
              processName: this.pieceworkData.processName,
              unitPrice: this.pieceworkData.unitPrice
            })
            // 保存到本地存储
            uni.setStorageSync('styleProcessMap', this.styleProcessMap)
            console.log('Updated styleProcessMap:', this.styleProcessMap)
          }
        }
        
        this.closeModal()
        
        // 重置表单
        this.resetPieceworkForm()
        
        // 重新生成日历，更新记工记录显示
        this.generateCalendar()
      }
    },
    
    // 重置记计件表单
    resetPieceworkForm() {
      this.pieceworkData = {
        date: new Date().toISOString().split('T')[0],
        styleNumber: '',
        processName: '',
        quantity: 0,
        unitPrice: 0,
        product: '',
        price: 0,
        note: ''
      }
      this.selectedCategory = ''
      this.standardPriceHint = ''
      this.showCategoryHint = false
    },

    // 保存记录到本地存储
    saveRecord(record) {
      const records = uni.getStorageSync('workRecords') || []
      records.push(record)
      uni.setStorageSync('workRecords', records)
      
      // 检查是否是首次记录固定支出类型
      if (record.type === 'expense') {
        this.checkFixedExpenseReminder(record.category, record.amount)
      }
      
      uni.showToast({
        title: '保存成功',
        icon: 'success'
      })
    },
    // 检查固定支出提醒
    checkFixedExpenseReminder(category, amount) {
      const fixedExpenseCategories = ['房租/房贷', '水电费', '燃气费', '手机话费', '宽带费', '物业费', '交通费', '保险费', '子女教育费', '车贷']
      if (fixedExpenseCategories.includes(category)) {
        uni.showModal({
          title: '设置固定支出提醒',
          content: `是否将${category}设置为固定支出，每月自动提醒？`,
          confirmText: '设置',
          cancelText: '暂不设置',
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({
                url: '/pages/worker/fixed-expenses'
              })
            }
          }
        })
      }
    },
    // 打开邀请码绑定弹窗
    openInviteCodeModal() {
      this.showInviteCodeModal = true
    },
    // 提交邀请码
    goToInviteInput() {
      // 关闭当前弹窗
      this.showInviteCodeModal = false
      // 跳转到邀请码输入页面
      uni.navigateTo({
        url: '/pages/worker/invite-input'
      })
    },
    submitInviteCode() {
      if (!this.inviteCode.trim()) {
        uni.showToast({
          title: '请输入邀请码',
          icon: 'none'
        })
        return
      }
      
      // 跳转到邀请码确认页面
      uni.navigateTo({
        url: `/pages/worker/invite-confirmation?code=${this.inviteCode}`
      })
      
      // 关闭弹窗
      this.showInviteCodeModal = false
      this.inviteCode = ''
    },
    // 打开收入记录弹窗
    openIncomeModal() {
      console.log('Opening income modal')
      this.showIncomeModal = true
    },
    // 保存收入记录
    saveIncomeRecord() {
      console.log('Saving income record:', this.incomeData)
      if (!this.incomeData.amount || !this.incomeData.category) {
        uni.showToast({
          title: '请填写收入金额和类别',
          icon: 'none'
        })
        return
      }
      
      const record = {
        id: Date.now(),
        type: 'income',
        date: this.incomeData.date,
        amount: this.incomeData.amount,
        category: this.incomeData.category,
        note: this.incomeData.note,
        createdAt: new Date().toISOString()
      }
      
      console.log('Income record to save:', record)
      this.saveRecord(record)
      this.closeModal()
      
      // 重置表单
      this.incomeData = {
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        category: '',
        note: ''
      }
      
      // 重新生成日历，更新收入记录显示
      console.log('Regenerating calendar after saving income')
      this.generateCalendar()
    },

    // 检查固定支出提醒
    checkFixedExpenseReminders() {
      const fixedExpenses = uni.getStorageSync('fixedExpenses') || []
      const today = new Date()
      const todayDay = today.getDate()
      const todayDate = today.toISOString().split('T')[0]
      let updated = false
      
      fixedExpenses.forEach(expense => {
        // 检查是否到期
        if (expense.endDate && expense.endDate < todayDate) {
          expense.status = 'completed'
          updated = true
        }
        
        // 检查暂停是否到期
        if (expense.status === 'paused' && expense.pauseEndDate && expense.pauseEndDate < todayDate) {
          expense.status = 'active'
          delete expense.pauseEndDate
          updated = true
        }
        
        // 检查提醒日期（话费提前3天提醒）
        let remindDay = expense.remindDay
        if (expense.category === '手机话费') {
          remindDay = remindDay - 3
          if (remindDay < 1) {
            // 上个月的最后几天
            const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 0)
            remindDay = lastMonth.getDate() + remindDay
          }
        }
        
        if (expense.status === 'active' && remindDay === todayDay) {
          uni.showModal({
            title: '固定支出提醒',
            content: `今天是${expense.name}的缴费日，金额：¥${expense.amount}`,
            confirmText: '已缴费',
            cancelText: '本月忽略',
            success: (res) => {
              if (res.confirm) {
                // 记录已缴费
                const paymentRecord = {
                  id: Date.now(),
                  type: 'expense',
                  date: todayDate,
                  amount: expense.amount,
                  category: expense.category,
                  note: `${expense.name}自动缴费`,
                  createdAt: new Date().toISOString()
                }
                this.saveRecord(paymentRecord)
              }
            }
          })
        }
      })
      
      if (updated) {
        uni.setStorageSync('fixedExpenses', fixedExpenses)
      }
    },
    // 处理首页点击，退出编辑模式
    handleHomePageTap() {
      if (this.editMode) {
        this.editMode = false
        this.draggingModuleId = null
      }
    }
  }
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-bottom: 120rpx;
}



/* 顶部极简信息区 */
.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  padding: 20rpx 30rpx;
  height: 120rpx;
  position: sticky;
  top: 0;
  z-index: 99;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15rpx;
}

.user-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  background-color: #E8F0FE;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 2rpx solid #4A90E2;
}

.user-nickname {
  font-size: 26rpx;
  font-weight: 600;
  color: #333;
}

.avatar-icon {
  font-size: 40rpx;
}

.avatar-image {
  width: 100%;
  height: 100%;
}

.header-center {
  flex: 1;
}

.add-module-btn {
  font-size: 36rpx;
  color: #fff;
  font-weight: 600;
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background-color: #1677ff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 8rpx rgba(22, 119, 255, 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.add-module-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.6s;
}

.add-module-btn:active {
  transform: scale(0.95);
  box-shadow: 0 1rpx 4rpx rgba(22, 119, 255, 0.4);
}

.add-module-btn:active::before {
  left: 100%;
}

/* 双数据卡片 */
.dual-card-section {
  display: flex;
  padding: 30rpx;
  gap: 20rpx;
}

.monthly-card {
  flex: 1;
  border-radius: 20rpx;
  padding: 30rpx 20rpx;
  text-align: center;
  color: #fff;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.monthly-card:active {
  transform: translateY(-5rpx);
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.15);
}

.expected-card {
  background: linear-gradient(135deg, #1677ff 0%, #4096ff 100%);
}

.actual-card {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
}

.card-label {
  font-size: 28rpx;
  font-weight: 600;
  display: block;
  margin-bottom: 15rpx;
}

.card-value {
  font-size: 48rpx;
  font-weight: 700;
  display: block;
  margin-bottom: 10rpx;
}

.card-sub {
  font-size: 22rpx;
  opacity: 0.9;
  display: block;
  margin-bottom: 10rpx;
}

.card-detail {
  font-size: 20rpx;
  opacity: 0.8;
  display: block;
}

.card-divider {
  width: 1rpx;
  background: rgba(255, 255, 255, 0.3);
  margin: 20rpx 0;
}

/* 收支趋势图表样式 */
.chart-section {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin: 0 30rpx 30rpx;
}

.chart-header {
  margin-bottom: 20rpx;
}

.chart-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.chart-container {
  width: 100%;
}

.chart-grid {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 200rpx;
  margin-bottom: 20rpx;
}

.chart-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.chart-date {
  font-size: 20rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  height: 140rpx;
  width: 40rpx;
  gap: 4rpx;
}

.chart-bar {
  flex: 1;
  border-radius: 4rpx 4rpx 0 0;
  transition: height 0.3s ease;
}

.income-bar {
  background: linear-gradient(to top, #52c41a, #73d13d);
}

.expense-bar {
  background: linear-gradient(to top, #ff7a45, #ff9a61);
}

.chart-balance {
  font-size: 18rpx;
  font-weight: 600;
  color: #333;
  margin-top: 10rpx;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 40rpx;
  margin-top: 20rpx;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.legend-color {
  width: 16rpx;
  height: 16rpx;
  border-radius: 4rpx;
}

.income-color {
  background-color: #52c41a;
}

.expense-color {
  background-color: #ff7a45;
}

.legend-text {
  font-size: 20rpx;
  color: #666;
}

/* 账本入口 */
.ledger-entry-section {
  display: flex;
  padding: 0 30rpx;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.ledger-entry-card {
  flex: 1;
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx 20rpx;
  text-align: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.ledger-entry-card:active {
  transform: translateY(-5rpx);
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.12);
}

.ledger-icon {
  font-size: 48rpx;
  margin-bottom: 15rpx;
  display: block;
}

.ledger-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
  display: block;
}

.ledger-desc {
  font-size: 22rpx;
  color: #666;
  display: block;
}

/* 首屏核心：快捷记账操作区 */
.core-action-section {
  display: flex;
  flex-direction: row;
  padding: 0 30rpx;
  gap: 15rpx;
  margin-bottom: 30rpx;
}

/* 主记账按钮 */
.main-action-btn {
  flex: 1;
  border-radius: 24rpx;
  padding: 40rpx 15rpx;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  color: #fff;
  box-shadow: 0 6rpx 20rpx rgba(82, 196, 26, 0.3);
  transition: all 0.3s ease;
  position: relative;
}

.main-action-btn:active {
  transform: translateY(-5rpx);
  box-shadow: 0 8rpx 24rpx rgba(82, 196, 26, 0.4);
}

.main-btn-icon {
  font-size: 48rpx;
  margin-bottom: 15rpx;
}

.main-btn-text {
  font-size: 28rpx;
  font-weight: bold;
}



/* 记支出按钮 */
.expense-action-btn {
  flex: 1;
  border-radius: 24rpx;
  padding: 40rpx 15rpx;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(135deg, #ff7a45 0%, #ff9a61 100%);
  color: #fff;
  box-shadow: 0 6rpx 20rpx rgba(255, 122, 69, 0.3);
  transition: all 0.3s ease;
}

.expense-action-btn:active {
  transform: translateY(-5rpx);
  box-shadow: 0 6rpx 20rpx rgba(255, 122, 69, 0.4);
}

/* 收入按钮 */
.main-action-btn.income-btn {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  box-shadow: 0 6rpx 20rpx rgba(82, 196, 26, 0.3);
}

.main-action-btn.income-btn:active {
  box-shadow: 0 8rpx 24rpx rgba(82, 196, 26, 0.4);
}

/* 快捷选项样式 */
.quick-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 10rpx;
}

.quick-option {
  padding: 10rpx 20rpx;
  background: #f0f0f0;
  border-radius: 20rpx;
  font-size: 20rpx;
  color: #666;
  transition: all 0.3s ease;
}

.quick-option:active {
  background: #e0e0e0;
  transform: scale(0.95);
}

/* 快捷选项编辑样式 */
.form-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}

.edit-btn {
  font-size: 20rpx;
  color: #1677ff;
  cursor: pointer;
  transition: color 0.3s ease;
}

.edit-btn:active {
  color: #096dd9;
}

.quick-options-edit {
  margin-top: 10rpx;
}

.quick-option-item {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
  background: #f8f9fa;
  border-radius: 10rpx;
  padding: 10rpx;
}

.quick-option-input {
  flex: 1;
  padding: 15rpx;
  border: 1rpx solid #e8e8e8;
  border-radius: 8rpx;
  font-size: 20rpx;
  background: #fff;
}

.delete-btn {
  margin-left: 15rpx;
  font-size: 32rpx;
  color: #ff4d4f;
  cursor: pointer;
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #fff1f0;
  transition: all 0.3s ease;
}

.delete-btn:active {
  background: #ffccc7;
  transform: scale(0.9);
}

.add-option-btn {
  display: block;
  text-align: center;
  padding: 15rpx;
  background: #f6ffed;
  border: 1rpx dashed #52c41a;
  border-radius: 8rpx;
  font-size: 20rpx;
  color: #52c41a;
  margin: 15rpx 0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-option-btn:active {
  background: #e6f7ff;
  transform: scale(0.98);
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 20rpx;
  margin-top: 20rpx;
}

.cancel-btn {
  padding: 10rpx 20rpx;
  font-size: 20rpx;
  color: #666;
  cursor: pointer;
  transition: color 0.3s ease;
}

.cancel-btn:active {
  color: #333;
}

.save-btn {
  padding: 10rpx 20rpx;
  font-size: 20rpx;
  color: #1677ff;
  cursor: pointer;
  transition: color 0.3s ease;
}

.save-btn:active {
  color: #096dd9;
}

/* 快捷记账卡片样式 */
.quick-expense-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15rpx;
  margin-top: 15rpx;
}

/* 主要快捷记账卡片 */
.quick-expense-cards.main-cards {
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.quick-expense-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 16rpx;
  padding: 25rpx;
  text-align: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.quick-expense-card.main-card {
  background: linear-gradient(135deg, #e6f7ff 0%, #91d5ff 100%);
  padding: 35rpx;
  border-radius: 20rpx;
  box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.15);
}

.quick-expense-card.main-card:active {
  transform: translateY(-8rpx);
  box-shadow: 0 10rpx 20rpx rgba(0, 0, 0, 0.2);
}

.card-name {
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.quick-expense-card.main-card .card-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 15rpx;
}

.card-amount {
  font-size: 32rpx;
  font-weight: bold;
  color: #1677ff;
  display: block;
}

.quick-expense-card.main-card .card-amount {
  font-size: 40rpx;
  font-weight: bold;
  color: #1677ff;
}

/* 详细表单样式 */
.detailed-form {
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 25rpx;
  margin-top: 20rpx;
  border: 1rpx solid #e8e8e8;
}

/* 金额输入框 */
.amount-input {
  width: 120rpx;
  margin-left: 10rpx;
}

.btn-icon {
  font-size: 64rpx;
  margin-bottom: 20rpx;
}

.btn-text {
  font-size: 36rpx;
  font-weight: bold;
}

/* 计薪模式选择弹窗样式 */
.wage-mode-options {
  margin: 30rpx 0;
}

.wage-mode-option {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.option-radio {
  font-size: 32rpx;
  margin-right: 20rpx;
  color: #52c41a;
}

.option-text {
  flex: 1;
  font-size: 26rpx;
  color: #333;
  line-height: 1.4;
}

.modal-subtext {
  font-size: 22rpx;
  color: #999;
  text-align: center;
  margin-bottom: 30rpx;
  line-height: 1.4;
}

/* 邀请码输入框 */
.invite-code-input {
  background-color: #FFF9E6;
  border: 1rpx solid #FFD700;
  border-radius: 10rpx;
  padding: 20rpx;
  font-size: 24rpx;
  color: #333;
}

/* 单价和数量并排显示 */
.price-quantity-group {
  margin-bottom: 20rpx;
}

.price-quantity-row {
  display: flex;
  gap: 20rpx;
}

.price-quantity-item {
  flex: 1;
}

/* 金额显示 */
.amount-display {
  font-size: 32rpx;
  font-weight: bold;
  color: #1677ff;
  margin-top: 10rpx;
  display: block;
}

/* 添加按钮 */
.add-buttons {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
  margin: 30rpx 0;
}

.add-button {
  width: 100%;
  height: 80rpx;
  border: 1rpx solid #52c41a;
  background-color: #f6ffed;
  color: #52c41a;
  border-radius: 10rpx;
  font-size: 28rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.add-button:active {
  background-color: #e6f7ff;
  transform: scale(0.98);
}

/* 上传按钮 */
.upload-btn {
  margin-left: 15rpx;
  padding: 10rpx 15rpx;
  background-color: #f0f0f0;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.upload-btn:active {
  background-color: #e0e0e0;
  transform: scale(0.95);
}

.upload-icon {
  font-size: 28rpx;
}

/* 底部极简辅助入口区 */
.auxiliary-entry-section {
  display: flex;
  padding: 0 30rpx;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.auxiliary-card {
  flex: 1;
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx 20rpx;
  text-align: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.auxiliary-card:active {
  transform: translateY(-5rpx);
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.12);
}

.auxiliary-icon {
  font-size: 48rpx;
  margin-bottom: 15rpx;
  display: block;
}

.auxiliary-title {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
  display: block;
}

.auxiliary-desc {
  font-size: 20rpx;
  color: #666;
  display: block;
}

/* 自定义模块区样式 */
.custom-modules-section {
  display: flex;
  flex-wrap: wrap;
  padding: 0 30rpx;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.custom-module-card {
  flex: 1;
  min-width: 30%;
  max-width: 48%;
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx 20rpx;
  text-align: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200rpx;
}

.custom-module-card .module-title {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.custom-module-card .module-desc {
  font-size: 20rpx;
  color: #666;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  max-height: 48rpx;
  line-height: 24rpx;
}

/* 响应式调整 */
@media (max-width: 750rpx) {
  .custom-module-card {
    min-width: 45%;
    max-width: 48%;
  }
  
  .custom-module-card .module-title {
    font-size: 24rpx;
  }
  
  .custom-module-card .module-desc {
    font-size: 18rpx;
  }
}

@media (max-width: 480rpx) {
  .custom-module-card {
    min-width: 100%;
    max-width: 100%;
  }
  
  .custom-module-card .module-title {
    font-size: 28rpx;
  }
  
  .custom-module-card .module-desc {
    font-size: 22rpx;
    -webkit-line-clamp: 3;
    max-height: 72rpx;
  }
}

/* 添加模块按钮 */
.add-module-card {
  flex: 1;
  min-width: 30%;
  max-width: 48%;
  background: #f6ffed;
  border: 2rpx dashed #52c41a;
  border-radius: 20rpx;
  padding: 30rpx 20rpx;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.add-module-card:active {
  background: #e6f7ff;
  transform: scale(0.98);
}

.add-module-icon {
  font-size: 48rpx;
  margin-bottom: 15rpx;
  color: #52c41a;
}

.add-module-text {
  font-size: 24rpx;
  color: #52c41a;
  font-weight: 500;
}

.custom-module-card:active {
  transform: translateY(-5rpx);
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.12);
}

.custom-module-card.editing {
  background: #fff1f0;
  box-shadow: 0 4rpx 16rpx rgba(255, 77, 79, 0.2);
  animation: shake 0.5s infinite;
}

.custom-module-card.dragging {
  transform: scale(1.05);
  z-index: 10;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.2);
}

/* 抖动动画 */
@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5rpx);
  }
  75% {
    transform: translateX(5rpx);
  }
}

/* 编辑模式提示 */
.edit-mode-hint {
  position: fixed;
  bottom: 150rpx;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 15rpx 30rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  z-index: 999;
  animation: fadeInOut 2s ease-in-out;
}

/* 模块容器样式 */
.module-container {
  margin-bottom: 30rpx;
}

.module-wrapper {
  position: relative;
  transition: all 0.3s ease;
  border-radius: 20rpx;
  overflow: hidden;
}

.module-wrapper.editing {
  animation: shake 0.5s infinite;
  box-shadow: 0 4rpx 16rpx rgba(255, 77, 79, 0.2);
}

.module-wrapper.dragging {
  transform: scale(1.02);
  z-index: 10;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.2);
}

@keyframes fadeInOut {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(20rpx);
  }
  10% {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  90% {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) translateY(20rpx);
  }
}

.module-icon {
  font-size: 48rpx;
  margin-bottom: 15rpx;
  display: block;
}

.module-title {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
  display: block;
}

.module-desc {
  font-size: 20rpx;
  color: #666;
  display: block;
}

.delete-icon {
  position: absolute;
  top: 10rpx;
  right: 15rpx;
  font-size: 32rpx;
  color: #ff4d4f;
  background: #fff;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  display: flex;
  flex-direction: column;
  z-index: 9999;
  overflow: hidden;
}

.modal-content {
  background: #fff;
  padding: 40rpx;
  width: 100%;
  height: 100%;
  text-align: center;
  overflow-y: auto;
  position: relative;
  z-index: 1000;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.modal-subtitle {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 30rpx;
  display: block;
}

.core-modules-list {
  margin-bottom: 30rpx;
}

.core-module-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background-color: #f8f9fa;
  border-radius: 12rpx;
  margin-bottom: 15rpx;
  transition: all 0.3s ease;
}

.core-module-item:active {
  background-color: #e8f0fe;
  transform: translateX(10rpx);
}

.core-module-item .module-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
  width: 60rpx;
  text-align: center;
}

.core-module-item .module-info {
  flex: 1;
}

.core-module-item .module-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 5rpx;
  display: block;
}

.core-module-item .module-desc {
  font-size: 22rpx;
  color: #666;
  display: block;
}

.core-module-item .add-icon {
  font-size: 32rpx;
  color: #1677ff;
  font-weight: 600;
  width: 50rpx;
  text-align: center;
}

.modal-desc {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 30rpx;
  line-height: 1.5;
}

.modal-btn {
  width: 100%;
  height: 80rpx;
  border-radius: 10rpx;
  font-size: 28rpx;
  font-weight: bold;
  margin-top: 20rpx;
}

.modal-btn.primary {
  background-color: #1677ff;
  color: #fff;
}

.modal-btn.secondary {
  background-color: #f5f5f5;
  color: #333;
}

.modal-actions {
  display: flex;
  gap: 15rpx;
  margin-top: 30rpx;
}

.form-group {
  margin-bottom: 25rpx;
}

.form-label {
  display: block;
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 10rpx;
}

.form-input {
  width: 100%;
  height: 70rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 10rpx;
  padding: 0 20rpx;
  font-size: 24rpx;
  background-color: #fff;
}

.form-picker {
  width: 100%;
  height: 70rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 10rpx;
  padding: 0 20rpx;
  display: flex;
  align-items: center;
  background-color: #fff;
}

.form-picker-text {
  font-size: 24rpx;
  color: #666;
}

/* 下拉菜单样式 */
.dropdown-container {
  position: relative;
  width: 100%;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 2rpx solid #e0e0e0;
  border-radius: 10rpx;
  max-height: 300rpx;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  margin-top: 10rpx;
}

.dropdown-item {
  padding: 20rpx;
  font-size: 24rpx;
  color: #333;
  border-bottom: 1rpx solid #f0f0f0;
  text-align: left;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:active {
  background-color: #f5f5f5;
}

/* 上传按钮样式 */
.upload-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-left: 10rpx;
  padding: 10rpx;
  background-color: #f0f0f0;
  border-radius: 8rpx;
  min-width: 80rpx;
}

.upload-icon {
  font-size: 32rpx;
  margin-bottom: 4rpx;
}

.upload-text {
  font-size: 16rpx;
  color: #666;
}

.day-detail-list {
  margin: 20rpx 0;
  text-align: left;
}

.day-detail-item {
  display: flex;
  justify-content: space-between;
  padding: 15rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.item-type {
  font-size: 24rpx;
  color: #333;
}

.item-amount {
  font-size: 24rpx;
  font-weight: 600;
  color: #ff4d4f;
}

/* 账本Tab */
.tab-section {
  display: flex;
  padding: 0 30rpx;
  margin-bottom: 20rpx;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  font-size: 28rpx;
  color: #666;
  border-bottom: 4rpx solid transparent;
}

.tab-item.active {
  color: #1677ff;
  font-weight: 600;
  border-bottom-color: #1677ff;
}

/* 日期筛选区 */
.date-filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30rpx;
  margin-bottom: 20rpx;
}

.date-btn {
  background: #1677ff;
  color: #fff;
  padding: 15rpx 30rpx;
  border-radius: 30rpx;
  font-size: 26rpx;
}

.date-selector {
  display: flex;
  align-items: center;
  font-size: 26rpx;
  color: #666;
}

.arrow {
  margin-left: 8rpx;
  font-size: 20rpx;
}

/* 优化后的日历模块 */
.calendar-section {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin: 0 30rpx 30rpx;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.calendar-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.calendar-stats {
  font-size: 22rpx;
  color: #666;
}

.week-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10rpx;
  margin-bottom: 15rpx;
}

.week-day {
  text-align: center;
  font-size: 24rpx;
  color: #999;
  font-weight: 600;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10rpx;
}

.calendar-day {
  aspect-ratio: 1;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.empty-day {
  background: transparent;
}

.today {
  border: 3rpx solid #1677ff;
  animation: breathe 2s ease-in-out infinite;
}

@keyframes breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.sunday {
  background: #f5f7fa;
  color: #999;
}

.has-checkin {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  color: #fff;
}

.has-expense {
  background: linear-gradient(135deg, #faad14 0%, #ffc53d 100%);
  color: #fff;
}

.continuous {
  background: linear-gradient(135deg, #1677ff 0%, #4096ff 100%);
  color: #fff;
}

.day-number {
  font-size: 26rpx;
  font-weight: 600;
}

.day-icon {
  font-size: 16rpx;
  position: absolute;
  bottom: 4rpx;
  right: 4rpx;
}

/* 模块操作菜单 */
.module-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.module-menu {
  background: #fff;
  border-radius: 20rpx;
  width: 80%;
  max-width: 500rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.menu-header {
  padding: 25rpx;
  border-bottom: 1rpx solid #f0f0f0;
  text-align: center;
}

.menu-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.menu-content {
  padding: 30rpx 25rpx;
}

.size-preview-section {
  margin-bottom: 30rpx;
}

.preview-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.size-preview-container {
  display: flex;
  gap: 15rpx;
  justify-content: space-between;
}

.size-preview {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15rpx;
  border-radius: 12rpx;
  border: 2rpx solid #e8e8e8;
  transition: all 0.3s ease;
}

.size-preview.active {
  border-color: #1677ff;
  background-color: #e6f7ff;
}

.preview-box {
  width: 100%;
  height: 60rpx;
  background-color: #f0f0f0;
  border-radius: 8rpx;
  margin-bottom: 10rpx;
}

.size-text {
  font-size: 20rpx;
  color: #666;
  font-weight: 500;
}

.menu-actions {
  display: flex;
  gap: 20rpx;
  justify-content: space-around;
}

.action-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx;
  border-radius: 12rpx;
  background-color: #f8f9fa;
  transition: all 0.3s ease;
}

.action-item:active {
  background-color: #e9ecef;
  transform: scale(0.95);
}

.action-icon {
  font-size: 40rpx;
  margin-bottom: 10rpx;
}

.action-text {
  font-size: 24rpx;
  color: #333;
  font-weight: 500;
}

/* 底部固定操作栏 */
.bottom-action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: #fff;
  padding: 15rpx 30rpx;
  box-shadow: 0 -2rpx 20rpx rgba(0, 0, 0, 0.1);
  z-index: 100;
  border-top: 1rpx solid #f0f0f0;
}

.bottom-action-bar .action-btn {
  flex: 1;
  margin: 0 8rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 15rpx 10rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;
  position: relative;
  transition: all 0.3s ease;
  min-height: 100rpx;
}

.bottom-action-bar .action-btn:hover {
  background: #f8f9fa;
}

.bottom-action-bar .action-btn:active {
  background: #e9ecef;
  transform: translateY(2rpx);
}

.bottom-action-bar .action-btn.editing {
  background: #fff1f0;
  box-shadow: 0 4rpx 16rpx rgba(255, 77, 79, 0.2);
  animation: shake 0.5s infinite;
}

.bottom-action-bar .action-btn.dragging {
  transform: scale(1.05);
  z-index: 10;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.2);
}

.bottom-action-bar .btn-icon {
  font-size: 48rpx;
  margin-bottom: 8rpx;
}

.bottom-action-bar .btn-text {
  font-size: 22rpx;
  font-weight: 500;
  line-height: 1.2;
}

.bottom-action-bar .delete-icon {
  position: absolute;
  top: 5rpx;
  right: 5rpx;
  font-size: 24rpx;
  color: #ff4d4f;
  background: #fff;
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

/* 邀请码弹窗描述样式 */
.modal-desc {
  font-size: 24rpx;
  color: #666;
  line-height: 1.4;
  text-align: center;
  margin-bottom: 30rpx;
}
/* 底部滑入式记账面板 */
.expense-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: flex-end;
  animation: fadeIn 0.3s ease;
}

.expense-panel {
  background: #fff;
  border-radius: 30rpx 30rpx 0 0;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

/* 顶部操作栏 */
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.cancel-btn {
  font-size: 32rpx;
  color: #666;
  font-weight: 600;
}

.panel-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.history-btn {
  font-size: 28rpx;
  color: #1677ff;
  font-weight: 600;
}

/* 金额输入区 */
.amount-input-section {
  padding: 40rpx 30rpx;
  text-align: center;
}

.amount-display {
  font-size: 64rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.date-section {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10rpx;
  margin-bottom: 30rpx;
}

.date-label {
  font-size: 24rpx;
  color: #666;
}

.date-icon {
  font-size: 24rpx;
}

.amount-input {
  width: 100%;
  height: 80rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 10rpx;
  padding: 0 30rpx;
  font-size: 32rpx;
  text-align: center;
  background: #fafafa;
}

/* 分类区 */
.category-section {
  padding: 0 30rpx 30rpx;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
}

.category-card {
  background: #f5f5f5;
  border-radius: 16rpx;
  padding: 20rpx;
  text-align: center;
  transition: all 0.3s ease;
}

.category-card.selected {
  background: #1677ff;
  color: #fff;
}

.category-icon {
  font-size: 48rpx;
  margin-bottom: 10rpx;
  display: block;
}

.category-name {
  font-size: 24rpx;
  font-weight: 500;
}

/* 快捷模板区 */
.template-section {
  padding: 0 30rpx 30rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
}

.template-scroll {
  display: flex;
  gap: 20rpx;
  overflow-x: auto;
  padding-bottom: 10rpx;
}

.template-card {
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 20rpx;
  min-width: 150rpx;
  text-align: center;
  border: 1rpx solid #e0e0e0;
}

.template-name {
  font-size: 22rpx;
  color: #666;
  margin-bottom: 5rpx;
  display: block;
}

.template-amount {
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
}

/* 固定支出设置 */
.fixed-expense-section {
  padding: 0 30rpx 30rpx;
}

.fixed-expense-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.fixed-expense-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.fixed-expense-switch {
  transform: scale(1.2);
}

.fixed-expense-settings {
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 20rpx;
}

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
}

.setting-label {
  font-size: 24rpx;
  color: #666;
}

.setting-input {
  width: 150rpx;
  height: 60rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 8rpx;
  padding: 0 15rpx;
  font-size: 22rpx;
}

.setting-picker {
  width: 200rpx;
  height: 60rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 8rpx;
  padding: 0 15rpx;
  display: flex;
  align-items: center;
  background: #fff;
}

.picker-text {
  font-size: 22rpx;
  color: #666;
}

/* 备注区 */
.note-section {
  padding: 0 30rpx 30rpx;
}

.note-input {
  width: 100%;
  height: 100rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 12rpx;
  padding: 15rpx;
  font-size: 24rpx;
  background: #fafafa;
}

/* 底部操作栏 */
.panel-footer {
  padding: 30rpx;
  border-top: 1rpx solid #f0f0f0;
}

.confirm-btn {
  width: 100%;
  height: 90rpx;
  background: #1677ff;
  color: #fff;
  border: none;
  border-radius: 12rpx;
  font-size: 32rpx;
  font-weight: bold;
}

/* 日期选择器 */
.date-picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.date-picker-content {
  background: #fff;
  border-radius: 20rpx;
  width: 80%;
  padding: 30rpx;
}

.date-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.picker-cancel, .picker-confirm {
  font-size: 28rpx;
  font-weight: 600;
  color: #1677ff;
}

.picker-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.date-picker-input {
  width: 100%;
  height: 80rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 10rpx;
  padding: 0 20rpx;
  font-size: 24rpx;
}

/* 标准工价提示 */
.standard-price-hint {
  font-size: 24rpx;
  color: #999;
  text-align: center;
  margin-top: 15rpx;
}

/* 工价参考 */
.price-reference {
  margin-top: 20rpx;
  padding: 15rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
}

.price-reference-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.price-reference-text {
  font-size: 28rpx; /* 14号字体 */
  color: #666;
  flex: 1;
  line-height: 1.4;
}

.price-reference-expand {
  font-size: 24rpx;
  color: #4A90E2;
  margin-left: 10rpx;
}

.price-reference-details {
  margin-top: 15rpx;
  padding-top: 15rpx;
  border-top: 1rpx solid #e0e0e0;
}

.price-reference-item {
  margin-bottom: 10rpx;
  display: flex;
  align-items: flex-start;
}

.price-reference-label {
  font-size: 24rpx;
  color: #999;
  width: 150rpx;
  flex-shrink: 0;
}

.price-reference-value {
  font-size: 24rpx;
  color: #333;
  flex: 1;
  line-height: 1.4;
}

.price-reference-feedback {
  margin-top: 15rpx;
  display: flex;
  align-items: center;
}

.feedback-label {
  font-size: 24rpx;
  color: #999;
  margin-right: 15rpx;
}

.feedback-buttons {
  display: flex;
  gap: 10rpx;
  flex: 1;
}

.feedback-btn {
  flex: 1;
  height: 60rpx;
  font-size: 22rpx;
  padding: 0;
  border: 1rpx solid #e0e0e0;
  background: #fff;
  color: #666;
  border-radius: 8rpx;
}

/* 细分品类提示条 */
.category-hint {
  margin-top: 20rpx;
  padding: 15rpx;
  background: rgba(74, 144, 226, 0.1);
  border-radius: 8rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hint-text {
  font-size: 32rpx; /* 16号加粗字体 */
  color: rgba(74, 144, 226, 0.9);
  flex: 1;
  line-height: 1.4;
}

.hint-buttons {
  display: flex;
  gap: 10rpx;
  flex-shrink: 0;
}

.hint-btn {
  padding: 10rpx 20rpx;
  border-radius: 8rpx;
  font-weight: bold;
}

.hint-btn.primary {
  background: #4A90E2;
  color: #fff;
  font-size: 36rpx; /* 18号加粗字体 */
  width: 180rpx; /* 占提示条60%宽度 */
}

.hint-btn.secondary {
  background: transparent;
  color: #666;
  border: 1rpx solid #e0e0e0;
  font-size: 32rpx; /* 16号字体 */
  width: 105rpx; /* 占提示条35%宽度 */
}

/* 细分品类选择面板 */
.category-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1200;
}

.category-panel {
  width: 100%;
  max-height: 80vh;
  background: #fff;
  border-top-left-radius: 30rpx;
  border-top-right-radius: 30rpx;
  padding: 30rpx;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
  animation: slideUp 0.3s ease;
}

.category-panel-header {
  margin-bottom: 30rpx;
}

.category-panel-close {
  width: 100%;
  height: 80rpx;
  background: #f5f5f5;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  font-size: 32rpx;
  color: #666;
  font-weight: normal;
}

.category-panel-content {
  max-height: 60vh;
  overflow-y: auto;
}

.category-group {
  margin-bottom: 30rpx;
}

.category-group-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 15rpx;
  padding-left: 10rpx;
}

.category-items {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15rpx;
}

.category-item {
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 30rpx;
  text-align: center;
  min-height: 160rpx; /* 单张卡片尺寸≥160*80dp */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2rpx solid #e0e0e0;
  transition: all 0.3s ease;
}

.category-item:active {
  background: #e0e0e0;
  transform: scale(0.98);
}

.category-item-icon {
  font-size: 48rpx;
  margin-bottom: 10rpx;
}

.category-item-name {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}
</style>