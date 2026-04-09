import axios from 'axios'
import { Message } from 'element-ui'

// 1. 创建 axios 实例
const request = axios.create({
    baseURL: 'http://localhost:8080', // 指向你的 Spring Boot 后台地址
    timeout: 5000
})

// 2. 请求拦截器：自动在请求头带上 Token
request.interceptors.request.use(config => {
    // 🌟 核心修正：这里必须和 Login.vue 里存的名称保持绝对一致，使用 admin_token
    let token = localStorage.getItem("admin_token");
    if (token) {
        // 与后端 AuthInterceptor.java 约定的 Authorization 字段和 Bearer 前缀格式
        config.headers['Authorization'] = 'Bearer ' + token;
    }
    return config
}, error => {
    return Promise.reject(error)
})

// 3. 响应拦截器：统一处理后端返回的结果
request.interceptors.response.use(
    response => {
        let res = response.data;
        // 如果被后端拦截器拦截 (比如 Token 过期、被篡改，或者没带 Token)
        if (res.code === 401) {
            Message.error(res.msg);
            // 🌟 核心修正：被拦截后，要清空管理员的专属缓存
            localStorage.removeItem("admin_token");
            localStorage.removeItem("admin_user");
            window.location.href = '/login'; // 强制跳回登录页
        }
        return res;
    },
    error => {
        console.error('请求错误：' + error)
        Message.error('网络连接异常，请检查后端服务是否启动');
        return Promise.reject(error)
    }
)

export default request