<template>
  <view class="recruitment-list-container">
    <!-- 顶部导航栏 -->
    <view class="top-nav">
    </view>
    
    <!-- 招聘信息内容 -->
    <view class="tab-content">
      <view class="search-section">
        <input type="text" v-model="searchKeyword" placeholder="搜索工序、职位" class="search-input" @confirm="search" />
        <button type="default" class="search-button" @click="search">搜索</button>
      </view>
      
      <!-- 搜索历史 -->
      <view v-if="searchHistory.length > 0 && !searchKeyword" class="search-history">
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
      
      <!-- 快速筛选栏 -->
      <view class="quick-filter-section">
        <view class="quick-filter-scroll">
          <button type="default" :class="['quick-filter-btn', activeQuickFilters.includes('seasonal') ? 'active' : '']" @click="goToSeasonalJobs">旺季高薪</button>
          <button type="default" :class="['quick-filter-btn', activeQuickFilters.includes('nearest') ? 'active' : '']" @click="setQuickFilter('nearest')">离我最近</button>
          <button type="default" :class="['quick-filter-btn', activeQuickFilters.includes('highestSalary') ? 'active' : '']" @click="setQuickFilter('highestSalary')">工价最高</button>
          <button type="default" :class="['quick-filter-btn', activeQuickFilters.includes('includeMeals') ? 'active' : '']" @click="setQuickFilter('includeMeals')">包吃住</button>
          <button type="default" :class="['quick-filter-btn', activeQuickFilters.includes('dailyWeeklyPay') ? 'active' : '']" @click="setQuickFilter('dailyWeeklyPay')">日结周结</button>
          <button type="default" :class="['quick-filter-btn', activeQuickFilters.includes('longTerm') ? 'active' : '']" @click="setQuickFilter('longTerm')">长期稳定</button>
        </view>
      </view>
      
      <!-- 热门城市筛选 -->
      <view class="city-filter-section">
        <view class="city-filter-scroll">
          <button type="default" :class="['city-filter-btn', selectedCities.length === 0 ? 'active' : '']" @click="clearSelectedCities">全国</button>
          <button type="default" :class="['city-filter-btn', selectedCities.includes(city) ? 'active' : '']" v-for="city in hotCities" :key="city" @click="toggleCity(city)">{{ city }}</button>
          <button type="default" class="city-filter-btn all-city-btn" @click="showAllCities">全部城市</button>
        </view>
      </view>
      
      <!-- 已选城市标签 -->
      <view v-if="selectedCities.length > 0" class="selected-cities-section">
        <view class="selected-cities-header">
          <text class="selected-cities-title">已选城市：</text>
          <text class="clear-all-cities" @click="clearSelectedCities">清空</text>
        </view>
        <view class="selected-cities-tags">
          <view v-for="city in selectedCities" :key="city" class="selected-city-tag">
            <text class="tag-text">{{ city }}</text>
            <text class="tag-remove" @click="removeCity(city)">×</text>
          </view>
        </view>
      </view>
      
      <!-- 平台入职流程（吸顶展示） -->
      <view class="onboarding-process-header" :class="{ 'sticky': true }">
        <view class="process-collapse-header" @click="toggleProcessCollapse">
          <text class="process-header-text">平台入职流程</text>
          <text class="process-header-arrow">{{ isProcessCollapsed ? '▶' : '▼' }}</text>
        </view>
        <view v-if="!isProcessCollapsed" class="process-steps-expanded">
          <view class="process-step" @click="showStepDetail(1)">
            <view class="step-number">1</view>
            <text class="step-text">精准匹配</text>
            <text class="step-desc">工序核验·岗位适配</text>
          </view>
          <view class="step-arrow">→</view>
          <view class="process-step" @click="showStepDetail(2)">
            <view class="step-number">2</view>
            <text class="step-text">咨询沟通</text>
            <text class="step-desc">在线咨询·电话联系</text>
          </view>
          <view class="step-arrow">→</view>
          <view class="process-step" @click="showStepDetail(3)">
            <view class="step-number">3</view>
            <text class="step-text">面试入职</text>
            <text class="step-desc">面试评价·确认入职</text>
          </view>
          <view class="step-arrow">→</view>
          <view class="process-step" @click="showStepDetail(4)">
            <view class="step-number">4</view>
            <text class="step-text">结算保障</text>
            <text class="step-desc">按约结款·平台监督</text>
          </view>
        </view>
      </view>
      
      <!-- 位置筛选区 -->
      <view class="filter-section">
        <view class="filter-header" @click="toggleFilterExpanded('recruitmentLocation')">
          <text class="filter-title">工作地点：</text>
          <text class="expand-icon">{{ filterExpanded.recruitmentLocation ? '▼' : '▶' }}</text>
        </view>
        <view v-if="filterExpanded.recruitmentLocation" class="filter-tags-container">
          <button type="default" :class="['filter-tag-btn', !recruitmentFilter.location ? 'active' : '']" @click="setRecruitmentLocationFilter('')">全部</button>
          <button type="default" :class="['filter-tag-btn', recruitmentFilter.location === '广州' ? 'active' : '']" @click="setRecruitmentLocationFilter('广州')">广州</button>
          <button type="default" :class="['filter-tag-btn', recruitmentFilter.location === '深圳' ? 'active' : '']" @click="setRecruitmentLocationFilter('深圳')">深圳</button>
          <button type="default" :class="['filter-tag-btn', recruitmentFilter.location === '东莞' ? 'active' : '']" @click="setRecruitmentLocationFilter('东莞')">东莞</button>
          <button type="default" :class="['filter-tag-btn', recruitmentFilter.location === '佛山' ? 'active' : '']" @click="setRecruitmentLocationFilter('佛山')">佛山</button>
          <button type="default" :class="['filter-tag-btn', recruitmentFilter.location === '中山' ? 'active' : '']" @click="setRecruitmentLocationFilter('中山')">中山</button>
          <button type="default" :class="['filter-tag-btn', recruitmentFilter.location === '珠海' ? 'active' : '']" @click="setRecruitmentLocationFilter('珠海')">珠海</button>
          <button type="default" :class="['filter-tag-btn', recruitmentFilter.location === '惠州' ? 'active' : '']" @click="setRecruitmentLocationFilter('惠州')">惠州</button>
          <button type="default" :class="['filter-tag-btn', recruitmentFilter.location === '江门' ? 'active' : '']" @click="setRecruitmentLocationFilter('江门')">江门</button>
          <button type="default" :class="['filter-tag-btn', recruitmentFilter.location === '肇庆' ? 'active' : '']" @click="setRecruitmentLocationFilter('肇庆')">肇庆</button>
        </view>
      </view>
      
      <!-- 工序筛选区 -->
      <view class="filter-section">
        <view class="filter-header" @click="toggleFilterExpanded('processCategory')">
          <text class="filter-title">工种/工序：</text>
          <text class="expand-icon">{{ filterExpanded.processCategory ? '▼' : '▶' }}</text>
        </view>
        <view v-if="filterExpanded.processCategory" class="filter-tags-container">
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
          
          <!-- 细分工序 -->
          <view v-if="selectedCategories.length > 0" class="subprocess-section">
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
        <!-- 测试信息 -->
        <view class="test-info">
          <text>共 {{filteredList.length}} 条招聘信息</text>
          <text>总招聘信息数: {{recruitmentList.length}}</text>
        </view>
        
        <!-- 空状态提示 -->
        <view v-if="filteredList.length === 0" class="empty-state">
          <text class="empty-text">暂无匹配岗位</text>
        </view>
        
        <!-- 招聘信息卡片 -->
        <view v-else v-for="item in filteredList" :key="item.id" class="recruitment-item" @click="viewRecruitmentDetails(item.id)">
          <!-- 工厂实拍图已移至工厂详情页面查看 -->
          
          <!-- 头部信息 -->
          <view class="job-header">
            <view class="company-avatar" @click.stop="viewCompanyDetails(item.id)">
              <image :src="item.avatar || '/static/logo.png'" mode="aspectFill" class="avatar-img" />
            </view>
            <view class="job-info">
              <text class="job-title">{{item.title}}</text>
              <view class="company-info">
                <text class="company-name" @click.stop="viewCompanyDetails(item.id)">{{item.company}}</text>
                <!-- 公司评价 -->
                <view class="company-rating-short">
                  <text class="rating-value">{{ getCompanyRating(item.id).toFixed(1) }}分</text>
                </view>
                <!-- 认证标识 -->
                <text v-if="item.verificationType === 'enterprise'" class="verification-tag enterprise-tag">企业认证</text>
                <text v-else-if="item.verificationType === 'personal'" class="verification-tag personal-tag">个人认证</text>
              </view>

            </view>
          </view>
          
          <!-- 关键信息区 -->
          <view class="key-info-section">
            <view class="salary-location-container">
              <view class="salary-highlight">
                <text class="salary-amount">{{item.salary}}</text>
                <text class="salary-type">{{item.salaryType || '计件/计时'}}</text>
              </view>
              <view class="location-distance">
                <text class="location-icon">📍</text>
                <text class="location-text">{{item.location}}</text>
                <text class="distance-text">距您 {{getDistance(item.location)}}公里</text>
              </view>
            </view>
            
            <!-- 标签区（工序和福利） -->
            <view class="tags-section">
              <!-- 工序标签栏 -->
              <text v-for="(skill, index) in item.skills" 
                    v-if="index < 3" 
                    :key="'skill-' + item.id + '-' + index"
                    class="process-tag">
                {{skill}}
              </text>
              <!-- 福利标签 -->
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
          
          <!-- 折叠信息 -->
          <view class="collapsible-section">
            <view class="section-header" @click="toggleCollapse(item.id)">
              <text class="section-title">更多信息</text>
              <text class="collapse-icon">{{collapsedItems[item.id] ? '▼' : '▶'}}</text>
            </view>
            <view v-if="!collapsedItems[item.id]" class="section-content">
              <!-- 技能要求 -->
              <view v-if="item.skills && item.skills.length > 0" class="job-skills">
                <text class="skill-label">技能要求：</text>
                <view class="skill-tags">
                  <text v-for="(skill, index) in item.skills" :key="'skill-' + item.id + '-' + index" class="skill-tag">{{skill}}</text>
                </view>
              </view>
              

              
              <!-- 工作经验 -->
              <view class="experience-section">
                <text class="experience-label">工作经验：</text>
                <text class="experience-value">{{item.experience || getExperienceText(item.experienceLevel)}}</text>
              </view>
              
              <!-- 工作描述 -->
              <view class="job-description">
                <text class="description-label">工作描述：</text>
                <text :class="['description-text', { 'expanded': collapsedItems[item.id + '-description'] }]">{{item.description || '暂无描述'}}</text>
                <text v-if="item.description && item.description.length > 100" class="view-full-text" @click="toggleFullDescription(item.id)">{{collapsedItems[item.id + '-description'] ? '收起' : '查看全文'}}</text>
              </view>
            </view>
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
import { initWordLibrary, searchProcessWords, searchWithSynonyms, addToCandidatePool, getProcessCategories, getProcessByCategory } from '../../utils/process-word-library.js'
import { generateSimilarJobs, triggerRecommendationScenario, recordRecommendationAction } from '../../utils/job-recommendation.js'
import { validatePhoneAuth } from '../../utils/privacy-protection.js'

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
      showAllCitiesModal: false
    }
  },
  computed: {
    filteredList() {
      let list = [...this.recruitmentList];
      
      // 搜索筛选
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase();
        // 按优先级排序：工序名 > 岗位名 > 工厂名
        list = list.filter(item => {
          // 检查是否包含工序关键词
          const hasProcess = item.skills && item.skills.some(skill => 
            skill.toLowerCase().includes(keyword)
          );
          // 检查是否包含岗位名关键词
          const hasTitle = item.title.toLowerCase().includes(keyword);
          // 检查是否包含工厂名关键词
          const hasCompany = item.company.toLowerCase().includes(keyword);
          // 检查是否包含描述关键词
          const hasDescription = item.description.toLowerCase().includes(keyword);
          
          return hasProcess || hasTitle || hasCompany || hasDescription;
        }).sort((a, b) => {
          // 按优先级排序
          const aHasProcess = a.skills && a.skills.some(skill => 
            skill.toLowerCase().includes(keyword)
          );
          const bHasProcess = b.skills && b.skills.some(skill => 
            skill.toLowerCase().includes(keyword)
          );
          
          if (aHasProcess && !bHasProcess) return -1;
          if (!aHasProcess && bHasProcess) return 1;
          
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
      
      // 工序筛选
      if (this.selectedProcesses.length > 0) {
        list = list.filter(item => {
          return item.skills && this.selectedProcesses.every(process => 
            item.skills.includes(process)
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
      
      // 加载用户技能并按匹配度排序
      const userSkills = uni.getStorageSync('workerSkills') || [];
      if (userSkills.length > 0) {
        list = list.sort((a, b) => {
          const matchScoreA = this.calculateMatchScore(a.skills || [], userSkills);
          const matchScoreB = this.calculateMatchScore(b.skills || [], userSkills);
          
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
    // 页面加载
    onLoad() {
      // 页面加载时统计
      this.pageLoadTime = Date.now();
      this.hasInteraction = false;
      
      // 初始化数据
      this.initData();
      
      // 初始化工序词库
      this.initProcessWordLibrary();
    },
    
    // 初始化数据
    initData() {
      // 从本地存储加载招聘信息
      const storedRecruitments = uni.getStorageSync('recruitments') || [];
      if (storedRecruitments.length > 0) {
        this.recruitmentList = storedRecruitments;
      } else {
        // 如果没有存储的招聘信息，使用默认数据
        this.recruitmentList = [
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
          }
        ];
        // 将默认数据保存到本地存储
        uni.setStorageSync('recruitments', this.recruitmentList);
      }
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
      this.selectedCategories.forEach(category => {
        const processes = getProcessByCategory(category);
        allProcesses = [...allProcesses, ...processes];
      });
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
    

    
    // 导航
    navigateTo(url) {
      uni.navigateTo({
        url: url
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
  margin-bottom: 30rpx;
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
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

/* 热门城市筛选 */
.city-filter-section {
  margin-bottom: 16rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  padding: 0 20rpx;
}

.city-filter-scroll {
  display: flex;
  overflow-x: auto;
  gap: 12rpx;
  padding: 10rpx 0;
  flex: 1;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}

.city-filter-btn {
  padding: 12rpx 24rpx;
  min-width: 80rpx;
  border: none;
  border-radius: 18rpx;
  background-color: #F5F5F5;
  color: #666666;
  font-size: 24rpx;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.city-filter-btn.active {
  background-color: #4A90E2;
  color: #FFFFFF;
}

.city-filter-btn.all-city-btn {
  background-color: #f0f0f0;
  color: #666;
  border: 1rpx solid #e0e0e0;
}

/* 已选城市标签 */
.selected-cities-section {
  margin-bottom: 20rpx;
  padding: 16rpx 20rpx;
  background-color: #f9f9f9;
  border-radius: 12rpx;
}

.selected-cities-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.selected-cities-title {
  font-size: 24rpx;
  font-weight: bold;
  color: #333;
}

.clear-all-cities {
  font-size: 22rpx;
  color: #999;
  cursor: pointer;
}

.selected-cities-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.selected-city-tag {
  display: flex;
  align-items: center;
  padding: 8rpx 16rpx;
  background-color: #e3f2fd;
  border-radius: 20rpx;
  font-size: 22rpx;
  color: #2196F3;
}

.tag-remove {
  margin-left: 8rpx;
  font-size: 24rpx;
  font-weight: bold;
  cursor: pointer;
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

/* 招聘信息卡片 */
.recruitment-item {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 20rpx;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
  position: relative;
  margin-bottom: 20rpx;
  max-height: 300rpx;
  overflow: hidden;
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

.company-info {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 12rpx;
}

.company-name {
  font-size: 24rpx;
  color: #666666;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 公司评价短显示 */
.company-rating-short {
  display: inline-flex;
  align-items: center;
  margin-right: 12rpx;
}

.company-rating-short .rating-value {
  font-size: 24rpx;
  font-weight: bold;
  color: #FF5722;
}

.verification-tag {
  font-size: 20rpx;
  border-radius: 8rpx;
  padding: 2rpx 8rpx;
  white-space: nowrap;
}

.enterprise-tag {
  color: #2196F3;
  border: 1rpx solid #2196F3;
}

.personal-tag {
  color: #FF9800;
  border: 1rpx solid #FF9800;
}



/* 关键信息区 */
.key-info-section {
  margin-bottom: 16rpx;
}

.salary-location-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
  flex-wrap: nowrap;
}

.salary-highlight {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex: 1;
  min-width: 0;
}

.salary-amount {
  font-size: 32rpx;
  font-weight: bold;
  color: #FF5722;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.salary-type {
  font-size: 20rpx;
  color: white;
  background-color: #F44336;
  border-radius: 8rpx;
  padding: 2rpx 8rpx;
  white-space: nowrap;
}

.location-distance {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #666666;
  gap: 8rpx;
  white-space: nowrap;
}

.location-icon {
  font-size: 24rpx;
}

.location-text {
  font-size: 24rpx;
  color: #666666;
}

.distance-text {
  font-size: 24rpx;
  color: #666666;
}

/* 标签区 */
.tags-section {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 12rpx;
}

.process-tag {
  font-size: 22rpx;
  color: #2196F3;
  border: 1rpx solid #2196F3;
  background-color: transparent;
  border-radius: 12rpx;
  padding: 4rpx 12rpx;
  white-space: nowrap;
}

.benefit-tag {
  font-size: 22rpx;
  color: #666666;
  border: 1rpx solid #CCCCCC;
  background-color: transparent;
  border-radius: 12rpx;
  padding: 4rpx 12rpx;
  white-space: nowrap;
}

/* 折叠信息 */
.collapsible-section {
  border-top: 1rpx solid #e0e0e0;
  margin-top: 16rpx;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  height: 48rpx;
  line-height: 48rpx;
  padding-top: 0;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
}

.collapse-icon {
  font-size: 24rpx;
  color: #999999;
}

.section-content {
  padding-top: 16rpx;
  padding-bottom: 16rpx;
}

/* 技能要求 */
.job-skills {
  margin-bottom: 16rpx;
}

.skill-label {
  font-size: 24rpx;
  color: #666666;
  margin-right: 16rpx;
  font-weight: 500;
}

.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 8rpx;
}

.skill-tag {
  font-size: 22rpx;
  color: #2196F3;
  border: 1rpx solid #2196F3;
  border-radius: 12rpx;
  padding: 4rpx 12rpx;
  white-space: nowrap;
}

/* 工作经验 */
.experience-section {
  margin-bottom: 16rpx;
}

.experience-label {
  font-size: 24rpx;
  color: #666666;
  margin-right: 16rpx;
  font-weight: 500;
}

.experience-value {
  font-size: 24rpx;
  color: #666666;
}

/* 工作描述 */
.job-description {
  margin-bottom: 16rpx;
}

.description-label {
  font-size: 24rpx;
  color: #666666;
  margin-right: 16rpx;
  font-weight: 500;
  display: block;
  margin-bottom: 8rpx;
}

.description-text {
  font-size: 24rpx;
  color: #333333;
  line-height: 32rpx;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.description-text.expanded {
  -webkit-line-clamp: unset;
  display: block;
}

.view-full-text {
  font-size: 20rpx;
  color: #2196F3;
  margin-top: 8rpx;
  display: block;
  cursor: pointer;
}

/* 公司评价 */
.company-rating {
  margin-bottom: 16rpx;
}

.rating-label {
  font-size: 24rpx;
  color: #666666;
  margin-right: 16rpx;
  font-weight: 500;
}

.rating-value {
  font-size: 24rpx;
  color: #FF5722;
  font-weight: bold;
}

.rating-details {
  margin-top: 12rpx;
  padding: 12rpx;
  background-color: #f9f9f9;
  border-radius: 12rpx;
}

.rating-item {
  display: flex;
  margin-bottom: 8rpx;
  align-items: center;
}

.rating-item-label {
  font-size: 22rpx;
  color: #666666;
  width: 120rpx;
}

.rating-item-value {
  font-size: 22rpx;
  color: #FF5722;
  font-weight: bold;
}

.rating-count {
  margin-top: 12rpx;
  font-size: 20rpx;
  color: #999999;
  text-align: right;
}

/* 底部信息 */
.job-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 30rpx;
  padding-top: 20rpx;
  border-top: 2rpx solid #e0e0e0;
}

.publish-date {
  font-size: 24rpx;
  color: #999;
}

.applicant-count {
  font-size: 24rpx;
  color: #999;
}



/* 更多菜单 */
.more-menu {
  margin-top: 16rpx;
  background-color: #f9f9f9;
  border-radius: 16rpx;
  padding: 10rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.menu-item {
  width: 100%;
  padding: 16rpx;
  background-color: transparent;
  color: #666;
  border: none;
  border-radius: 12rpx;
  font-size: 24rpx;
  text-align: left;
}

.menu-item:hover {
  background-color: #f0f0f0;
}



/* 附加操作按钮 */
.additional-action-buttons {
  display: flex;
  gap: 16rpx;
  margin-top: 16rpx;
  justify-content: space-between;
}

.leave-phone-button-simple {
  flex: 2;
  min-width: 240rpx;
  padding: 16rpx;
  background-color: #FF9800;
  color: #fff;
  border: none;
  border-radius: 16rpx;
  font-size: 20rpx;
  font-weight: bold;
}

.report-button {
  flex: 1;
  min-width: 120rpx;
  padding: 16rpx;
  background-color: #f5f5f5;
  color: #666;
  border: 2rpx solid #e0e0e0;
  border-radius: 16rpx;
  font-size: 24rpx;
}

/* 入职流程引导 */
.onboarding-process-guide {
  margin-top: 20rpx;
  padding: 20rpx 15rpx;
  background-color: #fff;
  border-radius: 16rpx;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.guide-title {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
  display: block;
}

.process-steps {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  cursor: pointer;
}

.step-number {
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  background-color: #4A90E2;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16rpx;
  font-weight: bold;
  margin-bottom: 6rpx;
  transition: all 0.2s ease;
}

.step-item.completed .step-number {
  background-color: #4A90E2;
}

.step-item.completed .step-number::before {
  content: '✓';
}

.step-text {
  font-size: 24rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 4rpx;
  text-align: center;
  white-space: nowrap;
}

.step-desc {
  font-size: 16rpx;
  color: #999;
  text-align: center;
  white-space: nowrap;
}

.step-arrow {
  color: #4A90E2;
  font-size: 20rpx;
  margin: 0 8rpx;
}

/* 安全提示 */
.safety-tips {
  margin-top: 30rpx;
  padding: 20rpx;
  background-color: #f0f0f0;
  border-radius: 16rpx;
  font-size: 24rpx;
  color: #666;
}

.safety-tip-item {
  display: block;
  margin-bottom: 10rpx;
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