import App from './App'

//路由拦截
import { setupRouteGuard } from '@/untils/routeGuard.js'

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
  setupRouteGuard()
  return {
    app
  }
}
// #endif