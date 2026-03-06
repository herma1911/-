<template>
  <view class="skill-profile-container">
    <view class="header">
      <text class="title">技能档案</text>
      <text class="subtitle">你记过的每一件衣服，都在为你的手艺背书</text>
    </view>
    
    <!-- 完善档案提醒 -->
    <view class="profile-reminder">
      <text class="reminder-icon">💡</text>
      <text class="reminder-text">完善技能档案，让招工方更快找到你！</text>
      <button class="reminder-btn" @click="scrollToForm">立即完善</button>
    </view>
    
    <!-- 档案亮点展示区 -->
    <view class="profile-highlights" v-if="isProfileComplete">
      <text class="highlights-title">档案亮点</text>
      
      <!-- 1. 信誉分 -->
      <view class="reputation-section">
        <text class="section-subtitle">1. 信誉分</text>
        <view class="reputation-score">
          <text class="score-number">{{profile.reputationScore || 0}}</text>
          <text class="score-label">分</text>
          <text class="score-desc">{{getReputationLevel(profile.reputationScore)}}</text>
        </view>
      </view>
      
      <!-- 2. 记账实绩 -->
      <view class="work-records-section">
        <text class="section-subtitle">2. 记账实绩（自动生成）</text>
        <view class="work-records">
          <view v-for="(record, index) in profile.workRecords" :key="index" class="work-record-item">
            <text class="record-skill">{{record.skill}}</text>
            <text class="record-count">｜累计 {{record.count}} 件</text>
            <text class="record-level">｜{{record.level}}</text>
          </view>
        </view>
      </view>
      
      <!-- 3. 技能特长 -->
      <view class="skill-specialty-section">
        <text class="section-subtitle">3. 技能特长</text>
        <view class="skill-specialty">
          <text class="specialty-label">擅长：</text>
          <text class="specialty-skills">{{profile.skills.join('、') || '暂无'}}</text>
          <button class="edit-btn" @click="scrollToForm">【编辑】</button>
        </view>
      </view>
      
      <!-- 4. 工友认可 -->
      <view class="peer-recognition-section">
        <text class="section-subtitle">4. 工友认可</text>
        <view class="total-likes">
          <text class="total-likes-text">已有 {{totalLikes}} 位老乡认可</text>
        </view>
        <view class="peer-recognition">
          <view v-for="(skill, index) in selectedSkillsWithLevel" :key="index" class="recognition-item">
            <view class="recognition-tag">
              <text class="recognition-skill">{{skill.name}}</text>
              <text class="recognition-count">{{skill.likes}}</text>
            </view>
          </view>
          <button class="invite-btn" :class="{ 'disabled': !isProfileComplete }" @click="inviteLikes">
            <text class="like-icon">👍</text>
            <text class="like-btn-text">拉老乡点赞</text>
            <view v-if="!hasInvitedLikes && isProfileComplete" class="red-dot"></view>
          </button>
        </view>
      </view>
      
      <!-- 5. 工厂评价 -->
      <view class="factory-evaluation-section">
        <text class="section-subtitle">5. 工厂评价</text>
        <view class="factory-evaluation">
          <text class="factory-comment">{{profile.factoryComments}}</text>
        </view>
      </view>
      
      <!-- 技能描述 -->
      <view class="skill-description-section" v-if="profile.skillDescription">
        <text class="section-subtitle">技能描述</text>
        <view class="skill-description">
          <text class="description-content">{{profile.skillDescription}}</text>
        </view>
      </view>
      
      <!-- 计薪模式与稳定性数据 -->
      <view class="wage-mode-section">
        <text class="section-subtitle">计薪模式与稳定性</text>
        <view class="wage-mode-stats">
          <view class="wage-mode-item">
            <text class="stat-label">主计薪模式</text>
            <text class="stat-value">{{profile.wageMode === 'piecework' ? '计件' : profile.wageMode === 'hourly' ? '计时' : '未设置'}}</text>
          </view>
          <view class="wage-mode-item" v-if="profile.wageMode === 'hourly'">
            <text class="stat-label">岗位类型</text>
            <text class="stat-value">{{profile.hourlyJobType || '未设置'}}</text>
          </view>
        </view>
        
        <!-- 稳定性数据 -->
        <view class="stability-section">
          <text class="sub-section-title">稳定性数据</text>
          <view class="stability-stats">
            <view class="stability-stat-item">
              <text class="stability-label">连续记工天数</text>
              <text class="stability-value">{{profile.stabilityData.continuousWorkDays}}天</text>
              <text class="stability-tag" :class="profile.stabilityData.continuousWorkDays >= 30 ? 'high-stability' : profile.stabilityData.continuousWorkDays <= 7 ? 'low-stability' : 'medium-stability'">
                {{profile.stabilityData.continuousWorkDays >= 30 ? '高稳定' : profile.stabilityData.continuousWorkDays <= 7 ? '待观察' : '稳定'}}
              </text>
            </view>
            <view class="stability-stat-item">
              <text class="stability-label">月度出勤率</text>
              <text class="stability-value">{{profile.stabilityData.monthlyAttendanceRate}}%</text>
              <text class="stability-tag" :class="profile.stabilityData.monthlyAttendanceRate >= 90 ? 'high-stability' : profile.stabilityData.monthlyAttendanceRate < 60 ? 'low-stability' : 'medium-stability'">
                {{profile.stabilityData.monthlyAttendanceRate >= 90 ? '全勤标杆' : profile.stabilityData.monthlyAttendanceRate < 60 ? '出勤不稳定' : '出勤稳定'}}
              </text>
            </view>
            <view class="stability-stat-item">
              <text class="stability-label">岗位留存时长</text>
              <text class="stability-value">{{profile.stabilityData.jobRetentionDuration}}个月</text>
              <text class="stability-tag" :class="profile.stabilityData.jobRetentionDuration >= 3 ? 'high-stability' : profile.stabilityData.jobRetentionDuration < 1 ? 'low-stability' : 'medium-stability'">
                {{profile.stabilityData.jobRetentionDuration >= 3 ? '长期稳定' : profile.stabilityData.jobRetentionDuration < 1 ? '高流动性' : '稳定'}}
              </text>
            </view>
            <view class="stability-stat-item">
              <text class="stability-label">工时稳定性</text>
              <text class="stability-value">{{profile.stabilityData.workHourStability}}%</text>
              <text class="stability-tag" :class="profile.stabilityData.workHourStability >= 80 ? 'high-stability' : profile.stabilityData.workHourStability < 60 ? 'low-stability' : 'medium-stability'">
                {{profile.stabilityData.workHourStability >= 80 ? '工时稳定' : profile.stabilityData.workHourStability < 60 ? '工时波动大' : '基本稳定'}}
              </text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 简历背书 -->
      <view class="resume-endorsement-section">
        <text class="section-subtitle">简历背书</text>
        <view class="endorsement-content">
          <!-- 稳定性标签 -->
          <view class="stability-tags">
            <text class="tag-label">稳定性标签：</text>
            <view class="tag-list">
              <text v-for="(tag, index) in profile.resumeEndorsement.stabilityTags" :key="index" class="stability-tag high-stability">
                {{tag}}
              </text>
            </view>
          </view>
          
          <!-- 工厂评价 -->
          <view class="factory-endorsement">
            <text class="endorsement-label">工厂评价：</text>
            <text class="endorsement-value">
              合作{{profile.resumeEndorsement.cooperativeFactoryCount}}家工厂，综合评分{{profile.resumeEndorsement.factoryEvaluationScore}}分，
              {{profile.resumeEndorsement.highFrequencyPraiseTags.length > 0 ? profile.resumeEndorsement.highFrequencyPraiseTags.join('、') : '暂无高频好评'}}，
              合作时长{{profile.resumeEndorsement.cooperativeDuration}}个月
            </text>
          </view>
        </view>
      </view>
      
      <!-- 工资战绩 -->
      <view class="salary-section">
        <text class="section-subtitle">工资战绩</text>
        <view class="salary-stats">
          <view class="salary-stat-item">
            <text class="stat-label">平均时薪</text>
            <text class="stat-value">{{profile.avgHourlyWage || '--'}}元</text>
          </view>
          <view class="salary-stat-item">
            <text class="stat-label">最高月工资</text>
            <text class="stat-value">{{profile.maxMonthlySalary || '--'}}元</text>
          </view>
          <view class="salary-stat-item" v-if="profile.salaryStability">
            <text class="stat-label">工资稳定性</text>
            <text class="stat-value stability-icon">📈 连续{{profile.salaryStability}}个月超8000</text>
          </view>
        </view>
      </view>
      

      
      <!-- 评价背书 -->
      <view class="evaluation-section">
        <text class="section-subtitle">评价背书</text>
        
        <!-- 评价分为工友说和工厂评两部分 -->
        <view class="evaluation-container">
          <!-- 工友说 -->
          <view class="evaluation-column">
            <text class="evaluation-title">工友说</text>
            <view class="peer-evaluations">
              <view v-for="(peerEval, index) in profile.peerEvaluations.slice(0, 3)" :key="index" class="evaluation-bubble peer-bubble">
                <text class="evaluation-content">{{peerEval.content}}</text>
                <text class="evaluation-from">(来自{{peerEval.from}})</text>
              </view>
              <view v-if="profile.peerEvaluations.length === 0" class="no-evaluation">
                <text class="no-evaluation-text">暂无工友评价</text>
              </view>
            </view>
          </view>
          
          <!-- 工厂评 -->
          <view class="evaluation-column">
            <text class="evaluation-title">工厂评</text>
            <view class="factory-evaluations">
              <view v-for="(factoryEval, index) in profile.factoryEvaluations.slice(0, 3)" :key="index" class="evaluation-bubble factory-bubble">
                <text class="factory-eval-tag">⭐️ {{factoryEval.tag}}：</text>
                <text class="factory-eval-score">{{factoryEval.score}}</text>
                <text class="factory-eval-comment">("{{factoryEval.comment}}")</text>
              </view>
              <view v-if="profile.factoryEvaluations.length === 0" class="no-evaluation">
                <text class="no-evaluation-text">暂无工厂评价</text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 查看全部按钮 -->
        <view class="view-all-evaluations">
          <button class="view-all-btn" @click="viewAllEvaluations">查看全部评价</button>
          <button class="view-all-btn peer-eval-btn" @click="evaluatePeer">评价工友</button>
          <button class="view-all-btn ledger-eval-btn" @click="evaluateLedger">记账背书</button>
        </view>
      </view>
    </view>
    
    <view class="profile-form">
      <!-- 个人信息 -->
      <view class="form-section">
        <text class="section-title">个人信息</text>
        <view class="form-item">
          <text class="form-label">姓名</text>
          <input type="text" v-model="profile.name" placeholder="请输入姓名" class="form-input" />
        </view>
        <view class="form-item">
          <text class="form-label">年龄</text>
          <input type="number" v-model.number="profile.age" placeholder="请输入年龄" class="form-input" />
        </view>
        <view class="form-item">
          <text class="form-label">手机号码</text>
          <input type="text" v-model="profile.phone" placeholder="请输入手机号码" class="form-input" />
        </view>
        <view class="form-item">
          <text class="form-label">微信</text>
          <input type="text" v-model="profile.wechat" placeholder="请输入微信" class="form-input" />
        </view>
        <view class="form-item">
          <text class="form-label">从业年限</text>
          <input type="number" v-model.number="profile.workYears" placeholder="请输入从业年限" class="form-input" />
        </view>
        <view class="form-item">
          <text class="form-label">类型</text>
          <picker :value="typeIndex" :range="types" @change="typeChange">
            <view class="picker">
              {{ types[typeIndex] }}
            </view>
          </picker>
        </view>
        <!-- 计薪模式选择 -->
        <view class="form-item">
          <text class="form-label">主计薪模式</text>
          <picker :value="wageModeIndex" :range="wageModes.map(item => item.label)" @change="wageModeChange">
            <view class="picker">
              {{ profile.wageMode ? wageModes.find(item => item.value === profile.wageMode).label : '请选择' }}
            </view>
          </picker>
        </view>
        <!-- 计时工人岗位类型选择 -->
        <view v-if="profile.wageMode === 'hourly'" class="form-item">
          <text class="form-label">岗位类型</text>
          <picker :value="hourlyJobTypeIndex" :range="getHourlyJobTypeOptions()" @change="hourlyJobTypeChange">
            <view class="picker">
              {{ profile.hourlyJobType || '请选择' }}
            </view>
          </picker>
        </view>
      </view>
      
      <!-- 工时偏好设置（仅计时工人） -->
      <view v-if="profile.wageMode === 'hourly'" class="form-section">
        <text class="section-title">工时偏好</text>
        <view class="form-item">
          <text class="form-label">工时制度</text>
          <picker :value="workHourSystemIndex" :range="workHourSystems" @change="workHourSystemChange">
            <view class="picker">
              {{ profile.workHourPreference.workHourSystem || '请选择' }}
            </view>
          </picker>
        </view>
        <view class="form-item">
          <text class="form-label">用工周期</text>
          <picker :value="employmentCycleIndex" :range="employmentCycles" @change="employmentCycleChange">
            <view class="picker">
              {{ profile.workHourPreference.employmentCycle || '请选择' }}
            </view>
          </picker>
        </view>
        <view class="form-item">
          <text class="form-label">固定工时</text>
          <picker :value="fixedHoursIndex" :range="fixedHoursOptions" @change="fixedHoursChange">
            <view class="picker">
              {{ profile.workHourPreference.fixedHours || '请选择' }}
            </view>
          </picker>
        </view>
        <view class="form-item checkbox-item">
          <checkbox :checked="profile.workHourPreference.acceptOvertime" @change="(e) => profile.workHourPreference.acceptOvertime = e.detail.value" />
          <text class="checkbox-label">是否接受加班</text>
        </view>
      </view>
      
      <!-- 技能信息 -->
      <view class="form-section">
        <text class="section-title">技能信息</text>
        <text class="section-subtitle">擅长工序（可多选）</text>
        <view class="skill-list">
          <view v-for="(skill, index) in skills" :key="index" class="skill-item">
            <checkbox :checked="profile.skills.includes(skill.name)" @change="(e) => toggleSkill(skill.name, e.detail.value)" />
            <text class="skill-name">{{skill.name}}</text>
            <view class="skill-level">
              <view class="star-rating">
                <text v-for="star in 5" :key="star" :class="['star', star <= (skill.levelIndex === 0 ? 2 : skill.levelIndex === 1 ? 3 : 5) ? 'active' : '']" @click.stop="updateSkillLevel(index, star >= 5 ? 2 : star >= 3 ? 1 : 0)">★</text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 从GSD数据库选择技能 -->
        <button class="add-skill-btn" @click="openGsdModal">从GSD数据库选择技能</button>
        
        <!-- 自定义技能描述 -->
        <text class="section-subtitle">技能描述（手动填写详细信息）</text>
        <view class="form-item">
          <textarea v-model="profile.skillDescription" placeholder="请详细描述您的技能水平、工作经验、擅长的工序等信息，让招工方更全面了解您的能力。例如：熟练操作平车5年，擅长制作牛仔裤，能够独立完成整条裤子的缝制工艺等。" class="form-textarea" />
        </view>
        
        <!-- 添加自定义技能 -->
        <view class="form-item">
          <text class="form-label">添加自定义技能</text>
          <input type="text" v-model="customSkill" placeholder="输入您的特殊技能" class="form-input" />
          <button class="add-skill-btn" @click="addCustomSkill">添加</button>
        </view>
      </view>
      
      <!-- 工资信息 -->
      <view class="form-section">
        <text class="section-title">工资信息</text>
        <view class="form-item checkbox-item">
          <checkbox :checked="profile.authorizeSalary" @change="(e) => profile.authorizeSalary = e.detail.value" />
          <text class="checkbox-label">授权显示工资信息</text>
        </view>
        <view v-if="profile.authorizeSalary">
          <view class="form-item">
            <text class="form-label">历史最高月工资</text>
            <input type="number" v-model.number="profile.maxMonthlySalary" placeholder="请输入历史最高月工资" class="form-input" />
          </view>
          <view class="form-item">
            <text class="form-label">平均时薪</text>
            <input type="number" v-model.number="profile.avgHourlyWage" placeholder="请输入平均时薪" class="form-input" />
          </view>
          <view class="form-item">
            <text class="form-label">工资稳定性（连续超8000元的月数）</text>
            <input type="number" v-model.number="profile.salaryStability" placeholder="请输入月数" class="form-input" />
          </view>
        </view>
      </view>
      
      <!-- 评价信息 -->
      <view class="form-section">
        <text class="section-title">评价信息</text>
        <text class="section-subtitle">之前工厂的评价会自动同步到这里</text>
        <view class="evaluation-placeholder" v-if="!profile.evaluations || profile.evaluations.length === 0">
          <text class="placeholder-text">暂无评价，完成工作后会收到工厂评价</text>
        </view>
      </view>
      

      
      <!-- 工作意向标签 -->
      <view class="form-section">
        <text class="section-title">工作意向标签</text>
        
        <!-- 意向工作地区 -->
        <text class="section-subtitle">意向工作地区（可多选）</text>
        <view class="region-list">
          <view v-for="(region, index) in regions" :key="index" class="region-item">
            <checkbox :checked="profile.intendedRegions.includes(region.name)" @change="(e) => toggleRegion(region.name, e.detail.value)" />
            <text class="region-name">{{region.name}}</text>
          </view>
        </view>
        
        <!-- 全国可跑选项 -->
        <view class="form-item checkbox-item">
          <checkbox :checked="profile.nationwideAvailable" @change="(e) => profile.nationwideAvailable = e.detail.value" />
          <text class="checkbox-label">全国可跑</text>
        </view>
        
        <!-- 可到岗时间 -->
        <view class="form-item">
          <text class="form-label">可到岗时间</text>
          <input type="text" v-model="profile.availableTime" placeholder="如：随时、3天后、下周" class="form-input" />
        </view>
        
        <!-- 计薪偏好 -->
        <text class="section-subtitle">计薪偏好（可多选）</text>
        <view class="payment-list">
          <view v-for="(payment, index) in paymentTypes" :key="index" class="payment-item">
            <checkbox :checked="profile.paymentPreferences.includes(payment)" @change="(e) => togglePaymentPreference(payment, e.detail.value)" />
            <text class="payment-name">{{payment}}</text>
          </view>
        </view>
        
        <!-- 过往擅长品类 -->
        <text class="section-subtitle">过往擅长品类（可多选）</text>
        <view class="category-list">
          <view v-for="(category, index) in categories" :key="index" class="category-item">
            <checkbox :checked="profile.specializedCategories.includes(category)" @change="(e) => toggleCategory(category, e.detail.value)" />
            <text class="category-name">{{category}}</text>
          </view>
        </view>
      </view>
      
      <!-- 其他信息 -->
      <view class="form-section">
        <text class="section-title">其他信息</text>
        <view class="form-item">
          <text class="form-label">工作经历</text>
          <textarea v-model="profile.workExperience" placeholder="请输入工作经历" class="form-textarea" />
        </view>
        <view class="form-item">
          <text class="form-label">期望薪资</text>
          <input type="text" v-model="profile.expectedSalary" placeholder="请输入期望薪资" class="form-input" />
        </view>
      </view>
    </view>
    
    <!-- GSD工序选择模态框 -->
    <view v-if="showGsdModal" class="gsd-modal-overlay" @click="closeGsdModal">
      <view class="gsd-modal" @click.stop>
        <view class="gsd-modal-header">
          <text class="gsd-modal-title">选择GSD标准工序</text>
          <text class="gsd-modal-close" @click="closeGsdModal">×</text>
        </view>
        <view class="gsd-modal-content">
          <!-- 搜索框 -->
          <view class="gsd-search">
            <input type="text" v-model="searchKeyword" placeholder="搜索工序名称" class="gsd-search-input" />
            <button class="gsd-search-btn" @click="searchGsdProcesses">搜索</button>
          </view>
          
          <!-- 工序列表 -->
          <view class="gsd-process-list">
            <view v-for="process in filteredGsdProcesses" :key="process.id" class="gsd-process-item" @click="selectGsdProcess(process)">
              <text class="gsd-process-name">{{process.name}}</text>
              <text class="gsd-process-standard">{{process.standardName}}</text>
              <text class="gsd-process-desc">{{process.description}}</text>
              <text class="gsd-process-level">技能等级：{{process.skillLevel}}</text>
            </view>
            <view v-if="filteredGsdProcesses.length === 0" class="gsd-empty">
              <text class="gsd-empty-text">未找到相关工序</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 实用工具 -->
    <view class="utility-section">
      <view class="utility-buttons">
        <button class="utility-btn primary-btn" @click="generateResume">
          <text class="btn-icon">📱</text>
          <text class="btn-text">生成简历卡片</text>
        </button>
        <button class="utility-btn" @click="shareProfile">
          <text class="btn-icon">🤝</text>
          <text class="btn-text">分享档案</text>
        </button>
        <button class="utility-btn" @click="inviteLikes">
          <text class="btn-icon">👍</text>
          <text class="btn-text">拉老乡点赞</text>
        </button>
      </view>
    </view>
    
    <view class="action-buttons">
      <button class="action-btn save-btn" @click="saveProfile">保存档案</button>
    </view>
  </view>
