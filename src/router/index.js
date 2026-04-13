import Vue from 'vue'
import VueRouter from 'vue-router'
// 引入你的视图组件
import LoginView from '../views/LoginView.vue'
import HomeView from '../views/HomeView.vue'
import ProductAudit from '../views/ProductAudit.vue'
import OrderManage from '../views/OrderManage.vue'
// 🌟 新增：引入评价管理组件
import ReviewManage from '../views/ReviewManage.vue'
import ApplyAudit from '../views/ApplyAudit.vue'

Vue.use(VueRouter)

// 路由配置
const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginView },
  { 
    path: '/home', 
    component: HomeView, 
    redirect: '/home/dashboard', // 修改默认跳转到大屏
    children: [
      { path: 'dashboard', component: () => import('../views/DataDashboard.vue') },
      // 🌟 核心：添加申请审批路由
      { path: 'apply', name: 'ApplyAudit', component: ApplyAudit },
      { path: 'audit', component: ProductAudit },
      { path: 'order', component: OrderManage },
      { path: 'review', component: ReviewManage }, 
      { path: 'history', component: () => import('../views/AuditHistory.vue') },
      {
        path: 'notice',
        name: 'NoticeManage',
        component: () => import('../views/NoticeManage.vue'),
        meta: { title: '公告管理' }
      }
    ]
  }
]

const router = new VueRouter({ routes })

/**
 * 🌟 核心：全局前置路由守卫 (建立权限“护城河”)
 * 逻辑：每次路由跳转前都会执行此函数进行拦截核验
 */
router.beforeEach((to, from, next) => {
  // 1. 豁免检查：如果去的是登录页，直接放行
  if (to.path === '/login') {
    return next();
  }

  // 2. 获取存储在本地的 Token 和用户信息
  const token = localStorage.getItem('admin_token');
  const userJson = localStorage.getItem('admin_user');

  // 3. 检查是否登录
  if (!token || !userJson) {
    alert('检测到未登录或登录已失效，请重新登录！');
    return next('/login');
  }

  try {
    const user = JSON.parse(userJson);

    // 4. 角色权限校验：role=3 代表管理员
    if (user.role === 3) {
      next(); // 准予放行
    } else {
      alert('权限不足！该系统仅限管理员访问。');
      localStorage.clear();
      next('/login');
    }
  } catch (error) {
    localStorage.clear();
    next('/login');
  }
})

export default router