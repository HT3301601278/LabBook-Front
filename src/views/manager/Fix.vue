<template>
  <div>
    <div class="search">
      <el-input v-if="user.role !== 'STUDENT'" placeholder="请输入报修人" style="width: 200px; margin-left: 10px" v-model="studentName"></el-input>
      <el-input placeholder="请输入报修说明" style="width: 200px" v-model="description"></el-input>
      <el-input placeholder="请输入实验室" style="width: 200px; margin-left: 10px" v-model="labName"></el-input>
      <el-select v-model="status" placeholder="请选择处理状态" style="width: 200px; margin-left: 10px">
        <el-option label="待处理" value="待处理"></el-option>
        <el-option label="处理中" value="处理中"></el-option>
        <el-option label="已完成" value="已完成"></el-option>
      </el-select>
      <el-button type="info" plain style="margin-left: 10px" @click="load(1)">查询</el-button>
      <el-button type="warning" plain style="margin-left: 10px" @click="reset">重置</el-button>
    </div>

    <div class="table">
      <el-table :data="tableData" stripe>
        <el-table-column prop="id" label="序号" width="80" align="center" sortable></el-table-column>
        <el-table-column prop="studentName" label="报修人" min-width="10%" show-overflow-tooltip></el-table-column>
        <el-table-column prop="description" label="报修说明" min-width="20%" show-overflow-tooltip></el-table-column>
        <el-table-column prop="createTime" label="报修时间" min-width="15%" show-overflow-tooltip></el-table-column>
        <el-table-column prop="labName" label="实验室" min-width="15%" show-overflow-tooltip>
          <template v-slot="scope">
            {{scope.row.typeName}} - {{scope.row.labName}}
          </template>
        </el-table-column>
        <el-table-column prop="labadminName" label="实验室管理员" min-width="12%" show-overflow-tooltip></el-table-column>
        <el-table-column prop="status" label="处理状态" min-width="8%" show-overflow-tooltip>
          <template v-slot="scope">
            <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="fixTime" label="处理时间" min-width="15%" show-overflow-tooltip></el-table-column>

        <el-table-column label="操作" width="180" align="center">
          <template v-slot="scope">
            <el-button plain type="primary" @click="handleEdit(scope.row)" size="mini" v-if="(user.role === 'ADMIN' || user.role === 'LABADMIN') && scope.row.status === '待处理'">处理</el-button>
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
    <el-dialog title="填写检修信息" :visible.sync="fromVisible" width="40%" :close-on-click-modal="false" :append-to-body="true" destroy-on-close center>
      <el-form label-width="100px" style="padding-right: 50px" :model="form" :rules="rules" ref="formRef">
        <el-form-item prop="inspectorName" label="检修人">
          <el-input v-model="form.inspectorName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item prop="phone" label="联系电话">
          <el-input v-model="form.phone" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item prop="department" label="检修部门">
          <el-input v-model="form.department" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item prop="content" label="检修内容">
          <el-input type="textarea" :rows="3" v-model="form.content" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item prop="description" label="处理说明">
          <el-input type="textarea" :rows="3" v-model="form.description" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item prop="fixTime" label="处理时间">
          <el-date-picker style="width: 100%"
              v-model="form.fixTime"
              type="datetime"
              value-format="yyyy-MM-dd HH:mm"
              placeholder="选择处理时间">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="fromVisible = false">取 消</el-button>
        <el-button type="primary" @click="submit">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Fix",
  data() {
    return {
      tableData: [],  // 所有的数据
      pageNum: 1,   // 当前的页码
      pageSize: 10,  // 每页显示的个数
      total: 0,
      description: null,
      studentName: null,
      labName: null,
      status: null,
      fromVisible: false,
      form: {},
      user: JSON.parse(localStorage.getItem('labuser') || '{}'),
      rules: {
        inspectorName: [
          {required: true, message: '请输入检修人姓名', trigger: 'blur'},
        ],
        phone: [
          {required: true, message: '请输入联系电话', trigger: 'blur'},
        ],
        content: [
          {required: true, message: '请输入检修内容', trigger: 'blur'},
        ],
        department: [
          {required: true, message: '请输入检修部门', trigger: 'blur'},
        ],
        description: [
          {required: true, message: '请输入处理说明', trigger: 'blur'},
        ],
        fixTime: [
          {required: true, message: '请选择处理时间', trigger: 'blur'},
        ],
      },
    }
  },
  created() {
    this.load(1)
    // 如果URL中有id参数，自动打开处理对话框
    const id = this.$route.query.id
    if (id) {
      this.$request.get('/fix/searchPage', {
        params: {
          pageNum: 1,
          pageSize: 1000,
          id: id
        }
      }).then(res => {
        if (res.code === '200' && res.data && res.data.list && res.data.list.length > 0) {
          const fixData = res.data.list[0]
          this.handleEdit(fixData)
        }
      })
    }
  },
  methods: {
    getStatusType(status) {
      switch (status) {
        case '待处理': return 'warning'
        case '处理中': return 'primary'
        case '已完成': return 'success'
        default: return 'info'
      }
    },
    submit() {
      this.$refs.formRef.validate((valid) => {
        if (valid) {
          // 先添加检修记录
          const checksData = {
            labId: this.form.labId,
            fixId: this.form.fixId,
            inspectorName: this.form.inspectorName,
            phone: this.form.phone,
            content: this.form.content,
            department: this.form.department,
            inspectionTime: this.form.fixTime
          }

          this.$request.post('/checks/add', checksData).then(res => {
            if (res.code === '200') {
              // 更新报修记录状态
              const fixData = {
                id: this.form.fixId,
                status: '已完成',
                fixTime: this.form.fixTime,
                labadminId: this.user.id,
                description: this.form.description
              }

              this.$request.put('/fix/update', fixData).then(res => {
                if (res.code === '200') {
                  this.$message.success('操作成功')
                  this.fromVisible = false
                  this.load(1)
                } else {
                  this.$message.error(res.msg)
                }
              })
            } else {
              this.$message.error(res.msg)
            }
          })
        }
      })
    },
    handleEdit(row) {
      this.form = {
        labId: row.labId,
        fixId: row.id,
        inspectorName: '',
        phone: '',
        content: '',
        department: '',
        description: '',
        fixTime: null
      }
      this.fromVisible = true
    },
    load(pageNum) {  // 分页查询
      if (pageNum) this.pageNum = pageNum
      this.$request.get('/fix/searchPage', {
        params: {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          description: this.description,
          studentName: this.studentName,
          labName: this.labName,
          status: this.status
        }
      }).then(res => {
        this.tableData = res.data?.list
        this.total = res.data?.total
      })
    },
    reset() {
      this.description = null
      this.studentName = null
      this.labName = null
      this.status = null
      this.load(1)
    },
    handleCurrentChange(pageNum) {
      this.load(pageNum)
    },
    handleSizeChange(pageSize) {
      this.pageSize = pageSize
      this.load(1)
    },
  }
}
</script>

<style scoped>
.pagination {
  margin-top: 20px;
  text-align: right;
}

.el-tag {
  margin-right: 5px;
}

/* 对话框样式 */
:deep(.el-dialog) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-dialog__header) {
  background-color: #409EFF;
  padding: 20px;
  margin-right: 0;
}

:deep(.el-dialog__title) {
  color: #fff;
  font-size: 18px;
  font-weight: 500;
}

:deep(.el-dialog__headerbtn .el-dialog__close) {
  color: #fff;
}

:deep(.el-dialog__body) {
  padding: 30px 20px;
}

:deep(.el-dialog__footer) {
  padding: 15px 20px;
  border-top: 1px solid #eee;
}

/* 表单样式优化 */
:deep(.el-textarea__inner) {
  min-height: 80px;
}

:deep(.el-form-item) {
  margin-bottom: 22px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-input), :deep(.el-textarea) {
  width: 100%;
}
</style>
