<template>
  <view class="recruitment-list-container">
    <!-- 顶部导航栏 -->
    <view class="top-nav">
      <view class="nav-bar">
        <text class="nav-back" @click="navigateBack">←</text>
        <text class="page-title">找工作</text>
        <text class="my-applications" @click="goToMyApplications">我的求职</text>
      </view>
    </view>
    
    <!-- 招聘信息内容 -->
    <view class="tab-content">
      <view class="search-section">
        <input type="text" v-model="searchKeyword" placeholder="搜索平车、裁剪、质检等工序/职位" class="search-input" @confirm="search" @focus="showHotSearch" />
        <button type="default" class="search-button" @click="search">搜索</button>
      </view>
      
      <!-- 搜索历史 -->
      <view v-if="searchHistory.length > 0 && !searchKeyword && !showHotSearchTags" class="search-history">
        <view class="history-header">
          <text class="history-title">搜索历史</text>
          <text class="clear-history" @click="clearSearchHistory">清空</text>
        </view>
        <view class="history-tags">
          <button type="default" class="history-tag" 
                  v-for="(item, index) in searchHistory" 
                  :key="index"
                  @click="searchKeyword = item; search()">
            {{item}}
          </button>
        </view>
      </view>
      
      <!-- 热门搜索标签 -->
      <view v-if="showHotSearchTags" class="hot-search-section">
        <view class="hot-search-header">
          <text class="hot-search-title">热门工种</text>
        </view>
        <view class="hot-search-tags">
          <button type="default" class="hot-search-tag" 
                  v-for="(tag, index) in hotSearchTags" 
                  :key="index"
                  @click="searchKeyword = tag; search(); showHotSearchTags = false">
            {{tag}}
          </button>
        </view>
      </view>
      
      <!-- 快速筛选栏 -->
      <view class="quick-filter-section">
        <view class="quick-filter-scroll">
          <button type="default" :class="['quick-filter-btn', activeQuickFilters.includes('seasonal') ? 'active' : '']" @click="goToSeasonalJobs">旺季高薪</button>
          <button type="default" :class="['quick-filter-btn', activeQuickFilters.includes('nearest') ? 'active' : '']" @click="setQuickFilter('nearest')">离我最近</button>
          <button type="default" :class="['quick-filter-btn', activeQuickFilters.includes('highestSalary') ? 'active' : '']" @click="setQuickFilter('highestSalary')">工价最高</button>
          <button type="default" :class="['quick-filter-btn', activeQuickFilters.includes('includeMeals') ? 'active' : '']" @click="setQuickFilter('includeMeals')">包吃包住</button>
          <button type="default" :class="['quick-filter-btn', activeQuickFilters.includes('dailyWeeklyPay') ? 'active' : '']" @click="setQuickFilter('dailyWeeklyPay')">日结周结</button>
          <button type="default" :class="['quick-filter-btn', activeQuickFilters.includes('dayShift') ? 'active' : '']" @click="setQuickFilter('dayShift')">长白班</button>
          <button type="default" :class="['quick-filter-btn', activeQuickFilters.includes('socialInsurance') ? 'active' : '']" @click="setQuickFilter('socialInsurance')">五险一金</button>
          <button type="default" :class="['quick-filter-btn', frequencyFilter === '高频' ? 'active' : '']" @click="frequencyFilter = '高频'">高频工序</button>
          <button type="default" :class="['quick-filter-btn', frequencyFilter === '低频' ? 'active' : '']" @click="frequencyFilter = '低频'">低频工序</button>
          <button type="default" :class="['quick-filter-btn', frequencyFilter === 'all' ? 'active' : '']" @click="frequencyFilter = 'all'">全品类</button>
        </view>
      </view>
      
      <!-- 城市选择 -->
      <view class="city-selection-section">
        <view class="city-selection-container">
          <text class="current-city" @click="showCitySelector">{{ userLocation || '定位中' }}</text>
          <text class="location-icon">📍</text>
          <view class="precision-filter-buttons">
            <button type="default" class="precision-filter-btn" @click="toggleFilterExpanded('processCategory')">选工种</button>
          </view>
        </view>
      </view>
      
      <!-- 工序筛选区 -->
      <view class="filter-section">
        <view class="filter-header" @click="toggleFilterExpanded('processCategory')">
          <text class="filter-title">工种/工序：</text>
          <text class="expand-icon">{{ filterExpanded.processCategory ? '▼' : '▶' }}</text>
        </view>
        <view v-if="filterExpanded.processCategory" class="filter-tags-container">
          <!-- 机种类型 -->
          <view class="category-section">
            <text class="section-label">机种类型：</text>
            <view class="category-tags">
              <button type="default" 
                      v-for="machine in machineTypes" 
                      :key="machine"
                      :class="['filter-tag-btn', selectedMachineTypes.includes(machine) ? 'active' : '']"
                      @click="toggleMachineType(machine)">
                {{machine}}
              </button>
            </view>
          </view>
          
          <!-- 大类工种 -->
          <view class="category-section">
            <text class="section-label">大类工种：</text>
            <view class="category-tags">
              <button type="default" 
                      v-for="category in processCategories" 
                      :key="category"
                      :class="['filter-tag-btn', selectedCategories.includes(category) ? 'active' : '']"
                      @click="toggleCategory(category)">
                {{category}}
              </button>
            </view>
          </view>
          
          <!-- 面料类型 -->
          <view class="category-section">
            <text class="section-label">面料类型：</text>
            <view class="category-tags">
              <button type="default" 
                      :class="['filter-tag-btn', selectedFabricTypes.includes('针织') ? 'active' : '']"
                      @click="toggleFabricType('针织')">
                针织
              </button>
              <button type="default" 
                      :class="['filter-tag-btn', selectedFabricTypes.includes('梭织') ? 'active' : '']"
                      @click="toggleFabricType('梭织')">
                梭织
              </button>
            </view>
          </view>
          
          <!-- 细分工序 -->
          <view v-if="selectedCategories.length > 0 || selectedMachineTypes.length > 0" class="subprocess-section">
            <text class="section-label">细分工序：</text>
            <view class="subprocess-tags">
              <button type="default" 
                      v-for="process in getAllSelectedCategoryProcesses()" 
                      :key="process"
                      :class="['filter-tag-btn', selectedProcesses.includes(process) ? 'active' : '']"
                      @click="toggleProcess(process)">
                {{process}}
              </button>
            </view>
          </view>
          
          <!-- 已选工序 -->
          <view v-if="selectedProcesses.length > 0" class="selected-processes">
            <text class="section-label">已选工序：</text>
            <view class="selected-tags">
              <view v-for="process in selectedProcesses" :key="process" class="selected-tag">
                <text class="tag-text">{{process}}</text>
                <text class="tag-remove" @click="removeProcess(process)">×</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <view class="recruitment-list">
        <!-- 岗位数量提示 -->
        <view class="job-count-info">
          <text>为你找到 {{filteredList.length}} 个匹配岗位</text>
        </view>
        
        <!-- 空状态提示 -->
        <view v-if="filteredList.length === 0" class="empty-state">
          <text class="empty-text">暂无匹配岗位</text>
        </view>
        
        <!-- 招聘信息卡片 -->
        <view v-else v-for="item in filteredList" :key="item.id" class="recruitment-item">
          <!-- 收藏按钮 -->
          <view class="favorite-btn" @click="toggleFavorite(item.id)">
            <text :class="['favorite-icon', isFavorite(item.id) ? 'favorited' : '']">
              {{ isFavorite(item.id) ? '★' : '☆' }}
            </text>
          </view>
          
          <!-- 卡片顶部：核心信任+基础信息 -->
          <view class="card-header">
            <view class="company-info">
              <text v-if="item.verificationType === 'enterprise'" class="verification-tag enterprise-tag">企业认证</text>
              <text v-else-if="item.verificationType === 'personal'" class="verification-tag personal-tag">个人认证</text>
              <text v-if="item.factoryLevel" :class="['factory-level-tag', 'level-' + item.factoryLevel.charAt(0).toLowerCase()]">{{item.factoryLevel}}</text>
              <text class="company-name">{{item.company}}</text>
            </view>
            <view class="trust-info">
              <text class="company-rating">{{ getCompanyRating(item.id).toFixed(1) }}分</text>
              <text class="platform-salary-tag">平台保薪</text>
            </view>
          </view>
          
          <!-- 卡片视觉焦点：核心决策信息 -->
          <view class="core-info">
            <view class="salary-section">
              <text class="salary-amount">{{item.salary}}</text>
              <text class="salary-type">{{item.salaryType || '计件/计时'}}</text>
            </view>
            <view class="distance-section">
              <text class="distance-text">{{item.location}} 距您{{getDistance(item.location)}}公里</text>
            </view>
          </view>
          
          <!-- 标签区：分类展示 -->
          <view class="tags-section">
            <!-- 技能标签 -->
            <view class="skill-tags">
              <text v-for="(skill, index) in item.skills" 
                    v-if="index < 3" 
                    :key="'skill-' + item.id + '-' + index"
                    class="skill-tag">
                {{skill}}
              </text>
            </view>
            <!-- 福利标签 -->
            <view class="benefit-tags">
              <text v-for="(benefit, key) in item.benefits" 
                    v-if="item.benefits && benefit" 
                    :key="'benefit-' + item.id + '-' + key"
                    class="benefit-tag">
                {{key === 'includeMeals' ? '包吃' : key === 'includeAccommodation' ? '包住' : key === 'socialInsurance' ? '五险一金' : ''}}
              </text>
              <text v-if="item.salaryPaymentDay" class="benefit-tag">月结</text>
              <text v-if="item.workingHours && item.workingHours.includes('白班')" class="benefit-tag">长白班</text>
            </view>
          </view>
          
          <!-- 工序照片展示 -->
          <view v-if="item.processPhotos && item.processPhotos.length > 0" class="process-photos-section">
            <text class="process-photos-label">工序照片：</text>
            <view class="process-photos-preview">
              <image v-for="(photo, index) in item.processPhotos.slice(0, 3)" 
                     :key="'process-photo-' + item.id + '-' + index"
                     :src="photo" 
                     mode="aspectFill" 
                     class="process-photo-item" 
                     @click="viewProcessPhoto(item.processPhotos, index)" />
            </view>
          </view>
          
          <!-- 卡片底部：操作入口 -->
          <view class="card-actions">
            <button type="default" class="action-btn detail-btn" @click="viewRecruitmentDetails(item.id)">查看详情</button>
            <button type="default" class="action-btn consult-btn" @click="chatWithEmployer(item.id)">一键咨询</button>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 平台入职保障 -->
    <view class="onboarding-protection">
      <view class="protection-header" @click="toggleProcessCollapse">
        <text class="protection-title">平台入职保障</text>
        <text class="protection-arrow">{{ isProcessCollapsed ? '▶' : '▼' }}</text>
      </view>
      <view v-if="!isProcessCollapsed" class="protection-content">
        <view class="protection-steps">
          <view class="protection-step" @click="showStepDetail(1)">
            <text class="step-number">1</text>
            <text class="step-text">精准匹配</text>
            <text class="step-desc">工序核验·岗位适配</text>
          </view>
          <view class="step-arrow">→</view>
          <view class="protection-step" @click="showStepDetail(2)">
            <text class="step-number">2</text>
            <text class="step-text">咨询沟通</text>
            <text class="step-desc">在线咨询·电话联系</text>
          </view>
          <view class="step-arrow">→</view>
          <view class="protection-step" @click="showStepDetail(3)">
            <text class="step-number">3</text>
            <text class="step-text">面试入职</text>
            <text class="step-desc">面试评价·确认入职</text>
          </view>
          <view class="step-arrow">→</view>
          <view class="protection-step" @click="showStepDetail(4)">
            <text class="step-number">4</text>
            <text class="step-text">结算保障</text>
            <text class="step-desc">按约结款·平台监督</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 安全提示 -->
    <view class="safety-tips">
      <text class="safety-tip-item">如遇无效、虚假、诈骗、违法信息，请举报！</text>
      <text class="safety-tip-item">招聘过程中要求押金/保证金、身份证件抵押，请举报！</text>
      <text class="safety-tip-item">实际工作内容与招聘信息不符，请举报！</text>
    </view>
    
    <!-- 留电话弹窗 -->
    <view v-if="showPhoneModalVisible" class="modal-overlay" @click="closePhoneModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">留个电话，给你推靠谱好厂✨</text>
        </view>
        <view class="modal-body">
          <view class="modal-item">
            <text class="modal-check">✅</text>
            <text class="modal-text">只推我们核实过的老厂、正规厂，不推黑厂、坑人工厂</text>
          </view>
          <view class="modal-item">
            <text class="modal-check">✅</text>
            <text class="modal-text">工价透明、准时发薪，岗位信息和实际一致不忽悠</text>
          </view>
          <view class="modal-item">
            <text class="modal-check">✅</text>
            <text class="modal-text">不瞎骚扰！只有适合你工种、离家近的好岗位才通知你</text>
          </view>
          <view class="modal-item">
            <text class="modal-check">✅</text>
            <text class="modal-text">留号即享优先安排，好岗位不用抢，我们直接对接</text>
          </view>
          
          <view class="phone-input-section">
            <input type="number" v-model="phoneNumber" placeholder="请输入常用手机号，仅用于岗位对接" class="phone-input" />
          </view>
          
          <!-- 授权选项 -->
          <view class="authorization-options">
            <label class="auth-option">
              <checkbox v-model="authOptions.platformRecommendation" />
              <text class="auth-text">同意平台推荐岗位</text>
            </label>
            <label class="auth-option">
              <checkbox v-model="authOptions.factoryContact" />
              <text class="auth-text">同意工厂联系</text>
            </label>
          </view>
          
          <text class="privacy-text">（隐私保障：你的电话仅用于匹配岗位，绝不泄露给工厂）</text>
        </view>
        <view class="modal-footer">
          <button class="cancel-button" @click="closePhoneModal">暂不</button>
          <button class="confirm-button" @click="submitPhone">留电话·优先安排靠谱厂</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getFactoryEvaluation, getWorkerEvaluation } from '../../utils/evaluation.js'
