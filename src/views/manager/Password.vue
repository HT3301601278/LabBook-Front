<template>
  <div class="password-container">
    <el-card class="password-card" shadow="hover">
      <div class="card-header">
        <h2 class="title">修改密码</h2>
      </div>
      <el-form ref="formRef" :model="user" :rules="rules" label-width="120px">
        <div class="avatar-container">
          <el-upload
              class="avatar-uploader"
              :action="$baseUrl + '/files/upload'"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
          >
            <img v-if="user.avatar" :src="user.avatar" class="avatar" />
            <div v-else class="avatar-placeholder">
              <i class="el-icon-plus"></i>
              <span>上传头像</span>
            </div>
          </el-upload>
        </div>
        <el-form-item label="原始密码" prop="password">
          <el-input show-password v-model="user.password" placeholder="请输入原始密码" prefix-icon="el-icon-lock"></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input show-password v-model="user.newPassword" placeholder="请输入新密码" prefix-icon="el-icon-key"></el-input>
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input show-password v-model="user.confirmPassword" placeholder="请再次输入新密码" prefix-icon="el-icon-check"></el-input>
        </el-form-item>
        <div class="button-container">
          <el-button type="primary" @click="update" class="submit-button">确认修改</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Password",
  data() {
    const validatePassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请确认密码'))
      } else if (value !== this.user.newPassword) {
        callback(new Error('确认密码错误'))
      } else {
        callback()
      }
    }

    return {
      user: JSON.parse(localStorage.getItem('labuser') || '{}'),
      rules: {
        password: [
          { required: true, message: '请输入原始密码', trigger: 'blur' },
        ],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
        ],
        confirmPassword: [
          { validator: validatePassword, required: true, trigger: 'blur' },
        ],
      }
    }
  },
  created() {

  },
  methods: {
    update() {
      this.$refs.formRef.validate((valid) => {
        if (valid) {
          this.$request.put('/updatePassword', this.user).then(res => {
            if (res.code === '200') {
              // 成功更新
              localStorage.removeItem('labuser')   // 清除缓存的用户信息
              this.$message.success('修改密码成功')
              this.$router.push('/login')
            } else {
              this.$message.error(res.msg)
            }
          })
        }
      })
    },
    handleAvatarSuccess(response, file, fileList) {
      // 把头像属性换成上传的图片的链接
      this.$set(this.user, 'avatar', response.data)
    }
  }
}
</script>

<style scoped>
.password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 60px);
  background-color: #f5f7fa;
  background-image: linear-gradient(135deg, #f5f7fa 0%, #e4ecfb 100%);
  padding: 20px;
}

.password-card {
  width: 600px;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  background-color: #fff;
  border: none;
}

.password-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);
}

.card-header {
  background-color: #409EFF;
  color: white;
  padding: 20px 0;
  text-align: center;
  margin-bottom: 20px;
  border-radius: 16px;
  background-image: linear-gradient(120deg, #4facfe 0%, #00f2fe 100%);
}

.title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 1px;
}

.password-card :deep(.el-form) {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 0 20px 20px;
}

:deep(.el-form-item) {
  width: 100%;
  margin-bottom: 22px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

:deep(.el-input__inner) {
  border-radius: 4px;
  transition: all 0.3s;
  padding-left: 40px;
}

:deep(.el-input__inner:focus) {
  border-color: #409EFF;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.avatar-container {
  margin: 10px 0 30px;
  display: flex;
  justify-content: center;
  width: 100%;
}

:deep(.el-upload) {
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
}

:deep(.avatar-uploader .el-upload) {
  border: 2px dashed #d9d9d9;
  position: relative;
  overflow: hidden;
  border-radius: 50%;
  background-color: #fafafa;
}

:deep(.avatar-uploader .el-upload:hover) {
  border-color: #409EFF;
  transform: scale(1.02);
  box-shadow: 0 0 10px rgba(64, 158, 255, 0.3);
}

.avatar-placeholder {
  width: 130px;
  height: 130px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #8c939d;
  border-radius: 50%;
}

.avatar-placeholder i {
  font-size: 32px;
  margin-bottom: 8px;
}

.avatar-placeholder span {
  font-size: 14px;
}

.avatar {
  width: 130px;
  height: 130px;
  display: block;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 3px solid white;
}

.button-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin: 30px 0 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.submit-button {
  padding: 12px 30px;
  width: 180px;
  height: 40px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s ease;
  background-image: linear-gradient(120deg, #4facfe 0%, #00f2fe 100%);
  border: none;
  box-shadow: 0 4px 10px rgba(79, 172, 254, 0.3);
  color: white;
}

.submit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(79, 172, 254, 0.4);
}

.submit-button:active {
  transform: translateY(0);
  box-shadow: 0 4px 10px rgba(79, 172, 254, 0.3);
}
</style>
