import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import '@/assets/css/global.css'
import '@/assets/css/theme/index.css'
import request from "@/utils/request";
import AIChat from '@/views/common/AIChat.vue'

Vue.config.productionTip = false

Vue.prototype.$request = request
Vue.prototype.$baseUrl = 'http://localhost:8080'

Vue.use(ElementUI, {size: "small"})

// 创建全局聊天实例
const aiChatInstance = new Vue({
  render: h => h(AIChat)
}).$mount()
document.body.appendChild(aiChatInstance.$el)
Vue.prototype.$aiChat = aiChatInstance.$children[0]

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')
