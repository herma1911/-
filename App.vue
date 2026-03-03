<script>
// 直接在App.vue中实现示例评价数据初始化，避免模块导入问题

// 检查并处理超时未确认的班组归属请求
function checkTeamConfirmationTimeout() {
  const teamConfirmations = uni.getStorageSync('teamConfirmations') || []
  const now = new Date().getTime()
  const twentyFourHours = 24 * 60 * 60 * 1000
  
  let updatedConfirmations = teamConfirmations.filter(confirmation => {
    if (confirmation.status === 'pending') {
      const submittedTime = new Date(confirmation.submittedAt).getTime()
      if (now - submittedTime > twentyFourHours) {
        // 超过24小时未确认，自动解绑
        return false
      }
    }
    return true
  })
  
  // 如果有变化，更新存储
  if (updatedConfirmations.length !== teamConfirmations.length) {
    uni.setStorageSync('teamConfirmations', updatedConfirmations)
    return true
  }
  
  return false
}

export default {
		onLaunch: function() {
		console.log('=== 新App启动成功 ===')
		// 获取用户信息
		const userInfo = uni.getStorageSync('userInfo') || {}
		console.log('用户角色：', userInfo.role)
		
		// 检查是否有用户信息，没有则跳转到登录页
		if (!userInfo || !userInfo.role) {
			uni.reLaunch({
				url: '/pages/login/login',
				fail: (err) => {
					console.error('跳转登录页失败：', err)
				}
			})
		} else {
			// 根据角色跳转到对应首页
			const finalRole = userInfo.role
			const isEnterpriseUser = userInfo.isEnterprise || false
			
			if (finalRole === '个人') {
				uni.reLaunch({
					url: '/pages/worker/employee-home',
					fail: (err) => {
						console.error('跳转个人首页失败：', err)
					}
				})
			} else if (finalRole === '赫尔玛智能') {
				// 赫尔玛智能角色跳转到Web版后台管理系统
				uni.showToast({
					title: '正在打开赫尔玛智能后台管理系统...',
					icon: 'loading',
					duration: 1000
				})
				
				setTimeout(() => {
					// 在实际应用中，这里会打开Web浏览器访问赫尔玛Web版
					// 由于是模拟环境，我们暂时跳转到工厂首页
					uni.redirectTo({
						url: '/pages/factory/factory-home',
						fail: (err) => {
							console.error('跳转失败：', err)
						}
					})
				}, 1000)
			} else if (finalRole === '厂长' || finalRole === '工厂版' || finalRole === '工厂') {
				uni.redirectTo({
					url: '/pages/factory/factory-home',
					fail: (err) => {
						console.error('跳转工厂首页失败：', err)
					}
				})
			}
		}
		
		// 延迟执行其他初始化操作
		setTimeout(() => {
			// 检查并处理超时未确认的班组归属请求
			checkTeamConfirmationTimeout()
			console.log('已检查班组确认超时')
			
			// 检查是否已经初始化过评价数据
			const hasInitialized = uni.getStorageSync('hasInitializedEvaluations')
			if (!hasInitialized) {
				// 清除之前的评价数据，确保重新初始化
				uni.removeStorageSync('factoryEvaluations')
				uni.removeStorageSync('workerEvaluations')
				// 初始化示例评价数据
				this.initSampleEvaluations()
				// 标记已经初始化
				uni.setStorageSync('hasInitializedEvaluations', true)
				console.log('示例评价数据已初始化')
			} else {
				console.log('评价数据已初始化，跳过初始化步骤')
			}
		}, 1000)
	},
	onShow: function() {
		console.log('App 显示正常')
		// 每次应用显示时检查超时
		checkTeamConfirmationTimeout()
	},
	onHide: function() {
		console.log('App Hide')
	},
	methods: {
		// 保存工厂评价
		saveFactoryEvaluation(factoryId, evaluation) {
			// 获取现有评价
			let factoryEvaluations = uni.getStorageSync('factoryEvaluations') || {}
			
			// 如果该工厂还没有评价，初始化
			if (!factoryEvaluations[factoryId]) {
				factoryEvaluations[factoryId] = {
					totalEvaluations: 0,
					salaryBenefits: 0, // 薪资福利
					workEnvironment: 0, // 工作环境
					management: 0, // 管理规范
					communication: 0, // 沟通态度
					growthSpace: 0, // 成长空间
					evaluations: []
				}
			}
			
			// 更新评价数据
			const factoryEval = factoryEvaluations[factoryId]
			factoryEval.totalEvaluations++
			factoryEval.salaryBenefits = ((factoryEval.salaryBenefits * (factoryEval.totalEvaluations - 1)) + evaluation.salaryBenefits) / factoryEval.totalEvaluations
			factoryEval.workEnvironment = ((factoryEval.workEnvironment * (factoryEval.totalEvaluations - 1)) + evaluation.workEnvironment) / factoryEval.totalEvaluations
			factoryEval.management = ((factoryEval.management * (factoryEval.totalEvaluations - 1)) + evaluation.management) / factoryEval.totalEvaluations
			factoryEval.communication = ((factoryEval.communication * (factoryEval.totalEvaluations - 1)) + evaluation.communication) / factoryEval.totalEvaluations
			factoryEval.growthSpace = ((factoryEval.growthSpace * (factoryEval.totalEvaluations - 1)) + evaluation.growthSpace) / factoryEval.totalEvaluations
			
			// 添加具体评价
			factoryEval.evaluations.push({
				id: Date.now(),
				evaluatorId: evaluation.evaluatorId,
				evaluatorName: evaluation.isAnonymous ? '匿名工人' : evaluation.evaluatorName,
				isAnonymous: evaluation.isAnonymous || false,
				salaryBenefits: evaluation.salaryBenefits,
				workEnvironment: evaluation.workEnvironment,
				management: evaluation.management,
				communication: evaluation.communication,
				growthSpace: evaluation.growthSpace,
				comment: evaluation.comment || '',
				tags: evaluation.tags || [], // 评价标签
				reply: evaluation.reply || null, // 老板回复
				replyDate: evaluation.replyDate || null, // 回复日期
				evaluationDate: new Date().toISOString().split('T')[0]
			})
			
			// 保存回本地存储
			uni.setStorageSync('factoryEvaluations', factoryEvaluations)
			return factoryEval
		},
		
		// 保存员工评价
		saveWorkerEvaluation(workerId, evaluation) {
			// 获取现有评价
			let workerEvaluations = uni.getStorageSync('workerEvaluations') || {}
			
			// 如果该员工还没有评价，初始化
			if (!workerEvaluations[workerId]) {
				workerEvaluations[workerId] = {
					totalEvaluations: 0,
					skillProficiency: 0, // 技能熟练度
					efficiency: 0, // 效率高低
					learningAbility: 0, // 学习能力
					responsibility: 0, // 责任心
					teamwork: 0, // 团队配合
					evaluations: []
				}
			}
			
			// 更新评价数据
			const workerEval = workerEvaluations[workerId]
			workerEval.totalEvaluations++
			workerEval.skillProficiency = ((workerEval.skillProficiency * (workerEval.totalEvaluations - 1)) + evaluation.skillProficiency) / workerEval.totalEvaluations
			workerEval.efficiency = ((workerEval.efficiency * (workerEval.totalEvaluations - 1)) + evaluation.efficiency) / workerEval.totalEvaluations
			workerEval.learningAbility = ((workerEval.learningAbility * (workerEval.totalEvaluations - 1)) + evaluation.learningAbility) / workerEval.totalEvaluations
			workerEval.responsibility = ((workerEval.responsibility * (workerEval.totalEvaluations - 1)) + evaluation.responsibility) / workerEval.totalEvaluations
			workerEval.teamwork = ((workerEval.teamwork * (workerEval.totalEvaluations - 1)) + evaluation.teamwork) / workerEval.totalEvaluations
			
			// 添加具体评价
			workerEval.evaluations.push({
				id: Date.now(),
				evaluatorId: evaluation.evaluatorId,
				evaluatorName: evaluation.evaluatorName,
				skillProficiency: evaluation.skillProficiency,
				efficiency: evaluation.efficiency,
				learningAbility: evaluation.learningAbility,
				responsibility: evaluation.responsibility,
				teamwork: evaluation.teamwork,
				comment: evaluation.comment || '',
				tags: evaluation.tags || [], // 评价标签
				evaluationDate: new Date().toISOString().split('T')[0]
			})
			
			// 保存回本地存储
			uni.setStorageSync('workerEvaluations', workerEvaluations)
			return workerEval
		},
		
		// 初始化示例评价数据
		initSampleEvaluations() {
			// 为招聘信息添加评价
			const jobIds = [1, 2, 3, 4, 5, 6]
			
			jobIds.forEach(jobId => {
				// 评价1：匿名评价
				this.saveFactoryEvaluation(jobId, {
					evaluatorId: 'worker1',
					evaluatorName: '张三',
					isAnonymous: true,
					salaryBenefits: 4.5,
					workEnvironment: 4.0,
					management: 3.5,
					communication: 4.0,
					growthSpace: 3.0,
					comment: '工资按时发放，工作环境不错，管理上有些严格，总体来说还可以。',
					tags: ['薪资靠谱', '环境友好', '管理严格']
				})
				
				// 评价2：实名评价
				this.saveFactoryEvaluation(jobId, {
					evaluatorId: 'worker2',
					evaluatorName: '李四',
					isAnonymous: false,
					salaryBenefits: 4.0,
					workEnvironment: 4.5,
					management: 4.0,
					communication: 4.5,
					growthSpace: 3.5,
					comment: '老板人很好，经常和工人交流，车间有空调，夏天干活很舒服。就是工资稍微低了一点。',
					tags: ['没架子', '环境友好', '福利到位']
				})
				
				// 评价3：带老板回复的评价
				this.saveFactoryEvaluation(jobId, {
					evaluatorId: 'worker3',
					evaluatorName: '王五',
					isAnonymous: false,
					salaryBenefits: 3.5,
					workEnvironment: 3.0,
					management: 3.0,
					communication: 4.0,
					growthSpace: 2.5,
					comment: '工作强度有点大，希望能适当减轻一些，工资也希望能再涨一点。',
					tags: ['沟通顺畅', '工作强度大'],
					reply: '感谢您的反馈，我们会考虑调整工作强度，工资方面我们会根据绩效进行调整，希望能继续一起努力！',
					replyDate: new Date().toISOString().split('T')[0]
				})
			})
			
			// 为工人添加评价
			const workerIds = [1, 2, 3, 4]
			
			workerIds.forEach(workerId => {
				// 评价1：技能很好
				this.saveWorkerEvaluation(workerId, {
					evaluatorId: 'boss1',
					evaluatorName: '衣起赚服装厂',
					skillProficiency: 5.0,
					efficiency: 4.5,
					learningAbility: 4.0,
					responsibility: 4.5,
					teamwork: 4.0,
					comment: '技术非常好，做的衣服质量很高，效率也不错，是个靠谱的工人。',
					tags: ['技术大神', '效率先锋', '靠谱担当']
				})
				
				// 评价2：学习能力强
				this.saveWorkerEvaluation(workerId, {
					evaluatorId: 'boss2',
					evaluatorName: '时尚服装厂',
					skillProficiency: 4.0,
					efficiency: 3.5,
					learningAbility: 5.0,
					responsibility: 4.0,
					teamwork: 4.5,
					comment: '虽然经验不是很丰富，但是学习能力很强，很快就能掌握新技能，团队合作也很好。',
					tags: ['学习小天才', '团队粘合剂', '责任心强']
				})
				
				// 评价3：效率高
				this.saveWorkerEvaluation(workerId, {
					evaluatorId: 'boss3',
					evaluatorName: '精品服装厂',
					skillProficiency: 4.5,
					efficiency: 5.0,
					learningAbility: 4.0,
					responsibility: 4.0,
					teamwork: 3.5,
					comment: '效率非常高，每天的产量都能超额完成，质量也能保证，是个高产能手。',
					tags: ['高产王', '效率先锋', '技术大神']
				})
			})
		},
		
		// 显示加载动画
		showLoading(message = '正在加载...') {
			uni.showLoading({
				title: message,
				mask: true
			})
		},
		
		// 隐藏加载动画
		hideLoading() {
			uni.hideLoading()
		},
		
		// 显示成功提示
		showSuccess(message) {
			uni.showToast({
				title: message,
				icon: 'success',
				duration: 2000
			})
			// 触发震动反馈
			this.triggerVibration()
		},
		
		// 显示错误提示
		showError(message) {
			uni.showToast({
				title: message,
				icon: 'none',
				duration: 2000
			})
		},
		
		// 显示确认弹窗
		showConfirm(options) {
			return new Promise((resolve) => {
				uni.showModal({
					title: options.title || '确认',
					content: options.content || '确定要执行此操作吗？',
					confirmText: options.confirmText || '确定',
					cancelText: options.cancelText || '取消',
					success: (res) => {
						if (res.confirm) {
							resolve(true)
							// 触发震动反馈
							this.triggerVibration()
						} else {
							resolve(false)
						}
					}
				})
			})
		},
		
		// 触发震动反馈
		triggerVibration() {
			// 检查是否支持震动
			if (uni.vibrateShort) {
				uni.vibrateShort({
					type: 'light'
				})
			}
		},
		
		// 显示网络异常提示
		showNetworkError(options = {}) {
			uni.showModal({
				title: '网络异常',
				content: '网络不佳，请检查网络连接',
				confirmText: '重试',
				cancelText: '取消',
				success: (res) => {
					if (res.confirm) {
						// 触发重试操作
						if (typeof options.onRetry === 'function') {
							options.onRetry()
						}
					}
				}
			})
		}
	}
}
</script>

