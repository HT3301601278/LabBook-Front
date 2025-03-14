<template>
  <div class="login-container">
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
        <el-form-item>
          <el-select
            v-model="form.role"
            placeholder="请选择角色"
            class="custom-select">
            <el-option label="系统管理员" value="ADMIN"></el-option>
            <el-option label="实验室管理员" value="LABADMIN"></el-option>
            <el-option label="学生" value="STUDENT"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            class="login-button"
            @click="login">
            登 录
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
      }
    }
  },
  created() {
    // 进入登录页面时清除旧的 token
    localStorage.removeItem('user')
    // 初始化表单数据
    this.form = {
      username: '',
      password: '',
      role: ''
    }
  },
  methods: {
    login() {
      this.$refs['formRef'].validate((valid) => {
        if (valid) {
          // 验证通过
          this.$request.post('/login', this.form).then(res => {
            if (res.code === '200') {
              localStorage.setItem("user", JSON.stringify(res.data))  // 存储用户数据
              this.$router.push('/')  // 跳转主页
              this.$message.success('登录成功')
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
  width: 420px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
  backdrop-filter: blur(10px);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  width: 80px;
  height: 80px;
  margin-bottom: 15px;
}

.login-header h2 {
  color: #2c3e50;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.login-form {
  margin-top: 30px;
}

.custom-input :deep(.el-input__inner) {
  height: 45px;
  line-height: 45px;
  border-radius: 8px;
  border: 1px solid #dcdfe6;
  transition: all 0.3s;
}

.custom-input :deep(.el-input__inner):focus {
  border-color: #409EFF;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.custom-select {
  width: 100%;
}

.custom-select :deep(.el-input__inner) {
  height: 45px;
  line-height: 45px;
  border-radius: 8px;
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
  margin-top: 20px;
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
</style>