import analytics from '../../utils/analytics.js'
import { initWordLibrary, searchProcessWords, searchWithSynonyms, addToCandidatePool, getProcessCategories, getProcessByCategory, machineProcessMap } from '../../utils/process-word-library.js'
import { generateSimilarJobs, triggerRecommendationScenario, recordRecommendationAction } from '../../utils/job-recommendation.js'
import { validatePhoneAuth } from '../../utils/privacy-protection.js'
import { filterRecruitmentPosts, calculateProcessFrequency } from '../../utils/process-frequency-calculator.js'

export default {
  data() {
    return {
      searchKeyword: '',
      currentFilter: {},
      // 快速筛选
      activeQuickFilters: [], // 支持多选
      recruitmentFilter: {
        location: '',
        processes: [],
        categories: []
      },
      // 筛选类别展开状态
      filterExpanded: {
        recruitmentLocation: false,
        processCategory: false
      },
      // 工序相关
      processCategories: [],
      selectedCategories: [],
      selectedProcesses: [],
      searchHistory: [],
      // 面料类型
      selectedFabricTypes: [],
      // 机种类型
      machineTypes: ['平车', '双针', '三线拷边', '四线拷边', '五线拷边', '小方头', '大方头', '平头锁眼机', '圆头锁眼机', '钉扣机', '打枣车', '埋夹机', '挑脚车', '人字车'],
      selectedMachineTypes: [],
      // 留电话弹窗
      showPhoneModalVisible: false,
      phoneNumber: '',
      currentJobId: null,
      authOptions: {
        platformRecommendation: false,
        factoryContact: false
      },
      // 折叠状态
      collapsedItems: {},
      // 更多菜单状态
      moreMenuVisible: {},
      // 新用户引导
      showNewUserGuide: false,
      // 懒加载相关
      pageSize: 20,
      currentPage: 1,
      isLoading: false,
      hasMore: true,
      recruitmentList: [],
      // 入职流程展开状态
      isProcessCollapsed: false,
      // 地区筛选
      hotCities: ['广州', '深圳', '东莞', '佛山', '中山', '珠海', '惠州', '江门', '肇庆', '汕头'],
      selectedCities: [],
      showAllCitiesModal: false,
      // 热门搜索
      showHotSearchTags: false,
      hotSearchTags: ['平车熟练工', '服装质检', '裁剪师', '锁边工', '整烫工', '拷边工', '质检员', '缝纫工'],
      // 定位相关
      userLocation: '',
      locationPermissionGranted: false,
      // 下拉刷新
      refreshing: false,
      // 收藏相关
      favoriteJobs: [],
      // 高低频筛选
      frequencyFilter: 'all',
      frequencyOptions: [
        { value: 'all', label: '全品类' },
        { value: '高频', label: '高频工序' },
        { value: '低频', label: '低频工序' }
      ]
    }
  },
  computed: {
    filteredList() {
      let list = [...this.recruitmentList];
      
      // 获取用户的计薪模式
      const userWageMode = uni.getStorageSync('wageMode') || 'piecework';
      
      // 按计薪模式筛选岗位
      list = list.filter(item => {
        // 如果岗位没有计薪模式，默认按计件处理
        if (!item.wageMode) return true;
        // 只显示与用户计薪模式匹配的岗位
        return item.wageMode === userWageMode;
      });
      
      // 搜索筛选
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase();
        // 按优先级排序：工序名/岗位类型 > 岗位名 > 工厂名
        list = list.filter(item => {
          // 检查是否包含工序关键词（计件）
          const hasProcess = item.skills && item.skills.some(skill => 
            skill.toLowerCase().includes(keyword)
          );
          // 检查是否包含岗位类型关键词（计时）
          const hasJobType = item.hourlyJobTypes && item.hourlyJobTypes.some(jobType => 
            jobType.toLowerCase().includes(keyword)
          );
          // 检查是否包含岗位名关键词
          const hasTitle = item.title.toLowerCase().includes(keyword);
          // 检查是否包含工厂名关键词
          const hasCompany = item.company.toLowerCase().includes(keyword);
          // 检查是否包含描述关键词
          const hasDescription = item.description.toLowerCase().includes(keyword);
          
          return hasProcess || hasJobType || hasTitle || hasCompany || hasDescription;
        }).sort((a, b) => {
          // 按优先级排序
          const aHasProcess = a.skills && a.skills.some(skill => 
            skill.toLowerCase().includes(keyword)
          );
          const bHasProcess = b.skills && b.skills.some(skill => 
            skill.toLowerCase().includes(keyword)
          );
          
          const aHasJobType = a.hourlyJobTypes && a.hourlyJobTypes.some(jobType => 
            jobType.toLowerCase().includes(keyword)
          );
          const bHasJobType = b.hourlyJobTypes && b.hourlyJobTypes.some(jobType => 
            jobType.toLowerCase().includes(keyword)
          );
          
          if ((aHasProcess || aHasJobType) && !(bHasProcess || bHasJobType)) return -1;
          if (!(aHasProcess || aHasJobType) && (bHasProcess || bHasJobType)) return 1;
          
          const aHasTitle = a.title.toLowerCase().includes(keyword);
          const bHasTitle = b.title.toLowerCase().includes(keyword);
          
          if (aHasTitle && !bHasTitle) return -1;
          if (!aHasTitle && bHasTitle) return 1;
          
          const aHasCompany = a.company.toLowerCase().includes(keyword);
          const bHasCompany = b.company.toLowerCase().includes(keyword);
          
          if (aHasCompany && !bHasCompany) return -1;
          if (!aHasCompany && bHasCompany) return 1;
          
          return 0;
        });
      }
      
      // 地点筛选
      if (this.selectedCities.length > 0) {
        list = list.filter(item => this.selectedCities.some(city => item.location.includes(city)));
      }
      
      // 保留原有的地点筛选逻辑，与新的城市筛选并行
      if (this.recruitmentFilter.location) {
        list = list.filter(item => item.location.includes(this.recruitmentFilter.location));
      }
      
      // 工序筛选（仅对计件岗位）
      if (this.selectedProcesses.length > 0) {
        list = list.filter(item => {
          // 计件岗位：检查工序
          if (item.wageMode === 'piecework') {
            return item.skills && this.selectedProcesses.every(process => 
              item.skills.includes(process)
            );
          }
          // 计时岗位：不筛选工序
          return true;
        });
      }
      
      // 面料类型筛选
      if (this.selectedFabricTypes.length > 0) {
        list = list.filter(item => {
          return item.type && this.selectedFabricTypes.includes(item.type);
        });
      }
      
      // 机种类型筛选
      if (this.selectedMachineTypes.length > 0) {
        list = list.filter(item => {
          return item.skills && this.selectedMachineTypes.some(machine => 
            item.skills.some(skill => skill.includes(machine))
          );
        });
      }
      
      // 快速筛选（支持多选）
      if (this.activeQuickFilters.includes('nearest')) {
        list.sort((a, b) => this.getDistance(a.location) - this.getDistance(b.location));
      }
      
      if (this.activeQuickFilters.includes('highestSalary')) {
        list.sort((a, b) => {
          const salaryA = this.getSalaryValue(a.salary);
          const salaryB = this.getSalaryValue(b.salary);
          return salaryB - salaryA;
        });
      }
      
      if (this.activeQuickFilters.includes('includeMeals')) {
        list = list.filter(item => item.benefits && item.benefits.includeMeals && item.benefits.includeAccommodation);
      }
      
      if (this.activeQuickFilters.includes('dailyWeeklyPay')) {
        list = list.filter(item => item.salaryType && (item.salaryType.includes('日结') || item.salaryType.includes('周结')));
      }
      
      if (this.activeQuickFilters.includes('longTerm')) {
        list = list.filter(item => item.salaryType && item.salaryType.includes('月结'));
      }
      
      // 高低频筛选
      if (this.frequencyFilter !== 'all') {
        list = list.filter(item => item.frequency === this.frequencyFilter);
      }
      
      // 加载用户技能并按匹配度排序
      const userSkills = uni.getStorageSync('workerSkills') || [];
      if (userSkills.length > 0) {
        list = list.sort((a, b) => {
          let matchScoreA = 0;
          let matchScoreB = 0;
          
          // 计件岗位：匹配工序
          if (a.wageMode === 'piecework') {
            matchScoreA = this.calculateMatchScore(a.skills || [], userSkills);
          }
          // 计时岗位：暂时不计算匹配度
          
          if (b.wageMode === 'piecework') {
            matchScoreB = this.calculateMatchScore(b.skills || [], userSkills);
          }
          
          // 按匹配度降序排序
          if (matchScoreA !== matchScoreB) {
            return matchScoreB - matchScoreA;
          }
          
          // 匹配度相同，按距离排序
          const distanceA = this.getDistance(a.location);
          const distanceB = this.getDistance(b.location);
          if (distanceA !== distanceB) {
            return distanceA - distanceB;
          }
          
          // 距离相同，按工价排序
          const salaryA = this.getSalaryValue(a.salary);
          const salaryB = this.getSalaryValue(b.salary);
          return salaryB - salaryA;
        });
      }
      
      return list;
    }
  },
  methods: {
    // 计算匹配度分数
    calculateMatchScore(jobSkills, userSkills) {
      if (!jobSkills || jobSkills.length === 0) return 0;
      if (!userSkills || userSkills.length === 0) return 0;
      
      let matchedCount = 0;
      jobSkills.forEach(skill => {
        if (userSkills.includes(skill)) {
          matchedCount++;
        }
      });
      
      return Math.round((matchedCount / jobSkills.length) * 100);
    },
    
    // 监听返回按钮
    onBackPress() {
      this.navigateBack();
      return true;
    },
    
    // 初始化滑动返回
    initSwipeBack() {
      // 在APP端启用原生滑动返回
      if (uni.getSystemInfoSync().platform === 'android' || uni.getSystemInfoSync().platform === 'ios') {
        uni.pageScrollTo({ scrollTop: 0, duration: 0 });
      }
    },
    // 页面加载
    onLoad() {
      // 页面加载时统计
      this.pageLoadTime = Date.now();
      this.hasInteraction = false;
      
      // 初始化数据
      this.initData();
      
      // 初始化工序词库
      this.initProcessWordLibrary();
      
      // 申请定位权限
      this.requestLocationPermission();
      
      // 初始化滑动返回
      this.initSwipeBack();
    },
    
    // 初始化数据
    initData() {
      // 模拟工人ID（实际应从用户登录信息获取）
      const workerId = 1;
      
      // 使用新的筛选函数获取招聘信息
      const filteredPosts = filterRecruitmentPosts(workerId, 2); // 2=全品类
      
      // 从本地存储加载招聘信息
      const storedRecruitments = uni.getStorageSync('recruitments') || [];
      if (storedRecruitments.length > 0) {
        // 为存储的招聘信息添加工序频率信息
        this.recruitmentList = storedRecruitments.map(post => {
          // 查找对应的工序频率信息
          const frequencyInfo = filteredPosts.find(p => p.post_id === post.id);
          return {
            ...post,
            frequency: frequencyInfo ? frequencyInfo.frequency : '低频' // 默认低频
          };
        });
      } else {
        // 如果没有存储的招聘信息，使用默认数据
        const defaultRecruitments = [
          {
            id: 1,
            title: '平车熟练工',
            company: '衣起赚服装厂',
            salary: '6500-9500元/月',
            location: '广州',
            experience: '2年以上相关经验，技术稳定优先',
            experienceLevel: 3,
            description: '熟练操作平车，主要负责服装的基础缝制工作，要求工作认真负责，服从安排。工厂环境整洁，管理规范，按时发工资。',
            publishDate: '2026-03-03',
            applicantCount: 18,
            type: '针织',
            skills: ['平车', '平车开袋', '平车上拉链'],
            wechat: 'yiqizhuan888',
            phone: '13800138000',
            factoryPhotos: [
              'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20clothing%20factory%20interior%20design%20office&image_size=landscape_4_3',
              'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=clothing%20factory%20production%20line%20workers%20sewing&image_size=landscape_4_3',
              'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=factory%20dormitory%20clean%20comfortable%20living%20space&image_size=landscape_4_3',
              'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=factory%20canteen%20clean%20food%20service&image_size=landscape_4_3'
            ],
            benefits: {
              includeMeals: true,
              includeAccommodation: true,
              socialInsurance: true
            },
            verificationType: 'enterprise',
            salaryType: '月结',
            workingHours: '8:00-17:00，月休4天',
            companySize: '200-300人'
          },
          {
            id: 2,
            title: '锁边/拷边工',
            company: '广州时尚服装厂',
            salary: '6000-9000元/月',
            location: '广州白云区',
            experience: '1年以上经验，熟手优先',
            experienceLevel: 2,
            description: '熟练操作锁边机/拷边机，主要负责服装的边缘处理工作，要求技术稳定，质量意识强。工厂订单充足，工价透明。',
            publishDate: '2026-03-03',
            applicantCount: 25,
            type: '梭织',
            skills: ['锁边', '拷边', '四线拷边'],
            wechat: 'fuzhuangrenli',
            phone: '13900139000',
            factoryPhotos: [
              'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=clothing%20factory%20sewing%20workshop%20with%20machines&image_size=landscape_4_3',
              'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=factory%20dormitory%20clean%20beds&image_size=landscape_4_3',
              'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=factory%20canteen%20with%20food%20counter&image_size=landscape_4_3'
            ],
            benefits: {
              includeMeals: true,
              includeAccommodation: true,
              socialInsurance: false
            },
            verificationType: 'personal',
            salaryType: '周结',
            workingHours: '9:00-18:00，月休4天',
            companySize: '100-200人'
          },
          {
            id: 3,
            title: '整烫工',
            company: '深圳精品制衣厂',
            salary: '5500-8500元/月',
            location: '深圳宝安区',
            experience: '有经验即可，熟手优先',
            experienceLevel: 1,
            description: '负责服装的整烫工作，要求技术熟练，能够处理各种面料的熨烫。工厂环境舒适，提供免费食宿。',
            publishDate: '2026-03-03',
            applicantCount: 12,
            type: '针织',
            skills: ['大烫', '小烫', '整烫'],
            wechat: 'shenzhenzhiyi',
            phone: '13700137000',
            factoryPhotos: [
              'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=clothing%20factory%20ironing%20station&image_size=landscape_4_3',
              'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20factory%20dormitory&image_size=landscape_4_3'
            ],
            benefits: {
              includeMeals: true,
              includeAccommodation: true,
              socialInsurance: true
            },
            verificationType: 'enterprise',
            salaryType: '月结',
            workingHours: '8:30-17:30，月休4天',
            companySize: '150-250人'
          },
          {
            id: 4,
            title: '服装裁剪师',
            company: '东莞精准制衣厂',
            salary: '7000-10000元/月',
            location: '东莞虎门',
            experience: '2年以上相关经验，技术稳定优先',
            experienceLevel: 3,
            description: '负责服装版型设计和裁剪工作，要求熟悉各种面料特性，能够准确按照图纸进行裁剪。工厂提供良好的工作环境和发展空间。',
            publishDate: '2026-03-03',
            applicantCount: 8,
            type: '梭织',
            skills: ['裁剪', '排料', '版型设计'],
            wechat: 'dongguancaijian',
            phone: '13600136000',
            factoryPhotos: [
              'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=clothing%20factory%20cutting%20room%20with%20tables&image_size=landscape_4_3',
              'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20clothing%20factory%20office&image_size=landscape_4_3'
            ],
            benefits: {
              includeMeals: true,
              includeAccommodation: true,
              socialInsurance: true
            },
            verificationType: 'enterprise',
            salaryType: '月结',
            workingHours: '8:00-17:30，月休4天',
            companySize: '150-200人'
          },
          {
            id: 5,
            title: '服装质检员',
            company: '佛山品质服装厂',
            salary: '5000-7000元/月',
            location: '佛山南海',
            experience: '不限经验，想学即可',
            experienceLevel: 0,
            description: '负责服装产品的质量检验工作，要求熟悉服装质量标准，工作认真细致，责任心强。工厂订单稳定，管理规范。',
            publishDate: '2026-03-03',
            applicantCount: 15,
            type: '针织',
            skills: ['质检', '品质控制', '验货'],
            wechat: 'foshanzhijian',
            phone: '13500135000',
            factoryPhotos: [
              'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=clothing%20quality%20inspection%20area&image_size=landscape_4_3',
              'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=factory%20canteen%20modern%20clean&image_size=landscape_4_3'
            ],
            benefits: {
              includeMeals: true,
              includeAccommodation: true,
              socialInsurance: true
            },
            verificationType: 'enterprise',
            salaryType: '月结',
            workingHours: '9:00-18:00，月休4天',
            companySize: '100-150人'
          },
          {
            id: 6,
            title: '电脑平车操作工',
            company: '中山精密制衣厂',
            salary: '6000-8500元/月',
            location: '中山小榄',
            experience: '1年以上经验，熟练操作电脑平车',
            experienceLevel: 2,
            description: '主要负责使用电脑平车进行服装缝制，要求技术熟练，能够独立完成各种缝制任务。工厂提供良好的工作环境和晋升空间。',
            publishDate: '2026-03-02',
            applicantCount: 20,
            type: '针织',
            skills: ['电脑平车', '平车开袋', '平车上领'],
            wechat: 'zhongshanzhiyi',
            phone: '13400134000',
            factoryPhotos: [
              'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20computerized%20sewing%20machines%20in%20factory&image_size=landscape_4_3',
              'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=clean%20factory%20workshop%20with%20sewing%20machines&image_size=landscape_4_3'
            ],
            benefits: {
              includeMeals: true,
              includeAccommodation: true,
              socialInsurance: true
            },
            verificationType: 'enterprise',
            salaryType: '月结',
            workingHours: '8:00-17:00，月休4天',
            companySize: '150-200人'
          },
          {
            id: 7,
            title: '特种缝纫机操作工',
            company: '珠海时尚服装厂',
            salary: '6500-9000元/月',
            location: '珠海香洲',
            experience: '2年以上特种缝纫机操作经验',
            experienceLevel: 3,
            description: '熟练操作各种特种缝纫机，如冚车、锁眼机等，负责服装的特殊缝制工艺。工厂订单充足，工价高。',
            publishDate: '2026-03-01',
            applicantCount: 10,
            type: '梭织',
            skills: ['特种缝纫机', '冚车', '锁眼'],
            wechat: 'zhuhaisz',
            phone: '13300133000',
            factoryPhotos: [
              'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=specialized%20sewing%20machines%20in%20clothing%20factory&image_size=landscape_4_3',
              'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=factory%20workers%20operating%20special%20sewing%20machines&image_size=landscape_4_3'
            ],
            benefits: {
              includeMeals: true,
              includeAccommodation: true,
              socialInsurance: true
            },
            verificationType: 'enterprise',
            salaryType: '月结',
            workingHours: '8:30-17:30，月休4天',
            companySize: '100-150人'
          },
          {
            id: 8,
            title: '双针平车操作工',
            company: '汕头内衣厂',
            salary: '5500-8000元/月',
            location: '汕头潮阳',
            experience: '1年以上双针平车操作经验',
            experienceLevel: 2,
            description: '负责使用双针平车进行服装缝制，主要生产内衣产品，要求技术熟练，工作认真负责。',
            publishDate: '2026-02-29',
            applicantCount: 15,
            type: '针织',
            skills: ['双针平车', '平车合缝', '平车卷边'],
            wechat: 'shantouneiyi',
            phone: '13200132000',
            factoryPhotos: [
              'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=double%20needle%20sewing%20machine%20in%20factory&image_size=landscape_4_3',
              'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=underwear%20production%20line%20in%20factory&image_size=landscape_4_3'
            ],
            benefits: {
              includeMeals: true,
              includeAccommodation: true,
              socialInsurance: false
            },
            verificationType: 'personal',
            salaryType: '周结',
            workingHours: '9:00-18:00，月休4天',
            companySize: '80-120人'
          },
          {
            id: 9,
            title: '锁眼机操作工',
            company: '揭阳纺织品有限公司',
            salary: '5000-7500元/月',
            location: '揭阳普宁',
            experience: '有锁眼机操作经验优先',
            experienceLevel: 1,
            description: '负责使用锁眼机为服装加工扣眼，要求技术熟练，能够保证扣眼质量。工厂环境整洁，管理规范。',
            publishDate: '2026-02-28',
            applicantCount: 8,
            type: '梭织',
            skills: ['锁眼机', '锁眼'],
            wechat: 'jieyangfz',
            phone: '13100131000',
            factoryPhotos: [
              'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=buttonhole%20machine%20in%20clothing%20factory&image_size=landscape_4_3',
              'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=factory%20worker%20operating%20buttonhole%20machine&image_size=landscape_4_3'
            ],
            benefits: {
              includeMeals: true,
              includeAccommodation: true,
              socialInsurance: true
            },
            verificationType: 'enterprise',
            salaryType: '月结',
            workingHours: '8:00-17:00，月休4天',
            companySize: '100-150人'
          },
          {
            id: 10,
            title: '钉扣机操作工',
            company: '梅州制衣厂',
            salary: '4500-6500元/月',
            location: '梅州梅县',
            experience: '不限经验，会操作钉扣机即可',
            experienceLevel: 0,
            description: '负责使用钉扣机为服装钉扣，工作简单易上手，要求工作认真负责。工厂提供免费培训。',
            publishDate: '2026-02-27',
            applicantCount: 22,
            type: '针织',
            skills: ['钉扣机', '钉扣'],
            wechat: 'meizhouzhiyi',
            phone: '13000130000',
            factoryPhotos: [
              'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=button%20sewing%20machine%20in%20factory&image_size=landscape_4_3',
              'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=factory%20worker%20operating%20button%20machine&image_size=landscape_4_3'
            ],
            benefits: {
              includeMeals: true,
              includeAccommodation: true,
              socialInsurance: false
            },
            verificationType: 'personal',
            salaryType: '日结',
            workingHours: '9:00-18:00，月休4天',
            companySize: '50-100人'
          },
          {
            id: 11,
            title: '冚车操作工',
            company: '广州冚车专业厂',
            salary: '6000-8500元/月',
            location: '广州番禺',
            experience: '1年以上冚车操作经验',
            experienceLevel: 2,
            description: '熟练操作冚车，主要负责服装的领口、袖口等部位的缝制，要求技术稳定，质量意识强。工厂订单充足，工价透明。',
            publishDate: '2026-03-03',
            applicantCount: 18,
            type: '针织',
            skills: ['冚车', '冚领', '冚袖'],
            wechat: 'gzhoukanche',
            phone: '13800138001',
            factoryPhotos: [
              'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=coverstitch%20machine%20in%20clothing%20factory&image_size=landscape_4_3',
              'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=factory%20worker%20operating%20coverstitch%20machine&image_size=landscape_4_3'
            ],
            benefits: {
              includeMeals: true,
              includeAccommodation: true,
              socialInsurance: true
            },
            verificationType: 'enterprise',
            salaryType: '月结',
            workingHours: '8:30-17:30，月休4天',
            companySize: '100-150人'
          },
          {
            id: 12,
            title: '烫台操作工',
            company: '深圳整烫中心',
            salary: '5000-7000元/月',
            location: '深圳龙岗',
            experience: '有烫台操作经验优先',
            experienceLevel: 1,
            description: '负责使用烫台进行服装整烫工作，要求熟悉各种面料的熨烫工艺，工作认真细致。工厂环境舒适，提供免费食宿。',
            publishDate: '2026-03-02',
            applicantCount: 15,
            type: '梭织',
            skills: ['烫台', '整烫', '熨烫'],
            wechat: 'shenzhentangtai',
            phone: '13700137001',
            factoryPhotos: [
              'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ironing%20table%20in%20clothing%20factory&image_size=landscape_4_3',
              'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=factory%20worker%20ironing%20clothes%20on%20table&image_size=landscape_4_3'
            ],
            benefits: {
              includeMeals: true,
              includeAccommodation: true,
              socialInsurance: true
            },
            verificationType: 'enterprise',
            salaryType: '周结',
            workingHours: '9:00-18:00，月休4天',
            companySize: '80-120人'
          },
          {
            id: 13,
            title: '服装包装工',
            company: '东莞包装厂',
            salary: '4000-6000元/月',
            location: '东莞大朗',
            experience: '不限经验，能吃苦耐劳',
            experienceLevel: 0,
            description: '负责服装的包装、整理和打包工作，工作简单易上手，要求工作认真负责，服从安排。工厂提供免费培训。',
            publishDate: '2026-03-01',
            applicantCount: 25,
            type: '针织',
            skills: ['包装', '整理', '打包'],
            wechat: 'dongguanbaozhuang',
            phone: '13600136001',
            factoryPhotos: [
              'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=clothing%20packaging%20area%20in%20factory&image_size=landscape_4_3',
              'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=factory%20workers%20packaging%20clothes&image_size=landscape_4_3'
            ],
            benefits: {
              includeMeals: true,
              includeAccommodation: true,
              socialInsurance: false
            },
            verificationType: 'personal',
            salaryType: '日结',
            workingHours: '8:00-17:00，月休4天',
            companySize: '150-200人'
          },
          {
            id: 14,
            title: '服装跟单员',
            company: '佛山外贸服装厂',
            salary: '5500-8000元/月',
            location: '佛山顺德',
            experience: '1年以上服装跟单经验',
            experienceLevel: 2,
            description: '负责服装订单的跟进和管理，包括生产进度、质量控制等，要求熟悉服装生产流程，沟通能力强。',
            publishDate: '2026-02-29',
            applicantCount: 10,
            type: '梭织',
            skills: ['跟单', '生产管理', '质量控制'],
            wechat: 'foshandangen',
            phone: '13500135001',
            factoryPhotos: [
              'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=clothing%20factory%20office%20with%20computers&image_size=landscape_4_3',
              'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=factory%20manager%20checking%20production%20progress&image_size=landscape_4_3'
            ],
            benefits: {
              includeMeals: true,
              includeAccommodation: true,
              socialInsurance: true
            },
            verificationType: 'enterprise',
            salaryType: '月结',
            workingHours: '9:00-18:00，月休4天',
            companySize: '100-150人'
          },
          {
            id: 15,
            title: '服装设计师助理',
            company: '深圳时尚设计公司',
            salary: '5000-7500元/月',
            location: '深圳南山',
            experience: '设计相关专业，有服装设计经验优先',
            experienceLevel: 1,
            description: '协助设计师完成服装款式设计、图纸绘制等工作，要求熟悉设计软件，有创意和审美能力。',
            publishDate: '2026-02-28',
            applicantCount: 8,
            type: '针织',
            skills: ['服装设计', 'CAD', '创意设计'],
            wechat: 'shenzhendesign',
            phone: '13400134001',
            factoryPhotos: [
              'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fashion%20design%20studio%20with%20drawing%20tables&image_size=landscape_4_3',
              'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=designer%20working%20on%20fashion%20sketches&image_size=landscape_4_3'
            ],
            benefits: {
              includeMeals: true,
              includeAccommodation: false,
              socialInsurance: true
            },
            verificationType: 'enterprise',
            salaryType: '月结',
            workingHours: '9:00-18:00，周末双休',
            companySize: '50-100人'
          }
        ];
        
        // 为默认数据添加工序频率信息
        this.recruitmentList = defaultRecruitments.map(post => {
          // 查找对应的工序频率信息
          const frequencyInfo = filteredPosts.find(p => p.post_id === post.id);
          return {
            ...post,
            frequency: frequencyInfo ? frequencyInfo.frequency : '低频' // 默认低频
          };
        });
        
        // 将默认数据保存到本地存储
        uni.setStorageSync('recruitments', this.recruitmentList);
        
        // 清除旧的本地存储数据，确保新添加的招聘信息能够正确显示
        uni.removeStorageSync('recruitments');
        uni.setStorageSync('recruitments', this.recruitmentList);
      }
      
      // 加载收藏的岗位
      this.favoriteJobs = uni.getStorageSync('favoriteJobs') || [];
    },
    
    // 初始化工序词库
    initProcessWordLibrary() {
      initWordLibrary();
      this.processCategories = getProcessCategories();
      // 加载搜索历史
      const history = uni.getStorageSync('processSearchHistory');
      if (history) {
        this.searchHistory = history;
      }
    },
    

    
    // 显示热门搜索
    showHotSearch() {
      this.showHotSearchTags = true;
    },
    
    // 搜索
    search() {
      if (!this.searchKeyword) {
        uni.showToast({
          title: '请输入工序或职位名称',
          icon: 'none'
        });
        return;
      }
      
      // 保存搜索历史
      this.saveSearchHistory(this.searchKeyword);
      
      // 检查是否是工序关键词（考虑同义词）
      const processResults = searchWithSynonyms(this.searchKeyword);
      if (processResults.length > 0) {
        // 是工序关键词，记录搜索次数
        addToCandidatePool(this.searchKeyword);
      }
      console.log('搜索关键词：', this.searchKeyword);
      console.log('搜索结果数量：', this.filteredList.length);
      this.showHotSearchTags = false;
    },
    
    // 保存搜索历史
    saveSearchHistory(keyword) {
      // 去重并限制历史记录数量
      this.searchHistory = [keyword, ...this.searchHistory.filter(item => item !== keyword)].slice(0, 10);
      uni.setStorageSync('processSearchHistory', this.searchHistory);
    },
    
    // 清空搜索历史
    clearSearchHistory() {
      this.searchHistory = [];
      uni.removeStorageSync('processSearchHistory');
    },
    
    // 快速筛选
    setQuickFilter(filter) {
      const index = this.activeQuickFilters.indexOf(filter);
      if (index > -1) {
        this.activeQuickFilters.splice(index, 1);
      } else {
        this.activeQuickFilters.push(filter);
      }
    },
    
    // 设置招聘地点筛选
    setRecruitmentLocationFilter(location) {
      this.recruitmentFilter.location = location;
    },
    

    
    // 查看公司详情
    viewCompanyDetails(companyId) {
      uni.navigateTo({
        url: './company-details?companyId=' + companyId
      });
    },
    
    // 查看招聘详情
    viewRecruitmentDetails(recruitmentId) {
      uni.navigateTo({
        url: './company-details?companyId=' + recruitmentId
      });
    },
    
    // 获取距离
    getDistance(location) {
      // 模拟距离计算
      return Math.floor(Math.random() * 10) + 1;
    },
    
    // 获取薪资数值
    getSalaryValue(salary) {
      const match = salary.match(/(\d+)\-?(\d+)?/);
      if (match) {
        if (match[2]) {
          return (parseInt(match[1]) + parseInt(match[2])) / 2;
        } else {
          return parseInt(match[1]);
        }
      }
      return 0;
    },
    
    // 查看所有照片
    viewAllPhotos(photos) {
      // 查看照片逻辑
    },
    
    // 切换折叠状态
    toggleCollapse(itemId) {
      this.$set(this.collapsedItems, itemId, !this.collapsedItems[itemId]);
    },
    
    // 切换工序标签展开状态
    toggleProcessExpand(itemId) {
      this.$set(this.collapsedItems, itemId + '-process', !this.collapsedItems[itemId + '-process']);
    },
    
    // 切换工作描述全文显示
    toggleFullDescription(itemId) {
      this.$set(this.collapsedItems, itemId + '-description', !this.collapsedItems[itemId + '-description']);
    },
    
    // 优化工作经验表达
    getExperienceText(experience) {
      // 如果是数字类型，直接返回对应的文案
      if (typeof experience === 'number') {
        const experienceMap = {
          0: '不限经验，想学即可',
          1: '有经验即可，熟手优先',
          2: '1年以上经验，熟手优先',
          3: '2年以上相关经验，技术稳定优先'
        };
        return experienceMap[experience] || '不限经验，想学即可';
      }
      
      // 处理字符串类型的经验
      if (!experience || experience === '不限') {
        return '不限经验，想学即可';
      } else if (experience.includes('1年以内')) {
        return '有经验即可，熟手优先';
      } else if (experience.includes('1-2年')) {
        return '1年以上经验，熟手优先';
      } else if (experience.includes('2年以上')) {
        return '2年以上相关经验，技术稳定优先';
      } else {
        return experience;
      }
    },
    
    // 获取公司评分
    getCompanyRating(companyId) {
      // 从真实评价数据中获取评分
      const factoryEvaluation = this.factoryEvaluation(companyId);
      if (factoryEvaluation && factoryEvaluation.weightedScore > 0) {
        return factoryEvaluation.weightedScore;
      }
      // 如果没有评价数据，返回默认值
      return 4.0;
    },
    
    // 申请工作
    applyForJob(jobId) {
      // 查找当前岗位
      const currentJob = this.recruitmentList.find(job => job.id == jobId);
      if (!currentJob) {
        uni.showToast({
          title: '岗位信息不存在',
          icon: 'none'
        });
        return;
      }
      
      // 计算技能匹配度
      const matchScore = this.calculateMatchScore(currentJob.skills || [], uni.getStorageSync('workerSkills') || []);
      
      // 低匹配度提示
      if (matchScore < 60) {
        uni.showModal({
          title: '匹配度提示',
          content: `你的技能与岗位工序匹配度较低(${matchScore}%)，是否继续申请？`,
          success: (res) => {
            if (res.confirm) {
              this.submitApplication(jobId, matchScore);
            }
          }
        });
      } else {
        uni.showModal({
          title: '申请确认',
          content: `你的技能与岗位工序匹配度为${matchScore}%，是否申请该岗位？`,
          success: (res) => {
            if (res.confirm) {
              this.submitApplication(jobId, matchScore);
            }
          }
        });
      }
    },
    
    // 提交申请
    submitApplication(jobId, matchScore) {
      // 模拟申请成功
      uni.showToast({
        title: '申请成功，等待工厂回复',
        duration: 2000
      });
      
      // 记录申请信息（包含匹配度）
      const applications = uni.getStorageSync('jobApplications') || [];
      applications.push({
        jobId,
        matchScore,
        applyTime: new Date().toISOString()
      });
      uni.setStorageSync('jobApplications', applications);
    },
    
    // 与雇主聊天
    chatWithEmployer(jobId) {
      uni.navigateTo({
        url: './chat?jobId=' + jobId
      });
    },
    
    // 留电话
    showPhoneModal(jobId) {
      this.currentJobId = jobId;
      this.showPhoneModalVisible = true;
    },
    
    // 关闭电话弹窗
    closePhoneModal() {
      this.showPhoneModalVisible = false;
    },
    
    // 提交电话
    submitPhone() {
      if (!this.phoneNumber) {
        uni.showToast({
          title: '请输入手机号',
          icon: 'none'
        });
        return;
      }
      
      // 验证授权选项
      const authValidation = validatePhoneAuth(this.authOptions);
      if (!authValidation.valid) {
        uni.showToast({
          title: authValidation.reason,
          icon: 'none'
        });
        return;
      }
      
      // 保存用户授权信息
      this.saveUserAuthInfo();
      
      // 模拟提交成功
      uni.showToast({
        title: '留号成功，我们会尽快为您匹配好岗位',
        duration: 2000
      });
      
      this.showPhoneModalVisible = false;
    },
    
    // 保存用户授权信息
    saveUserAuthInfo() {
      const userInfo = uni.getStorageSync('userInfo') || {};
      const userId = userInfo.phone || userInfo.username || Date.now().toString();
      
      // 保存留号记录
      const phoneRecords = uni.getStorageSync('phoneRecords') || {};
      phoneRecords[userId] = {
        phone: this.phoneNumber,
        authOptions: this.authOptions,
        timestamp: Date.now(),
        jobId: this.currentJobId
      };
      uni.setStorageSync('phoneRecords', phoneRecords);
      
      // 保存联系限制记录
      const contactLimits = uni.getStorageSync('contactLimits') || {};
      contactLimits[userId] = {
        lastContactTime: {}, // 工厂联系时间记录
        dailyPlatformPushes: 0,
        lastPushDate: new Date().toDateString()
      };
      uni.setStorageSync('contactLimits', contactLimits);
      
      console.log('用户授权信息已保存:', this.authOptions);
    },
    
    // 拨打电话
    makePhoneCall(phone) {
      uni.makePhoneCall({
        phoneNumber: phone
      });
    },
    
    // 举报
    reportJob(jobId) {
      uni.showModal({
        title: '举报确认',
        content: '确定要举报该招聘信息吗？',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({
              title: '举报成功',
              duration: 2000
            });
          }
        }
      });
    },
    
    // 评价工厂
    evaluateFactory(factoryId) {
      uni.navigateTo({
        url: './evaluate-factory?factoryId=' + factoryId
      });
    },
    
    // 获取工厂评价
    factoryEvaluation(factoryId) {
      return getFactoryEvaluation(factoryId);
    },
    
    // 切换筛选展开状态
    toggleFilterExpanded(filter) {
      this.$set(this.filterExpanded, filter, !this.filterExpanded[filter]);
    },
    
    // 切换工序大类选择
    toggleCategory(category) {
      const index = this.selectedCategories.indexOf(category);
      if (index > -1) {
        this.selectedCategories.splice(index, 1);
        // 移除该类别下的所有已选工序
        const categoryProcesses = getProcessByCategory(category);
        this.selectedProcesses = this.selectedProcesses.filter(process => !categoryProcesses.includes(process));
      } else {
        this.selectedCategories.push(category);
      }
    },
    
    // 获取所有选中类别的工序
    getAllSelectedCategoryProcesses() {
      let allProcesses = [];
      
      // 如果选择了机种，只显示机种对应的工序
      if (this.selectedMachineTypes.length > 0) {
        this.selectedMachineTypes.forEach(machineType => {
          const associatedProcesses = machineProcessMap[machineType] || [];
          allProcesses = [...allProcesses, ...associatedProcesses];
        });
      } else {
        // 否则显示选择分类的工序
        this.selectedCategories.forEach(category => {
          const processes = getProcessByCategory(category);
          allProcesses = [...allProcesses, ...processes];
        });
      }
      
      // 去重
      return [...new Set(allProcesses)];
    },
    
    // 切换工序选择状态
    toggleProcess(process) {
      const index = this.selectedProcesses.indexOf(process);
      if (index > -1) {
        this.selectedProcesses.splice(index, 1);
      } else {
        this.selectedProcesses.push(process);
      }
    },
    
    // 移除已选工序
    removeProcess(process) {
      const index = this.selectedProcesses.indexOf(process);
      if (index > -1) {
        this.selectedProcesses.splice(index, 1);
      }
    },
    
    // 切换面料类型选择
    toggleFabricType(fabricType) {
      const index = this.selectedFabricTypes.indexOf(fabricType);
      if (index > -1) {
        this.selectedFabricTypes.splice(index, 1);
      } else {
        this.selectedFabricTypes.push(fabricType);
      }
    },
    
    // 切换机种类型选择
    toggleMachineType(machineType) {
      const index = this.selectedMachineTypes.indexOf(machineType);
      if (index > -1) {
        // 取消选择机种，移除关联的工序
        this.selectedMachineTypes.splice(index, 1);
        // 移除该机种关联的工序
        const associatedProcesses = machineProcessMap[machineType] || [];
        this.selectedProcesses = this.selectedProcesses.filter(process => !associatedProcesses.includes(process));
      } else {
        // 选择机种，添加关联的工序
        this.selectedMachineTypes.push(machineType);
        // 添加该机种关联的工序
        const associatedProcesses = machineProcessMap[machineType] || [];
        associatedProcesses.forEach(process => {
          if (!this.selectedProcesses.includes(process)) {
            this.selectedProcesses.push(process);
          }
        });
      }
    },
    

    
    // 导航
    navigateTo(url) {
      uni.navigateTo({
        url: url
      })
    },
    // 返回上一页
    navigateBack() {
      uni.navigateBack()
    },
    // 跳转到我的求职页面
    goToMyApplications() {
      uni.navigateTo({
        url: './my-applications'
      })
    },
    // 跳转到旺季高薪推荐页面
    goToSeasonalJobs() {
      const index = this.activeQuickFilters.indexOf('seasonal');
      if (index > -1) {
        this.activeQuickFilters.splice(index, 1);
      } else {
        this.activeQuickFilters.push('seasonal');
      }
      uni.navigateTo({
        url: './seasonal-jobs'
      })
    },
    
    // 切换更多菜单
    toggleMoreMenu(itemId) {
      this.$set(this.moreMenuVisible, itemId, !this.moreMenuVisible[itemId])
    },
    
    // 推荐更多相似岗位
    recommendSimilarJobs(jobId) {
      // 查找当前岗位
      const currentJob = this.recruitmentList.find(job => job.id == jobId)
      if (!currentJob) {
        uni.showToast({
          title: '岗位信息不存在',
          icon: 'none'
        })
        return
      }
      
      // 触发推荐场景
      const scenario = triggerRecommendationScenario('主动触发', currentJob, this.getUserInfo())
      
      uni.showToast({
        title: scenario.message,
        icon: 'loading',
        duration: 1000
      })
      
      setTimeout(() => {
        // 生成相似岗位推荐
        const recommendedJobs = generateSimilarJobs(currentJob, this.recruitmentList, this.getUserInfo(), 6)
        
        if (recommendedJobs.length > 0) {
          // 记录推荐行为
          recordRecommendationAction('推荐', jobId, this.getUserId())
          
          uni.showModal({
            title: '为你推荐相似岗位',
            content: `根据您的技能和偏好，我们为您推荐了 ${recommendedJobs.length} 个相似岗位。`,
            confirmText: '查看推荐',
            cancelText: '取消',
            success: (res) => {
              if (res.confirm) {
                // 这里可以跳转到筛选后的招聘列表，或者应用相关筛选条件
                uni.showToast({
                  title: '已为您筛选相似岗位',
                  icon: 'success'
                })
                // 可以在这里实现筛选逻辑，或者跳转到新的推荐页面
              }
            }
          })
        } else {
          uni.showModal({
            title: '暂无相似岗位',
            content: '暂无相似岗位，换个条件试试吧～',
            confirmText: '刷新推荐',
            cancelText: '取消',
            success: (res) => {
              if (res.confirm) {
                this.recommendSimilarJobs(jobId)
              }
            }
          })
        }
      }, 1000)
    },
    
    // 获取用户信息
    getUserInfo() {
      const userInfo = uni.getStorageSync('userInfo') || {}
      const workerSkills = uni.getStorageSync('workerSkills') || []
      const appliedJobs = uni.getStorageSync('appliedJobs') || []
      const consultedJobs = uni.getStorageSync('consultedJobs') || []
      const favoriteJobs = uni.getStorageSync('favoriteJobs') || []
      const blockedFactories = uni.getStorageSync('blockedFactories') || []
      
      return {
        ...userInfo,
        skills: workerSkills,
        appliedJobs,
        consultedJobs,
        favoriteJobs,
        blockedFactories
      }
    },
    
    // 获取用户ID
    getUserId() {
      const userInfo = uni.getStorageSync('userInfo') || {}
      return userInfo.phone || userInfo.username || Date.now().toString()
    },
    
    // 显示步骤详情
    showStepDetail(step) {
      const stepDetails = {
        1: {
          title: '精准匹配',
          content: '工序核验·岗位适配\n\n- 工人技能工序与岗位工序精准匹配\n- 系统自动计算匹配度\n- 匹配度＜60%时会有提示\n- 工厂优先看到匹配度作为审核依据'
        },
        2: {
          title: '咨询沟通',
          content: '在线咨询·电话联系\n\n- 工人可点击「咨询」沟通细节\n- 可点击「电话」直连工厂\n- 支持留号等待工厂主动联系\n- 沟通记录自动留存作为凭证'
        },
        3: {
          title: '面试入职',
          content: '面试评价·确认入职\n\n- 面试后可提交「面试评价」\n- 评价包含3个5星维度和评价内容\n- 工厂确认入职后生成用工记录\n- 同一工人仅能对同一工厂完成1次面试评价'
        },
        4: {
          title: '结算保障',
          content: '按约结款·平台监督\n\n- 按岗位发布时的结款周期履约\n- 系统自动提醒工厂与工人结算\n- 工资拖欠可申请平台介入\n- 结算完成后可提交入职后评价'
        }
      }
      
      const detail = stepDetails[step]
      if (detail) {
        uni.showModal({
          title: detail.title,
          content: detail.content,
          showCancel: false,
          confirmText: '我知道了'
        })
      }
    },
    
    // 切换入职流程展开/收起状态
    toggleProcessCollapse() {
      this.isProcessCollapsed = !this.isProcessCollapsed
    },
    
    // 切换城市选择状态
    toggleCity(city) {
      const index = this.selectedCities.indexOf(city);
      if (index > -1) {
        this.selectedCities.splice(index, 1);
      } else {
        this.selectedCities.push(city);
      }
    },
    
    // 移除单个城市
    removeCity(city) {
      const index = this.selectedCities.indexOf(city);
      if (index > -1) {
        this.selectedCities.splice(index, 1);
      }
    },
    
    // 清空所有选中城市
    clearSelectedCities() {
      this.selectedCities = [];
    },
    
    // 显示全部城市选择弹窗
    showAllCities() {
      // 这里可以实现一个弹窗，显示所有城市供用户选择
      // 由于是示例，暂时只显示提示
      uni.showToast({
        title: '全部城市选择功能开发中',
        icon: 'none'
      });
    },
    
    // 申请定位权限
    requestLocationPermission() {
      uni.getLocation({
        type: 'wgs84',
        success: (res) => {
          this.locationPermissionGranted = true;
          // 这里可以根据经纬度获取城市信息
          // 模拟获取城市信息
          this.userLocation = '广州';
          // 默认选中当前城市
          this.selectedCities = [this.userLocation];
          uni.showToast({
            title: '定位成功，已为您推荐附近岗位',
            icon: 'success'
          });
        },
        fail: (err) => {
          console.log('定位失败:', err);
          this.locationPermissionGranted = false;
          uni.showToast({
            title: '定位失败，默认显示全国岗位',
            icon: 'none'
          });
        }
      });
    },
    
    // 下拉刷新
    onPullDownRefresh() {
      this.refreshing = true;
      // 模拟刷新数据
      setTimeout(() => {
        this.initData();
        uni.stopPullDownRefresh();
        this.refreshing = false;
        uni.showToast({
          title: '刷新成功',
          icon: 'success'
        });
      }, 1000);
    },
    
    // 上拉加载更多
    onReachBottom() {
      if (!this.isLoading && this.hasMore) {
        this.isLoading = true;
        // 模拟加载更多数据
        setTimeout(() => {
          this.currentPage++;
          // 这里可以添加加载更多数据的逻辑
          this.isLoading = false;
        }, 1000);
      }
    },
    
    // 收藏岗位
    toggleFavorite(jobId) {
      const index = this.favoriteJobs.indexOf(jobId);
      if (index > -1) {
        // 取消收藏
        this.favoriteJobs.splice(index, 1);
        uni.showToast({
          title: '取消收藏',
          icon: 'none'
        });
      } else {
        // 添加收藏
        this.favoriteJobs.push(jobId);
        uni.showToast({
          title: '收藏成功',
          icon: 'success'
        });
      }
      // 保存到本地存储
      uni.setStorageSync('favoriteJobs', this.favoriteJobs);
    },
    
    // 检查岗位是否已收藏
    isFavorite(jobId) {
      return this.favoriteJobs.includes(jobId);
    },
    // 查看工序照片
    viewProcessPhoto(photos, index) {
      uni.previewImage({
        current: photos[index],
        urls: photos,
        success: function(res) {
          console.log('预览照片成功');
        },
        fail: function(err) {
          console.log('预览照片失败', err);
        }
      });
    },
    // 显示城市选择器
    showCitySelector() {
      const cities = ['全国', '广州', '深圳', '东莞', '佛山', '中山', '珠海', '惠州', '江门', '肇庆'];
      uni.showActionSheet({
        itemList: cities,
        success: (res) => {
          if (res.tapIndex === 0) {
            // 全国
            this.selectedCities = [];
            this.userLocation = '全国';
          } else {
            const selectedCity = cities[res.tapIndex];
            this.selectedCities = [selectedCity];
            this.userLocation = selectedCity;
          }
          uni.showToast({
            title: `已切换到${this.userLocation}`,
            icon: 'success'
          });
        },
        fail: (err) => {
          console.log('选择城市失败', err);
        }
      });
    }
  }
}
</script>

