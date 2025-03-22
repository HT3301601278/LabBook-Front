<template>
  <div class="admin-person-container">
    <el-card class="person-card">
      <el-form :model="user" label-width="100px">
        <div style="margin: 15px; text-align: center">
          <el-upload
              class="avatar-uploader"
              :action="$baseUrl + '/files/upload'"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
          >
            <img v-if="user.avatar" :src="user.avatar" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </div>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="user.username" placeholder="用户名" disabled></el-input>
        </el-form-item>
        <el-form-item label="学号" prop="studentNumber">
          <el-input v-model="user.studentNumber" placeholder="请输入学号"></el-input>
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="user.name" placeholder="姓名"></el-input>
        </el-form-item>
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
        <el-form-item label="电话" prop="phone">
          <el-input v-model="user.phone" placeholder="电话"></el-input>
        </el-form-item>
        <el-form-item label="学生证照片" prop="studentCardPhoto">
          <el-upload
            class="student-card-uploader"
            :action="$baseUrl + '/files/upload'"
            :show-file-list="false"
            :on-success="handleStudentCardSuccess"
          >
            <img v-if="user.studentCardPhoto" :src="user.studentCardPhoto" class="student-card-image" />
            <i v-else class="el-icon-plus student-card-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <div style="text-align: center; margin-bottom: 20px">
          <el-button type="primary" @click="update">保 存</el-button>
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
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.person-card {
  width: 730px;
}

.person-card :deep(.el-form) {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

:deep(.el-form-item) {
  width: 100%;
  padding: 0 20px;
}

.button-container {
  display: flex;
  justify-content: center;
  width: 100%;
  margin: 20px 0;
}

:deep(.el-form-item__label) {
  font-weight: bold;
}
:deep(.el-upload) {
  border-radius: 50%;
}
:deep(.avatar-uploader .el-upload) {
  border: 1px dashed #d9d9d9;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  border-radius: 50%;
}
:deep(.avatar-uploader .el-upload:hover) {
  border-color: #409EFF;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  line-height: 120px;
  text-align: center;
  border-radius: 50%;
}
.avatar {
  width: 120px;
  height: 120px;
  display: block;
  border-radius: 50%;
}
.student-card-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.student-card-uploader .el-upload:hover {
  border-color: #409EFF;
}
.student-card-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 200px;
  height: 120px;
  line-height: 120px;
  text-align: center;
}
.student-card-image {
  width: 200px;
  height: 120px;
  display: block;
}
</style>
