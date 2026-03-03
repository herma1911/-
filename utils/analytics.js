// 埋点统计工具
class Analytics {
  constructor() {
    this.events = [];
    this.sessionId = this.generateSessionId();
    this.userId = this.getUserId();
    this.init();
  }

  // 生成会话ID
  generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // 获取用户ID
  getUserId() {
    const userInfo = uni.getStorageSync('userInfo');
    return userInfo?.username || 'guest';
  }

  // 初始化
  init() {
    // 监听页面加载和卸载事件
    if (uni.onAppShow) {
      uni.onAppShow(() => {
        this.trackEvent('app_show', { timestamp: Date.now() });
      });
    }

    if (uni.onAppHide) {
      uni.onAppHide(() => {
        this.trackEvent('app_hide', { timestamp: Date.now() });
        this.flushEvents();
      });
    }

    // 监听页面跳转
    if (uni.addInterceptor) {
      uni.addInterceptor('navigateTo', {
        invoke: (args) => {
          this.trackEvent('page_navigate', {
            from: getCurrentPages().slice(-1)[0]?.route || 'unknown',
            to: args.url,
            timestamp: Date.now()
          });
        }
      });
    }
  }

  // 追踪事件
  trackEvent(eventName, properties = {}) {
    const event = {
      eventName,
      properties: {
        ...properties,
        sessionId: this.sessionId,
        userId: this.userId,
        timestamp: Date.now(),
        deviceId: uni.getStorageSync('deviceId') || this.generateDeviceId(),
        appVersion: '1.0.0'
      }
    };

    this.events.push(event);

    // 当事件数量达到一定阈值时，发送数据
    if (this.events.length >= 10) {
      this.flushEvents();
    }

    // 本地存储事件数据
    this.saveEvents();
  }

  // 生成设备ID
  generateDeviceId() {
    const deviceId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    uni.setStorageSync('deviceId', deviceId);
    return deviceId;
  }

  // 保存事件到本地存储
  saveEvents() {
    uni.setStorageSync('analyticsEvents', this.events);
  }

  // 从本地存储加载事件
  loadEvents() {
    const savedEvents = uni.getStorageSync('analyticsEvents') || [];
    this.events = savedEvents;
  }

  // 发送事件数据
  flushEvents() {
    if (this.events.length === 0) return;

    // 模拟发送数据到服务器
    console.log('发送埋点数据:', this.events);

    // 清空事件队列
    this.events = [];
    this.saveEvents();
  }

  // 统计页面停留时间
  trackPageTime(pageName, duration) {
    this.trackEvent('page_duration', {
      pageName,
      duration,
      timestamp: Date.now()
    });
  }

  // 统计按钮点击
  trackButtonClick(buttonName, pageName) {
    this.trackEvent('button_click', {
      buttonName,
      pageName,
      timestamp: Date.now()
    });
  }

  // 统计跳出率
  trackBounceRate(pageName, hasInteraction) {
    this.trackEvent('page_bounce', {
      pageName,
      hasInteraction,
      timestamp: Date.now()
    });
  }

  // 统计A/B测试
  trackABTest(testName, variant, action) {
    this.trackEvent('ab_test', {
      testName,
      variant,
      action,
      timestamp: Date.now()
    });
  }
}

// 导出单例
const analytics = new Analytics();
export default analytics;