</template>

<script>
import { getGsdProcesses, searchGsdProcesses, getProcessByName } from '../../utils/gsd-database.js'

export default {
  data() {
    return {
      profile: {
        name: '',
        age: '',
        phone: '',
        wechat: '',
        workYears: '',
        expectedSalary: '',
        city: '',
        skills: [],
        // 新增记账实绩
        workRecords: [],
        factoryComments: '',
        skillDescription: '',
        avgHourlyWage: '',
        maxMonthlySalary: '',
        salaryStability: '',
        authorizeSalary: false,
        peerEvaluations: [],
        factoryEvaluations: [],
        // 工作意向标签
        intendedRegions: [],
        nationwideAvailable: false,
        availableTime: '',
        paymentPreferences: [],
        specializedCategories: [],
        // 计薪模式相关
        wageMode: '', // 主计薪模式：'piecework' 或 'hourly'
        // 计时工人岗位类型
        hourlyJobType: '',
        // 工时偏好
        workHourPreference: {
          workHourSystem: '', // 工时制度：长白班/两班倒/三班倒
          employmentCycle: '', // 用工周期：长期固定工/临时工/日结/周结/月结
          fixedHours: '', // 固定工时：8小时/10小时/12小时
          acceptOvertime: false // 是否接受加班
        },
        // 稳定性数据
        stabilityData: {
          continuousWorkDays: 0, // 连续记工天数
          monthlyAttendanceRate: 0, // 月度出勤率
          jobRetentionDuration: 0, // 岗位留存时长（月）
          workHourStability: 0, // 工时稳定性
          timelyTimekeeping: 0, // 记工及时性
          postPaymentRetention: 0, // 发薪后留存率
          ledgerCompleteness: 0 // 账本完整度
        },
        // 简历背书
        resumeEndorsement: {
          stabilityTags: [], // 稳定性标签
          factoryEvaluationScore: 0, // 工厂综合评分
          cooperativeFactoryCount: 0, // 合作工厂数量
          highFrequencyPraiseTags: [], // 高频好评标签
          cooperativeDuration: 0 // 合作时长（月）
        }
      },
      customSkill: '', // 新增自定义技能输入
      typeIndex: 0,
      types: ['全职', '兼职', '临时工'],
      hasInvitedLikes: false,
      skills: [
        { name: '平车', levelIndex: 0 },
        { name: '拷边', levelIndex: 0 },
        { name: '开口袋', levelIndex: 0 },
        { name: '装拉链', levelIndex: 0 },
        { name: '拉腰', levelIndex: 0 },
        { name: '装领', levelIndex: 0 },
        { name: '双针卷边', levelIndex: 0 },
        { name: '四针六线', levelIndex: 0 },
        { name: '无缝', levelIndex: 0 },
        { name: '打枣', levelIndex: 0 },
        { name: '锁边', levelIndex: 0 },
        { name: '钉扣', levelIndex: 0 },
        { name: '缝纫', levelIndex: 0 },
        { name: '裁剪', levelIndex: 0 },
        { name: '熨烫', levelIndex: 0 },
        { name: '大烫', levelIndex: 0 },
        { name: '包装', levelIndex: 0 },
        { name: '牛仔裤埋夹', levelIndex: 0 },
        { name: '羽绒服充绒', levelIndex: 0 }
      ],
      // GSD数据库相关
      gsdProcesses: [],
      selectedCategory: '',
      searchKeyword: '',
      showGsdModal: false,
      // 工作意向标签数据
      regions: [
        { name: '广东广州' },
        { name: '广东东莞' },
        { name: '广东中山' },
        { name: '浙江杭州' },
        { name: '浙江嘉兴' },
        { name: '浙江宁波' },
        { name: '福建泉州' },
        { name: '福建石狮' },
        { name: '江苏苏州' },
        { name: '江苏常熟' },
        { name: '湖北武汉' },
        { name: '河南郑州' },
        { name: '四川成都' },
        { name: '山东青岛' },
        { name: '辽宁大连' },
        { name: '江西于都' }
      ],
      paymentTypes: ['计件', '计时', '固定月薪'],
      categories: ['羽绒服', '牛仔', '针织T恤', '女装', '童装', '卫衣', '泳装', '休闲裤', '连衣裙', '西装', '运动服', '内衣', '工装'],
      // 计薪模式选项
      wageModes: [
        { value: 'piecework', label: '计件（按件算钱）' },
        { value: 'hourly', label: '计时（按时算钱）' }
      ],
      // 计时工人岗位类型选项
      hourlyJobTypes: [
        { category: '生产辅助类', options: ['后整包装', '大烫/小烫', '服装质检', '裁床辅助', '锁边/杂工'] },
        { category: '管理职能类', options: ['车间组长', '跟单员', '仓管员', '品控主管'] },
        { category: '临时用工类', options: ['日结普工', '旺季临时工', '夜班替补'] }
      ],
      // 工时偏好选项
      workHourSystems: ['长白班', '两班倒', '三班倒'],
      employmentCycles: ['长期固定工', '临时工', '日结', '周结', '月结'],
      fixedHoursOptions: ['8小时', '10小时', '12小时']
    }
  },

  computed: {
    isProfileComplete() {
      return true
    },
    selectedSkillsWithLevel() {
      return this.profile.skills.map(skill => {
        const skillObj = this.skills.find(s => s.name === skill)
        return {
          name: skill,
          likes: Math.floor(Math.random() * 50) + 1,
          level: skillObj && skillObj.levelIndex !== undefined ? (skillObj.levelIndex === 0 ? '初级' : skillObj.levelIndex === 1 ? '中级' : '高级') : '初级'
        }
      })
    },
    totalLikes() {
      // 从本地存储获取总点赞数
      return uni.getStorageSync('likeCount') || 0
    },
    // 计薪模式索引
    wageModeIndex() {
      return this.wageModes.findIndex(item => item.value === this.profile.wageMode)
    },
    // 计时工人岗位类型索引
    hourlyJobTypeIndex() {
      const options = this.getHourlyJobTypeOptions()
      return options.indexOf(this.profile.hourlyJobType)
    },
    // 工时制度索引
    workHourSystemIndex() {
      return this.workHourSystems.indexOf(this.profile.workHourPreference.workHourSystem)
    },
    // 用工周期索引
    employmentCycleIndex() {
      return this.employmentCycles.indexOf(this.profile.workHourPreference.employmentCycle)
    },
    // 固定工时索引
    fixedHoursIndex() {
      return this.fixedHoursOptions.indexOf(this.profile.workHourPreference.fixedHours)
    },
    // 过滤后的GSD工序列表
    filteredGsdProcesses() {
      if (this.searchKeyword) {
        return searchGsdProcesses(this.searchKeyword)
      }
      return this.gsdProcesses
    }
  },
  onLoad() {
    this.loadProfile()
    this.loadWageMode()
    this.loadGsdProcesses()
  },
  methods: {
    loadWageMode() {
      const savedWageMode = uni.getStorageSync('wageMode')
      if (savedWageMode) {
        this.profile.wageMode = savedWageMode
      }
    },
    getReputationLevel(score) {
      if (!score) return '暂无评价'
      if (score >= 90) return '信誉极佳'
      if (score >= 70) return '信誉良好'
      if (score >= 50) return '信誉一般'
      return '有待提升'
    },
    loadProfile() {
      // 强制使用默认示例数据，确保用户能看到简历内容
      this.profile = {
        name: '张三',
        age: 32,
        phone: '138****8888',
        wechat: 'zhangsan123',
        workYears: 8,
        expectedSalary: '8000-10000元/月',
        city: '广州',
        skills: ['平车', '拷边', '开口袋'],
        workRecords: [
          { skill: '平车', count: 150, level: '高级', isHighFrequency: true },
          { skill: '拷边', count: 120, level: '高级', isHighFrequency: true },
          { skill: '开口袋', count: 80, level: '中级', isHighFrequency: false }
        ],
        factoryComments: '工作认真负责，技术熟练，是我们车间的骨干员工',
        skillDescription: '熟练操作平车、拷边机等设备，擅长制作牛仔裤、休闲裤等服装。能够独立完成整条裤子的缝制工艺，包括开口袋、装拉链、拉腰等工序。工作效率高，质量稳定，有8年相关工作经验。',
        avgHourlyWage: 35,
        maxMonthlySalary: 12000,
        salaryStability: 6,
        authorizeSalary: true,
        peerEvaluations: [
          { content: '技术很好，做事认真，值得信赖', from: '工友 李四' },
          { content: '合作很愉快，效率高', from: '工友 王五' }
        ],
        factoryEvaluations: [
          { tag: '技术能力', score: '5星', comment: '技术熟练，操作规范' },
          { tag: '工作态度', score: '4星', comment: '认真负责，积极主动' }
        ],
        reputationScore: 85,
        // 工作意向标签
        intendedRegions: [],
        nationwideAvailable: false,
        availableTime: '',
        paymentPreferences: [],
        specializedCategories: [],
        // 计薪模式相关
        wageMode: 'piecework', // 主计薪模式：'piecework' 或 'hourly'
        // 计时工人岗位类型
        hourlyJobType: '',
        // 工时偏好
        workHourPreference: {
          workHourSystem: '', // 工时制度：长白班/两班倒/三班倒
          employmentCycle: '', // 用工周期：长期固定工/临时工/日结/周结/月结
          fixedHours: '', // 固定工时：8小时/10小时/12小时
          acceptOvertime: false // 是否接受加班
        },
        // 稳定性数据
        stabilityData: {
          continuousWorkDays: 120, // 连续记工天数
          monthlyAttendanceRate: 95, // 月度出勤率
          jobRetentionDuration: 6, // 岗位留存时长（月）
          workHourStability: 90, // 工时稳定性
          timelyTimekeeping: 85, // 记工及时性
          postPaymentRetention: 90, // 发薪后留存率
          ledgerCompleteness: 95 // 账本完整度
        },
        // 简历背书
        resumeEndorsement: {
          stabilityTags: ['高稳定全勤标杆', '出勤稳定', '长期稳定'], // 稳定性标签
          factoryEvaluationScore: 4.9, // 工厂综合评分
          cooperativeFactoryCount: 6, // 合作工厂数量
          highFrequencyPraiseTags: ['出勤稳定', '配合度高'], // 高频好评标签
          cooperativeDuration: 18 // 合作时长（月）
        }
      }
      // 保存示例数据到本地存储
      uni.setStorageSync('skillProfile', this.profile)
      
      // 加载记账数据并生成工作记录
      this.loadWorkRecords()
    },
    loadWorkRecords() {
      // 从本地存储加载账本记录
      const allRecords = uni.getStorageSync('ledgerRecords') || []
      // 过滤出已确认的记录
      const confirmedRecords = allRecords.filter(record => record.status === 'confirmed')
      
      // 只有在有真实账本记录时才覆盖工作记录
      if (confirmedRecords.length > 0) {
        // 按技能分组统计
        const skillMap = {}
        confirmedRecords.forEach(record => {
          // 从描述中提取技能信息
          if (record.description) {
            // 尝试从描述中提取技能名称
            let skillName = record.description
            // 简单处理：取描述的前半部分作为技能名称
            if (skillName.includes(' - ')) {
              skillName = skillName.split(' - ')[0]
            }
            if (skillName.includes('款号')) {
              skillName = skillName.replace('款号', '').trim()
            }
            if (!skillMap[skillName]) {
              skillMap[skillName] = {
                skill: skillName,
                count: 0
              }
            }
            // 增加计数
            skillMap[skillName].count += 1
          }
        })
        
        // 转换为工作记录数组
        this.profile.workRecords = Object.values(skillMap).map(record => ({
          ...record,
          level: record.count >= 20 ? '高级' : record.count >= 10 ? '中级' : '初级',
          isHighFrequency: record.count >= 10, // 高频使用：该工序有效记录≥10条
          isFactoryCertified: false // 工厂认证：有绑定班组审批通过的记录
        }))
      }
      // 如果没有真实记录，保留示例数据
    },
    // 加载GSD数据库工序数据
    loadGsdProcesses() {
      this.gsdProcesses = getGsdProcesses()
    },
    // 打开GSD工序选择模态框
    openGsdModal() {
      this.showGsdModal = true
      this.searchKeyword = ''
    },
    // 关闭GSD工序选择模态框
    closeGsdModal() {
      this.showGsdModal = false
    },
    // 选择GSD工序
    selectGsdProcess(process) {
      // 检查技能是否已存在
      const isExist = this.skills.some(skill => skill.name === process.name)
      if (!isExist) {
        // 添加到技能列表
        this.skills.push({ name: process.name, levelIndex: 0 })
      }
      // 自动选中该技能
      if (!this.profile.skills.includes(process.name)) {
        // 限制技能数量最多5个
        if (this.profile.skills.length >= 5) {
          uni.showToast({
            title: '技能最多选择5个',
            icon: 'none'
          })
          this.closeGsdModal()
          return
        }
        this.profile.skills.push(process.name)
      }
      uni.showToast({
        title: '技能添加成功',
        icon: 'success'
      })
      this.closeGsdModal()
    },
    // 搜索GSD工序
    searchGsdProcesses() {
      // 搜索逻辑已在computed的filteredGsdProcesses中处理
    },
    saveProfile() {
      // 限制技能数量最多5个
      if (this.profile.skills.length > 5) {
        uni.showToast({
          title: '技能最多选择5个',
          icon: 'none'
        })
        return
      }
      
      uni.setStorageSync('skillProfile', this.profile)
      // 保存计薪模式到本地存储，与首页保持同步
      if (this.profile.wageMode) {
        uni.setStorageSync('wageMode', this.profile.wageMode)
      }
      uni.showToast({
        title: '保存成功',
        icon: 'success'
      })
    },
    toggleSkill(skillName, isChecked) {
      if (isChecked) {
        // 限制技能数量最多5个
        if (this.profile.skills.length >= 5) {
          uni.showToast({
            title: '技能最多选择5个',
            icon: 'none'
          })
          return
        }
        if (!this.profile.skills.includes(skillName)) {
          this.profile.skills.push(skillName)
        }
      } else {
        this.profile.skills = this.profile.skills.filter(skill => skill !== skillName)
      }
    },
    addCustomSkill() {
      if (this.customSkill.trim()) {
        const skillName = this.customSkill.trim()
        // 检查技能是否已存在
        const isExist = this.skills.some(skill => skill.name === skillName)
        if (!isExist) {
          // 添加到技能列表，包含 levelIndex 字段
          this.skills.push({ name: skillName, levelIndex: 0 })
          // 自动选中该技能
          if (!this.profile.skills.includes(skillName)) {
            // 限制技能数量最多5个
            if (this.profile.skills.length >= 5) {
              uni.showToast({
                title: '技能最多选择5个',
                icon: 'none'
              })
              return
            }
            this.profile.skills.push(skillName)
          }
          uni.showToast({
            title: '技能添加成功',
            icon: 'success'
          })
        } else {
          uni.showToast({
            title: '该技能已存在',
            icon: 'none'
          })
        }
        // 清空输入框
        this.customSkill = ''
      } else {
        uni.showToast({
          title: '请输入技能名称',
          icon: 'none'
        })
      }
    },
    generateResume() {
      uni.showLoading({
        title: '生成简历中...'
      })
      
      setTimeout(() => {
        uni.hideLoading()
        // 跳转到简历分享页面
        uni.navigateTo({
          url: './resume-share'
        })
      }, 1000)
    },
    shareProfile() {
      uni.showActionSheet({
        itemList: ['分享到微信', '复制分享链接'],
        success: (res) => {
          if (res.tapIndex === 0) {
            uni.showToast({
              title: '已选择分享到微信',
              icon: 'none'
            })
          } else if (res.tapIndex === 1) {
            uni.setClipboardData({
              data: 'https://yiqizhuan.com/profile/' + Math.random().toString(36).substr(2, 9),
              success: () => {
                uni.showToast({
                  title: '链接已复制到剪贴板',
                  icon: 'success'
                })
              }
            })
          }
        }
      })
    },
    scrollToForm() {
      // 滚动到表单区域
      uni.createSelectorQuery().select('.profile-form').boundingClientRect((rect) => {
        if (rect) {
          uni.pageScrollTo({
            scrollTop: rect.top - 100,
            duration: 300
          })
        }
      }).exec()
    },
    typeChange(e) {
      this.typeIndex = e.detail.value
    },
    // 计薪模式变更处理
    wageModeChange(e) {
      const index = e.detail.value
      this.profile.wageMode = this.wageModes[index].value
      // 保存计薪模式到本地存储，与首页保持同步
      uni.setStorageSync('wageMode', this.profile.wageMode)
      // 如果切换到计时模式，清空岗位类型
      if (this.profile.wageMode === 'hourly') {
        this.profile.hourlyJobType = ''
      }
    },
    // 获取计时工人岗位类型选项
    getHourlyJobTypeOptions() {
      let options = []
      this.hourlyJobTypes.forEach(category => {
        category.options.forEach(option => {
          options.push(`${category.category} - ${option}`)
        })
      })
      return options
    },
    // 计时工人岗位类型变更处理
    hourlyJobTypeChange(e) {
      const index = e.detail.value
      const options = this.getHourlyJobTypeOptions()
      this.profile.hourlyJobType = options[index]
    },
    // 工时制度变更处理
    workHourSystemChange(e) {
      const index = e.detail.value
      this.profile.workHourPreference.workHourSystem = this.workHourSystems[index]
    },
    // 用工周期变更处理
    employmentCycleChange(e) {
      const index = e.detail.value
      this.profile.workHourPreference.employmentCycle = this.employmentCycles[index]
    },
    // 固定工时变更处理
    fixedHoursChange(e) {
      const index = e.detail.value
      this.profile.workHourPreference.fixedHours = this.fixedHoursOptions[index]
    },
    updateSkillLevel(index, levelIndex) {
      this.skills[index].levelIndex = levelIndex
    },
    viewAllEvaluations() {
      uni.showToast({
        title: '查看所有评价功能开发中',
        icon: 'none'
      })
    },
    evaluatePeer() {
      uni.showToast({
        title: '评价工友功能开发中',
        icon: 'none'
      })
    },
    evaluateLedger() {
      uni.showToast({
        title: '记账背书功能开发中',
        icon: 'none'
      })
    },
    inviteLikes() {
      // 生成分享链接
      const shareUrl = 'https://yiqizhuan.com/like/' + Math.random().toString(36).substr(2, 9)
      
      uni.showActionSheet({
        itemList: ['分享到微信', '复制分享链接'],
        success: (res) => {
          // 标记用户已经发起过点赞邀请
          this.hasInvitedLikes = true
          
          if (res.tapIndex === 0) {
            uni.showToast({
              title: '已选择分享到微信',
              icon: 'none'
            })
          } else if (res.tapIndex === 1) {
            uni.setClipboardData({
              data: shareUrl,
              success: () => {
                uni.showToast({
                  title: '链接已复制到剪贴板',
                  icon: 'success'
                })
              }
            })
          }
        }
      })
    },
    // 工作意向标签相关方法
    toggleRegion(regionName, isChecked) {
      if (isChecked) {
        if (!this.profile.intendedRegions.includes(regionName)) {
          this.profile.intendedRegions.push(regionName)
        }
      } else {
        this.profile.intendedRegions = this.profile.intendedRegions.filter(region => region !== regionName)
      }
    },
    togglePaymentPreference(payment, isChecked) {
      if (isChecked) {
        if (!this.profile.paymentPreferences.includes(payment)) {
          this.profile.paymentPreferences.push(payment)
        }
      } else {
        this.profile.paymentPreferences = this.profile.paymentPreferences.filter(p => p !== payment)
      }
    },
    toggleCategory(category, isChecked) {
      if (isChecked) {
        if (!this.profile.specializedCategories.includes(category)) {
          this.profile.specializedCategories.push(category)
        }
      } else {
        this.profile.specializedCategories = this.profile.specializedCategories.filter(c => c !== category)
      }
    }
  }
}
</script>

