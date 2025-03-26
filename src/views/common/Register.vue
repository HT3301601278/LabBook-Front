<template>
  <div class="login-container">
    <div id="particles-js" class="particles"></div>
    <div class="login-box">
      <div class="login-header">
        <img src="@/assets/imgs/沈阳化工大学校徽.svg" alt="logo" class="logo">
        <h2>实验室预约管理系统注册</h2>
      </div>
      <el-form :model="form" :rules="rules" ref="formRef" class="login-form">
        <div class="form-row">
          <div class="form-col">
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
            <el-form-item prop="confirmPass">
              <el-input
                prefix-icon="el-icon-lock"
                placeholder="请确认密码"
                show-password
                v-model="form.confirmPass"
                class="custom-input"
                @focus="handleFocus"
                @blur="handleBlur">
              </el-input>
            </el-form-item>
            <el-form-item prop="studentNumber">
              <el-input
                prefix-icon="el-icon-notebook-2"
                placeholder="请输入学号"
                v-model="form.studentNumber"
                class="custom-input"
                @focus="handleFocus"
                @blur="handleBlur">
              </el-input>
            </el-form-item>
          </div>
          <div class="form-col">
            <el-form-item prop="name">
              <el-input
                prefix-icon="el-icon-user"
                placeholder="请输入姓名"
                v-model="form.name"
                class="custom-input"
                @focus="handleFocus"
                @blur="handleBlur">
              </el-input>
            </el-form-item>
            <el-form-item prop="college">
              <el-select 
                v-model="form.college" 
                placeholder="请选择学院"
                @change="handleCollegeChange"
                @focus="handleFocus"
                @blur="handleBlur"
                class="custom-input">
                <el-option
                  v-for="item in colleges"
                  :key="item"
                  :label="item"
                  :value="item">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item prop="major">
              <el-select 
                v-model="form.major" 
                placeholder="请选择专业"
                @focus="handleFocus"
                @blur="handleBlur"
                class="custom-input">
                <el-option
                  v-for="item in majors"
                  :key="item"
                  :label="item"
                  :value="item">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item prop="phone">
              <el-input
                prefix-icon="el-icon-phone"
                placeholder="请输入手机号"
                v-model="form.phone"
                class="custom-input"
                @focus="handleFocus"
                @blur="handleBlur">
              </el-input>
            </el-form-item>
          </div>
        </div>
        <el-form-item prop="studentCardPhoto">
          <div class="upload-container">
            <el-upload
              class="upload-box"
              action="http://localhost:8080/files/upload"
              :show-file-list="false"
              :on-success="handleStudentCardSuccess"
              :before-upload="beforeStudentCardUpload"
              @focus="handleFocus"
              @blur="handleBlur">
              <div class="upload-area" :class="{'has-file': form.studentCardPhoto}">
                <i class="el-icon-upload upload-icon"></i>
                <div class="upload-text">
                  {{ form.studentCardPhoto ? '重新上传学生证照片' : '上传学生证照片' }}
                </div>
                <div class="upload-tip" v-if="!form.studentCardPhoto">请上传清晰的学生证照片（JPG/PNG格式，小于5MB）</div>
                <div class="upload-success" v-if="form.studentCardPhoto">
                  <i class="el-icon-check"></i> 已成功上传学生证照片
                </div>
              </div>
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button
            class="login-button"
            @click="register"
            @mouseenter="handleButtonHover"
            @mouseleave="handleButtonLeave">
            <span>注 册</span>
          </el-button>
        </el-form-item>
        <div class="register-link">
          已有账号？<router-link to="/login" class="register-text">立即登录</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: "Register",
  data() {
    // 验证密码
    const validatePassword = (rule, confirmPass, callback) => {
      if (confirmPass === '') {
        callback(new Error('请确认密码'))
      } else if (confirmPass !== this.form.password) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }
    // 验证手机号
    const validatePhone = (rule, value, callback) => {
      if (value && !/^1[3-9]\d{9}$/.test(value)) {
        callback(new Error('请输入正确的手机号'))
      } else {
        callback()
      }
    }
    return {
      activeField: null,
      buttonHovered: false,
      form: { 
        role: 'STUDENT',
        username: '',
        password: '',
        confirmPass: '',
        name: '',
        studentNumber: '',
        college: '',
        major: '',
        phone: '',
        studentCardPhoto: ''
      },
      // 学院和专业的映射关系
      collegeToMajors: {
        '化学工程学院': [
          '化学工程与工艺',
          '化学工程与工艺（卓越工程师班）',
          '化学工程与工艺（菱镁产业学院）',
          '应用化学',
          '能源化学工程',
          '制药工程'
        ],
        '材料科学与工程学院': [
          '高分子材料与工程',
          '高分子材料与工程（卓越工程师班）',
          '材料化学',
          '无机非金属材料工程',
          '金属材料工程',
          '新能源材料与器件'
        ],
        '机械与动力工程学院': [
          '过程装备与控制工程专业',
          '机械设计制造及其自动化专业',
          '能源与动力工程专业',
          '能源与动力工程专业（中外合作办学）',
          '金属材料工程',
          '油气储运工程专业'
        ],
        '信息工程学院': [
          '自动化专业',
          '电气工程及其自动化专业',
          '测控技术与仪器专业',
          '电子信息工程专业',
          '电子科学与技术专业',
          '物联网工程专业',
          '人工智能专业'
        ],
        '计算机科学与技术学院': [
          '计算机科学与技术专业',
          '网络工程专业',
          '软件工程专业',
          '数据科学与大数据技术专业'
        ],
        '环境与安全工程学院': [
          '水质科学与技术专业',
          '环境工程专业',
          '安全工程专业'
        ],
        '理学院': [
          '应用物理学专业',
          '化学专业'
        ],
        '经济与管理学院': [
          '工商管理专业',
          '工程管理专业',
          '国际经济与贸易专业',
          '金融学专业',
          '会计学专业',
          '大数据管理与应用专业',
          '应急管理专业'
        ],
        '外国语学院': [
          '英语专业',
          '国际经济与贸易专业（对俄贸易方向）'
        ],
        '人文与艺术学院': [
          '社会工作专业',
          '产品设计专业',
          '环境设计专业'
        ],
        '体育部': [
          '社会体育指导与管理专业'
        ]
      },
      // 获取所有学院列表
      colleges: [],
      // 当前可选的专业列表
      majors: [],
      rules: {
        username: [
          { required: true, message: '请输入账号', trigger: 'blur' },
          { min: 3, max: 20, message: '账号长度在3-20个字符之间', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 20, message: '密码长度在6-20个字符之间', trigger: 'blur' }
        ],
        confirmPass: [
          { validator: validatePassword, trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入姓名', trigger: 'blur' },
          { pattern: /^[\u4e00-\u9fa5]+$/, message: '姓名只能输入汉字', trigger: 'blur' }
        ],
        studentNumber: [
          { required: true, message: '请输入学号', trigger: 'blur' },
          { pattern: /^(21|22|23|24)\d{8}$/, message: '请输入正确的学号', trigger: 'blur' }
        ],
        college: [
          { required: true, message: '请选择学院', trigger: 'change' }
        ],
        major: [
          { required: true, message: '请选择专业', trigger: 'change' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
        ],
        studentCardPhoto: [
          { required: true, message: '请上传学生证照片', trigger: 'change' }
        ]
      }
    }
  },
  created() {
    // 初始化学院列表
    this.colleges = Object.keys(this.collegeToMajors)
  },
  mounted() {
    // 动态加载粒子动画库
    const script = document.createElement('script')
    script.setAttribute('src', 'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js')
    script.onload = this.initParticles
    document.head.appendChild(script)
  },
  methods: {
    // 处理学院选择变化
    handleCollegeChange(value) {
      this.form.major = '' // 清空专业选择
      this.majors = this.collegeToMajors[value] || [] // 更新专业列表
    },
    // 初始化粒子动画
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
    // 处理输入框焦点
    handleFocus(event) {
      // 记录当前激活的输入框
      this.activeField = event.target
      
      // 添加焦点动画
      const formItem = event.target.closest('.el-form-item')
      if (formItem) {
        formItem.classList.add('form-item-focus')
      }
    },
    // 处理输入框失焦
    handleBlur(event) {
      // 移除焦点动画
      const formItem = event.target.closest('.el-form-item')
      if (formItem) {
        formItem.classList.remove('form-item-focus')
      }
      this.activeField = null
    },
    // 处理按钮悬停
    handleButtonHover() {
      this.buttonHovered = true
    },
    // 处理按钮离开
    handleButtonLeave() {
      this.buttonHovered = false
    },
    // 显示成功动画
    showSuccessAnimation() {
      const loginBox = document.querySelector('.login-box')
      loginBox.classList.add('success-animation')
      setTimeout(() => {
        loginBox.classList.remove('success-animation')
      }, 1000)
    },
    // 显示错误动画
    showErrorAnimation() {
      const loginBox = document.querySelector('.login-box')
      loginBox.classList.add('error-animation')
      setTimeout(() => {
        loginBox.classList.remove('error-animation')
      }, 500)
    },
    // 上传学生证照片前的验证
    beforeStudentCardUpload(file) {
      const isImage = file.type.startsWith('image/')
      const isLt5M = file.size / 1024 / 1024 < 5

      if (!isImage) {
        this.$message.error('只能上传图片文件！')
        return false
      }
      if (!isLt5M) {
        this.$message.error('图片大小不能超过 5MB！')
        return false
      }
      return true
    },
    // 学生证照片上传成功的回调
    handleStudentCardSuccess(res) {
      if (res.code === '200') {
        this.form.studentCardPhoto = res.data
        this.$message.success('上传成功')
        // 手动触发表单验证
        this.$refs['formRef'].validateField('studentCardPhoto')
      } else {
        this.$message.error('上传失败')
      }
    },
    // 注册
    register() {
      this.$refs['formRef'].validate((valid) => {
        if (valid) {
          // 添加按钮加载动画
          const loginBtn = document.querySelector('.login-button')
          loginBtn.classList.add('loading')
          
          // 验证通过
          this.$request.post('/register', this.form).then(res => {
            loginBtn.classList.remove('loading')
            if (res.code === '200') {
              // 添加成功动画
              this.showSuccessAnimation()
              
              // 延迟跳转，让动画有时间显示
              setTimeout(() => {
                this.$router.push('/login')  // 跳转登录页面
                this.$message.success('注册成功')
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
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  position: relative;
  overflow: hidden;
  padding: 30px 15px;
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
  width: 100%;
  max-width: 800px;
  padding: 30px 40px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
  backdrop-filter: blur(10px);
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform: translateY(0);
}

.login-header {
  text-align: center;
  margin-bottom: 20px;
}

.logo {
  width: 70px;
  height: 70px;
  margin-bottom: 12px;
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
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 5px 0;
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

.subtitle {
  color: #606266;
  font-size: 16px;
  margin-top: 5px;
  font-weight: normal;
}

.login-form {
  margin-top: 20px;
}

.el-form-item {
  margin-bottom: 25px;
  transition: all 0.3s ease;
}

.form-item-focus {
  transform: translateX(5px);
}

.custom-input {
  width: 100%;
  margin-bottom: 5px;
}

.custom-input :deep(.el-input__inner),
.custom-input :deep(.el-select .el-input__inner) {
  height: 42px;
  line-height: 42px;
  border-radius: 8px;
  border: 1px solid #dcdfe6;
  transition: all 0.3s;
  padding-left: 40px;
}

.custom-input :deep(.el-input__inner):focus,
.custom-input :deep(.el-select .el-input__inner):focus {
  border-color: #409EFF;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  transform: translateY(-2px);
}

.upload-container {
  width: 100%;
  margin: 10px 0;
}

.upload-box {
  width: 100%;
  text-align: center;
}

.upload-area {
  width: 100%;
  height: 120px;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #f8f9fa;
  padding: 15px;
}

.upload-area:hover {
  border-color: #409EFF;
  background-color: #f0f7ff;
}

.upload-area.has-file {
  border-color: #67C23A;
  background-color: #f0f9eb;
}

.upload-icon {
  font-size: 28px;
  color: #409EFF;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 15px;
  font-weight: 500;
  color: #409EFF;
  margin-bottom: 5px;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  text-align: center;
  margin-top: 5px;
}

.upload-success {
  color: #67C23A;
  font-size: 14px;
  margin-top: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-success i {
  margin-right: 5px;
}

.login-button {
  width: 100%;
  height: 42px;
  font-size: 16px;
  font-weight: 500;
  background: linear-gradient(135deg, #409EFF 0%, #3a8ee6 100%);
  border: none;
  border-radius: 8px;
  color: white;
  transition: all 0.3s;
  margin-top: 10px;
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
  margin-top: 15px;
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

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

:deep(.el-form-item) {
  margin-bottom: 18px;
}

:deep(.el-form-item__error) {
  padding-top: 2px;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.form-col {
  flex: 1;
  min-width: 0;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .login-box {
    padding: 25px 20px;
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .logo {
    width: 60px;
    height: 60px;
  }
  
  .login-header h2 {
    font-size: 20px;
  }
  
  .subtitle {
    font-size: 14px;
  }
}

/* 添加过渡动画 */
.login-form :deep(.el-form-item) {
  transition: all 0.3s ease;
}

.login-form :deep(.el-input),
.login-form :deep(.el-select) {
  transition: all 0.3s ease;
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
</style>