<style>
	/* 全局样式重置 */
	* {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}
	
	/* 全局颜色变量 */
	:root {
		/* 主色调 */
		--primary-green: #52c41a; /* 记账、收入 */
		--primary-blue: #4A90E2; /* 招聘、沟通 */
		
		/* 辅助色 */
		--secondary-red: #ff4d4f; /* 警告、未读 */
		--secondary-orange: #FA8C16; /* 提示、消息 */
		
		/* 中性色 */
		--text-primary: #333333;
		--text-secondary: #666666;
		--text-tertiary: #999999;
		--background-light: #f5f5f5;
		--background-white: #ffffff;
		--border-color: #e0e0e0;
	}
	
	/* 全局字体设置 */
	body {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
		font-size: 14px;
		color: var(--text-primary);
		line-height: 1.5;
		background-color: var(--background-light);
	}
	
	/* 字体大小 */
	.text-xs {
		font-size: 12px;
	}
	
	.text-sm {
		font-size: 14px;
	}
	
	.text-base {
		font-size: 16px;
	}
	
	.text-lg {
		font-size: 18px;
		font-weight: bold;
	}
	
	.text-xl {
		font-size: 20px;
		font-weight: bold;
	}
	
	.text-2xl {
		font-size: 24px;
		font-weight: bold;
	}
	
	/* 颜色类 */
	.text-green {
		color: var(--primary-green);
	}
	
	.text-blue {
		color: var(--primary-blue);
	}
	
	.text-red {
		color: var(--secondary-red);
	}
	
	.text-orange {
		color: var(--secondary-orange);
	}
	
	/* 背景色类 */
	.bg-green {
		background-color: var(--primary-green);
	}
	
	.bg-blue {
		background-color: var(--primary-blue);
	}
	
	.bg-red {
		background-color: var(--secondary-red);
	}
	
	.bg-orange {
		background-color: var(--secondary-orange);
	}
	
	/* 按钮样式 */
	button {
		border: none;
		outline: none;
		cursor: pointer;
		transition: all 0.3s ease;
	}
	
	button:active {
		transform: scale(0.95);
		opacity: 0.8;
	}
	
	/* 输入框样式 */
	input {
		border: 1rpx solid var(--border-color);
		outline: none;
		transition: border-color 0.3s ease;
	}
	
	input:focus {
		border-color: var(--primary-blue);
	}
	
	/* 通用卡片样式 */
	.card {
		background-color: var(--background-white);
		border-radius: 16rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
		padding: 24rpx;
	}
	
	/* 通用动画 */
	.fade-enter-active,
	.fade-leave-active {
		transition: opacity 0.3s ease;
	}
	
	.fade-enter-from,
	.fade-leave-to {
		opacity: 0;
	}
</style>