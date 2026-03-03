<template>
  <view class="resume-detail-container">
    <view class="header">
      <text class="title">简历详情</text>
    </view>
    
    <view class="personal-info-section">
      <view class="info-header">
        <text class="section-title">个人信息</text>
      </view>
      <view class="info-content">
        <view class="info-item">
          <text class="info-label">姓名：</text>
          <text class="info-value">{{resume.name}}</text>
        </view>
        <view class="info-item">
          <text class="info-label">年龄：</text>
          <text class="info-value">{{resume.age}}岁</text>
        </view>
        <view class="info-item">
          <text class="info-label">性别：</text>
          <text class="info-value">{{resume.gender}}</text>
        </view>
        <view class="info-item">
          <text class="info-label">学历：</text>
          <text class="info-value">{{resume.education}}</text>
        </view>
        <view class="info-item">
          <text class="info-label">工作经验：</text>
          <text class="info-value">{{resume.experience}}</text>
        </view>
        <view class="info-item">
          <text class="info-label">期望薪资：</text>
          <text class="info-value">{{resume.expectedSalary}}</text>
        </view>
        <view class="info-item">
          <text class="info-label">类型：</text>
          <text class="info-value">{{resume.type || '未选择'}}</text>
        </view>
        <view class="info-item">
          <text class="info-label">手机号码：</text>
          <text v-if="canViewPhone && !phoneMasked" class="info-value">{{resume.phone || '未填写'}}</text>
          <view v-else class="phone-masked">
            <text class="info-value">139****6666</text>
            <button v-if="!canViewPhone" class="unlock-btn" @click="unlockPhone">解锁查看</button>
          </view>
        </view>

      </view>
    </view>
    
    <!-- 记账实绩 -->
    <view class="work-records-section">
      <view class="info-header">
        <text class="section-title">记账实绩</text>
      </view>
      <view class="work-records-content">
        <view v-if="resume.workRecords && resume.workRecords.length > 0" class="work-record-item" v-for="(record, index) in resume.workRecords" :key="index">
          <view class="record-main">
            <text class="record-skill">{{record.skill}}</text>
            <text class="record-count">｜累计 {{record.count}} 件</text>
            <text class="record-level">｜{{record.level}}</text>
          </view>
        </view>
        <view v-else class="no-record">
          <text>暂无记账实绩</text>
        </view>
      </view>
    </view>
    
    <!-- 技能特长 -->
    <view class="skills-section">
      <view class="info-header">
        <text class="section-title">技能特长</text>
      </view>
      <view class="skills-content">
        <text v-for="(skill, index) in resume.skills" :key="index" class="skill-tag">{{skill}}</text>
      </view>
    </view>
    
    <!-- 工友认可 -->
    <view class="peer-recognition-section">
      <view class="info-header">
        <text class="section-title">工友认可</text>
      </view>
      <view class="peer-recognition-content">
        <view v-if="resume.peerRecognition && resume.peerRecognition.length > 0" class="recognition-container">
          <view v-for="(item, index) in resume.peerRecognition" :key="index" class="recognition-tag">
            <text class="recognition-skill">{{item.skill}}</text>
            <text class="recognition-count">{{item.count}}</text>
          </view>
        </view>
        <view v-else class="no-recognition">
          <text>暂无工友认可</text>
        </view>
      </view>
    </view>
    
    <view class="work-experience-section">
      <view class="info-header">
        <text class="section-title">工作经验</text>
      </view>
      <view class="experience-content">
        <view v-for="(exp, index) in resume.workExperience" :key="index" class="experience-item">
          <text class="company-name">{{exp.company}}</text>
          <text class="job-position">{{exp.position}}</text>
          <text class="work-period">{{exp.period}}</text>
          <text class="work-description">{{exp.description}}</text>
        </view>
      </view>
    </view>
    
    <view class="education-section">
      <view class="info-header">
        <text class="section-title">教育背景</text>
      </view>
      <view class="education-content">
        <view v-for="(edu, index) in resume.educationBackground" :key="index" class="education-item">
          <text class="school-name">{{edu.school}}</text>
          <text class="major">{{edu.major}}</text>
          <text class="education-period">{{edu.period}}</text>
        </view>
      </view>
    </view>
    
    <!-- 评价部分 -->
    <view class="evaluation-section">
      <view class="info-header">
        <text class="section-title">用工者评价</text>
      </view>
      <view class="evaluation-content">
        <view v-if="workerEvaluation" class="evaluation-summary">
          <view class="overall-rating">
            <text class="rating-label">综合评分：</text>
            <text class="rating-value">{{ getOverallRating().toFixed(1) }}分</text>
          </view>
          
          <!-- 各维度评分 -->
          <view class="dimension-ratings">
            <view class="dimension-item">
              <text class="dimension-label">技能熟练度：</text>
              <text class="dimension-value">{{ workerEvaluation.skillProficiency.toFixed(1) }}分</text>
            </view>
            <view class="dimension-item">
              <text class="dimension-label">效率高低：</text>
              <text class="dimension-value">{{ workerEvaluation.efficiency.toFixed(1) }}分</text>
            </view>
            <view class="dimension-item">
              <text class="dimension-label">学习能力：</text>
              <text class="dimension-value">{{ workerEvaluation.learningAbility.toFixed(1) }}分</text>
            </view>
            <view class="dimension-item">
              <text class="dimension-label">责任心：</text>
              <text class="dimension-value">{{ workerEvaluation.responsibility.toFixed(1) }}分</text>
            </view>
            <view class="dimension-item">
              <text class="dimension-label">团队配合：</text>
              <text class="dimension-value">{{ workerEvaluation.teamwork.toFixed(1) }}分</text>
            </view>
          </view>
          
          <!-- 评价列表 -->
          <view class="evaluation-list">
            <text class="evaluation-count">{{ workerEvaluation.totalEvaluations }}人评价</text>
            <view v-for="(evaluation, index) in workerEvaluation.evaluations" :key="evaluation.id" class="evaluation-item">
              <view class="evaluator-info">
                <text class="evaluator-name">{{ evaluation.evaluatorName }}</text>
                <text class="evaluation-date">{{ evaluation.evaluationDate }}</text>
              </view>
              <text v-if="evaluation.comment" class="evaluation-comment">{{ evaluation.comment }}</text>
              <view v-if="evaluation.tags && evaluation.tags.length > 0" class="tag-list">
                <text 
                  v-for="tag in evaluation.tags" 
                  :key="tag"
                  class="tag"
                >{{ tag }}</text>
              </view>
            </view>
          </view>
        </view>
        <view v-else class="no-evaluation">
          <text>暂无评价</text>
        </view>
      </view>
    </view>
    
    <view class="footer-button">
      <button type="primary" class="contact-button" @click="contactCandidate">联系TA</button>
      <button type="default" class="share-button" @click="shareResume">一键分享</button>
      <button type="default" class="download-button" @click="downloadResume">下载简历</button>
      <button type="default" class="evaluate-button" @click="evaluateWorker">评价TA</button>
      <button type="default" class="report-button" @click="reportResume">举报TA</button>
    </view>
  </view>
