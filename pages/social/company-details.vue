<template>
  <view class="company-details-container">
    <view class="header">
      <text class="title">招聘详情</text>
    </view>
    <view class="company-profile">
      <view class="profile-header">
        <view class="company-avatar">
          <image :src="companyInfo.avatar || '../../static/logo.png'" mode="aspectFill" class="avatar-img" />
        </view>
        <view class="company-info">
          <text class="company-name">{{ companyInfo.company || '未知公司' }}</text>
          <text class="company-location">{{ companyInfo.location || '未知位置' }}</text>
          <!-- 综合评分 -->
          <view class="company-rating" v-if="factoryEvaluation">
            <text class="rating-label">综合评分：</text>
            <text class="rating-value">{{ (factoryEvaluation.weightedScore || 0).toFixed(1) }}</text>
            <view class="star-rating">
              <text v-for="star in 5" :key="star" :class="['star', (factoryEvaluation.weightedScore || 0) >= star ? 'active' : '']">★</text>
            </view>
            <text v-if="(factoryEvaluation.totalEvaluations || 0) < 3" class="evaluation-tip">评价较少，仅供参考</text>
          </view>
          <view class="company-rating" v-else>
            <text class="rating-label">综合评分：</text>
            <text class="rating-value gray">暂无评分</text>
            <view class="star-rating">
              <text v-for="star in 5" :key="star" class="star gray">☆</text>
            </view>
          </view>
          <!-- 平台认证信用条 -->
          <view class="platform-guarantee">
            <text class="guarantee-text">平台认证 | 发薪准时率100% | 对账确认率98%</text>
          </view>
        </view>
      </view>
      <!-- 三维度评分区 -->
      <view class="rating-dimensions" v-if="factoryEvaluation">
        <view class="dimension-item">
          <text class="dimension-label">发工资准时</text>
          <text class="dimension-score">{{ (factoryEvaluation.salaryOnTime || 0).toFixed(1) }}分</text>
          <view class="star-rating">
            <text v-for="star in 5" :key="star" :class="['star', (factoryEvaluation.salaryOnTime || 0) >= star ? 'active' : '']">★</text>
          </view>
        </view>
        <view class="dimension-item">
          <text class="dimension-label">活多稳定</text>
          <text class="dimension-score">{{ (factoryEvaluation.workStability || 0).toFixed(1) }}分</text>
          <view class="star-rating">
            <text v-for="star in 5" :key="star" :class="['star', (factoryEvaluation.workStability || 0) >= star ? 'active' : '']">★</text>
          </view>
        </view>
        <view class="dimension-item">
          <text class="dimension-label">管理规范</text>
          <text class="dimension-score">{{ (factoryEvaluation.managementStandard || 0).toFixed(1) }}分</text>
          <view class="star-rating">
            <text v-for="star in 5" :key="star" :class="['star', (factoryEvaluation.managementStandard || 0) >= star ? 'active' : '']">★</text>
          </view>
        </view>
      </view>
      <!-- 工厂实拍图轮播 -->
      <view v-if="companyInfo.factoryPhotos && companyInfo.factoryPhotos.length > 0" class="factory-photo-carousel">
        <swiper class="carousel" indicator-dots circular>
          <swiper-item v-for="(photo, index) in companyInfo.factoryPhotos" :key="index" v-if="index !== 1">
            <image :src="photo" mode="aspectFill" class="carousel-image" />
          </swiper-item>
        </swiper>
      </view>
    </view>
    <view class="job-details">
      <!-- 匹配度提示 -->
      <view class="match-info" v-if="matchInfo.score >= 0">
        <text class="match-message">{{ matchInfo.message }}</text>
        <view class="match-progress">
          <view class="progress-bar">
            <view class="progress-fill" :style="{ width: matchInfo.score + '%' }"></view>
          </view>
          <text class="progress-text">{{ matchInfo.score }}%</text>
        </view>
        <view v-if="matchInfo.matchedProcesses.length > 0" class="match-details">
          <text class="detail-label">匹配的工序：</text>
          <view class="process-tags">
            <text v-for="process in matchInfo.matchedProcesses" :key="process" class="process-tag matched">{{ process }}</text>
          </view>
        </view>
        <view v-if="matchInfo.unmatchedProcesses.length > 0" class="match-details">
          <text class="detail-label">未匹配的工序：</text>
          <view class="process-tags">
            <text v-for="process in matchInfo.unmatchedProcesses" :key="process" class="process-tag unmatched">{{ process }}</text>
          </view>
        </view>
      </view>
      
      <view class="job-header">
        <text class="job-title">{{ companyInfo.title || '未知职位' }}</text>
        <text class="job-salary">{{ companyInfo.salary || '薪资面议' }}</text>
      </view>
      <view class="job-info">
        <view class="info-item">
          <text class="info-label">工作经验：</text>
          <text class="info-value">{{ companyInfo.experience || getExperienceText(companyInfo.experienceLevel) }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">招聘类型：</text>
          <text class="info-value">{{ companyInfo.type || '不限' }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">发布日期：</text>
          <text class="info-value">{{ companyInfo.publishDate || '未知' }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">申请人数：</text>
          <text class="info-value">{{ companyInfo.applicantCount || 0 }}人</text>
        </view>
      </view>
      <view class="job-description">
        <text class="section-title">职位描述</text>
        <text :class="['description-text', { 'expanded': expandedDescription }]">{{ companyInfo.description || '暂无描述' }}</text>
        <text v-if="companyInfo.description && companyInfo.description.length > 100" class="view-full-text" @click="toggleDescriptionExpand">
          {{ expandedDescription ? '收起' : '查看全文' }}
        </text>
      </view>
      <view class="contact-info">
        <text class="section-title">联系方式</text>
        <view class="contact-item">
          <text class="contact-label">微信：</text>
          <text class="contact-value">{{ companyInfo.wechat || '未提供' }}</text>
        </view>
        <view class="contact-item">
          <text class="contact-label">电话：</text>
          <text class="contact-value">{{ companyInfo.phone || '未提供' }}</text>
        </view>
      </view>
      
      <!-- 我要评价 -->
      <view class="evaluation-section">
        <text class="section-title">我要评价</text>
        <view class="evaluation-form">
          <!-- 三维度评分 -->
          <view class="evaluation-item">
            <text class="evaluation-label">发工资准时</text>
            <view class="star-rating">
              <text v-for="star in 5" :key="star" :class="['star', salaryOnTime >= star ? 'active' : '']" @click="salaryOnTime = star">★</text>
            </view>
          </view>
          <view class="evaluation-item">
            <text class="evaluation-label">活多稳定</text>
            <view class="star-rating">
              <text v-for="star in 5" :key="star" :class="['star', workStability >= star ? 'active' : '']" @click="workStability = star">★</text>
            </view>
          </view>
          <view class="evaluation-item">
            <text class="evaluation-label">管理规范</text>
            <view class="star-rating">
              <text v-for="star in 5" :key="star" :class="['star', managementStandard >= star ? 'active' : '']" @click="managementStandard = star">★</text>
            </view>
          </view>
          <!-- 评价内容 -->
          <view class="evaluation-item">
            <text class="evaluation-label">评价内容（选填）</text>
            <textarea v-model="comment" placeholder="说说你的真实体验，帮助更多工友避坑～" class="comment-input" @input="checkCommentLength" />
            <text class="comment-length">{{ comment.length }}/500</text>
          </view>
          <!-- 匿名/实名选项 -->
          <view class="evaluation-item">
            <view class="anonymous-option">
              <checkbox :checked="isAnonymous" @change="isAnonymous = !isAnonymous" />
              <text class="anonymous-label">{{ isAnonymous ? '匿名评价（保护隐私）' : '实名评价（老板会看到你的信息）' }}</text>
            </view>
          </view>
          <!-- 提交按钮 -->
          <button :class="['submit-button', canSubmit ? 'active' : '']" :disabled="!canSubmit" @click="submitEvaluation">提交评价</button>
        </view>
      </view>
      
      <!-- 面试评价展示区 -->
      <view class="evaluation-list-section">
        <text class="section-title">面试体验评价</text>
        <view v-if="factoryEvaluation && factoryEvaluation.interviewEvaluations && factoryEvaluation.interviewEvaluations.length > 0" class="evaluation-list">
          <text class="evaluation-count">共{{ factoryEvaluation.interviewTotalEvaluations || 0 }}条面试评价</text>
          <view v-for="evaluation in factoryEvaluation.interviewEvaluations" :key="evaluation.id" class="evaluation-item-card">
            <view class="evaluation-header">
              <text class="evaluator-name">{{ evaluation.isAnonymous ? '匿名工友' : evaluation.evaluatorName }}</text>
              <text class="evaluation-date">{{ evaluation.evaluationDate }}</text>
              <view class="star-rating small">
                <text v-for="star in 5" :key="star" :class="['star', getInterviewEvaluationScore(evaluation) >= star ? 'active' : '']">★</text>
              </view>
              <text 
                v-if="evaluation.evaluationType === 'passerby'" 
                class="passerby-tag"
              >
                路人评价·无用工记录，仅供参考
              </text>
            </view>
            <view class="evaluation-scores">
              <text class="score-item">体验{{ getStarRating(evaluation.interviewExperience) }}</text>
              <text class="score-item">匹配{{ getStarRating(evaluation.jobMatch) }}</text>
              <text class="score-item">接待{{ getStarRating(evaluation.reception) }}</text>
            </view>
            <view class="evaluation-content" :class="{ 'expanded': expandedEvaluations.includes(evaluation.id) }">
              <text class="content-text">{{ evaluation.comment || '暂无评价内容' }}</text>
              <text v-if="evaluation.comment && evaluation.comment.length > 100" class="expand-button" @click="toggleEvaluationExpand(evaluation.id)">
                {{ expandedEvaluations.includes(evaluation.id) ? '收起' : '查看全文' }}
              </text>
            </view>
            <view v-if="evaluation.reply" class="evaluation-reply">
              <text class="reply-label">工厂回复：</text>
              <text class="reply-content">{{ evaluation.reply }}</text>
            </view>
          </view>
        </view>
        <view v-else class="no-evaluations">
          <text>暂无面试评价，快来分享你的面试体验吧！</text>
        </view>
      </view>
      
      <!-- 入职后评价列表 -->
      <view class="evaluation-list-section">
        <text class="section-title">工友评价</text>
        <view v-if="factoryEvaluation && factoryEvaluation.evaluations && factoryEvaluation.evaluations.length > 0" class="evaluation-list">
          <view v-for="evaluation in factoryEvaluation.evaluations" :key="evaluation.id" class="evaluation-item-card">
            <view class="evaluation-header">
              <text class="evaluator-name">{{ evaluation.isAnonymous ? '匿名工友' : evaluation.evaluatorName }}</text>
              <text class="evaluation-date">{{ evaluation.evaluationDate }}</text>
              <view class="star-rating small">
                <text v-for="star in 5" :key="star" :class="['star', getEvaluationScore(evaluation) >= star ? 'active' : '']">★</text>
              </view>
              <text 
                v-if="evaluation.evaluationType === 'passerby'" 
                class="passerby-tag"
              >
                路人评价·无用工记录，仅供参考
              </text>
            </view>
            <view class="evaluation-scores">
              <text class="score-item">工资{{ getStarRating(evaluation.salaryOnTime) }}</text>
              <text class="score-item">稳定{{ getStarRating(evaluation.workStability) }}</text>
              <text class="score-item">管理{{ getStarRating(evaluation.managementStandard) }}</text>
            </view>
            <view class="evaluation-content" :class="{ 'expanded': expandedEvaluations.includes(evaluation.id) }">
              <text class="content-text">{{ evaluation.comment || '暂无评价内容' }}</text>
              <text v-if="evaluation.comment && evaluation.comment.length > 100" class="expand-button" @click="toggleEvaluationExpand(evaluation.id)">
                {{ expandedEvaluations.includes(evaluation.id) ? '收起' : '查看全文' }}
              </text>
            </view>
            <view v-if="evaluation.reply" class="evaluation-reply">
              <text class="reply-label">工厂回复：</text>
              <text class="reply-content">{{ evaluation.reply }}</text>
            </view>
          </view>
        </view>
        <view v-else class="no-evaluations">
          <text>暂无工友评价，快来成为第一个评价的人吧！</text>
        </view>
      </view>
      

      <!-- 推荐更多相似岗位 -->
      <view class="similar-jobs-section">
        <text class="section-title">查看更多相似岗位，精准匹配技能</text>
        <view class="similar-jobs-list" v-if="similarJobs && similarJobs.length > 0">
          <view v-for="job in similarJobs" :key="job.id" class="similar-job-item" @click="navigateTo('./company-details?companyId=' + job.id)">
            <text class="similar-job-title">{{ job.title }}</text>
            <text class="similar-job-company">{{ job.company }}</text>
            <text class="similar-job-salary">{{ job.salary }}</text>
            <view class="similar-job-tags">
              <text v-for="(skill, index) in job.skills" v-if="index < 2" :key="skill" class="similar-job-tag">{{ skill }}</text>
            </view>
          </view>
        </view>
        <view v-else class="no-similar-jobs">
          <text>暂无相似岗位</text>
        </view>
      </view>
      
      <!-- 操作按钮 -->
      <view class="action-buttons">
        <button type="default" class="action-button" @click="applyForJob">申请</button>
        <button type="default" class="action-button" @click="chatWithEmployer">咨询</button>
        <button type="default" class="action-button" @click="makePhoneCall">电话</button>
      </view>
    </view>
  </view>
</template>

<script>
import { getFactoryEvaluation, saveFactoryEvaluation, hasUserEvaluatedFactory } from '../../utils/evaluation.js'
import { checkSensitiveWords, isUserVerified } from '../../utils/sensitive-filter.js'
import { generateSimilarJobs } from '../../utils/job-recommendation.js'

export default {
  data() {
    return {
      companyId: '',
      companyInfo: {},
      matchInfo: {
        score: 0,
        message: '',
        matchedProcesses: [],
        unmatchedProcesses: []
      },
      userSkills: [],
      // 评价相关数据
      factoryEvaluation: null,
      salaryOnTime: 0,
      workStability: 0,
      managementStandard: 0,
      comment: '',
      isAnonymous: true,
      expandedEvaluations: [],
      // 相似岗位
      similarJobs: [],
      // 工作描述展开状态
      expandedDescription: false
    }
  },
  computed: {
    canSubmit() {
      return this.salaryOnTime > 0 && this.workStability > 0 && this.managementStandard > 0
    }
  },
  onLoad(options) {
    this.companyId = options.companyId || ''
    this.loadCompanyInfo()
    this.loadUserSkills()
    this.loadFactoryEvaluation()
  },
  watch: {
    companyInfo: {
      handler(newVal) {
        if (newVal && newVal.id) {
          this.loadSimilarJobs()
        }
      },
      deep: true
    }
  },
  methods: {
    loadUserSkills() {
      // 加载用户技能工序
      const userSkills = uni.getStorageSync('workerSkills') || []
      this.userSkills = userSkills
      
      // 计算匹配度
      this.calculateMatchScore()
    },
    
    calculateMatchScore() {
      if (!this.companyInfo.skills || this.companyInfo.skills.length === 0) {
        this.matchInfo = {
          score: 0,
          message: '该岗位未设置具体工序要求',
          matchedProcesses: [],
          unmatchedProcesses: []
        }
        return
      }
      
      if (this.userSkills.length === 0) {
        this.matchInfo = {
          score: 0,
          message: '请在个人中心设置您的技能工序，获取岗位匹配度',
          matchedProcesses: [],
          unmatchedProcesses: []
        }
        return
      }
      
      // 计算匹配的工序
      const matchedProcesses = []
      const unmatchedProcesses = []
      
      this.companyInfo.skills.forEach(process => {
        if (this.userSkills.includes(process)) {
          matchedProcesses.push(process)
        } else {
          unmatchedProcesses.push(process)
        }
      })
      
      // 计算匹配度分数
      const score = Math.round((matchedProcesses.length / this.companyInfo.skills.length) * 100)
      
      // 生成匹配度提示信息
      let message = ''
      if (score === 100) {
        message = '【你的技能和该岗位工序100%匹配，可快速入职】'
      } else if (score >= 70) {
        message = `【你的技能和该岗位工序${score}%匹配，适合入职】`
      } else if (score >= 40) {
        message = `【你的技能和该岗位工序${score}%匹配，部分工序需要学习】`
      } else {
        message = `【你的技能和该岗位工序${score}%匹配，建议提升相关技能】`
      }
      
      this.matchInfo = {
        score,
        message,
        matchedProcesses,
        unmatchedProcesses
      }
    },
    
    loadCompanyInfo() {
      // 从本地存储加载招聘信息
      const storedRecruitments = uni.getStorageSync('recruitments') || [];
      const companyInfo = storedRecruitments.find(item => item.id.toString() === this.companyId);
      if (companyInfo) {
        this.companyInfo = companyInfo;
      } else {
        // 如果找不到对应ID的招聘信息，显示默认信息
        this.companyInfo = {
          company: '未知公司',
          location: '未知位置',
          title: '未知职位',
          salary: '薪资面议',
          experience: '不限',
          type: '不限',
          publishDate: '未知',
          applicantCount: 0,
          description: '暂无描述',
          wechat: '未提供',
          phone: '未提供',
          skills: [],
          factoryPhotos: []
        };
      }
      
      // 重新计算匹配度
      this.calculateMatchScore();
    },
    
    loadFactoryEvaluation() {
      // 加载工厂评价数据
      this.factoryEvaluation = getFactoryEvaluation(this.companyId)
    },
    
    checkCommentLength() {
      if (this.comment.length > 500) {
        this.comment = this.comment.substring(0, 500)
        uni.showToast({
          title: '评价内容最多500字',
          icon: 'none'
        })
      }
    },
    
    submitEvaluation() {
      // 检查是否已经评价过
      const userInfo = uni.getStorageSync('userInfo') || {}
      const userId = userInfo.phone || userInfo.username || Date.now().toString()
      
      if (hasUserEvaluatedFactory(userId, this.companyId)) {
        uni.showToast({
          title: '您已经评价过该工厂',
          icon: 'none'
        })
        return
      }
      
      // 检查是否已实名
      if (!isUserVerified(userInfo)) {
        uni.showToast({
          title: '评价必须实名制，请先绑定手机号',
          icon: 'none'
        })
        return
      }
      
      // 检查敏感词
      const sensitiveCheck = checkSensitiveWords(this.comment)
      if (sensitiveCheck.hasSensitive) {
        uni.showToast({
          title: '评价内容包含敏感词：' + sensitiveCheck.words.join('、'),
          icon: 'none'
        })
        return
      }
      
      // 提交评价
      const evaluation = {
        evaluatorId: userId,
        evaluatorName: userInfo.username || '匿名用户',
        isAnonymous: this.isAnonymous,
        salaryOnTime: this.salaryOnTime,
        workStability: this.workStability,
        managementStandard: this.managementStandard,
        comment: this.comment
      }
      
      saveFactoryEvaluation(this.companyId, evaluation)
      
      uni.showToast({
        title: '评价提交成功，感谢你的真实分享！',
        icon: 'success'
      })
      
      // 刷新评价数据
      setTimeout(() => {
        this.loadFactoryEvaluation()
        // 重置评价表单
        this.salaryOnTime = 0
        this.workStability = 0
        this.managementStandard = 0
        this.comment = ''
        this.isAnonymous = true
      }, 1000)
    },
    
    getEvaluationScore(evaluation) {
      // 计算单条评价的综合得分
      return ((evaluation.salaryOnTime || 0) + (evaluation.workStability || 0) + (evaluation.managementStandard || 0)) / 3
    },
    
    getStarRating(score) {
      // 将分数转换为星级
      let stars = ''
      for (let i = 1; i <= 5; i++) {
        stars += i <= (score || 0) ? '★' : '☆'
      }
      return stars
    },
    
    toggleEvaluationExpand(evaluationId) {
      const index = this.expandedEvaluations.indexOf(evaluationId)
      if (index > -1) {
        this.expandedEvaluations.splice(index, 1)
      } else {
        this.expandedEvaluations.push(evaluationId)
      }
    },
    
    getInterviewEvaluationScore(evaluation) {
      // 计算单条面试评价的综合得分
      return ((evaluation.interviewExperience || 0) + (evaluation.jobMatch || 0) + (evaluation.reception || 0)) / 3
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
    
    // 加载相似岗位
    loadSimilarJobs() {
      if (!this.companyInfo) return;
      
      // 从本地存储加载所有招聘信息
      const storedRecruitments = uni.getStorageSync('recruitments') || [];
      
      // 生成相似岗位推荐
      this.similarJobs = generateSimilarJobs(this.companyInfo, storedRecruitments, this.getUserInfo(), 4);
    },
    
    // 获取用户信息
    getUserInfo() {
      const userInfo = uni.getStorageSync('userInfo') || {};
      const workerSkills = uni.getStorageSync('workerSkills') || [];
      return {
        ...userInfo,
        skills: workerSkills
      };
    },
    
    // 导航
    navigateTo(url) {
      uni.navigateTo({
        url: url
      });
    },
    
    // 申请工作
    applyForJob() {
      if (!this.companyInfo.id) return;
      
      // 计算技能匹配度
      const matchScore = this.calculateMatchScore();
      
      // 低匹配度提示
      if (matchScore < 60) {
        uni.showModal({
          title: '匹配度提示',
          content: `你的技能与岗位工序匹配度较低(${matchScore}%)，是否继续申请？`,
          success: (res) => {
            if (res.confirm) {
              this.submitApplication();
            }
          }
        });
      } else {
        uni.showModal({
          title: '申请确认',
          content: `你的技能与岗位工序匹配度为${matchScore}%，是否申请该岗位？`,
          success: (res) => {
            if (res.confirm) {
              this.submitApplication();
            }
          }
        });
      }
    },
    
    // 提交申请
    submitApplication() {
      // 模拟申请成功
      uni.showToast({
        title: '申请成功，等待工厂回复',
        duration: 2000
      });
      
      // 记录申请信息（包含匹配度）
      const applications = uni.getStorageSync('jobApplications') || [];
      applications.push({
        jobId: this.companyInfo.id,
        matchScore: this.calculateMatchScore(),
        applyTime: new Date().toISOString()
      });
      uni.setStorageSync('jobApplications', applications);
    },
    
    // 与雇主聊天
    chatWithEmployer() {
      if (!this.companyInfo.id) return;
      uni.navigateTo({
        url: './chat?jobId=' + this.companyInfo.id
      });
    },
    
    // 拨打电话
    makePhoneCall() {
      if (!this.companyInfo.phone) {
        uni.showToast({
          title: '暂无联系电话',
          icon: 'none'
        });
        return;
      }
      uni.makePhoneCall({
        phoneNumber: this.companyInfo.phone
      });
    },
    
    // 切换工作描述展开状态
    toggleDescriptionExpand() {
      this.expandedDescription = !this.expandedDescription;
    }
  }
}
</script>

<style scoped>
.company-details-container {
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
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-btn {
  position: absolute;
  left: 30rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 40rpx;
  height: 40rpx;
  background: transparent;
  border: none;
  font-size: 32rpx;
  color: #333;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  text-align: center;
}

.company-profile {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.profile-header {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}

.company-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 20rpx;
}

.avatar-img {
  width: 100%;
  height: 100%;
}

.company-info {
  flex: 1;
}

.company-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.company-location {
  font-size: 24rpx;
  color: #666;
}

/* 平台认证信用条 */
.platform-guarantee {
  background-color: #FFF8E1;
  height: 48rpx;
  border-radius: 8rpx;
  padding: 0 16rpx;
  display: flex;
  align-items: center;
  margin-top: 12rpx;
}

.guarantee-text {
  font-size: 22rpx;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 综合评分 */
.company-rating {
  margin-top: 10rpx;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.rating-label {
  font-size: 24rpx;
  color: #666;
  margin-right: 10rpx;
}

.rating-value {
  font-size: 28rpx;
  font-weight: bold;
  color: #4A90E2;
  margin-right: 10rpx;
}

.rating-value.gray {
  color: #999;
}

.star-rating {
  display: flex;
  gap: 5rpx;
  margin-right: 10rpx;
}

.star-rating.small {
  font-size: 20rpx;
}

.star {
  font-size: 24rpx;
  color: #ddd;
}

.star.active {
  color: #FFD700;
}

.star.gray {
  color: #ddd;
}

.evaluation-tip {
  font-size: 20rpx;
  color: #999;
  margin-left: 10rpx;
}

/* 三维度评分区 */
.rating-dimensions {
  display: flex;
  justify-content: space-between;
  margin-top: 30rpx;
  padding: 20rpx;
  background-color: #f9f9f9;
  border-radius: 16rpx;
}

.dimension-item {
  flex: 1;
  text-align: center;
}

.dimension-label {
  font-size: 20rpx;
  color: #666;
  display: block;
  margin-bottom: 10rpx;
}

.dimension-score {
  font-size: 24rpx;
  font-weight: bold;
  color: #4A90E2;
  display: block;
  margin-bottom: 10rpx;
}

/* 工厂实拍图轮播 */
.factory-photo-carousel {
  margin-top: 30rpx;
  width: 100%;
  height: 400rpx;
}

.carousel {
  width: 100%;
  height: 100%;
}

.carousel-image {
  width: 100%;
  height: 100%;
  border-radius: 16rpx;
}

/* 评价相关样式 */
.evaluation-section {
  margin-top: 30rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.evaluation-form {
  background-color: #f9f9f9;
  padding: 20rpx;
  border-radius: 16rpx;
  margin-top: 15rpx;
}

.evaluation-item {
  margin-bottom: 20rpx;
}

.evaluation-label {
  font-size: 24rpx;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.comment-input {
  width: 100%;
  min-height: 200rpx;
  padding: 15rpx;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  font-size: 24rpx;
  background-color: #fff;
  resize: none;
}

.comment-length {
  font-size: 20rpx;
  color: #999;
  text-align: right;
  margin-top: 5rpx;
}

.anonymous-option {
  display: flex;
  align-items: center;
}

.anonymous-label {
  font-size: 24rpx;
  color: #666;
  margin-left: 10rpx;
}

.submit-button {
  width: 100%;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  margin-top: 20rpx;
  background-color: #ddd;
  color: #999;
  border: none;
}

.submit-button.active {
  background-color: #4A90E2;
  color: #fff;
}

/* 评价列表 */
.evaluation-list-section {
  margin-top: 30rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.evaluation-list {
  margin-top: 15rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.evaluation-item-card {
  background-color: #f9f9f9;
  padding: 20rpx;
  border-radius: 16rpx;
}

.evaluation-header {
  display: flex;
  align-items: center;
  margin-bottom: 15rpx;
  flex-wrap: wrap;
  gap: 10rpx;
}

.evaluator-name {
  font-size: 24rpx;
  color: #333;
  font-weight: bold;
}

.evaluation-date {
  font-size: 20rpx;
  color: #999;
}

.evaluation-scores {
  display: flex;
  gap: 20rpx;
  margin-bottom: 15rpx;
}

.score-item {
  font-size: 22rpx;
  color: #4A90E2;
}

.evaluation-content {
  margin-bottom: 15rpx;
  position: relative;
}

.evaluation-content:not(.expanded) .content-text {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.content-text {
  font-size: 24rpx;
  color: #333;
  line-height: 1.5;
}

.expand-button {
  font-size: 22rpx;
  color: #4A90E2;
  margin-top: 10rpx;
  display: block;
  cursor: pointer;
}

.evaluation-reply {
  padding-top: 15rpx;
  border-top: 1rpx solid #e0e0e0;
}

.reply-label {
  font-size: 22rpx;
  color: #666;
  margin-right: 10rpx;
}

.reply-content {
  font-size: 22rpx;
  color: #999;
}

.passerby-tag {
  font-size: 20rpx;
  color: #FF9800;
  background-color: #FFF3E0;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  margin-left: 12rpx;
  white-space: nowrap;
}

.no-evaluations {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 24rpx;
  background-color: #f9f9f9;
  border-radius: 16rpx;
  margin-top: 15rpx;
}

.job-details {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.job-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
}

.job-salary {
  font-size: 28rpx;
  font-weight: bold;
  color: #ff6b6b;
}

.job-info {
  margin-bottom: 30rpx;
}

.info-item {
  display: flex;
  margin-bottom: 15rpx;
  align-items: center;
}

.info-label {
  font-size: 24rpx;
  color: #666;
  width: 120rpx;
}

.info-value {
  font-size: 24rpx;
  color: #333;
  flex: 1;
}

.job-description {
  margin-bottom: 30rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.section-title {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 15rpx;
  display: block;
}

.description-text {
  font-size: 24rpx;
  color: #666;
  line-height: 1.5;
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
  font-size: 22rpx;
  color: #4A90E2;
  margin-top: 12rpx;
  display: block;
  cursor: pointer;
  text-align: right;
}

.contact-info {
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.contact-item {
  display: flex;
  margin-bottom: 15rpx;
  align-items: center;
}

.contact-label {
  font-size: 24rpx;
  color: #666;
  width: 80rpx;
}

.contact-value {
  font-size: 24rpx;
  color: #333;
  flex: 1;
}

/* 匹配度提示样式 */
.match-info {
  background-color: #f0f8ff;
  border: 2rpx solid #1e90ff;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.match-message {
  font-size: 24rpx;
  color: #1e90ff;
  font-weight: bold;
  display: block;
  margin-bottom: 16rpx;
}

.match-progress {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
  gap: 16rpx;
}

.progress-bar {
  flex: 1;
  height: 12rpx;
  background-color: #e0e0e0;
  border-radius: 6rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #1e90ff;
  border-radius: 6rpx;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 24rpx;
  font-weight: bold;
  color: #1e90ff;
  min-width: 60rpx;
  text-align: right;
}

.match-details {
  margin-top: 16rpx;
}

.detail-label {
  font-size: 22rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.process-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.process-tag {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 20rpx;
}

.process-tag.matched {
  background-color: #e6f7ff;
  color: #1890ff;
  border: 2rpx solid #91d5ff;
}

.process-tag.unmatched {
  background-color: #fff2e8;
  color: #fa8c16;
  border: 2rpx solid #ffd591;
}

/* 推荐更多相似岗位 */
.similar-jobs-section {
  margin-top: 30rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.similar-jobs-list {
  margin-top: 15rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.similar-job-item {
  background-color: #f9f9f9;
  padding: 20rpx;
  border-radius: 16rpx;
  cursor: pointer;
  transition: all 0.2s ease;
}

.similar-job-item:active {
  background-color: #f0f0f0;
}

.similar-job-title {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.similar-job-company {
  font-size: 22rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.similar-job-salary {
  font-size: 24rpx;
  font-weight: bold;
  color: #ff6b6b;
  display: block;
  margin-bottom: 12rpx;
}

.similar-job-tags {
  display: flex;
  gap: 8rpx;
  flex-wrap: wrap;
}

.similar-job-tag {
  font-size: 20rpx;
  color: #2196F3;
  border: 1rpx solid #2196F3;
  border-radius: 12rpx;
  padding: 4rpx 12rpx;
  white-space: nowrap;
}

.no-similar-jobs {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 24rpx;
  background-color: #f9f9f9;
  border-radius: 16rpx;
  margin-top: 15rpx;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 16rpx;
  margin-top: 30rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.action-button {
  flex: 1;
  height: 80rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: bold;
  background-color: #4A90E2;
  color: #fff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-button:active {
  background-color: #357ABD;
}

</style>