<template>
  <div class="login-container">
    <div id="particles-js" class="particles"></div>
    <div class="login-box">
      <div class="login-header">
        <img src="@/assets/imgs/沈阳化工大学校徽.svg" alt="logo" class="logo">
        <h2>实验室预约管理系统登录</h2>
      </div>
      <el-form :model="form" :rules="rules" ref="formRef" class="login-form">
        <el-form-item prop="username">
          <el-input
            prefix-icon="el-icon-user"
            placeholder="请输入账号"
            v-model="form.username"
            class="custom-input"
            @focus="handleFocus"
            @blur="handleBlur">
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            prefix-icon="el-icon-lock"
            placeholder="请输入密码"
            show-password
            v-model="form.password"
            class="custom-input"
            @focus="handleFocus"
            @blur="handleBlur">
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-select
            v-model="form.role"
            placeholder="请选择角色"
            class="custom-select"
            @focus="handleFocus"
            @blur="handleBlur">
            <el-option label="系统管理员" value="ADMIN"></el-option>
            <el-option label="实验室管理员" value="LABADMIN"></el-option>
            <el-option label="学生" value="STUDENT"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            class="login-button"
            @click="login"
            @mouseenter="handleButtonHover"
            @mouseleave="handleButtonLeave">
            <span>登 录</span>
          </el-button>
        </el-form-item>
        <div class="register-link">
          还没有账号？<router-link to="/register" class="register-text">立即注册</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: "Login",
  data() {
    return {
      form: {},
      rules: {
        username: [
          { required: true, message: '请输入账号', trigger: 'blur' },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
        ]
      },
      activeField: null,
      buttonHovered: false
    }
  },
  created() {
    // 进入登录页面时清除旧的 token
    localStorage.removeItem('labuser')
    // 初始化表单数据
    this.form = {
      username: '',
      password: '',
      role: ''
    }
  },
  mounted() {
    // 动态加载粒子动画库
    const script = document.createElement('script')
    script.setAttribute('src', 'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js')
    script.onload = this.initParticles
    document.head.appendChild(script)
  },
  methods: {
    login() {
      this.$refs['formRef'].validate((valid) => {
        if (valid) {
          // 添加按钮加载动画
          const loginBtn = document.querySelector('.login-button')
          loginBtn.classList.add('loading')
          
          // 验证通过
          this.$request.post('/login', this.form).then(res => {
            loginBtn.classList.remove('loading')
            if (res.code === '200') {
              localStorage.setItem("labuser", JSON.stringify(res.data))  // 存储用户数据
              
              // 添加成功动画
              this.showSuccessAnimation()
              
              // 延迟跳转，让动画有时间显示
              setTimeout(() => {
                this.$router.push('/')  // 跳转主页
                this.$message.success('登录成功')
              }, 800)
            } else {
              // 添加失败动画
              this.showErrorAnimation()
              this.$message.error(res.msg)
            }
          }).catch(() => {
            loginBtn.classList.remove('loading')
            this.showErrorAnimation()
          })
        }
      })
    },
    initParticles() {
      if (window.particlesJS) {
        window.particlesJS('particles-js', {
          particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: '#409EFF' },
            shape: { type: 'circle', stroke: { width: 0, color: '#000000' } },
            opacity: { value: 0.5, random: true, anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false } },
            size: { value: 3, random: true, anim: { enable: true, speed: 2, size_min: 0.1, sync: false } },
            line_linked: { enable: true, distance: 150, color: '#409EFF', opacity: 0.4, width: 1 },
            move: {
              enable: true, speed: 1, direction: 'none', random: true,
              straight: false, out_mode: 'out', bounce: false,
              attract: { enable: true, rotateX: 600, rotateY: 1200 }
            }
          },
          interactivity: {
            detect_on: 'canvas',
            events: {
              onhover: { enable: true, mode: 'grab' },
              onclick: { enable: true, mode: 'push' },
              resize: true
            },
            modes: {
              grab: { distance: 140, line_linked: { opacity: 1 } },
              bubble: { distance: 400, size: 40, duration: 2, opacity: 8, speed: 3 },
              repulse: { distance: 200, duration: 0.4 },
              push: { particles_nb: 4 },
              remove: { particles_nb: 2 }
            }
          },
          retina_detect: true
        })
      }
    },
    handleFocus(event) {
      // 记录当前激活的输入框
      this.activeField = event.target
      
      // 添加焦点动画
      const formItem = event.target.closest('.el-form-item')
      if (formItem) {
        formItem.classList.add('form-item-focus')
      }
    },
    handleBlur(event) {
      // 移除焦点动画
      const formItem = event.target.closest('.el-form-item')
      if (formItem) {
        formItem.classList.remove('form-item-focus')
      }
      this.activeField = null
    },
    handleButtonHover() {
      this.buttonHovered = true
    },
    handleButtonLeave() {
      this.buttonHovered = false
    },
    showSuccessAnimation() {
      const loginBox = document.querySelector('.login-box')
      loginBox.classList.add('success-animation')
      setTimeout(() => {
        loginBox.classList.remove('success-animation')
      }, 1000)
    },
    showErrorAnimation() {
      const loginBox = document.querySelector('.login-box')
      loginBox.classList.add('error-animation')
      setTimeout(() => {
        loginBox.classList.remove('error-animation')
      }, 500)
    }
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  position: relative;
  overflow: hidden;
}