</template>

<script>
import { getWorkerEvaluation } from '../../utils/evaluation.js'
import { checkPhoneViewPermission, checkAppMessagePermission } from '../../utils/privacy-protection.js'

export default {
  data() {
    return {
      resumeId: '',
      resume: {
        name: '',
        age: '',
        gender: '未填写',
        education: '未填写',
        experience: '',
        expectedSalary: '',
        contact: '',
        skills: [],
        workRecords: [],
        peerRecognition: [],
        workExperience: [],
        educationBackground: []
      },
      workerEvaluation: null,
      canViewPhone: false,
      phoneMasked: true
    }
  },
  onLoad(options) {
    if (options.id) {
      this.resumeId = options.id
    }
    // 无论是否有id参数，都加载数据
    this.loadResumeDetail()
    // 检查是否为工厂用户并检查权限
    this.checkFactoryPermissions()
    // 不再调用loadWorkerEvaluation，因为我们已经在loadResumeDetail中设置了workerEvaluation
  },
  methods: {
    loadResumeDetail() {
      // 加载本地存储的技能档案作为简历详情
      const skillProfile = uni.getStorageSync('skillProfile')
      const skillLikes = uni.getStorageSync('skillLikes') || {}
      
      if (skillProfile) {
        // 从skillLikes中获取点赞数
        const peerRecognition = (skillProfile.skills || []).map(skill => ({
          skill: skill,
          count: skillLikes[skill] || 0
        }))
        
        this.resume = {
          name: skillProfile.name || '李明',
          age: skillProfile.age || '28',
          gender: skillProfile.gender || '男',
          education: '初中',
          experience: (skillProfile.workYears || 6) + '年经验',
          expectedSalary: skillProfile.expectedSalary || '7500-9500元/月',
          type: skillProfile.type || '全职',
          phone: skillProfile.phone || '139****6666',

          skills: skillProfile.skills && skillProfile.skills.length > 0 ? skillProfile.skills : ['平车', '装领', '上腰', '拷边', '开口袋', '装拉链'],
          workRecords: skillProfile.workRecords && skillProfile.workRecords.length > 0 ? skillProfile.workRecords : [
            { skill: '装领', count: '32600', level: '精通' },
            { skill: '上腰', count: '18300', level: '熟练' },
            { skill: '拷边', count: '15800', level: '熟练' },
            { skill: '平车', count: '28500', level: '精通' },
            { skill: '开口袋', count: '12600', level: '熟练' },
            { skill: '装拉链', count: '9800', level: '熟练' }
          ],
          peerRecognition: peerRecognition && peerRecognition.length > 0 ? peerRecognition : [
            { skill: '平车', count: '58' },
            { skill: '装领', count: '45' },
            { skill: '上腰', count: '36' },
            { skill: '拷边', count: '31' },
            { skill: '开口袋', count: '24' },
            { skill: '装拉链', count: '18' }
          ],
          workExperience: [
            {
              company: '广州衣起赚服装厂',
              position: '熟练车工',
              period: '2022-2024',
              description: '主要负责装领、上腰等工序，工作认真负责，效率高，多次被评为优秀员工。平均日产量达到280件，质量合格率99.5%。'
            },
            {
              company: '深圳XX制衣厂',
              position: '车工',
              period: '2020-2022',
              description: '从事平车、拷边等工作，积累了丰富的经验，能够快速适应不同的工作环境。参与过多个品牌服装的生产，熟悉各类服装工艺要求。'
            }
          ],
          educationBackground: [
            {
              school: '湖南XX中学',
              major: '初中',
              period: '2010-2013'
            }
          ]
        }
        
        // 同步工厂评价信息
        this.workerEvaluation = {
          skillProficiency: 4.8,
          efficiency: 4.7,
          learningAbility: 4.5,
          responsibility: 4.9,
          teamwork: 4.6,
          totalEvaluations: 12,
          evaluations: [
            {
              id: '1',
              evaluatorName: 'XX制衣厂',
              evaluationDate: '2026-01-15',
              comment: skillProfile.factoryComments || '手艺稳、速度快、做事主动、配合度高，是一位非常优秀的工人。',
              tags: ['手艺稳', '速度快', '做事主动', '配合度高']
            },
            {
              id: '2',
              evaluatorName: 'YY服装厂',
              evaluationDate: '2025-12-20',
              comment: '技术熟练，工作认真负责，能够按时完成任务，团队合作能力强。',
              tags: ['技术熟练', '工作认真', '按时完成', '团队合作']
            }
          ]
        }
      } else {
        // 添加示例数据
        this.resume = {
          name: '李明',
          age: '28',
          gender: '男',
          education: '初中',
          experience: '6年经验',
          expectedSalary: '7500-9500元/月',
          type: '全职',
          phone: skillProfile.phone || '139****6666',

          skills: ['平车', '装领', '上腰', '拷边', '开口袋', '装拉链'],
          workRecords: [
            { skill: '装领', count: '32600', level: '精通' },
            { skill: '上腰', count: '18300', level: '熟练' },
            { skill: '拷边', count: '15800', level: '熟练' },
            { skill: '平车', count: '28500', level: '精通' },
            { skill: '开口袋', count: '12600', level: '熟练' },
            { skill: '装拉链', count: '9800', level: '熟练' }
          ],
          peerRecognition: [
            { skill: '平车', count: '58' },
            { skill: '装领', count: '45' },
            { skill: '上腰', count: '36' },
            { skill: '拷边', count: '31' },
            { skill: '开口袋', count: '24' },
            { skill: '装拉链', count: '18' }
          ],
          workExperience: [
            {
              company: '广州衣起赚服装厂',
              position: '熟练车工',
              period: '2022-2024',
              description: '主要负责装领、上腰等工序，工作认真负责，效率高，多次被评为优秀员工。平均日产量达到280件，质量合格率99.5%。'
            },
            {
              company: '深圳XX制衣厂',
              position: '车工',
              period: '2020-2022',
              description: '从事平车、拷边等工作，积累了丰富的经验，能够快速适应不同的工作环境。参与过多个品牌服装的生产，熟悉各类服装工艺要求。'
            }
          ],
          educationBackground: [
            {
              school: '湖南XX中学',
              major: '初中',
              period: '2010-2013'
            }
          ]
        }
        
        // 为示例数据设置工厂评价
        this.workerEvaluation = {
          skillProficiency: 4.8,
          efficiency: 4.7,
          learningAbility: 4.5,
          responsibility: 4.9,
          teamwork: 4.6,
          totalEvaluations: 12,
          evaluations: [
            {
              id: '1',
              evaluatorName: 'XX制衣厂',
              evaluationDate: '2026-01-15',
              comment: '手艺稳、速度快、做事主动、配合度高，是一位非常优秀的工人。',
              tags: ['手艺稳', '速度快', '做事主动', '配合度高']
            },
            {
              id: '2',
              evaluatorName: 'YY服装厂',
              evaluationDate: '2025-12-20',
              comment: '技术熟练，工作认真负责，能够按时完成任务，团队合作能力强。',
              tags: ['技术熟练', '工作认真', '按时完成', '团队合作']
            }
          ]
        }
      }
    },
    loadWorkerEvaluation() {
      // 只有在workerEvaluation还没有值的情况下才加载
      if (!this.workerEvaluation) {
        // 加载工人评价
        const evaluation = getWorkerEvaluation(this.resumeId)
        if (evaluation) {
          this.workerEvaluation = evaluation
        } else {
          // 添加示例评价数据
          this.workerEvaluation = {
            skillProficiency: 4.8,
            efficiency: 4.7,
            learningAbility: 4.5,
            responsibility: 4.9,
            teamwork: 4.6,
            totalEvaluations: 12,
            evaluations: [
              {
                id: '1',
                evaluatorName: 'XX制衣厂',
                evaluationDate: '2026-01-15',
                comment: '手艺稳、速度快、做事主动、配合度高，是一位非常优秀的工人。',
                tags: ['手艺稳', '速度快', '做事主动', '配合度高']
              },
              {
                id: '2',
                evaluatorName: 'YY服装厂',
                evaluationDate: '2025-12-20',
                comment: '技术熟练，工作认真负责，能够按时完成任务，团队合作能力强。',
                tags: ['技术熟练', '工作认真', '按时完成', '团队合作']
              }
            ]
          }
        }
      }
    },
    getOverallRating() {
      if (!this.workerEvaluation) return 0
      
      // 计算加权综合评分
      const { skillProficiency, efficiency, learningAbility, responsibility, teamwork } = this.workerEvaluation
      return skillProficiency * 0.4 + efficiency * 0.15 + learningAbility * 0.15 + responsibility * 0.15 + teamwork * 0.15
    },
    evaluateWorker() {
      // 跳转到评价页面
      uni.navigateTo({
        url: './evaluate-worker?workerId=' + this.resumeId
      })
    },
    contactCandidate() {
      // 获取用户信息和工厂信息
      const userInfo = uni.getStorageSync('userInfo')
      const factoryId = userInfo.username || userInfo.openid || 'factory'
      const workerId = this.resumeId || 'worker'
      
      // 检查工人状态
      const workerStatus = uni.getStorageSync('userInfo')?.status || 'looking'
      
      // 检查APP内消息联系权限
      const appMessagePermission = checkAppMessagePermission(workerId, factoryId)
      // 检查电话联系权限
      const phonePermission = checkPhoneViewPermission(workerId, factoryId)
      
      // 根据权限和状态显示不同的联系选项
      const contactOptions = []
      
      if (appMessagePermission.allowed) {
        contactOptions.push('APP内发送信息（免费）')
      }
      
      // 电话联系需要积分或套餐解锁
      if (workerStatus !== 'exploring' && workerStatus !== 'working') {
        contactOptions.push('直拨电话（需积分/套餐）')
      }
      
      contactOptions.push('关注（免费）')
      
      if (contactOptions.length === 0) {
        uni.showToast({
          title: '当前状态下无法联系该工人',
          icon: 'none'
        })
        return
      }
      
      // 当工人不可打电话时，提醒工厂打开APP通知
      if (workerStatus === 'exploring' || workerStatus === 'working') {
        uni.showModal({
          title: '提醒',
          content: '工人当前状态不允许电话联系，请打开APP通知，避免错过工人回复',
          confirmText: '知道了',
          showCancel: false
        })
      }
      
      // 显示联系选项
      uni.showActionSheet({
        itemList: contactOptions,
        success: (res) => {
          if (res.tapIndex === 0 && appMessagePermission.allowed) {
            // APP内发送信息
            uni.showToast({
              title: '已选择APP内发送信息',
              icon: 'success'
            })
          } else if (res.tapIndex === 1 && workerStatus !== 'exploring' && workerStatus !== 'working') {
            // 直拨电话（需要积分或套餐）
            uni.showModal({
              title: '直拨电话权限',
              content: '直拨电话需要积分或套餐解锁，是否前往兑换？',
              confirmText: '前往兑换',
              cancelText: '取消',
              success: (res) => {
                if (res.confirm) {
                  // 跳转到积分兑换页面
                  uni.navigateTo({
                    url: '../factory/growth-management'
                  })
                }
              }
            })
          } else if (res.tapIndex === contactOptions.length - 1) {
            // 关注
            uni.showToast({
              title: '已关注该工人，待工人切换状态时会收到提醒',
              icon: 'success'
            })
          }
        }
      })
    },
    shareResume() {
      // 生成简历分享内容
      const shareContent = `【简历分享】\n姓名：${this.resume.name}\n年龄：${this.resume.age}岁\n工作经验：${this.resume.experience}\n期望薪资：${this.resume.expectedSalary}\n技能专长：${this.resume.skills.join(', ')}\n\n查看详情请联系：${this.resume.phone || '未公开'}`
      
      // 显示分享选项
      uni.showActionSheet({
        itemList: ['分享到微信好友', '分享到朋友圈', '复制简历信息'],
        success: (res) => {
          if (res.tapIndex === 0) {
            // 分享到微信好友
            uni.showToast({
              title: '已选择分享到微信好友',
              icon: 'none'
            })
          } else if (res.tapIndex === 1) {
            // 分享到朋友圈
            uni.showToast({
              title: '已选择分享到朋友圈',
              icon: 'none'
            })
          } else if (res.tapIndex === 2) {
            // 复制简历信息
            uni.setClipboardData({
              data: shareContent,
              success: () => {
                uni.showToast({
                  title: '简历信息已复制到剪贴板',
                  icon: 'success'
                })
              }
            })
          }
        }
      })
    },
    reportResume() {
      // 显示举报选项
      uni.showActionSheet({
        itemList: ['虚假信息', '诈骗信息', '违法信息', '其他原因'],
        success: (res) => {
          let reason = ''
          switch (res.tapIndex) {
            case 0:
              reason = '虚假信息'
              this.submitReport(reason)
              break
            case 1:
              reason = '诈骗信息'
              this.submitReport(reason)
              break
            case 2:
              reason = '违法信息'
              this.submitReport(reason)
              break
            case 3:
              // 其他原因，弹出输入框
              uni.showModal({
                title: '举报原因',
                content: '请输入具体举报原因',
                editable: true,
                placeholderText: '请详细描述举报原因',
                confirmText: '确定',
                cancelText: '取消',
                success: (modalRes) => {
                  if (modalRes.confirm && modalRes.content.trim()) {
                    reason = '其他原因：' + modalRes.content.trim()
                    this.submitReport(reason)
                  }
                }
              })
              break
          }
        }
      })
    },
    submitReport(reason) {
      // 保存举报记录到本地存储
      const reports = uni.getStorageSync('resumeReports') || []
      reports.push({
        id: Date.now(),
        resumeId: this.resumeId,
        reason: reason,
        reportDate: new Date().toISOString(),
        status: 'pending'
      })
      uni.setStorageSync('resumeReports', reports)
      
      uni.showToast({
        title: '举报成功，我们会尽快处理',
        icon: 'success'
      })
    },
    checkFactoryPermissions() {
      // 检查当前用户是否为工厂用户或厂长子账号
      const userInfo = uni.getStorageSync('userInfo')
      if (userInfo && (userInfo.role === '工厂' || userInfo.role === '厂长')) {
        // 检查工厂权限
        const factoryData = uni.getStorageSync('factoryData') || {
          unlockPermissions: {
            general: 0,
            premium: 0
          }
        }
        // 检查是否有足够的权限
        if (factoryData.unlockPermissions.general > 0) {
          this.canViewPhone = true
        }
      }
    },
    unlockPhone() {
      // 检查当前用户是否为工厂用户或厂长子账号
      const userInfo = uni.getStorageSync('userInfo')
      if (!userInfo || !(userInfo.role === '工厂' || userInfo.role === '厂长')) {
        uni.showToast({
          title: '只有工厂用户可以解锁查看手机号码',
          icon: 'none'
        })
        return
      }
      
      // 检查子账号权限（如果是厂长子账号）
      if (userInfo.role === '厂长') {
        const subAccounts = uni.getStorageSync('subAccounts') || []
        const currentSubAccount = subAccounts.find(account => account.phone === userInfo.phone)
        if (!currentSubAccount || !currentSubAccount.permissions.includes('unlockPhone')) {
          uni.showToast({
            title: '您没有解锁手机号的权限',
            icon: 'none'
          })
          return
        }
        // 检查子账号解锁额度
        if (currentSubAccount.unlockQuota <= 0) {
          uni.showToast({
            title: '您的解锁额度已用完，请联系工厂主增加额度',
            icon: 'none'
          })
          return
        }
      }
      
      // 检查工厂权限
      const factoryData = uni.getStorageSync('factoryData') || {
        unlockPermissions: {
          general: 0,
          premium: 0
        }
      }
      
      if (factoryData.unlockPermissions.general > 0) {
        // 扣除权限并解锁
        factoryData.unlockPermissions.general--
        uni.setStorageSync('factoryData', factoryData)
        
        // 扣除子账号额度（如果是厂长子账号）
        if (userInfo.role === '厂长') {
          const subAccounts = uni.getStorageSync('subAccounts') || []
          const updatedSubAccounts = subAccounts.map(account => {
            if (account.phone === userInfo.phone) {
              return {
                ...account,
                unlockQuota: Math.max(0, account.unlockQuota - 1)
              }
            }
            return account
          })
          uni.setStorageSync('subAccounts', updatedSubAccounts)
        }
        
        // 添加权限使用记录
        const permissionHistory = uni.getStorageSync('permissionHistory') || []
        permissionHistory.push({
          time: new Date().toISOString().split('T')[0],
          type: 'use',
          description: '解锁工人手机号码',
          amount: 1,
          permissionType: '通用权限',
          operator: userInfo.role === '工厂' ? '工厂主' : '厂长子账号'
        })
        uni.setStorageSync('permissionHistory', permissionHistory)
        
        this.canViewPhone = true
        this.phoneMasked = false
        
        // 30秒后自动掩码
        setTimeout(() => {
          this.phoneMasked = true
        }, 30000)
        
        uni.showToast({
          title: '解锁成功，已扣除1个通用权限，完整手机号将在30秒后自动掩码',
          icon: 'success'
        })
      } else {
        uni.showModal({
          title: '权限不足',
          content: '您的通用权限不足，需要通过拉新或活跃获得更多权限',
          confirmText: '去获取权限',
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({
                url: '../factory/growth-management'
              })
            }
          }
        })
      }
    },
    downloadResume() {
      // 检查当前用户是否为工厂用户或厂长子账号
      const userInfo = uni.getStorageSync('userInfo')
      if (!userInfo || !(userInfo.role === '工厂' || userInfo.role === '厂长')) {
        uni.showToast({
          title: '只有工厂用户可以下载简历',
          icon: 'none'
        })
        return
      }
      
      // 检查子账号权限（如果是厂长子账号）
      if (userInfo.role === '厂长') {
        const subAccounts = uni.getStorageSync('subAccounts') || []
        const currentSubAccount = subAccounts.find(account => account.phone === userInfo.phone)
        if (!currentSubAccount || !currentSubAccount.permissions.includes('downloadResume')) {
          uni.showToast({
            title: '您没有下载简历的权限',
            icon: 'none'
          })
          return
        }
      }
      
      // 生成简历内容
      let resumeContent = `【简历信息】\n`
      resumeContent += `姓名：${this.resume.name}\n`
      resumeContent += `年龄：${this.resume.age}岁\n`
      resumeContent += `性别：${this.resume.gender}\n`
      resumeContent += `学历：${this.resume.education}\n`
      resumeContent += `工作经验：${this.resume.experience}\n`
      resumeContent += `期望薪资：${this.resume.expectedSalary}\n`
      resumeContent += `类型：${this.resume.type || '未选择'}\n`
      resumeContent += `手机号码：${this.canViewPhone && !this.phoneMasked ? this.resume.phone : '已掩码'}\n\n`
      
      resumeContent += `【技能特长】\n`
      resumeContent += `${this.resume.skills.join('、')}\n\n`
      
      if (this.resume.workRecords && this.resume.workRecords.length > 0) {
        resumeContent += `【记账实绩】\n`
        this.resume.workRecords.forEach(record => {
          resumeContent += `${record.skill}：${record.count}件 (${record.level})\n`
        })
        resumeContent += `\n`
      }
      
      if (this.resume.workExperience && this.resume.workExperience.length > 0) {
        resumeContent += `【工作经验】\n`
        this.resume.workExperience.forEach(exp => {
          resumeContent += `公司：${exp.company}\n`
          resumeContent += `职位：${exp.position}\n`
          resumeContent += `期间：${exp.period}\n`
          resumeContent += `描述：${exp.description}\n\n`
        })
      }
      
      if (this.workerEvaluation) {
        resumeContent += `【用工者评价】\n`
        resumeContent += `综合评分：${this.getOverallRating().toFixed(1)}分\n`
        resumeContent += `技能熟练度：${this.workerEvaluation.skillProficiency.toFixed(1)}分\n`
        resumeContent += `效率高低：${this.workerEvaluation.efficiency.toFixed(1)}分\n`
        resumeContent += `学习能力：${this.workerEvaluation.learningAbility.toFixed(1)}分\n`
        resumeContent += `责任心：${this.workerEvaluation.responsibility.toFixed(1)}分\n`
        resumeContent += `团队配合：${this.workerEvaluation.teamwork.toFixed(1)}分\n`
      }
      
      // 复制到剪贴板
      uni.setClipboardData({
        data: resumeContent,
        success: () => {
          uni.showToast({
            title: '简历内容已复制到剪贴板',
            icon: 'success'
          })
          
          // 显示分享选项
          uni.showActionSheet({
            itemList: ['保存为文本文件', '分享给微信好友'],
            success: (res) => {
              if (res.tapIndex === 0) {
                // 保存为文本文件（模拟）
                uni.showToast({
                  title: '简历已保存为文本文件',
                  icon: 'success'
                })
              } else if (res.tapIndex === 1) {
                // 分享给微信好友
                uni.showToast({
                  title: '已选择分享给微信好友',
                  icon: 'none'
                })
              }
            }
          })
        }
      })
    }
  }
}
</script>

