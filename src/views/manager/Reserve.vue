<template>
  <div>
    <div class="search">
      <el-select v-model="status" placeholder="请选择预约状态" style="width: 200px">
        <el-option label="待审核" value="待审核"></el-option>
        <el-option label="已通过" value="已通过"></el-option>
        <el-option label="已拒绝" value="已拒绝"></el-option>
      </el-select>
      <el-select v-model="completionStatus" placeholder="请选择完成状态" style="width: 200px; margin-left: 10px">
        <el-option label="未开始" value="未开始"></el-option>
        <el-option label="进行中" value="进行中"></el-option>
        <el-option label="已完成" value="已完成"></el-option>
      </el-select>
      <el-button type="info" plain style="margin-left: 10px" @click="load(1)">查询</el-button>
      <el-button type="warning" plain style="margin-left: 10px" @click="reset">重置</el-button>
    </div>

    <div class="table">
      <el-table :data="tableData" stripe>
        <el-table-column prop="id" label="序号" width="80" align="center" sortable></el-table-column>
        <el-table-column prop="labName" label="实验室" min-width="15%" show-overflow-tooltip></el-table-column>
        <el-table-column prop="labadminName" label="实验室管理员" min-width="15%" show-overflow-tooltip></el-table-column>
        <el-table-column prop="studentName" label="预约人" min-width="10%" show-overflow-tooltip></el-table-column>
        <el-table-column prop="createTime" label="预约时间" min-width="15%"></el-table-column>
        <el-table-column label="使用时间段" min-width="20%">
          <template v-slot="scope">
            {{scope.row.reserveStartTime}} ~ {{scope.row.reserveEndTime}}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="预约状态" min-width="10%">
          <template v-slot="scope">
            <el-tag :type="getStatusType(scope.row.status)" effect="dark">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="completionStatus" label="完成状态" min-width="10%">
          <template v-slot="scope">
            <el-tag :type="getCompletionStatusType(scope.row.completionStatus)" effect="plain">{{ scope.row.completionStatus }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" align="center">
          <template v-slot="scope">
            <el-button plain type="warning" size="mini" @click="del(scope.row.id)" v-if="user.role === 'STUDENT' && scope.row.status === '待审核'">取消预约</el-button>
            <el-button plain type="success" size="mini" @click="handleAudit(scope.row, '已通过')" v-if="user.role !== 'STUDENT' && scope.row.status === '待审核'">通过</el-button>
            <el-button plain type="danger" size="mini" @click="handleAudit(scope.row, '已拒绝')" v-if="user.role !== 'STUDENT' && scope.row.status === '待审核'">不通过</el-button>
            <el-button plain type="warning" size="mini" @click="handleComplete(scope.row)" v-if="(user.role !== 'STUDENT' || (user.role === 'STUDENT' && scope.row.studentId === user.id)) && scope.row.completionStatus === '进行中'">结束使用</el-button>
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

    <el-dialog title="报修反馈信息" :visible.sync="fromVisible" width="40%" :close-on-click-modal="false" destroy-on-close :append-to-body="true">
      <el-form label-width="100px" style="padding-right: 50px" :model="form" :rules="rules" ref="formRef">
        <el-form-item prop="name" label="报修说明">
          <el-input type="textarea" :rows="5" v-model="form.name" autocomplete="off"></el-input>
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
  name: "Reserve",
  data() {
    return {
      tableData: [],  // 所有的数据
      pageNum: 1,   // 当前的页码
      pageSize: 10,  // 每页显示的个数
      total: 0,
      status: null,
      completionStatus: null,
      fromVisible: false,
      form: {},
      user: JSON.parse(localStorage.getItem('labuser') || '{}'),
      rules: {
        name: [
          {required: true, message: '请填写报修说明', trigger: 'blur'},
        ]
      },
      ids: []
    }
  },
  created() {
    this.load(1)
  },
  methods: {
    getStatusType(status) {
      switch (status) {
        case '待审核': return 'warning'
        case '已通过': return 'success'
        case '已拒绝': return 'danger'
        default: return 'info'
      }
    },
    getCompletionStatusType(status) {
      switch (status) {
        case '未开始': return 'info'
        case '进行中': return 'warning'
        case '已完成': return 'success'
        default: return 'info'
      }
    },
    handleAudit(row, status) {
      const actionText = status === '已通过' ? '通过' : '拒绝'
      this.$confirm(`确认${actionText}此预约申请？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$request.put('/reserve/update', {
          id: row.id,
          status: status
        }).then(res => {
          if (res.code === '200') {
            this.$message.success('操作成功')
            this.load(this.pageNum)
          } else {
            this.$message.error(res.msg)
          }
        })
      }).catch(() => {})
    },
    handleComplete(row) {
      this.$confirm('确认结束此预约的使用？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.changeCompletionStatus(row, '已完成')
      }).catch(() => {})
    },
    del(id) {
      this.$confirm('确认取消此预约？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$request.delete('/reserve/delete/' + id).then(res => {
          if (res.code === '200') {
            this.$message.success('操作成功')
            this.load(1)
          } else {
            this.$message.error(res.msg)
          }
        })
      }).catch(() => {})
    },
    load(pageNum) {
      if (pageNum) this.pageNum = pageNum
      this.$request.get('/reserve/selectPage', {
        params: {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          status: this.status,
          completionStatus: this.completionStatus
        }
      }).then(res => {
        this.tableData = res.data?.list
        this.total = res.data?.total
      })
    },
    reset() {
      this.status = null
      this.completionStatus = null
      this.load(1)
    },
    handleCurrentChange(pageNum) {
      this.load(pageNum)
    },
    handleSizeChange(pageSize) {
      this.pageSize = pageSize
      this.load(1)
    },
    initDialog(row) {
      this.form = JSON.parse(JSON.stringify(row))
      this.fromVisible = true
    },
    submit() {
      // 提交报修信息
      let data = {
        name: this.form.name,
        studentId: this.user.id,
        labId: this.form.labId,
        labadminId: this.form.labadminId,
        status: '待处理'
      }
      this.$request.post('/fix/add', data).then(res => {
        if (res.code === '200') {
          this.$message.success('操作成功')
          this.fromVisible = false
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    changeCompletionStatus(row, status) {
      this.$request.put('/reserve/update', {
        id: row.id,
        completionStatus: status
      }).then(res => {
        if (res.code === '200') {
          this.$message.success('操作成功')
          this.load(this.pageNum)
        } else {
          this.$message.error(res.msg)
        }
      })
    },
  }
}
</script>

<style scoped>
.el-tag {
  margin-right: 5px;
}
.el-table .cell {
  text-align: center;
}
</style>