.particles {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 0;
}

.login-container::before {
  content: '';
  position: absolute;
  width: 200%;
  height: 200%;
  top: -50%;
  left: -50%;
  background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 60%);
  animation: rotate 30s linear infinite;
}

.login-box {
  width: 420px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
  backdrop-filter: blur(10px);
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform: translateY(0);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  width: 80px;
  height: 80px;
  margin-bottom: 15px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.login-header h2 {
  color: #2c3e50;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  background: linear-gradient(45deg, #4facfe, #00f2fe);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradient 8s ease infinite;
  background-size: 200% 200%;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.login-form {
  margin-top: 30px;
}

.el-form-item {
  margin-bottom: 25px;
  transition: all 0.3s ease;
}

.form-item-focus {
  transform: translateX(5px);
}

.custom-input :deep(.el-input__inner) {
  height: 45px;
  line-height: 45px;
  border-radius: 8px;
  border: 1px solid #dcdfe6;
  transition: all 0.3s;
  padding-left: 40px;
}

.custom-input :deep(.el-input__inner):focus {
  border-color: #409EFF;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  transform: translateY(-2px);
}

.custom-select {
  width: 100%;
}

.custom-select :deep(.el-input__inner) {
  height: 45px;
  line-height: 45px;
  border-radius: 8px;
  padding-left: 40px;
}

.login-button {
  width: 100%;
  height: 45px;
  font-size: 16px;
  font-weight: 500;
  background: linear-gradient(135deg, #409EFF 0%, #3a8ee6 100%);
  border: none;
  border-radius: 8px;
  color: white;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.login-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: all 0.6s;
}

.login-button:hover::before {
  left: 100%;
}

.login-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 7px 14px rgba(64, 158, 255, 0.4);
}

.login-button:active {
  transform: translateY(0);
  box-shadow: 0 4px 8px rgba(64, 158, 255, 0.3);
}

.login-button span {
  position: relative;
  z-index: 1;
}

.login-button.loading {
  background: linear-gradient(135deg, #409EFF 0%, #3a8ee6 100%);
  pointer-events: none;
}

.login-button.loading::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  top: 50%;
  left: 50%;
  margin-top: -10px;
  margin-left: -10px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.register-link {
  text-align: center;
  margin-top: 20px;
  color: #606266;
  transition: all 0.3s;
}

.register-text {
  color: #409EFF;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s;
  position: relative;
}

.register-text::after {
  content: '';
  position: absolute;
  width: 0;
  height: 1px;
  bottom: -2px;
  left: 0;
  background-color: #409EFF;
  transition: width 0.3s;
}

.register-text:hover::after {
  width: 100%;
}

.register-text:hover {
  color: #66b1ff;
}

.success-animation {
  animation: success-pulse 0.8s;
}

@keyframes success-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(103, 194, 58, 0.4);
  }
  70% {
    box-shadow: 0 0 0 20px rgba(103, 194, 58, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(103, 194, 58, 0);
  }
}

.error-animation {
  animation: shake 0.5s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
