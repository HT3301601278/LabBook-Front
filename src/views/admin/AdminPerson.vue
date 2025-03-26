<template>
  <div class="admin-person-container">
    <el-card class="person-card">
      <div class="card-header">
        <h2>个人信息</h2>
      </div>
      <el-form :model="user" label-width="100px">
        <div class="avatar-container">
          <el-upload
              class="avatar-uploader"
              :action="$baseUrl + '/files/upload'"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
          >
            <img v-if="user.avatar" :src="user.avatar" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            <div class="avatar-hint">点击更换头像</div>
          </el-upload>
        </div>

        <div class="form-section">
          <h3 class="section-title">基本信息</h3>
          <el-form-item label="用户名" prop="username">
            <el-input v-model="user.username" placeholder="用户名" disabled></el-input>
          </el-form-item>
          <el-form-item label="姓名" prop="name">
            <el-input v-model="user.name" placeholder="姓名"></el-input>
          </el-form-item>
          <el-form-item label="电话" prop="phone">
            <el-input v-model="user.phone" placeholder="电话"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="user.email" placeholder="邮箱"></el-input>
          </el-form-item>
        </div>

        <div class="button-container">
          <el-button type="primary" @click="update">保存信息</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "AdminPerson",
  data() {
    return {
      user: JSON.parse(localStorage.getItem('labuser') || '{}')
    }
  },
  created() {

  },
  methods: {
    update() {
      // 保存当前的用户信息到数据库
      this.$request.put('/admin/update', this.user).then(res => {
        if (res.code === '200') {
          // 成功更新
          this.$message.success('保存成功')

          // 更新浏览器缓存里的用户信息
          localStorage.setItem('labuser', JSON.stringify(this.user))

          // 触发父级的数据更新
          this.$emit('update:user')
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    handleAvatarSuccess(response, file, fileList) {
      // 把user的头像属性换成上传的图片的链接
      this.$set(this.user, 'avatar', response.data)
    },
  }
}
</script>

<style scoped>
.admin-person-container {
  min-height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 30px;
  background-color: #f5f7fa;
  background-image: linear-gradient(135deg, #f5f7fa 0%, #e4ecfb 100%);
}

.person-card {
  width: 700px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
  background-color: #fff;
  border: none;
  margin: 0 auto;
}

.person-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);
}

.card-header {
  background-color: #f0f5ff;
  color: #1d1d1f;
  padding: 20px 0;
  text-align: center;
  border-radius: 16px;
  margin-bottom: 30px;
  background-image: linear-gradient(120deg, #e6f7ff 0%, #bae7ff 100%);
}

.card-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 1px;
  color: #1d1d1f;
}

.avatar-container {
  margin: 20px 0 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.avatar-hint {
  margin-top: 10px;
  color: #909399;
  font-size: 14px;
}

:deep(.el-form) {
  padding: 0 40px;
}

.form-section {
  margin-bottom: 30px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 20px;
}

.form-section:last-child {
  border-bottom: none;
}

.section-title {
  color: #6e6e73;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  padding-left: 10px;
  border-left: 4px solid #d2d2d7;
}

:deep(.el-form-item) {
  margin-bottom: 22px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

:deep(.el-input__inner) {
  border-radius: 4px;
  transition: all 0.3s;
}

:deep(.el-input__inner:focus) {
  border-color: #409EFF;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
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
  width: 120px;
  height: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
}

:deep(.avatar-uploader .el-upload:hover) {
  border-color: #409EFF;
  transform: scale(1.02);
  box-shadow: 0 0 10px rgba(64, 158, 255, 0.3);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  line-height: 120px;
  text-align: center;
}

.avatar {
  width: 100%;
  height: 100%;
  display: block;
  border-radius: 50%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
}

.button-container {
  text-align: center;
  margin: 30px 0;
  padding-top: 20px;
}

.button-container .el-button {
  padding: 12px 40px;
  font-size: 16px;
  border-radius: 16px;
  background-image: linear-gradient(120deg, #40a9ff 0%, #1890ff 100%);
  border: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(24, 144, 255, 0.15);
  color: #ffffff;
  position: relative;
  overflow: hidden;
  width: 200px;
}

.button-container .el-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    120deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: 0.5s;
}

.button-container .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(24, 144, 255, 0.25);
  background-image: linear-gradient(120deg, #69c0ff 0%, #40a9ff 100%);
}

.button-container .el-button:hover::before {
  left: 100%;
}

.button-container .el-button:active {
  transform: translateY(1px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
</style>
