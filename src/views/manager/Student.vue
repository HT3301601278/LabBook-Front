<template>
  <div>
    <div class="search">
      <el-input placeholder="请输入账号查询" style="width: 200px" v-model="username"></el-input>
      <el-input placeholder="请输入姓名查询" style="width: 200px; margin-left: 5px" v-model="name"></el-input>
      <el-select v-model="status" placeholder="请选择状态" style="width: 150px; margin-left: 5px">
        <el-option label="全部" value=""></el-option>
        <el-option label="待审核" value="0"></el-option>
        <el-option label="已通过" value="1"></el-option>
        <el-option label="已拒绝" value="2"></el-option>
      </el-select>
      <el-button type="info" plain style="margin-left: 10px" @click="load(1)">查询</el-button>
      <el-button type="warning" plain style="margin-left: 10px" @click="reset">重置</el-button>
    </div>

    <div class="operation">
      <el-button type="primary" plain @click="handleAdd">新增</el-button>
      <el-button type="danger" plain @click="delBatch">批量删除</el-button>
    </div>

    <div class="table">
      <el-table :data="tableData" strip @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center"></el-table-column>
        <el-table-column prop="id" label="序号" width="70" align="center" sortable></el-table-column>
        <el-table-column label="头像">
          <template v-slot="scope">
            <div style="display: flex; align-items: center">
              <el-image style="width: 40px; height: 40px; border-radius: 50%" v-if="scope.row.avatar"
                        :src="scope.row.avatar" :preview-src-list="[scope.row.avatar]"></el-image>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="账号"></el-table-column>
        <el-table-column prop="name" label="姓名"></el-table-column>
        <el-table-column prop="studentNumber" label="学号"></el-table-column>
        <el-table-column prop="college" label="学院"></el-table-column>
        <el-table-column prop="major" label="专业"></el-table-column>
        <el-table-column prop="phone" label="电话"></el-table-column>
        <el-table-column label="学生证照片">
          <template v-slot="scope">
            <div style="display: flex; align-items: center">
              <el-image style="width: 40px; height: 40px;" v-if="scope.row.studentCardPhoto"
                        :src="scope.row.studentCardPhoto" :preview-src-list="[scope.row.studentCardPhoto]"></el-image>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template v-slot="scope">
            <el-tag :type="getStatusType(scope.row.status)">{{ getStatusText(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="320">
          <template v-slot="scope">
            <template v-if="scope.row.status === 0">
              <el-button size="mini" type="success" plain @click="handleAudit(scope.row.id, '1')">
                <i class="el-icon-check"></i> 通过审核
              </el-button>
              <el-button size="mini" type="danger" plain @click="handleAudit(scope.row.id, '2')">
                <i class="el-icon-close"></i> 拒绝审核
              </el-button>
            </template>
            <template v-else-if="scope.row.status === 2">
              <el-tooltip content="查看拒绝原因" placement="top" effect="light">
                <el-button size="mini" type="warning" plain @click="showRejectReason(scope.row)">
                  <i class="el-icon-warning"></i> 查看原因
                </el-button>
              </el-tooltip>
            </template>
            <el-button size="mini" type="primary" plain @click="handleEdit(scope.row)">
              <i class="el-icon-edit"></i> 编辑
            </el-button>
            <el-button size="mini" type="danger" plain @click="del(scope.row.id)">
              <i class="el-icon-delete"></i> 删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
            background
            @current-change="handleCurrentChange"
            @size-change="handleSizeChange"
            :current-page="pageNum"
            :page-sizes="[10, 30, 50]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next"
            :total="total">
        </el-pagination>
      </div>
    </div>


    <el-dialog title="管理员" :visible.sync="fromVisible" width="40%" :close-on-click-modal="false" :append-to-body="true" destroy-on-close>
      <el-form :model="form" label-width="100px" style="padding-right: 50px" :rules="rules" ref="formRef">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="用户名"></el-input>
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="姓名"></el-input>
        </el-form-item>
        <el-form-item label="学号" prop="studentNumber">
          <el-input v-model="form.studentNumber" placeholder="学号"></el-input>
        </el-form-item>
        <el-form-item label="学院" prop="college">
          <el-select v-model="form.college" placeholder="请选择学院" @change="handleCollegeChange" style="width: 100%">
            <el-option v-for="item in colleges" :key="item" :label="item" :value="item"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="专业" prop="major">
          <el-select v-model="form.major" placeholder="请选择专业" style="width: 100%">
            <el-option v-for="item in majors" :key="item" :label="item" :value="item"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone" placeholder="电话"></el-input>
        </el-form-item>
        <el-form-item label="头像">
          <el-upload
              class="avatar-uploader"
              :action="$baseUrl + '/files/upload'"
              :headers="{ token: user.token }"
              list-type="picture"
              :on-success="handleAvatarSuccess"
          >
            <el-button type="primary">上传头像</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="学生证照片">
          <el-upload
              class="avatar-uploader"
              :action="$baseUrl + '/files/upload'"
              :headers="{ token: user.token }"
              list-type="picture"
              :on-success="handleStudentCardPhotoSuccess"
          >
            <el-button type="primary">上传学生证照片</el-button>
          </el-upload>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="fromVisible = false">取 消</el-button>
        <el-button type="primary" @click="save">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 审核不通过对话框 -->
    <el-dialog title="审核不通过原因" :visible.sync="rejectDialogVisible" width="30%" :close-on-click-modal="false" :append-to-body="true">
      <el-form :model="rejectForm" ref="rejectFormRef" :rules="rejectRules">
        <el-form-item label="审核意见" prop="rejectReason" label-width="80px">
          <el-input
            type="textarea"
            :rows="4"
            placeholder="请输入审核不通过的原因"
            v-model="rejectForm.rejectReason">
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="rejectDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitReject">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 查看拒绝原因对话框 -->
    <el-dialog title="审核拒绝原因" :visible.sync="rejectReasonVisible" width="30%" :append-to-body="true" center>
      <div class="reject-reason-content">
        <i class="el-icon-warning-outline warning-icon"></i>
        <div class="reject-reason-text">{{ currentRejectReason }}</div>
      </div>
    </el-dialog>

  </div>
</template>

<script>
export default {
  name: "Student",
  data() {
    // 验证手机号
    const validatePhone = (rule, value, callback) => {
      if (value && !/^1[3-9]\d{9}$/.test(value)) {
        callback(new Error('请输入正确的手机号'))
      } else {
        callback()
      }
    }
    return {
      tableData: [],  // 所有的数据
      pageNum: 1,   // 当前的页码
      pageSize: 10,  // 每页显示的个数
      total: 0,
      username: null,
      name: null,  // 添加姓名查询参数
      status: "", // 添加状态查询参数
      fromVisible: false,
      form: {},
      user: JSON.parse(localStorage.getItem('labuser') || '{}'),
      rules: {
        username: [
          {required: true, message: '请输入账号', trigger: 'blur'},
        ],
        name: [
          {required: true, message: '请输入姓名', trigger: 'blur'},
        ],
        studentNumber: [
          {required: true, message: '请输入学号', trigger: 'blur'},
          {pattern: /^\d{8,12}$/, message: '请输入正确的学号格式', trigger: 'blur'}
        ],
        college: [
          {required: true, message: '请选择学院', trigger: 'change'}
        ],
        major: [
          {required: true, message: '请选择专业', trigger: 'change'}
        ],
        phone: [
          {required: true, message: '请输入手机号', trigger: 'blur'},
          {validator: validatePhone, trigger: 'blur'}
        ]
      },
      ids: [],
      colleges: [],
      majors: [],
      // 学院和专业的映射关系
      collegeToMajors: {
        '信息工程学院': [
          '计算机科学与技术专业',
          '软件工程专业',
          '物联网工程专业',
          '网络工程专业',
          '数据科学与大数据技术专业',
          '人工智能专业'
        ],
        '机械工程学院': [
          '机械设计制造及其自动化专业',
          '机械电子工程专业',
          '工业设计专业',
          '智能制造工程专业'
        ],
        '电气工程学院': [
          '电气工程及其自动化专业',
          '自动化专业',
          '电子信息工程专业',
          '通信工程专业'
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
      rejectDialogVisible: false,
      rejectForm: {
        id: null,
        rejectReason: '',
        status: '2'
      },
      rejectRules: {
        rejectReason: [
          { required: true, message: '请输入审核不通过的原因', trigger: 'blur' },
          { min: 5, message: '审核意见至少5个字符', trigger: 'blur' }
        ]
      },
      rejectReasonVisible: false,
      currentRejectReason: '',
    }
  },
  created() {
    this.load(1)
    this.colleges = Object.keys(this.collegeToMajors)
  },
  methods: {
    handleAdd() {   // 新增数据
      this.form = {}  // 新增数据的时候清空数据
      this.fromVisible = true   // 打开弹窗
    },
    handleEdit(row) {   // 编辑数据
      this.form = JSON.parse(JSON.stringify(row))  // 给form对象赋值  注意要深拷贝数据
      this.fromVisible = true   // 打开弹窗
    },
    save() {   // 保存按钮触发的逻辑  它会触发新增或者更新
      this.$refs.formRef.validate((valid) => {
        if (valid) {
          this.$request({
            url: this.form.id ? '/student/update' : '/student/add',
            method: this.form.id ? 'PUT' : 'POST',
            data: this.form
          }).then(res => {
            if (res.code === '200') {  // 表示成功保存
              this.$message.success('保存成功')
              this.load(1)
              this.fromVisible = false
            } else {
              this.$message.error(res.msg)  // 弹出错误的信息
            }
          })
        }
      })
    },
    del(id) {   // 单个删除
      this.$confirm('您确定删除吗？', '确认删除', {type: "warning"}).then(response => {
        this.$request.delete('/student/delete/' + id).then(res => {
          if (res.code === '200') {   // 表示操作成功
            this.$message.success('操作成功')
            this.load(1)
          } else {
            this.$message.error(res.msg)  // 弹出错误的信息
          }
        })
      }).catch(() => {
      })
    },
    handleSelectionChange(rows) {   // 当前选中的所有的行数据
      this.ids = rows.map(v => v.id)
    },
    delBatch() {   // 批量删除
      if (!this.ids.length) {
        this.$message.warning('请选择数据')
        return
      }
      this.$confirm('您确定批量删除这些数据吗？', '确认删除', {type: "warning"}).then(response => {
        this.$request.delete('/student/delete/batch', {data: this.ids}).then(res => {
          if (res.code === '200') {   // 表示操作成功
            this.$message.success('操作成功')
            this.load(1)
          } else {
            this.$message.error(res.msg)  // 弹出错误的信息
          }
        })
      }).catch(() => {
      })
    },
    load(pageNum) {  // 分页查询
      if (pageNum) this.pageNum = pageNum
      this.$request.get('/student/selectPage', {
        params: {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          username: this.username,
          name: this.name,
          status: this.status || null
        }
      }).then(res => {
        this.tableData = res.data?.list
        this.total = res.data?.total
      })
    },
    reset() {
      this.username = null
      this.name = null
      this.status = ""
      this.load(1)
    },
    handleCurrentChange(pageNum) {
      this.load(pageNum)
    },
    handleSizeChange(pageSize) {
      this.pageSize = pageSize
      this.load(1)
    },
    handleAvatarSuccess(response, file, fileList) {
      // 把头像属性换成上传的图片的链接
      this.form.avatar = response.data
    },
    handleStudentCardPhotoSuccess(response, file, fileList) {
      // 把学生证照片属性换成上传的图片的链接
      this.form.studentCardPhoto = response.data
    },
    handleCollegeChange(value) {
      this.form.major = ''  // 清空专业选择
      this.majors = this.collegeToMajors[value] || []  // 更新专业列表
    },
    // 获取状态标签类型
    getStatusType(status) {
      const types = {
        0: 'warning',
        1: 'success',
        2: 'danger'
      }
      return types[status] || 'info'
    },
    // 获取状态文本
    getStatusText(status) {
      const texts = {
        0: '待审核',
        1: '已通过',
        2: '已拒绝'
      }
      return texts[status] || '未知'
    },
    // 处理审核操作
    handleAudit(id, status) {
      if (status === '2') {
        // 如果是拒绝，显示填写原因的对话框
        this.rejectForm.id = id
        this.rejectDialogVisible = true
      } else {
        // 如果是通过，直接确认
        const actionText = '通过'
        this.$confirm(`确定要${actionText}这个学生的注册申请吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.updateStudentStatus(id, status)
        }).catch(() => {})
      }
    },
    // 提交审核不通过
    submitReject() {
      this.$refs.rejectFormRef.validate((valid) => {
        if (valid) {
          this.updateStudentStatus(
            this.rejectForm.id,
            this.rejectForm.status,
            this.rejectForm.rejectReason
          )
          this.rejectDialogVisible = false
          this.rejectForm.rejectReason = ''
        }
      })
    },
    // 更新学生状态
    updateStudentStatus(id, status, rejectReason = '') {
      this.$request.put('/student/update', {
        id: id,
        status: status,
        reviewComment: rejectReason
      }).then(res => {
        if (res.code === '200') {
          this.$message.success('操作成功')
          this.load(this.pageNum)
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    // 显示拒绝原因
    showRejectReason(row) {
      this.currentRejectReason = row.reviewComment || '未提供拒绝原因'
      this.rejectReasonVisible = true
    },
  }
}
</script>

<style scoped>
.el-dialog__body {
  padding: 20px;
}

.reject-reason-content {
  display: flex;
  align-items: flex-start;
  padding: 20px;
}

.warning-icon {
  font-size: 24px;
  color: #E6A23C;
  margin-right: 15px;
  margin-top: 3px;
}

.reject-reason-text {
  flex: 1;
  color: #666;
  line-height: 1.6;
  background: #f8f8f8;
  padding: 15px;
  border-radius: 4px;
  font-size: 14px;
}
</style>