<style scoped>
.skill-profile-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  text-align: center;
  margin-bottom: 10rpx;
}

.subtitle {
  font-size: 24rpx;
  color: #666;
  display: block;
  text-align: center;
  line-height: 1.4;
}

/* 完善档案提醒样式 */
.profile-reminder {
  background: linear-gradient(135deg, #FFF3E0, #FFE0B2);
  border-radius: 15rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 15rpx;
}

.reminder-icon {
  font-size: 32rpx;
}

.reminder-text {
  flex: 1;
  font-size: 24rpx;
  color: #E65100;
  line-height: 1.4;
}

.reminder-btn {
  background-color: #FF9800;
  color: #fff;
  border: none;
  border-radius: 15rpx;
  padding: 10rpx 20rpx;
  font-size: 22rpx;
  font-weight: bold;
  box-shadow: 0 2rpx 8rpx rgba(255, 152, 0, 0.3);
}

.reminder-btn:active {
  background-color: #F57C00;
  transform: scale(0.95);
}

/* 档案亮点样式 */
.profile-highlights {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.highlights-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 25rpx;
  display: block;
}

/* 1. 信誉分样式 */
.reputation-section {
  margin-bottom: 25rpx;
}

.reputation-score {
  background-color: #f9f9f9;
  padding: 30rpx;
  border-radius: 10rpx;
  border-left: 5rpx solid #FF9800;
  display: flex;
  align-items: baseline;
  gap: 15rpx;
}

.score-number {
  font-size: 48rpx;
  font-weight: bold;
  color: #FF9800;
  text-shadow: 0 2rpx 4rpx rgba(255, 152, 0, 0.3);
}

.score-label {
  font-size: 24rpx;
  color: #666;
  font-weight: bold;
}

.score-desc {
  font-size: 24rpx;
  color: #333;
  font-weight: bold;
  margin-left: 10rpx;
}

/* 2. 记账实绩样式 */
.work-records-section {
  margin-bottom: 25rpx;
}

.work-records {
  background-color: #f9f9f9;
  padding: 20rpx;
  border-radius: 10rpx;
  border-left: 5rpx solid #4CAF50;
}

.work-record-item {
  margin-bottom: 10rpx;
  font-size: 24rpx;
  color: #333;
}

.record-skill {
  font-weight: bold;
  color: #4CAF50;
}

.record-count {
  margin-left: 10rpx;
}

.record-level {
  margin-left: 10rpx;
  font-weight: bold;
  color: #FF9800;
}

/* 2. 技能特长样式 */
.skill-specialty-section {
  margin-bottom: 25rpx;
}

.skill-specialty {
  background-color: #f9f9f9;
  padding: 20rpx;
  border-radius: 10rpx;
  border-left: 5rpx solid #2196F3;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 15rpx;
}

.specialty-label {
  font-size: 24rpx;
  color: #666;
  flex-shrink: 0;
}

.specialty-skills {
  font-size: 24rpx;
  color: #333;
  flex: 1;
}

.edit-btn {
  background-color: #2196F3;
  color: #fff;
  border: none;
  border-radius: 15rpx;
  padding: 8rpx 15rpx;
  font-size: 22rpx;
  flex-shrink: 0;
}

/* 3. 工友认可样式 */
.peer-recognition-section {
  margin-bottom: 25rpx;
}

.total-likes {
  background-color: #fff3cd;
  padding: 15rpx;
  border-radius: 10rpx;
  margin-bottom: 15rpx;
  border-left: 5rpx solid #ffcc00;
}

.total-likes-text {
  font-size: 24rpx;
  color: #856404;
  font-weight: bold;
  text-align: center;
  display: block;
}

.peer-recognition {
  background-color: #f9f9f9;
  padding: 20rpx;
  border-radius: 10rpx;
  border-left: 5rpx solid #FF9800;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
}

.recognition-item {
  margin-bottom: 10rpx;
}

.recognition-tag {
  display: inline-flex;
  align-items: center;
  background-color: #fff;
  border-radius: 20rpx;
  padding: 8rpx 20rpx;
  margin-right: 10rpx;
  margin-bottom: 10rpx;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
  position: relative;
}

.recognition-skill {
  font-size: 22rpx;
  color: #333;
  margin-right: 30rpx;
}

.recognition-count {
  font-size: 18rpx;
  color: #ff6b6b;
  font-weight: bold;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 12rpx;
  padding: 2rpx 8rpx;
  box-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.1);
  position: absolute;
  right: -5rpx;
  top: -5rpx;
  border: 1rpx solid #ff6b6b;
}