<style scoped>
.resume-detail-container {
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

.personal-info-section, .work-records-section, .skills-section, .peer-recognition-section, .work-experience-section, .education-section {
  background-color: #fff;
  border-radius: 15rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.info-header {
  padding: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.info-content {
  padding: 20rpx;
}

.info-item {
  margin-bottom: 15rpx;
  display: flex;
}

.info-label {
  font-size: 24rpx;
  color: #666;
  width: 150rpx;
}

.info-value {
  font-size: 24rpx;
  color: #333;
  flex: 1;
}

.skills-content {
  padding: 20rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.skill-tag {
  font-size: 20rpx;
  color: #4A90E2;
  background-color: #e6f2ff;
  padding: 5rpx 15rpx;
  border-radius: 15rpx;
}

/* 记账实绩样式 */
.work-records-content {
  padding: 20rpx;
}

.work-record-item {
  margin-bottom: 15rpx;
  padding: 15rpx;
  background-color: #f9f9f9;
  border-radius: 10rpx;
}

.record-main {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.record-skill {
  font-size: 24rpx;
  font-weight: bold;
  color: #333;
}

.record-count {
  font-size: 22rpx;
  color: #666;
  margin-left: 10rpx;
}

.record-level {
  font-size: 22rpx;
  color: #4A90E2;
  font-weight: bold;
  margin-left: 10rpx;
}

.no-record {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 24rpx;
}

/* 工友认可样式 */
.peer-recognition-content {
  padding: 20rpx;
}

.recognition-container {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
}

.recognition-tag {
  display: inline-flex;
  align-items: center;
  background-color: #f9f9f9;
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

.no-recognition {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 24rpx;
}

.experience-content, .education-content {
  padding: 20rpx;
}

.experience-item, .education-item {
  margin-bottom: 20rpx;
}

.company-name, .school-name {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 5rpx;
}

.job-position, .major {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-bottom: 5rpx;
}

.work-period, .education-period {
  font-size: 22rpx;
  color: #999;
  display: block;
  margin-bottom: 10rpx;
}

.work-description {
  font-size: 24rpx;
  color: #333;
  line-height: 36rpx;
}

.footer-button {
  margin-top: 30rpx;
  margin-bottom: 30rpx;
  display: flex;
  gap: 20rpx;
}

.contact-button {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 30rpx;
  background-color: #4A90E2;
}

.share-button {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 30rpx;
  background-color: #f0f0f0;
}

.evaluate-button {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 30rpx;
  background-color: #73d13d;
  color: #fff;
}

.download-button {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 30rpx;
  background-color: #fa8c16;
  color: #fff;
}

.report-button {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 30rpx;
  background-color: #ff4d4f;
  color: #fff;
}

.evaluation-section {
  background-color: #fff;
  border-radius: 15rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.evaluation-content {
  padding: 20rpx;
}

.overall-rating {
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.rating-label {
  font-size: 24rpx;
  color: #666;
}

.rating-value {
  font-size: 28rpx;
  font-weight: bold;
  color: #4A90E2;
  margin-left: 10rpx;
}

.dimension-ratings {
  margin-bottom: 20rpx;
}

.dimension-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.dimension-label {
  font-size: 22rpx;
  color: #666;
}

.dimension-value {
  font-size: 22rpx;
  color: #4A90E2;
  font-weight: bold;
}

.evaluation-list {
  margin-top: 20rpx;
}

.evaluation-count {
  font-size: 20rpx;
  color: #999;
  margin-bottom: 15rpx;
  display: block;
}

.evaluation-item {
  background-color: #f9f9f9;
  border-radius: 10rpx;
  padding: 15rpx;
  margin-bottom: 15rpx;
}

.evaluator-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.evaluator-name {
  font-size: 22rpx;
  font-weight: bold;
  color: #333;
}

.evaluation-date {
  font-size: 20rpx;
  color: #999;
}

.evaluation-comment {
  font-size: 22rpx;
  color: #666;
  line-height: 32rpx;
  margin-bottom: 10rpx;
  display: block;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 10rpx;
}

.tag {
  padding: 5rpx 15rpx;
  border-radius: 15rpx;
  font-size: 20rpx;
  background-color: #e6f7ff;
  color: #1890ff;
}

.no-evaluation {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 24rpx;
}

</style>