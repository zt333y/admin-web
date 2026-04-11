import Vue from 'vue'
import VueRouter from 'vue-router'
// 引入你的视图组件
import LoginView from '../views/LoginView.vue'
import HomeView from '../views/HomeView.vue'
import ProductAudit from '../views/ProductAudit.vue'
import OrderManage from '../views/OrderManage.vue'

Vue.use(VueRouter)

// 路由配置
const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginView },
  { 
    path: '/home', 
    component: HomeView, 
    redirect: '/home/audit',
    children: [
      { path: 'audit', component: ProductAudit },
      { path: 'order', component: OrderManage },
      { path: 'dashboard', component: () => import('../views/Dashboard.vue') }
    ]
  }
]

const router = new VueRouter({
  routes
})

/**
 * 🌟 核心：全局前置路由守卫 (建立权限“护城河”)
 * 逻辑：每次路由跳转前都会执行此函数进行拦截核验
 */
router.beforeEach((to, from, next) => {
  // 1. 豁免检查：如果去的是登录页，直接放行，否则会陷入无限重定向
  if (to.path === '/login') {
    return next();
  }

  // 2. 获取存储在本地的 Token 和用户信息
  // 注意：这里的名称必须与 Login.vue 登录成功后存入的 key 保持一致
  const token = localStorage.getItem('admin_token');
  const userJson = localStorage.getItem('admin_user');

  // 3. 检查是否登录（是否有 Token）
  if (!token || !userJson) {
    alert('检测到未登录或登录已失效，请重新登录！');
    return next('/login');
  }

  try {
    // 解析用户信息
    const user = JSON.parse(userJson);

    // 4. 角色权限硬核校验：
    // 根据数据库设计，role=3 代表管理员
    // 只有管理员能进入后台，其他角色（如农户 role=1）即使猜到了 URL 也会被踢出去
    if (user.role === 3) {
      next(); // 身份核验成功，准予放行
    } else {
      alert('权限不足！该系统仅限管理员访问。');
      // 清理非法缓存并强制返回登录页
      localStorage.clear();
      next('/login');
    }
  } catch (error) {
    // 如果 JSON 解析出错（说明缓存被篡改），清理并拦截
    localStorage.clear();
    next('/login');
  }
})

export default router