.invite-btn {
  margin-top: 15rpx;
  background-color: #FF6B35;
  color: #fff;
  border: none;
  border-radius: 25rpx;
  padding: 15rpx 30rpx;
  font-size: 24rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 10rpx;
  position: relative;
}

.invite-btn.disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.like-icon {
  font-size: 28rpx;
}

.like-btn-text {
  font-size: 24rpx;
}

.red-dot {
  position: absolute;
  top: -5rpx;
  right: -5rpx;
  width: 15rpx;
  height: 15rpx;
  background-color: #FF4D4F;
  border-radius: 50%;
  border: 2rpx solid #fff;
}

/* 4. 工厂评价样式 */
.factory-evaluation-section {
  margin-bottom: 25rpx;
}

.factory-evaluation {
  background-color: #f9f9f9;
  padding: 20rpx;
  border-radius: 10rpx;
  border-left: 5rpx solid #9C27B0;
}

.factory-comment {
  font-size: 24rpx;
  color: #333;
  line-height: 1.4;
}

/* 技能熟练度星星样式 */
.skill-stars {
  display: flex;
  margin-left: 10rpx;
  margin-right: 10rpx;
}

.star {
  font-size: 24rpx;
  color: #ddd;
  margin-right: 2rpx;
}

.star.active {
  color: #ffcc00;
  text-shadow: 0 1rpx 2rpx rgba(255, 165, 0, 0.5);
}

