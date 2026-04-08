import Vue from 'vue'
import App from './App.vue'
import router from './router' // 引入路由配置
import ElementUI from 'element-ui'; // 引入 Element UI
import 'element-ui/lib/theme-chalk/index.css'; // 引入样式

Vue.config.productionTip = false
Vue.use(ElementUI); // 全局注册 Element UI

new Vue({
  router, // 挂载路由
  render: h => h(App),
}).$mount('#app')