<style scoped>
/* 招聘列表容器 */
.recruitment-list-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

/* 顶部导航栏 */
.top-nav {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80rpx;
}

.nav-back {
  font-size: 36rpx;
  color: #333;
  cursor: pointer;
  padding: 10rpx;
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
  text-align: center;
}

.my-applications {
  font-size: 28rpx;
  color: #4A90E2;
  font-weight: 600;
  cursor: pointer;
  padding: 10rpx;
}

/* 标签内容 */
.tab-content {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
}

/* 搜索区域 */
.search-section {
  display: flex;
  margin-bottom: 30rpx;
  padding: 0 20rpx;
  width: 100%;
  box-sizing: border-box;
  gap: 16rpx;
}

.search-input {
  flex: 7;
  height: 80rpx;
  padding: 0 20rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 16rpx;
  font-size: 28rpx;
  color: #333;
}

.search-input:focus {
  border-color: #4A90E2;
  outline: none;
}

.search-input::placeholder {
  color: #999;
  font-size: 28rpx;
}

.search-button {
  flex: 3;
  min-width: 120rpx;
  height: 80rpx;
  background-color: #4A90E2;
  color: #fff;
  border: none;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-button:active {
  background-color: #357ABD;
}

/* 搜索历史 */
.search-history {
  margin-bottom: 30rpx;
  padding: 20rpx;
  background-color: #f9f9f9;
  border-radius: 16rpx;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.history-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.clear-history {
  font-size: 24rpx;
  color: #999;
  cursor: pointer;
}

/* 热门搜索 */
.hot-search-section {
  margin-bottom: 30rpx;
  padding: 20rpx;
  background-color: #f9f9f9;
  border-radius: 16rpx;
}

.hot-search-header {
  margin-bottom: 20rpx;
}

.hot-search-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.hot-search-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.hot-search-tag {
  padding: 12rpx 20rpx;
  background-color: #fff;
  border: 1rpx solid #e0e0e0;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #333;
  margin-right: 10rpx;
  margin-bottom: 10rpx;
}

.hot-search-tag:active {
  background-color: #f0f0f0;
}

.history-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.history-tag {
  padding: 12rpx 24rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 30rpx;
  background-color: #fff;
  color: #666;
  font-size: 24rpx;
}

/* 工序标签栏 */
.process-tags-section {
  margin: 20rpx 0;
}

.process-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.process-tag {
  padding: 12rpx 24rpx;
  border: 2rpx solid #4A90E2;
  border-radius: 30rpx;
  background-color: #e3f2fd;
  color: #4A90E2;
  font-size: 24rpx;
}

.process-tag.more-tag {
  background-color: #4A90E2;
  color: #fff;
  cursor: pointer;
}

/* 工序筛选区样式 */
.category-section,
.subprocess-section,
.selected-processes {
  margin-bottom: 30rpx;
}

.section-label {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
}

.category-tags,
.subprocess-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.selected-tag {
  display: flex;
  align-items: center;
  padding: 12rpx 20rpx;
  background-color: #e3f2fd;
  border-radius: 30rpx;
  font-size: 24rpx;
  color: #4A90E2;
}

.tag-remove {
  margin-left: 12rpx;
  font-size: 28rpx;
  font-weight: bold;
  cursor: pointer;
}

/* 快速筛选栏 */
.quick-filter-section {
  margin-bottom: 16rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  padding: 0 20rpx;
}

/* 城市选择 */
.city-selection-section {
  margin-bottom: 16rpx;
  padding: 0 20rpx;
}

.city-selection-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72rpx;
  background-color: #f9f9f9;
  border-radius: 18rpx;
  padding: 0 20rpx;
}

.current-city {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  flex: 1;
}

.location-icon {
  font-size: 24rpx;
  margin: 0 10rpx;
}

/* 精准筛选按钮 */
.precision-filter-buttons {
  display: flex;
  gap: 10rpx;
}

.precision-filter-btn {
  padding: 12rpx 20rpx;
  border: 1rpx solid #4A90E2;
  border-radius: 18rpx;
  font-size: 24rpx;
  background-color: #fff;
  color: #4A90E2;
  font-weight: 600;
  white-space: nowrap;
}

.precision-filter-btn:active {
  background-color: #4A90E2;
  color: #fff;
}

/* 平台入职流程（吸顶展示） */
.onboarding-process-header {
  margin-bottom: 20rpx;
  border-radius: 12rpx;
  overflow: hidden;
  background-color: #F5F5F5;
}

.onboarding-process-header.sticky {
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.process-collapse-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12rpx 20rpx;
  height: 44rpx;
  background-color: #F5F5F5;
  cursor: pointer;
}

.process-header-text {
  font-size: 24rpx;
  font-weight: 500;
  color: #333;
}

.process-header-arrow {
  font-size: 20rpx;
  color: #666;
}

.process-steps-expanded {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 16rpx 20rpx;
  height: 80rpx;
  background-color: #fff;
  border-top: 1rpx solid #e0e0e0;
}

.process-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.step-number {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  background-color: #4A90E2;
  color: white;
  font-size: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4rpx;
}

.step-text {
  font-size: 24rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 2rpx;
}

.step-desc {
  font-size: 20rpx;
  color: #666;
  white-space: nowrap;
}

.step-arrow {
  font-size: 24rpx;
  color: #999;
  margin: 0 8rpx;
}

.quick-filter-scroll {
  display: flex;
  overflow-x: auto;
  gap: 16rpx;
  padding: 10rpx 0;
  flex: 1;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}

.quick-filter-btn {
  padding: 16rpx 30rpx;
  min-width: 80rpx;
  border: none;
  border-radius: 18rpx;
  background-color: #F5F5F5;
  color: #666666;
  font-size: 28rpx;
  font-weight: bold;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.quick-filter-btn.active {
  background-color: #4A90E2;
  color: #FFFFFF;
  font-weight: bold;
}

/* 筛选区域 */
.filter-section {
  margin-bottom: 30rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 16rpx;
  overflow: hidden;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 30rpx;
  background-color: #f9f9f9;
  cursor: pointer;
}

.filter-title {
  font-size: 28rpx;
  color: #333;
}

.expand-icon {
  font-size: 24rpx;
  color: #999;
}

.filter-tags-container {
  padding: 20rpx 30rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.filter-tag-btn {
  padding: 12rpx 24rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 30rpx;
  background-color: #f5f5f5;
  color: #666;
  font-size: 24rpx;
}

.filter-tag-btn.active {
  background-color: #4A90E2;
  color: #fff;
  border-color: #4A90E2;
}

/* 测试信息 */
.test-info {
  background-color: #f0f0f0;
  padding: 20rpx;
  border-radius: 16rpx;
  margin-bottom: 30rpx;
  font-size: 24rpx;
  color: #666;
}

/* 岗位数量提示 */
.job-count-info {
  margin-bottom: 20rpx;
  font-size: 24rpx;
  color: #666;
  padding: 10rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
  font-size: 28rpx;
}

/* 招聘信息列表 */
.recruitment-list {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}



/* 头部信息 */
.job-header {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.company-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 16rpx;
}

.avatar-img {
  width: 100%;
  height: 100%;
}

.job-info {
  flex: 1;
}

.job-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 8rpx;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}





/* 重构后的岗位卡片样式 */
.recruitment-item {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
}

.recruitment-item:active {
  transform: translateY(-5rpx);
  box-shadow: 0 6rpx 12rpx rgba(0, 0, 0, 0.15);
}

/* 卡片顶部：核心信任+基础信息 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.company-info {
  display: flex;
  align-items: center;
  gap: 10rpx;
  flex: 1;
}

.verification-tag {
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  font-size: 18rpx;
}

.verification-tag.enterprise-tag {
  background-color: #e3f2fd;
  color: #2196f3;
  border: none;
}

.verification-tag.personal-tag {
  background-color: #e8f5e8;
  color: #4caf50;
  border: none;
}

.company-name {
  font-size: 24rpx;
  color: #666;
  font-weight: 500;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.trust-info {
  display: flex;
  align-items: center;
  gap: 15rpx;
}

.company-rating {
  font-size: 20rpx;
  color: #ff9800;
  font-weight: bold;
}

.platform-salary-tag {
  padding: 6rpx 14rpx;
  background-color: #ff4d4f;
  color: #fff;
  border-radius: 12rpx;
  font-size: 18rpx;
  font-weight: 600;
}

/* 卡片视觉焦点：核心决策信息 */
.core-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 25rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.salary-section {
  flex: 1;
}

.salary-amount {
  font-size: 42rpx;
  font-weight: bold;
  color: #ff5722;
  margin-bottom: 5rpx;
  display: block;
  overflow: visible;
  text-overflow: clip;
  white-space: normal;
}

.salary-type {
  font-size: 22rpx;
  color: #666;
  background-color: #f5f5f5;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  display: inline-block;
  border: none;
}

.distance-section {
  text-align: right;
}

.distance-text {
  font-size: 24rpx;
  color: #333;
  font-weight: 500;
}

/* 标签区：分类展示 */
.tags-section {
  margin-bottom: 25rpx;
  display: block;
  margin-top: 0;
}

.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-bottom: 15rpx;
}

.skill-tag {
  padding: 8rpx 16rpx;
  background-color: #e3f2fd;
  color: #2196f3;
  border-radius: 16rpx;
  font-size: 20rpx;
  border: none;
}

.benefit-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.benefit-tag {
  padding: 8rpx 16rpx;
  background-color: #f5f5f5;
  color: #666;
  border-radius: 16rpx;
  font-size: 20rpx;
  border: none;
}

/* 收藏按钮 */
.favorite-btn {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  z-index: 10;
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.favorite-icon {
  font-size: 32rpx;
  color: #ccc;
  transition: all 0.3s ease;
}

.favorite-icon.favorited {
  color: #ffd700;
  transform: scale(1.1);
}

/* 卡片底部：操作入口 */
.card-actions {
  display: flex;
  gap: 15rpx;
}

.action-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-btn {
  background-color: #fff;
  color: #4A90E2;
  border: 1rpx solid #4A90E2;
}

.consult-btn {
  background-color: #4A90E2;
  color: #fff;
  border: none;
}

/* 工序照片展示 */
.process-photos-section {
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.process-photos-label {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 12rpx;
  display: block;
}

.process-photos-preview {
  display: flex;
  gap: 10rpx;
  overflow-x: auto;
  padding-bottom: 10rpx;
}

.process-photo-item {
  width: 120rpx;
  height: 120rpx;
  border-radius: 8rpx;
  flex-shrink: 0;
  cursor: pointer;
}

.process-photo-item:active {
  transform: scale(0.95);
  transition: transform 0.2s ease;
}

/* 留电话弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  width: 80%;
  max-width: 500rpx;
}

.modal-header {
  margin-bottom: 30rpx;
  text-align: center;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.modal-body {
  margin-bottom: 30rpx;
}

.modal-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20rpx;
}

.modal-check {
  font-size: 28rpx;
  margin-right: 16rpx;
  margin-top: 4rpx;
}

/* 平台入职保障 */
.onboarding-protection {
  margin-top: 30rpx;
  background-color: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.protection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 30rpx;
  background-color: #f9f9f9;
  cursor: pointer;
}

.protection-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.protection-arrow {
  font-size: 24rpx;
  color: #999;
}

.protection-content {
  padding: 20rpx 30rpx;
}

.protection-steps {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 16rpx 0;
}

.protection-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  cursor: pointer;
}

.step-number {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background-color: #4A90E2;
  color: white;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8rpx;
}

.step-text {
  font-size: 24rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 4rpx;
}

.step-desc {
  font-size: 20rpx;
  color: #666;
  white-space: nowrap;
}

.step-arrow {
  font-size: 24rpx;
  color: #999;
  margin: 0 8rpx;
}

.modal-text {
  flex: 1;
  font-size: 24rpx;
  color: #666;
  line-height: 1.4;
}

.phone-input-section {
  margin-top: 30rpx;
  margin-bottom: 20rpx;
}

.phone-input {
  width: 100%;
  padding: 20rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 16rpx;
  font-size: 28rpx;
}

/* 授权选项 */
.authorization-options {
  margin-top: 24rpx;
  margin-bottom: 16rpx;
}

.auth-option {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.auth-option checkbox {
  margin-right: 12rpx;
  transform: scale(1.2);
}

.auth-text {
  font-size: 24rpx;
  color: #666;
  flex: 1;
}

.privacy-text {
  font-size: 20rpx;
  color: #999;
  text-align: center;
  margin-top: 10rpx;
}

.modal-footer {
  display: flex;
  gap: 20rpx;
}

.cancel-button {
  flex: 1;
  padding: 20rpx;
  background-color: #f5f5f5;
  color: #666;
  border: 2rpx solid #e0e0e0;
  border-radius: 16rpx;
  font-size: 28rpx;
}

.confirm-button {
  flex: 2;
  padding: 20rpx;
  background-color: #FF9800;
  color: #fff;
  border: none;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: bold;
}
</style>