/* 技能描述样式 */
.skill-description-section {
  margin-bottom: 25rpx;
}

.skill-description {
  background-color: #f9f9f9;
  padding: 20rpx;
  border-radius: 10rpx;
  border-left: 5rpx solid #4A90E2;
}

.description-content {
  font-size: 24rpx;
  color: #333;
  line-height: 1.4;
}

/* 核心信息样式 */
.core-info-section {
  margin-bottom: 25rpx;
}

.core-info {
  background-color: #f9f9f9;
  padding: 20rpx;
  border-radius: 10rpx;
  border-left: 5rpx solid #2196F3;
}

.info-item {
  margin-bottom: 15rpx;
  font-size: 24rpx;
  color: #333;
}

.info-label {
  font-weight: bold;
  color: #666;
  margin-right: 10rpx;
}

.info-value {
  color: #333;
}

/* 联系信息样式 */
.contact-section {
  margin-bottom: 25rpx;
}

.contact-info {
  background-color: #f9f9f9;
  padding: 20rpx;
  border-radius: 10rpx;
}

.contact-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.contact-label {
  font-size: 24rpx;
  color: #666;
}

.contact-value {
  font-size: 24rpx;
  color: #333;
  flex: 1;
  margin: 0 20rpx;
}

.copy-btn {
  padding: 8rpx 20rpx;
  font-size: 22rpx;
  border-radius: 15rpx;
  background-color: #4A90E2;
  color: #fff;
}

