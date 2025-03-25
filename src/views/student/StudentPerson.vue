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
          <el-form-item label="学号" prop="studentNumber">
            <el-input v-model="user.studentNumber" placeholder="请输入学号"></el-input>
          </el-form-item>
          <el-form-item label="姓名" prop="name">
            <el-input v-model="user.name" placeholder="姓名"></el-input>
          </el-form-item>
          <el-form-item label="电话" prop="phone">
            <el-input v-model="user.phone" placeholder="电话"></el-input>
          </el-form-item>
        </div>
        
        <div class="form-section">
          <h3 class="section-title">学院信息</h3>
          <el-form-item label="学院" prop="college">
            <el-select v-model="user.college" placeholder="请选择学院" @change="handleCollegeChange">
              <el-option
                v-for="college in colleges"
                :key="college"
                :label="college"
                :value="college">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="专业" prop="major">
            <el-select v-model="user.major" placeholder="请选择专业">
              <el-option
                v-for="major in majors"
                :key="major"
                :label="major"
                :value="major">
              </el-option>
            </el-select>
          </el-form-item>
        </div>
        
        <div class="form-section">
          <h3 class="section-title">证件照片</h3>
          <el-form-item label="学生证照片" prop="studentCardPhoto">
            <el-upload
              class="student-card-uploader"
              :action="$baseUrl + '/files/upload'"
              :show-file-list="false"
              :on-success="handleStudentCardSuccess"
            >
              <img v-if="user.studentCardPhoto" :src="user.studentCardPhoto" class="student-card-image" />
              <div v-else class="upload-placeholder">
                <i class="el-icon-plus student-card-uploader-icon"></i>
                <div class="upload-hint">点击上传学生证照片</div>
              </div>
            </el-upload>
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
  name: "StudentPerson",
  data() {
    return {
      user: JSON.parse(localStorage.getItem('labuser') || '{}'),
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
      majors: [] // 当前选中学院对应的专业列表
    }
  },
  computed: {
    colleges() {
      return Object.keys(this.collegeToMajors)
    }
  },
  created() {
    // 如果已有学院信息，初始化对应的专业列表
    if (this.user.college) {
      this.majors = this.collegeToMajors[this.user.college] || []
    }
  },
  methods: {
    handleCollegeChange(value) {
      // 当选择学院时，更新专业列表
      this.majors = this.collegeToMajors[value] || []
      // 清空已选专业
      this.user.major = ''
    },
    update() {
      // 保存当前的用户信息到数据库
      this.$request.put('/student/update', this.user).then(res => {
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
    handleStudentCardSuccess(response, file, fileList) {
      // 设置学生证照片链接
      this.$set(this.user, 'studentCardPhoto', response.data)
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
  background-color: #409EFF;
  color: white;
  padding: 20px 0;
  text-align: center;
  border-radius: 16px;
  margin-bottom: 20px;
  background-image: linear-gradient(120deg, #4facfe 0%, #00f2fe 100%);
}

.card-header h2 {
  margin: 0;
  font-weight: 600;
  font-size: 24px;
  letter-spacing: 1px;
}

.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px 0 30px;
  position: relative;
}

.avatar-uploader {
  display: inline-block;
  position: relative;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 3px solid #fff;
}

.avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
  border-radius: 50%;
  background-color: #f5f7fa;
  border: 1px dashed #d9d9d9;
  transition: all 0.3s ease;
}

.avatar-uploader-icon:hover {
  border-color: #409EFF;
  color: #409EFF;
  background-color: rgba(64, 158, 255, 0.05);
}

.avatar-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.avatar-uploader:hover .avatar-hint {
  opacity: 1;
}

.person-card :deep(.el-form) {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 20px 0;
}

.form-section {
  width: 100%;
  padding: 0 40px;
  margin-bottom: 25px;
  position: relative;
  background-color: #fafafa;
  border-radius: 12px;
  padding-top: 15px;
  padding-bottom: 15px;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.02);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #409EFF;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 50px;
  height: 3px;
  background-image: linear-gradient(120deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 3px;
}

:deep(.el-form-item) {
  width: 100%;
  margin-bottom: 22px;
}

.student-card-uploader .el-upload {
  border: 2px dashed #d9d9d9;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  background-color: #f5f7fa;
  transition: all 0.3s ease;
  width: 200px;
  height: 120px;
}

.student-card-uploader .el-upload:hover {
  border-color: #409EFF;
  background-color: rgba(64, 158, 255, 0.05);
  transform: scale(1.02);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.upload-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.student-card-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  transition: all 0.3s ease;
}

.student-card-image {
  width: 200px;
  height: 120px;
  display: block;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.student-card-image:hover {
  transform: scale(1.03);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.button-container {
  display: flex;
  justify-content: center;
  width: 100%;
  margin: 30px 0 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.button-container .el-button {
  padding: 12px 30px;
  font-size: 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
  background-image: linear-gradient(120deg, #4facfe 0%, #00f2fe 100%);
  border: none;
  box-shadow: 0 4px 10px rgba(79, 172, 254, 0.3);
}

.button-container .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(79, 172, 254, 0.4);
}

:deep(.el-input__inner), :deep(.el-select .el-input__inner) {
  border-radius: 8px;
  padding: 0 15px;
  height: 40px;
  transition: all 0.3s ease;
  border: 1px solid #dcdfe6;
}

:deep(.el-input__inner:focus), :deep(.el-select .el-input__inner:focus) {
  border-color: #409EFF;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}
</style>
