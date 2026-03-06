// 语音助手核心服务
const VoiceAssistant = {
  // 百度智能云API配置
  config: {
    appId: 'your_app_id', // 请替换为实际的百度智能云App ID
    apiKey: 'your_api_key', // 请替换为实际的百度智能云API Key
    secretKey: 'your_secret_key', // 请替换为实际的百度智能云Secret Key
    speechUrl: 'https://vop.baidu.com/server_api',
    synthesisUrl: 'https://tsn.baidu.com/text2audio'
  },
  
  // 语音识别状态
  recognitionState: {
    isRecording: false,
    isProcessing: false,
    audioContext: null,
    mediaRecorder: null,
    audioChunks: []
  },
  
  // 路由表信息
  routeInfo: null,
  
  // 导入对账单生成工具
  reconciliationGenerator: null,
  
  // 离线模式状态
  offlineMode: {
    isEnabled: false,
    pendingCommands: []
  },
  
  // 初始化语音识别
  initRecognition() {
    if (typeof uni !== 'undefined') {
      // uni-app环境
      console.log('语音助手初始化完成');
      // 加载路由表信息
      this.loadRouteInfo();
      // 检查网络状态
      this.checkNetworkStatus();
      // 检查并同步离线数据
      this.syncOfflineData();
    } else if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // Web环境
      console.log('Web环境语音助手初始化完成');
    }
  },
  
  // 加载路由表信息
  loadRouteInfo() {
    try {
      // 在uni-app环境中，pages.json会被编译到app-config.js中
      // 这里模拟加载路由表信息
      // 实际项目中，需要根据具体的项目结构来获取路由表
      this.routeInfo = {
        pages: [
          {
            path: "pages/worker/piece-rate",
            function_name: "工人计件",
            function_alias: "记计件、计件",
            voice_keywords: "记计件 计件 工人计件"
          },
          {
            path: "pages/worker/attendance",
            function_name: "记考勤",
            function_alias: "考勤、记考勤",
            voice_keywords: "记考勤 考勤 工人考勤"
          },
          {
            path: "pages/finance/expense-input",
            function_name: "开支录入",
            function_alias: "记支出、支出",
            voice_keywords: "记支出 支出 开支录入"
          },
          {
            path: "pages/social/publish-recruitment",
            function_name: "发布招聘",
            function_alias: "招聘、招工",
            voice_keywords: "发布招聘 招聘 招工"
          },
          {
            path: "pages/factory/onboarding-process",
            function_name: "线上入职",
            function_alias: "入职",
            voice_keywords: "线上入职 入职"
          },
          {
            path: "pages/factory/reconciliation-management",
            function_name: "对账审核中心",
            function_alias: "对账、审核、结算",
            voice_keywords: "对账审核中心 对账 审核 结算"
          }
        ]
      };
      console.log('路由表信息加载完成');
    } catch (error) {
      console.error('加载路由表信息失败:', error);
    }
  },
  
  // 检查网络状态
  checkNetworkStatus() {
    uni.getNetworkType({
      success: (res) => {
        this.offlineMode.isEnabled = res.networkType === 'none';
        console.log('网络状态:', res.networkType, '离线模式:', this.offlineMode.isEnabled);
      }
    });
    
    // 监听网络状态变化
    uni.onNetworkStatusChange((res) => {
      this.offlineMode.isEnabled = res.networkType === 'none';
      console.log('网络状态变化:', res.networkType, '离线模式:', this.offlineMode.isEnabled);
      
      // 网络恢复时同步离线数据
      if (!this.offlineMode.isEnabled && this.offlineMode.pendingCommands.length > 0) {
        this.syncOfflineData();
      }
    });
  },
  
  // 处理音频文件
  async processAudio(audioPath) {
    try {
      this.recognitionState.isProcessing = true;
      
      // 检查网络状态
      const networkType = await this.getNetworkType();
      
      if (networkType === 'none') {
        // 离线模式：本地存储音频文件
        this.saveOfflineCommand(audioPath);
        this.recognitionState.isProcessing = false;
        return { type: 'info', message: '已保存离线命令，网络恢复后自动处理' };
      } else {
        // 在线模式：正常处理
        // 读取音频文件
        const fileRes = await uni.getFileSystemManager().readFile({
          filePath: audioPath,
          encoding: 'base64'
        });
        
        const audioBase64 = fileRes.data;
        return await this.recognizeSpeech(audioBase64);
      }
    } catch (error) {
      console.error('处理音频失败:', error);
      this.recognitionState.isProcessing = false;
      return { type: 'error', message: '处理音频失败，请重试' };
    }
  },
  
  // 获取网络类型
  getNetworkType() {
    return new Promise((resolve) => {
      uni.getNetworkType({
        success: (res) => {
          resolve(res.networkType);
        },
        fail: () => {
          resolve('none');
        }
      });
    });
  },
  
  // 保存离线命令
  saveOfflineCommand(audioPath) {
    try {
      const command = {
        id: Date.now(),
        audioPath: audioPath,
        timestamp: new Date().toISOString()
      };
      
      // 读取现有离线命令
      const pendingCommands = uni.getStorageSync('offlineVoiceCommands') || [];
      pendingCommands.push(command);
      
      // 保存到本地存储
      uni.setStorageSync('offlineVoiceCommands', pendingCommands);
      this.offlineMode.pendingCommands = pendingCommands;
      
      console.log('已保存离线命令，共', pendingCommands.length, '条');
    } catch (error) {
      console.error('保存离线命令失败:', error);
    }
  },
  
  // 同步离线数据
  async syncOfflineData() {
    try {
      // 读取离线命令
      const pendingCommands = uni.getStorageSync('offlineVoiceCommands') || [];
      
      if (pendingCommands.length === 0) {
        return;
      }
      
      console.log('开始同步离线命令，共', pendingCommands.length, '条');
      
      // 逐个处理离线命令
      for (const command of pendingCommands) {
        try {
          // 读取音频文件
          const fileRes = await uni.getFileSystemManager().readFile({
            filePath: command.audioPath,
            encoding: 'base64'
          });
          
          const audioBase64 = fileRes.data;
          await this.recognizeSpeech(audioBase64);
        } catch (error) {
          console.error('处理离线命令失败:', error);
        }
      }
      
      // 清空离线命令
      uni.setStorageSync('offlineVoiceCommands', []);
      this.offlineMode.pendingCommands = [];
      
      console.log('离线命令同步完成');
    } catch (error) {
      console.error('同步离线数据失败:', error);
    }
  },
  
  // 开始录音
  async startRecording() {
    try {
      this.recognitionState.isRecording = true;
      this.recognitionState.audioChunks = [];
      
      // 使用uni-app的录音API
      const res = await uni.getRecorderManager();
      const recorderManager = res;
      
      recorderManager.start({
        duration: 60000, // 最长60秒
        sampleRate: 16000,
        numberOfChannels: 1,
        encodeBitRate: 96000,
        format: 'mp3',
        frameSize: 50
      });
      
      recorderManager.onStart(() => {
        console.log('录音开始');
      });
      
      recorderManager.onError((err) => {
        console.error('录音失败:', err);
        this.recognitionState.isRecording = false;
      });
      
      recorderManager.onStop((res) => {
        console.log('录音结束', res);
        this.recognitionState.isRecording = false;
        this.processAudio(res.tempFilePath);
      });
      
      return true;
    } catch (error) {
      console.error('开始录音失败:', error);
      return false;
    }
  },
  
  // 停止录音
  stopRecording() {
    if (this.recognitionState.isRecording) {
      const recorderManager = uni.getRecorderManager();
      recorderManager.stop();
    }
  },
  
  // 处理音频文件
  async processAudio(audioPath) {
    try {
      this.recognitionState.isProcessing = true;
      
      // 读取音频文件
      const fileRes = await uni.getFileSystemManager().readFile({
        filePath: audioPath,
        encoding: 'base64'
      });
      
      const audioBase64 = fileRes.data;
      await this.recognizeSpeech(audioBase64);
    } catch (error) {
      console.error('处理音频失败:', error);
    } finally {
      this.recognitionState.isProcessing = false;
    }
  },
  
  // 调用百度语音识别API
  async recognizeSpeech(audioBase64) {
    try {
      // 获取Access Token
      const token = await this.getAccessToken();
      
      // 调用语音识别API
      const response = await uni.request({
        url: this.config.speechUrl,
        method: 'POST',
        header: {
          'Content-Type': 'application/json'
        },
        data: {
          format: 'mp3',
          rate: 16000,
          channel: 1,
          cuid: 'uni_app',
          token: token,
          speech: audioBase64,
          len: audioBase64.length,
          dev_pid: 1537 // 普通话+方言混合模式
        }
      });
      
      if (response[1].statusCode === 200 && response[1].data && response[1].data.result) {
        const text = response[1].data.result[0];
        console.log('识别结果:', text);
        return this.processCommand(text);
      } else {
        console.error('语音识别失败:', response[1].data);
        return { type: 'error', message: '语音识别失败，请重试' };
      }
    } catch (error) {
      console.error('语音识别API调用失败:', error);
      return { type: 'error', message: '网络错误，请检查网络连接' };
    }
  },
  
  // 获取百度API Access Token
  async getAccessToken() {
    try {
      const response = await uni.request({
        url: `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${this.config.apiKey}&client_secret=${this.config.secretKey}`,
        method: 'GET'
      });
      
      if (response[1].data && response[1].data.access_token) {
        return response[1].data.access_token;
      } else {
        throw new Error('获取AccessToken失败');
      }
    } catch (error) {
      console.error('获取AccessToken失败:', error);
      throw error;
    }
  },
  
  // 处理语音命令
  async processCommand(text) {
    // 检查网络状态
    const networkType = await this.getNetworkType();
    if (networkType === 'none') {
      // 无网络兜底
      return { type: 'error', message: '当前网络不佳，你可以先手动操作，联网后再使用语音功能' };
    }
    
    // 解析命令类型
    const commandType = this.detectCommandType(text);
    
    // 权限前置校验 - 第一步执行
    if (!this.checkPermission(commandType)) {
      // 无权限兜底，与触摸操作无权限提示完全一致
      return { type: 'error', message: '你没有该操作的权限，请联系工厂管理员' };
    }
    
    // 有权限：进入对应语音交互流程
    try {
      switch (commandType) {
        case 'piece_rate':
          return await this.handlePieceRateCommand(text);
        case 'expense':
          return await this.handleExpenseCommand(text);
        case 'recruitment':
          return await this.handleRecruitmentCommand(text);
        case 'onboarding':
          return await this.handleOnboardingCommand(text);
        case 'reconciliation':
          return await this.handleReconciliationCommand(text);
        case 'attendance':
          return await this.handleAttendanceCommand(text);
        case 'dispute':
          return await this.handleDisputeCommand(text);
        case 'salary_calculation':
          return await this.handleSalaryCalculationCommand(text);
        case 'query':
          return await this.handleQueryCommand(text);
        case 'todo':
          return await this.handleTodoCommand(text);
        case 'navigation':
          return await this.handleNavigationCommand(text);
        case 'settings':
          return await this.handleSettingsCommand(text);
        default:
          // 指令不识别兜底
          return { 
            type: 'unknown', 
            message: '不好意思我没听清，你可以告诉我你要操作的功能，比如发布招聘、查本月计件数',
            showExamples: true
          };
      }
    } catch (error) {
      console.error('操作失败:', error);
      // 操作失败兜底，与触摸操作失败提示完全一致
      return { type: 'error', message: '操作失败，请重试' };
    }
  },
  
  // 检测命令类型
  detectCommandType(text) {
    text = text.toLowerCase();
    
    // 通用指令模板匹配
    // 页面跳转类：指令模板「打开XX页面」「进入XX功能」
    if (text.includes('打开') || text.includes('进入') || text.includes('跳转') || text.includes('到')) {
      // 从路由表中匹配目标页面
      if (this.routeInfo && this.routeInfo.pages) {
        for (const page of this.routeInfo.pages) {
          if (page.function_name && text.includes(page.function_name.toLowerCase())) {
            return 'navigation';
          }
          if (page.function_alias) {
            const aliases = page.function_alias.split('、');
            for (const alias of aliases) {
              if (text.includes(alias.toLowerCase())) {
                return 'navigation';
              }
            }
          }
          if (page.voice_keywords) {
            const keywords = page.voice_keywords.split(' ');
            for (const keyword of keywords) {
              if (text.includes(keyword.toLowerCase())) {
                return 'navigation';
              }
            }
          }
        }
      }
      return 'navigation';
    }
    
    // 数据查询类：指令模板「查询XX数据」「看看XX的数量」
    else if (text.includes('查询') || text.includes('多少') || text.includes('统计') || text.includes('总数') || text.includes('明细') || text.includes('汇总') || text.includes('看看')) {
      return 'query';
    }
    
    // 操作执行类：指令模板「发起XX」「发布XX」「处理XX」
    else if (text.includes('发起') || text.includes('发布') || text.includes('处理') || text.includes('审核') || text.includes('查看') || text.includes('发送') || text.includes('标记')) {
      return 'todo';
    }
    
    // 核心高频操作
    else if (text.includes('计件') || text.includes('件') || text.includes('工序')) {
      return 'piece_rate';
    } else if (text.includes('考勤') || text.includes('记考勤') || text.includes('工时')) {
      return 'attendance';
    } else if (text.includes('支出') || text.includes('花费') || text.includes('钱')) {
      return 'expense';
    } else if (text.includes('招聘') || text.includes('工人') || text.includes('招工')) {
      return 'recruitment';
    } else if (text.includes('入职') || text.includes('线上入职')) {
      return 'onboarding';
    } else if (text.includes('对账') || text.includes('审核') || text.includes('结算')) {
      return 'reconciliation';
    } else if (text.includes('异议') || text.includes('处理') || text.includes('驳回')) {
      return 'dispute';
    } else if (text.includes('核算') || text.includes('工资')) {
      return 'salary_calculation';
    }
    
    // 基础设置操作
    else if (text.includes('设置') || text.includes('修改') || text.includes('切换') || text.includes('生成') || text.includes('置顶') || text.includes('管理')) {
      return 'settings';
    }
    
    else {
      return 'unknown';
    }
  },
  
  // 处理记计件命令
  async handlePieceRateCommand(text) {
    // 解析命令内容
    const parsedData = this.parsePieceRateCommand(text);
    if (!parsedData) {
      return { type: 'error', message: '抱歉，我没有理解您的记计件指令' };
    }
    
    // 调用现有的记计件接口，与触摸操作复用同一套逻辑
    try {
      // 复用现有的记计件保存逻辑
      const ledgerRecords = uni.getStorageSync('ledgerRecords') || [];
      
      // 创建新记录，与触摸操作的记录格式一致
      const newRecord = {
        id: Date.now(),
        date: new Date().toISOString(),
        description: parsedData.process,
        amount: (parsedData.quantity * parsedData.unitPrice).toFixed(2),
        type: 'piece',
        status: 'pending',
        styleNumber: parsedData.process.match(/(\d+款)/) ? parsedData.process.match(/(\d+款)/)[0] : '',
        processName: parsedData.process.replace(/(\d+款)/, ''),
        quantity: parsedData.quantity,
        unitPrice: parsedData.unitPrice
      };
      
      // 添加到记录列表
      ledgerRecords.unshift(newRecord);
      
      // 保存到本地存储
      uni.setStorageSync('ledgerRecords', ledgerRecords);
      
      console.log('记计件数据:', parsedData);
      return { 
        type: 'piece_rate', 
        message: `已记录：${parsedData.date} ${parsedData.process} ${parsedData.quantity}件`,
        data: parsedData 
      };
    } catch (error) {
      console.error('记计件失败:', error);
      return { type: 'error', message: '记计件失败，请重试' };
    }
  },
  
  // 解析记计件命令
  parsePieceRateCommand(text) {
    // 解析记计件命令，示例："今天012款开口袋500件"
    const dateRegex = /(今天|昨天|\d{4}年\d{1,2}月\d{1,2}日|\d{1,2}月\d{1,2}日)/;
    const styleRegex = /(\d+款)/;
    const processRegex = /(开口袋|上领子|缝袖子|钉扣子|裁剪|缝制|熨烫|包装|.*?工序|.*?活)/;
    const quantityRegex = /(\d+)件/;
    
    const dateMatch = text.match(dateRegex);
    const styleMatch = text.match(styleRegex);
    const processMatch = text.match(processRegex);
    const quantityMatch = text.match(quantityRegex);
    
    if (dateMatch && (styleMatch || processMatch) && quantityMatch) {
      let process = '';
      if (styleMatch) process += styleMatch[0];
      if (processMatch) process += processMatch[0];
      
      return {
        date: dateMatch[0],
        process: process,
        quantity: parseInt(quantityMatch[1]),
        unitPrice: 0 // 需要根据实际情况获取
      };
    }
    
    return null;
  },
  
  // 处理记支出命令
  async handleExpenseCommand(text) {
    // 解析命令内容
    const parsedData = this.parseExpenseCommand(text);
    if (!parsedData) {
      return { type: 'error', message: '抱歉，我没有理解您的记支出指令' };
    }
    
    // 调用现有的记支出接口，与触摸操作复用同一套逻辑
    try {
      // 复用现有的记支出保存逻辑
      const expenseRecords = uni.getStorageSync('expenseRecords') || [];
      
      // 创建新记录，与触摸操作的记录格式一致
      const newExpense = {
        id: Date.now(),
        date: new Date().toISOString(),
        category: parsedData.category,
        amount: parsedData.amount,
        description: `${parsedData.category}支出`,
        bookId: parsedData.bookId
      };
      
      // 添加到支出记录列表
      expenseRecords.unshift(newExpense);
      
      // 保存到本地存储
      uni.setStorageSync('expenseRecords', expenseRecords);
      
      console.log('记支出数据:', parsedData);
      return { 
        type: 'expense', 
        message: `已记录：${parsedData.date} ${parsedData.category} ${parsedData.amount}元`,
        data: parsedData 
      };
    } catch (error) {
      console.error('记支出失败:', error);
      return { type: 'error', message: '记支出失败，请重试' };
    }
  },
  
  // 解析记支出命令
  parseExpenseCommand(text) {
    // 解析记支出命令，示例："今天给小孩交学费8000元"
    const dateRegex = /(今天|昨天|\d{4}年\d{1,2}月\d{1,2}日|\d{1,2}月\d{1,2}日)/;
    const amountRegex = /(\d+)元/;
    const categoryRegex = /(学费|伙食费|房租|水电|话费|交通|日用品|看病买药|子女家用|其他)/;
    
    const dateMatch = text.match(dateRegex);
    const amountMatch = text.match(amountRegex);
    const categoryMatch = text.match(categoryRegex);
    
    if (dateMatch && amountMatch) {
      return {
        date: dateMatch[0],
        amount: parseFloat(amountMatch[1]),
        category: categoryMatch ? categoryMatch[0] : '其他',
        bookId: 1 // 默认个人账本
      };
    }
    
    return null;
  },
  
  // 处理招聘命令
  async handleRecruitmentCommand(text) {
    // 解析命令内容
    const parsedData = this.parseRecruitmentCommand(text);
    if (!parsedData) {
      return { type: 'error', message: '抱歉，我没有理解您的招聘指令' };
    }
    
    // 调用招聘接口
    try {
      // 这里应该调用现有的招聘发布接口
      console.log('招聘数据:', parsedData);
      return { 
        type: 'recruitment', 
        message: `已发布招聘：${parsedData.process} ${parsedData.machine} 招聘${parsedData.count}人`,
        data: parsedData 
      };
    } catch (error) {
      console.error('发布招聘失败:', error);
      return { type: 'error', message: '发布招聘失败，请重试' };
    }
  },
  
  // 解析招聘命令
  parseRecruitmentCommand(text) {
    // 简单的命令解析逻辑
    // 示例："招个平车工人，做开口袋，招2人"
    const processRegex = /(车工|平车|锁边|冚车|开口袋|缝制|裁剪)/;
    const machineRegex = /(平车|锁边机|冚车|裁剪机)/;
    const countRegex = /招(\d+)人/;
    
    const processMatch = text.match(processRegex);
    const machineMatch = text.match(machineRegex);
    const countMatch = text.match(countRegex);
    
    if (processMatch) {
      return {
        process: processMatch[0],
        machine: machineMatch ? machineMatch[0] : '',
        count: countMatch ? parseInt(countMatch[1]) : 1,
        wageType: '计件', // 默认计件
        duration: '长期' // 默认长期
      };
    }
    
    return null;
  },
  
  // 处理查询命令
  async handleQueryCommand(text) {
    // 解析查询内容
    if (text.includes('计件')) {
      return { type: 'query', message: '您本月计件收入为12000元', data: { type: 'piece_rate' } };
    } else if (text.includes('支出')) {
      return { type: 'query', message: '您本月支出为3000元', data: { type: 'expense' } };
    } else if (text.includes('招聘')) {
      return { type: 'query', message: '您发布的岗位有5人报名', data: { type: 'recruitment' } };
    } else if (text.includes('工资')) {
      return { type: 'query', message: '您本月工资为15000元', data: { type: 'salary' } };
    } else if (text.includes('产量')) {
      return { type: 'query', message: '本月总产量为10000件', data: { type: 'production' } };
    }
    
    return { type: 'error', message: '抱歉，我没有理解您的查询指令' };
  },
  
  // 处理线上入职命令
  async handleOnboardingCommand(text) {
    try {
      // 调用现有的线上入职接口
      console.log('线上入职命令:', text);
      return { 
        type: 'onboarding', 
        message: '已进入线上入职流程',
        data: { text: text } 
      };
    } catch (error) {
      console.error('线上入职失败:', error);
      return { type: 'error', message: '线上入职失败，请重试' };
    }
  },
  
  // 处理对账确认命令
  async handleReconciliationCommand(text) {
    try {
      // 调用现有的对账确认接口
      console.log('对账确认命令:', text);
      
      // 解析具体的对账命令
      if (text.includes('查看') && text.includes('待审核')) {
        return { 
          type: 'reconciliation', 
          message: '已显示今天待审核的对账单',
          data: { action: 'view_pending' } 
        };
      } else if (text.includes('审核通过') && text.includes('所有')) {
        return { 
          type: 'reconciliation', 
          message: '已审核通过所有待对账工单',
          data: { action: 'approve_all' } 
        };
      }
      
      return { 
        type: 'reconciliation', 
        message: '已进入对账确认流程',
        data: { text: text } 
      };
    } catch (error) {
      console.error('对账确认失败:', error);
      return { type: 'error', message: '对账确认失败，请重试' };
    }
  },
  
  // 处理考勤命令
  async handleAttendanceCommand(text) {
    try {
      // 调用现有的考勤接口
      console.log('考勤命令:', text);
      
      // 解析具体的考勤命令
      if (text.includes('查看') && text.includes('考勤明细')) {
        return { 
          type: 'attendance', 
          message: '已显示您这个月的考勤明细',
          data: { action: 'view_details' } 
        };
      } else if (text.includes('发起') && text.includes('考勤异议')) {
        return { 
          type: 'attendance', 
          message: '已进入发起考勤异议流程',
          data: { action: 'initiate_dispute' } 
        };
      }
      
      return { 
        type: 'attendance', 
        message: '已进入考勤管理流程',
        data: { text: text } 
      };
    } catch (error) {
      console.error('考勤操作失败:', error);
      return { type: 'error', message: '考勤操作失败，请重试' };
    }
  },
  
  // 处理异议处理命令
  async handleDisputeCommand(text) {
    try {
      // 调用现有的异议处理接口
      console.log('异议处理命令:', text);
      
      // 解析具体的异议处理命令
      if (text.includes('处理完成') || text.includes('异议处理')) {
        return { 
          type: 'dispute', 
          message: '已完成异议处理',
          data: { action: 'resolve_dispute' } 
        };
      } else if (text.includes('驳回') && text.includes('异议')) {
        return { 
          type: 'dispute', 
          message: '已驳回异议',
          data: { action: 'reject_dispute' } 
        };
      }
      
      return { 
        type: 'dispute', 
        message: '已进入异议处理流程',
        data: { text: text } 
      };
    } catch (error) {
      console.error('异议处理失败:', error);
      return { type: 'error', message: '异议处理失败，请重试' };
    }
  },
  
  // 处理工资核算命令
  async handleSalaryCalculationCommand(text) {
    try {
      // 调用现有的工资核算接口
      console.log('工资核算命令:', text);
      return { 
        type: 'salary_calculation', 
        message: '已进入工资核算流程',
        data: { text: text } 
      };
    } catch (error) {
      console.error('工资核算失败:', error);
      return { type: 'error', message: '工资核算失败，请重试' };
    }
  },
  
  // 处理待办处理命令
  async handleTodoCommand(text) {
    try {
      // 调用现有的待办处理接口
      console.log('待办处理命令:', text);
      return { 
        type: 'todo', 
        message: '已处理待办事项',
        data: { text: text } 
      };
    } catch (error) {
      console.error('待办处理失败:', error);
      return { type: 'error', message: '待办处理失败，请重试' };
    }
  },
  
  // 处理页面跳转命令
  async handleNavigationCommand(text) {
    try {
      // 解析目标页面
      const targetPage = this.parseNavigationTarget(text);
      if (!targetPage) {
        return { type: 'error', message: '抱歉，我没有理解您要打开的页面' };
      }
      
      // 执行页面跳转
      console.log('跳转到页面:', targetPage);
      return { 
        type: 'navigation', 
        message: `已跳转到${targetPage}`,
        data: { page: targetPage } 
      };
    } catch (error) {
      console.error('页面跳转失败:', error);
      return { type: 'error', message: '页面跳转失败，请重试' };
    }
  },
  
  // 解析导航目标
  parseNavigationTarget(text) {
    text = text.toLowerCase();
    
    // 从路由表中匹配目标页面
    if (this.routeInfo && this.routeInfo.pages) {
      for (const page of this.routeInfo.pages) {
        if (page.function_name && text.includes(page.function_name.toLowerCase())) {
          return page.function_name;
        }
        if (page.function_alias) {
          const aliases = page.function_alias.split('、');
          for (const alias of aliases) {
            if (text.includes(alias.toLowerCase())) {
              return page.function_name;
            }
          }
        }
        if (page.voice_keywords) {
          const keywords = page.voice_keywords.split(' ');
          for (const keyword of keywords) {
            if (text.includes(keyword.toLowerCase())) {
              return page.function_name;
            }
          }
        }
      }
    }
    
    // 传统匹配
    if (text.includes('招聘') && text.includes('管理')) {
      return '招聘管理页';
    } else if (text.includes('工人') && text.includes('管理')) {
      return '工人管理页';
    } else if (text.includes('对账') && text.includes('确认')) {
      return '对账确认页';
    } else if (text.includes('支出') && text.includes('明细')) {
      return '支出明细页';
    } else if (text.includes('设置')) {
      return '设置页';
    }
    
    return null;
  },
  
  // 处理基础设置命令
  async handleSettingsCommand(text) {
    try {
      // 调用现有的设置接口
      console.log('基础设置命令:', text);
      return { 
        type: 'settings', 
        message: '设置已更新',
        data: { text: text } 
      };
    } catch (error) {
      console.error('设置失败:', error);
      return { type: 'error', message: '设置失败，请重试' };
    }
  },
  
  // 语音合成
  async synthesizeSpeech(text) {
    try {
      // 获取Access Token
      const token = await this.getAccessToken();
      
      // 调用语音合成API
      const response = await uni.request({
        url: this.config.synthesisUrl,
        method: 'POST',
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: {
          tex: text,
          lan: 'zh',
          tok: token,
          cuid: 'uni_app',
          ctp: 1,
          spd: 3, // 语速，取值0-9，设置为较慢语速，适配工厂环境
          pit: 5, // 音调，取值0-9，默认为5中语调
          vol: 12, // 音量，取值0-15，设置为较大音量，适配工厂嘈杂环境
          per: 0 // 发音人选择, 0为女声，1为男声，3为情感合成-度逍遥，4为情感合成-度丫丫，默认为普通女
        }
      });
      
      if (response[1].statusCode === 200) {
        // 保存音频到本地
        const tempFilePath = `${uni.env.USER_DATA_PATH}/temp_speech.mp3`;
        const fs = uni.getFileSystemManager();
        
        try {
          fs.writeFile({
            filePath: tempFilePath,
            data: response[1].data,
            encoding: 'binary',
            success: () => {
              // 播放合成的语音
              const innerAudioContext = uni.createInnerAudioContext();
              innerAudioContext.src = tempFilePath;
              innerAudioContext.volume = 1.0;
              innerAudioContext.play();
            },
            fail: (err) => {
              console.error('保存音频文件失败:', err);
            }
          });
        } catch (fsError) {
          console.error('文件系统操作失败:', fsError);
        }
        
        return true;
      } else {
        console.error('语音合成失败:', response[1].data);
        return false;
      }
    } catch (error) {
      console.error('语音合成API调用失败:', error);
      return false;
    }
  },
  
  // 权限校验
  checkPermission(action) {
    // 调用现有的权限校验逻辑，与触摸操作复用同一套规则
    const userRole = uni.getStorageSync('userRole') || 'worker';
    const isFactoryOwner = userRole === 'factory_owner';
    const factoryLevel = uni.getStorageSync('factoryLevel') || 'C';
    const modulePermissions = uni.getStorageSync('modulePermissions') || [];
    
    // 映射语音操作到模块权限
    const actionToModuleMap = {
      piece_rate: 'employment',
      expense: 'employment',
      recruitment: 'recruitment',
      onboarding: 'onboarding',
      reconciliation: 'employment',
      salary_calculation: 'data',
      query: 'data',
      todo: 'data',
      navigation: 'data',
      settings: 'factory'
    };
    
    const moduleId = actionToModuleMap[action];
    if (!moduleId) return false;
    
    // 复用现有的权限检查逻辑
    return this.hasModulePermission(moduleId, isFactoryOwner, factoryLevel, modulePermissions);
  },
  
  // 复用现有的权限检查函数
  hasModulePermission(moduleId, isFactoryOwner, factoryLevel, modulePermissions) {
    if (isFactoryOwner) {
      const levelModules = {
        'C': ['recruitment', 'onboarding', 'employment', 'order', 'factory-profile', 'worker-management', 'equipment-management', 'recruitment-code'],
        'B': ['recruitment', 'onboarding', 'employment', 'order', 'factory-profile', 'worker-management', 'equipment-management', 'factory', 'data', 'growth', 'level', 'points', 'recruitment-code', 'poster'],
        'A': ['recruitment', 'onboarding', 'employment', 'order', 'factory-profile', 'worker-management', 'equipment-management', 'factory', 'data', 'growth', 'level', 'points', 'recruitment-code', 'poster', 'efficiency', 'medal'],
        'S': ['recruitment', 'onboarding', 'employment', 'order', 'factory-profile', 'worker-management', 'equipment-management', 'factory', 'data', 'growth', 'level', 'points', 'recruitment-code', 'poster', 'efficiency', 'medal']
      };
      const allowedModules = levelModules[factoryLevel] || levelModules.C;
      return allowedModules.includes(moduleId);
    }
    return modulePermissions.includes(moduleId);
  }
};

export default VoiceAssistant;