/* 评价背书样式 */
.evaluation-section {
  margin-bottom: 25rpx;
}

.evaluation-container {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.evaluation-column {
  flex: 1;
}

.evaluation-title {
  font-size: 24rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 15rpx;
  display: block;
}

.peer-evaluations,
.factory-evaluations {
  gap: 15rpx;
}

.evaluation-bubble {
  padding: 20rpx;
  border-radius: 20rpx;
  margin-bottom: 15rpx;
  position: relative;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.peer-bubble {
  background-color: rgba(255, 165, 0, 0.2);
  border: 1rpx solid #ff9800;
  border-left: 4rpx solid #ff9800;
}

.factory-bubble {
  background-color: rgba(74, 144, 226, 0.2);
  border: 1rpx solid #4A90E2;
  border-left: 4rpx solid #4A90E2;
}

.evaluation-content {
  font-size: 22rpx;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
  line-height: 1.4;
}

.evaluation-from {
  font-size: 20rpx;
  color: #666;
  display: block;
  text-align: right;
}

.factory-eval-tag {
  font-size: 22rpx;
  font-weight: bold;
  color: #333;
  display: inline;
  margin-right: 5rpx;
}

.factory-eval-score {
  font-size: 24rpx;
  font-weight: bold;
  color: #4A90E2;
  display: inline;
  margin-right: 5rpx;
}

.factory-eval-comment {
  font-size: 20rpx;
  color: #666;
  display: inline;
  line-height: 1.4;
}

.no-evaluation {
  text-align: center;
  padding: 30rpx;
  background-color: #f9f9f9;
  border-radius: 10rpx;
  margin-bottom: 15rpx;
}

.no-evaluation-text {
  font-size: 22rpx;
  color: #999;
}

.view-all-evaluations {
  text-align: center;
  margin-top: 10rpx;
}

.view-all-btn {
  background-color: #f0f0f0;
  color: #333;
  border: none;
  border-radius: 20rpx;
  padding: 10rpx 20rpx;
  font-size: 20rpx;
}

.view-all-btn:hover {
  background-color: #e0e0e0;
}

.view-all-btn:active {
  background-color: #d0d0d0;
}

.peer-eval-btn {
  background-color: #4A90E2;
  color: #fff;
  margin: 0 5rpx;
}

.peer-eval-btn:hover {
  background-color: #357ABD;
}

.peer-eval-btn:active {
  background-color: #285E8E;
}

.ledger-eval-btn {
  background-color: #5CB85C;
  color: #fff;
  margin: 0 5rpx;
}

.ledger-eval-btn:hover {
  background-color: #4CAE4C;
}

.ledger-eval-btn:active {
  background-color: #3D8B3D;
}

.view-all-btn:active {
  transform: scale(0.95);
}

.profile-form {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.form-section {
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.section-subtitle {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 15rpx;
  display: block;
}

.form-item {
  margin-bottom: 20rpx;
}

.form-label {
  font-size: 24rpx;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

/* 复选框项样式 */
.checkbox-item {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.checkbox-label {
  font-size: 24rpx;
  color: #333;
  margin-left: 10rpx;
}

.form-input {
  height: 70rpx;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  padding: 0 15rpx;
  font-size: 24rpx;
  background-color: #f9f9f9;
}

.form-textarea {
  min-height: 150rpx;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  padding: 15rpx;
  font-size: 24rpx;
  background-color: #f9f9f9;
}

.skill-list {
  gap: 15rpx;
}

.skill-item {
  display: flex;
  align-items: center;
  margin-bottom: 15rpx;
  padding: 15rpx;
  background-color: #f9f9f9;
  border-radius: 10rpx;
}

.skill-name {
  flex: 1;
  font-size: 24rpx;
  color: #333;
  margin-left: 10rpx;
}

.skill-level {
  margin-left: 10rpx;
}

.level-picker {
  padding: 8rpx 15rpx;
  background-color: #fff;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  font-size: 22rpx;
  color: #333;
}

.star-rating {
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.star-rating .star {
  font-size: 28rpx;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
}

.star-rating .star:hover {
  transform: scale(1.1);
}

.star-rating .star.active {
  color: #ffcc00;
  text-shadow: 0 1rpx 2rpx rgba(255, 165, 0, 0.5);
}

.star-rating .star:not(.active) {
  color: #ddd;
}

/* 上传按钮样式 */
.upload-btn {
  height: 70rpx;
  line-height: 70rpx;
  background-color: #f0f0f0;
  color: #333;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  font-size: 24rpx;
  margin-bottom: 15rpx;
}

/* 添加技能按钮样式 */
.add-skill-btn {
  height: 70rpx;
  line-height: 70rpx;
  background-color: #4A90E2;
  color: #fff;
  border: none;
  border-radius: 10rpx;
  font-size: 24rpx;
  margin-top: 10rpx;
  width: 100%;
}



/* 评价占位符样式 */
.evaluation-placeholder {
  background-color: #f9f9f9;
  padding: 30rpx;
  border-radius: 10rpx;
  text-align: center;
}

.placeholder-text {
  font-size: 22rpx;
  color: #999;
  line-height: 1.5;
}

/* 实用工具区域样式 */
.utility-section {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.utility-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
}

.utility-btn {
  flex: 1;
  min-width: calc(33.333% - 10rpx);
  height: 120rpx;
  background-color: #f9f9f9;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  font-size: 22rpx;
  color: #333;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
}

.utility-btn.primary-btn {
  background-color: #4A90E2;
  color: #fff;
  border-color: #4A90E2;
  font-weight: bold;
  box-shadow: 0 4rpx 12rpx rgba(74, 144, 226, 0.3);
}

.btn-icon {
  font-size: 36rpx;
}

.btn-text {
  font-size: 20rpx;
  text-align: center;
}

.action-buttons {
  display: flex;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.action-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 10rpx;
  font-size: 28rpx;
}

/* GSD模态框样式 */
.gsd-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.gsd-modal {
  background-color: #fff;
  border-radius: 20rpx;
  width: 90%;
  max-height: 80vh;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.gsd-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #e0e0e0;
  background-color: #f5f5f5;
}

.gsd-modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.gsd-modal-close {
  font-size: 48rpx;
  color: #999;
  cursor: pointer;
  line-height: 1;
}

.gsd-modal-content {
  padding: 30rpx;
  max-height: 60vh;
  overflow-y: auto;
}

.gsd-search {
  display: flex;
  margin-bottom: 30rpx;
  gap: 15rpx;
}

.gsd-search-input {
  flex: 1;
  height: 70rpx;
  line-height: 70rpx;
  background-color: #f0f0f0;
  color: #333;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  font-size: 24rpx;
  padding: 0 20rpx;
}

.gsd-search-btn {
  height: 70rpx;
  line-height: 70rpx;
  background-color: #4A90E2;
  color: #fff;
  border: none;
  border-radius: 10rpx;
  font-size: 24rpx;
  padding: 0 30rpx;
  white-space: nowrap;
}

.gsd-process-list {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.gsd-process-item {
  background-color: #f9f9f9;
  border: 1rpx solid #e0e0e0;
  border-radius: 15rpx;
  padding: 20rpx;
  cursor: pointer;
  transition: all 0.3s ease;
}

.gsd-process-item:active {
  background-color: #e8f0fe;
  border-color: #4A90E2;
  transform: scale(0.98);
}

.gsd-process-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.gsd-process-standard {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.gsd-process-desc {
  font-size: 22rpx;
  color: #999;
  line-height: 1.4;
  margin-bottom: 8rpx;
  display: block;
}

.gsd-process-level {
  font-size: 20rpx;
  color: #4A90E2;
  font-weight: 500;
  display: block;
}

.gsd-empty {
  text-align: center;
  padding: 60rpx 20rpx;
  background-color: #f9f9f9;
  border-radius: 15rpx;
  border: 1rpx dashed #e0e0e0;
}

.gsd-empty-text {
  font-size: 24rpx;
  color: #999;
}

.save-btn {
  background-color: #4A90E2;
  color: #fff;
}

/* 关注按钮样式 */
.header-buttons {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  display: flex;
  gap: 10rpx;
}

.follow-btn {
  background-color: #f0f0f0;
  color: #333;
  border: none;
  border-radius: 20rpx;
  padding: 10rpx 20rpx;
  font-size: 24rpx;
}

.follow-btn.followed {
  background-color: #FF6B35;
  color: #fff;
}

/* 消息按钮样式 */
.message-btn {
  background-color: #4A90E2;
  color: #fff;
  border: none;
  border-radius: 20rpx;
  padding: 10rpx 20rpx;
  font-size: 24rpx;
}

/* 计薪模式与稳定性数据样式 */
.wage-mode-section {
  margin-bottom: 25rpx;
}

.wage-mode-stats {
  background-color: #f9f9f9;
  padding: 20rpx;
  border-radius: 10rpx;
  border-left: 5rpx solid #4CAF50;
  margin-bottom: 20rpx;
}

.wage-mode-item {
  margin-bottom: 10rpx;
  font-size: 24rpx;
  color: #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sub-section-title {
  font-size: 24rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 15rpx;
  display: block;
}

.stability-section {
  margin-top: 20rpx;
}

.stability-stats {
  background-color: #f9f9f9;
  padding: 20rpx;
  border-radius: 10rpx;
  border-left: 5rpx solid #2196F3;
}

.stability-stat-item {
  margin-bottom: 15rpx;
  font-size: 24rpx;
  color: #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.stability-label {
  flex: 1;
  margin-right: 10rpx;
}

.stability-value {
  font-weight: bold;
  margin-right: 10rpx;
}

.stability-tag {
  padding: 5rpx 15rpx;
  border-radius: 15rpx;
  font-size: 20rpx;
  font-weight: bold;
}

.stability-tag.high-stability {
  background-color: #4CAF50;
  color: #fff;
}

.stability-tag.medium-stability {
  background-color: #FFC107;
  color: #333;
}

.stability-tag.low-stability {
  background-color: #FF5722;
  color: #fff;
}

/* 简历背书样式 */
.resume-endorsement-section {
  margin-bottom: 25rpx;
}

.endorsement-content {
  background-color: #f9f9f9;
  padding: 20rpx;
  border-radius: 10rpx;
  border-left: 5rpx solid #9C27B0;
}

.stability-tags {
  margin-bottom: 15rpx;
}

.tag-label {
  font-size: 24rpx;
  color: #666;
  margin-right: 10rpx;
}

.tag-list {
  display: inline-block;
}

.factory-endorsement {
  margin-top: 15rpx;
}

.endorsement-label {
  font-size: 24rpx;
  color: #666;
  margin-right: 10rpx;
}

.endorsement-value {
  font-size: 24rpx;
  color: #333;
  line-height: 1.4;
}

/* 工作意向标签样式 */
.region-list,
.payment-list,
.category-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
  margin-bottom: 20rpx;
}

.region-item,
.payment-item,
.category-item {
  display: flex;
  align-items: center;
  background-color: #f9f9f9;
  padding: 15rpx 20rpx;
  border-radius: 20rpx;
  margin-right: 10rpx;
  margin-bottom: 10rpx;
}

.region-name,
.payment-name,
.category-name {
  font-size: 24rpx;
  color: #333;
  margin-left: 10rpx;
}
</style>