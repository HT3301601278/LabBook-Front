<template>
  <div>
    <div class="search">
      <el-input placeholder="请输入检修人姓名" style="width: 200px" v-model="inspectorName"></el-input>
      <el-input placeholder="请输入检修内容" style="width: 200px; margin-left: 10px" v-model="content"></el-input>
      <el-input placeholder="请输入检修部门" style="width: 200px; margin-left: 10px" v-model="department"></el-input>
      <el-button type="info" plain style="margin-left: 10px" @click="load(1)">查询</el-button>
      <el-button type="warning" plain style="margin-left: 10px" @click="reset">重置</el-button>
    </div>

    <div class="table">
      <el-table :data="tableData" stripe  @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center"></el-table-column>
        <el-table-column prop="id" label="序号" width="80" align="center" sortable></el-table-column>
        <el-table-column prop="labName" label="实验室" min-width="10%" show-overflow-tooltip></el-table-column>
        <el-table-column prop="fixName" label="报修说明" min-width="25%" show-overflow-tooltip></el-table-column>
        <el-table-column prop="content" label="检修内容" min-width="25%" show-overflow-tooltip></el-table-column>
        <el-table-column prop="inspectorName" label="检修人" min-width="10%" show-overflow-tooltip></el-table-column>
        <el-table-column prop="department" label="检修部门" min-width="10%" show-overflow-tooltip></el-table-column>
        <el-table-column prop="phone" label="联系电话" min-width="10%" show-overflow-tooltip></el-table-column>
        <el-table-column prop="inspectionTime" label="检修时间" min-width="10%" show-overflow-tooltip></el-table-column>
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

  </div>
</template>

<script>
export default {
  name: "Check",
  data() {
    return {
      tableData: [],  // 所有的数据
      pageNum: 1,   // 当前的页码
      pageSize: 10,  // 每页显示的个数
      total: 0,
      inspectorName: null,  // 修改搜索条件字段名
      content: null,
      department: null,
      fromVisible: false,
      form: {},
      user: JSON.parse(localStorage.getItem('labuser') || '{}'),
      rules: {
        inspectorName: [
          {required: true, message: '请输入检修人姓名', trigger: 'blur'},
        ],
        content: [
          {required: true, message: '请输入检修内容', trigger: 'blur'},
        ],
        department: [
          {required: true, message: '请输入检修部门', trigger: 'blur'},
        ]
      },
      ids: []
    }
  },
  created() {
    this.load(1)
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
            url: this.form.id ? '/checks/update' : '/checks/add',
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
        this.$request.delete('/checks/delete/' + id).then(res => {
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
      this.ids = rows.map(v => v.id)   //  [1,2]
    },
    delBatch() {   // 批量删除
      if (!this.ids.length) {
        this.$message.warning('请选择数据')
        return
      }
      this.$confirm('您确定批量删除这些数据吗？', '确认删除', {type: "warning"}).then(response => {
        this.$request.delete('/checks/delete/batch', {data: this.ids}).then(res => {
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
      this.$request.get('/checks/selectPage', {
        params: {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          inspectorName: this.inspectorName,
          content: this.content,
          department: this.department
        }
      }).then(res => {
        this.tableData = res.data?.list
        this.total = res.data?.total
      })
    },
    reset() {
      this.inspectorName = null
      this.content = null
      this.department = null
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
.search {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}
</style>
