import axios from 'axios'
import { Message } from 'element-ui'

// 1. 创建 axios 实例
const request = axios.create({
    baseURL: 'http://localhost:8080', // 指向你的 Spring Boot 后台地址
    timeout: 5000
})

// 2. 请求拦截器：自动在请求头带上 Token
request.interceptors.request.use(config => {
    let token = localStorage.getItem("token");
    if (token) {
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
        // 如果被后端拦截器拦截 (未登录或Token失效)
        if (res.code === 401) {
            Message.error(res.msg);
            localStorage.removeItem("token");
            window.location.href = '/login'; // 强制跳回登录页
        }
        return res;
    },
    error => {
        console.error('请求错误：' + error)
        return Promise.reject(error)
    }
)

export default request