<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <img src="@/assets/imgs/沈阳化工大学校徽.svg" alt="logo" class="logo">
        <h2>实验室预约管理系统注册</h2>
      </div>
      <el-form :model="form" :rules="rules" ref="formRef" class="login-form">
        <el-form-item prop="username">
          <el-input
            prefix-icon="el-icon-user"
            placeholder="请输入账号"
            v-model="form.username"
            class="custom-input">
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            prefix-icon="el-icon-lock"
            placeholder="请输入密码"
            show-password
            v-model="form.password"
            class="custom-input">
          </el-input>
        </el-form-item>
        <el-form-item prop="confirmPass">
          <el-input
            prefix-icon="el-icon-lock"
            placeholder="请确认密码"
            show-password
            v-model="form.confirmPass"
            class="custom-input">
          </el-input>
        </el-form-item>
        <el-form-item prop="name">
          <el-input
            prefix-icon="el-icon-user"
            placeholder="请输入姓名"
            v-model="form.name"
            class="custom-input">
          </el-input>
        </el-form-item>
        <el-form-item prop="studentNumber">
          <el-input
            prefix-icon="el-icon-notebook-2"
            placeholder="请输入学号"
            v-model="form.studentNumber"
            class="custom-input">
          </el-input>
        </el-form-item>
        <el-form-item prop="college">
          <el-select 
            v-model="form.college" 
            placeholder="请选择学院"
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
            class="custom-input">
          </el-input>
        </el-form-item>
        <el-form-item prop="studentCardPhoto">
          <el-upload
            class="upload-box"
            action="/files/upload"
            :show-file-list="false"
            :on-success="handleStudentCardSuccess"
            :before-upload="beforeStudentCardUpload">
            <el-button type="primary" class="upload-button">
              <i class="el-icon-upload"></i> 
              {{ form.studentCardPhoto ? '重新上传学生证照片' : '上传学生证照片' }}
            </el-button>
            <div class="upload-tip" v-if="!form.studentCardPhoto">请上传清晰的学生证照片</div>
            <div class="upload-success" v-else>
              <i class="el-icon-check"></i> 已上传
            </div>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <el-button
            class="login-button"
            @click="register">
            注 册
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
      // 学院列表
      colleges: [
        '化工学院',
        '材料学院',
        '机械学院',
        '信息学院',
        '经济管理学院',
        '文法学院',
        '理学院'
      ],
      // 专业列表
      majors: [
        '化学工程与工艺',
        '应用化学',
        '高分子材料与工程',
        '机械设计制造及其自动化',
        '计算机科学与技术',
        '软件工程',
        '信息管理与信息系统'
      ],
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
          { required: true, message: '请输入姓名', trigger: 'blur' }
        ],
        studentNumber: [
          { required: true, message: '请输入学号', trigger: 'blur' },
          { pattern: /^\d{8,12}$/, message: '请输入正确的学号格式', trigger: 'blur' }
        ],
        college: [
          { required: true, message: '请选择学院', trigger: 'change' }
        ],
        major: [
          { required: true, message: '请选择专业', trigger: 'change' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: validatePhone, trigger: 'blur' }
        ],
        studentCardPhoto: [
          { required: true, message: '请上传学生证照片', trigger: 'change' }
        ]
      }
    }
  },
  methods: {
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
          // 验证通过
          this.$request.post('/register', this.form).then(res => {
            if (res.code === '200') {
              this.$router.push('/login')  // 跳转登录页面
              this.$message.success('注册成功')
            } else {
              this.$message.error(res.msg)
            }
          })
        }
      })
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
  width: 480px;
  padding: 30px 40px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
  backdrop-filter: blur(10px);
}

.login-header {
  text-align: center;
  margin-bottom: 20px;
}

.logo {
  width: 70px;
  height: 70px;
  margin-bottom: 12px;
}

.login-header h2 {
  color: #2c3e50;
  font-size: 22px;
  font-weight: 600;
  margin: 0;
}

.login-form {
  margin-top: 20px;
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
}

.custom-input :deep(.el-input__inner):focus,
.custom-input :deep(.el-select .el-input__inner):focus {
  border-color: #409EFF;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.upload-box {
  width: 100%;
  text-align: center;
  margin: 5px 0;
}

.upload-button {
  width: 100%;
  height: 42px;
  border-radius: 8px;
  background: linear-gradient(135deg, #409EFF 0%, #3a8ee6 100%);
  border: none;
  color: white;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s;
}

.upload-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.upload-button:active {
  transform: translateY(0);
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 6px;
}

.upload-success {
  color: #67C23A;
  margin-top: 6px;
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
}

.login-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.login-button:active {
  transform: translateY(0);
}

.register-link {
  text-align: center;
  margin-top: 15px;
  color: #606266;
}

.register-text {
  color: #409EFF;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s;
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
</style>
