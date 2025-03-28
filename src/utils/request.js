import axios from 'axios'
import router from "@/router";
import {Message} from 'element-ui'

// 创建可一个新的axios对象
const request = axios.create({
    baseURL: 'http://localhost:8080',   // 设置baseURL为后端8080端口
    timeout: 30000     // 30s请求超时
})

// 添加标志位，用于防止重复显示 toast
let isShowingExpiredToast = false

// request 拦截器
// 可以自请求发送前对请求做一些处理
// 比如统一加token，对请求参数统一加密
request.interceptors.request.use(config => {
    config.headers['Content-Type'] = 'application/json;charset=utf-8';        // 设置请求头格式

    // 登录和注册接口不需要token
    if (!config.url.includes('/login') && !config.url.includes('/register')) {
        let user = JSON.parse(localStorage.getItem("labuser") || '{}')  // 获取缓存的用户信息
        if (user.token) {
            config.headers['token'] = user.token  // 设置请求头
        }
    }

    return config
}, error => {
    console.error('request error: ' + error) // for debug
    return Promise.reject(error)
});

// response 拦截器
// 可以在接口响应后统一处理结果
request.interceptors.response.use(
    response => {
        let res = response.data;

        // 兼容服务端返回的字符串数据
        if (typeof res === 'string') {
            res = res ? JSON.parse(res) : res
        }
        // 只在非登录接口时处理token过期
        if (res.code === '401' && !response.config.url.includes('/login')) {
            localStorage.removeItem('labuser')  // 清除token
            if (!isShowingExpiredToast) {
                isShowingExpiredToast = true
                Message.error('登录已过期，请重新登录')  // 添加错误提示
                setTimeout(() => {
                    isShowingExpiredToast = false
                }, 3000) // 3秒后重置标志位
            }
            router.push('/login')
        }
        return res;
    },
    error => {
        console.error('response error: ' + error) // for debug
        return Promise.reject(error)
    }
)


export default request
