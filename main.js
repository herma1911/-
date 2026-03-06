import App from './App'
// import { startScheduledTasks } from './utils/scheduler.js'

// 启动定时任务 - 暂时注释掉，避免应用启动时卡住
// startScheduledTasks()

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif