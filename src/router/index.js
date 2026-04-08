import Vue from 'vue'
import VueRouter from 'vue-router'
// 👇 这里改成了引入新名字的文件
import LoginView from '../views/LoginView.vue'
import HomeView from '../views/HomeView.vue'
import ProductAudit from '../views/ProductAudit.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  // 👇 这里的 component 也同步换成新名字
  { path: '/login', component: LoginView },
  { 
    path: '/home', 
    component: HomeView, // 👇 这里换成新名字
    redirect: '/home/audit',
    children: [
      { path: 'audit', component: ProductAudit }
    ]
  }
]

const router = new VueRouter({
  routes
})

export default router