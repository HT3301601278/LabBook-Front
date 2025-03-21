<template>
  <div>
    <div class="search">
      <el-input placeholder="请输入实验室编号" style="width: 200px" v-model="name"></el-input>
      <el-button type="info" plain style="margin-left: 10px" @click="load(1)">查询</el-button>
      <el-button type="warning" plain style="margin-left: 10px" @click="reset">重置</el-button>
    </div>

    <div class="operation">
      <el-button type="primary" plain @click="handleAdd">新增</el-button>
      <el-button type="danger" plain @click="delBatch">批量删除</el-button>
    </div>

    <div class="table">
      <el-table :data="tableData" stripe  @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center"></el-table-column>
        <el-table-column prop="id" label="序号" width="80" align="center" sortable></el-table-column>
        <el-table-column prop="labNumber" label="实验室编号" show-overflow-tooltip></el-table-column>
        <el-table-column prop="labName" label="实验室名称" show-overflow-tooltip></el-table-column>
        <el-table-column prop="startTime" label="开始时间" show-overflow-tooltip></el-table-column>
        <el-table-column prop="endTime" label="结束时间" show-overflow-tooltip></el-table-column>
        <el-table-column prop="maxReservationHours" label="最大预约时长(小时)" width="140" align="center"></el-table-column>
        <el-table-column prop="usageStatus" label="使用状态" show-overflow-tooltip></el-table-column>
        <el-table-column prop="typeName" label="所属分类" show-overflow-tooltip></el-table-column>
        <el-table-column prop="labadminName" label="实验室管理员"></el-table-column>

        <el-table-column label="操作" width="180" align="center">
          <template v-slot="scope">
            <el-button plain type="primary" @click="handleEdit(scope.row)" size="mini">编辑</el-button>
            <el-button plain type="danger" size="mini" @click=del(scope.row.id)>删除</el-button>
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


    <el-dialog title="信息" :visible.sync="fromVisible" width="40%" :close-on-click-modal="false" :append-to-body="true" destroy-on-close>
      <el-form label-width="100px" style="padding-right: 50px" :model="form" :rules="rules" ref="formRef">
        <el-form-item prop="labNumber" label="实验室编号">
          <el-input v-model="form.labNumber" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item prop="labName" label="实验室名称">
          <el-input v-model="form.labName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item prop="startTime" label="开始时间">
          <el-date-picker style="width: 100%"
              v-model="form.startTime"
              type="datetime"
              value-format="yyyy-MM-dd HH:mm"
              placeholder="请选择开始时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item prop="endTime" label="结束时间">
          <el-date-picker style="width: 100%"
              v-model="form.endTime"
              type="datetime"
              value-format="yyyy-MM-dd HH:mm"
              placeholder="请选择结束时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item prop="maxReservationHours" label="最大预约时长">
          <el-input-number v-model="form.maxReservationHours" :min="1" :max="24"></el-input-number>
        </el-form-item>
        <el-form-item prop="typeId" label="实验室分类">
          <el-select v-model="form.typeId" placeholder="请选择实验室分类" style="width: 100%">
            <el-option v-for="item in typeData" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="labadminId" label="实验室管理员">
          <el-select v-model="form.labadminId" placeholder="请选择实验室管理员" style="width: 100%">
            <el-option v-for="item in labadminData" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="使用手册">
          <el-upload
              class="upload-demo"
              :action="$baseUrl + '/files/upload'"
              :on-success="handleManualSuccess"
              :file-list="manualFileList">
            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="3D模型">
          <el-upload
              class="upload-demo"
              :action="$baseUrl + '/files/upload'"
              :on-success="handleModelSuccess"
              :file-list="modelFileList">
            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="fromVisible = false">取 消</el-button>
        <el-button type="primary" @click="save">确 定</el-button>
      </div>
    </el-dialog>


  </div>
</template>

<script>
export default {
  name: "Lab",
  data() {
    return {
      tableData: [],  // 所有的数据
      pageNum: 1,   // 当前的页码
      pageSize: 10,  // 每页显示的个数
      total: 0,
      name: null,
      fromVisible: false,
      form: {},
      user: JSON.parse(localStorage.getItem('labuser') || '{}'),
      rules: {
        labNumber: [
          {required: true, message: '请输入实验室编号', trigger: 'blur'},
        ],
        labName: [
          {required: true, message: '请输入实验室名称', trigger: 'blur'},
        ],
        startTime: [
          {required: true, message: '请选择开始时间', trigger: 'blur'},
        ],
        endTime: [
          {required: true, message: '请选择结束时间', trigger: 'blur'},
        ],
        typeId: [
          {required: true, message: '请选择实验室分类', trigger: 'blur'},
        ],
        labadminId: [
          {required: true, message: '请选择实验室管理员', trigger: 'blur'},
        ],
        maxReservationHours: [
          {required: true, message: '请设置最大预约时长', trigger: 'blur'},
        ],
      },
      ids: [],
      typeData: [],
      manualFileList: [],
      modelFileList: [],
      labadminData: []
    }
  },
  created() {
    this.load(1)
    this.loadType()
    this.loadLabadmin()
  },
  methods: {
    loadType() {
      this.$request.get('/type/selectAll').then(res => {
        if (res.code === '200') {
          this.typeData = res.data
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    loadLabadmin() {
      this.$request.get('/labadmin/selectAll').then(res => {
        if (res.code === '200') {
          this.labadminData = res.data
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    handleAdd() {   // 新增数据
      this.form = {  // 新增数据的时候清空数据并设置默认值
        maxReservationHours: 2
      }
      this.manualFileList = []
      this.modelFileList = []
      this.fromVisible = true   // 打开弹窗
    },
    handleEdit(row) {   // 编辑数据
      this.form = JSON.parse(JSON.stringify(row))  // 给form对象赋值  注意要深拷贝数据

      // 处理文件列表显示
      this.manualFileList = []
      this.modelFileList = []
      if (this.form.manual) {
        this.manualFileList = [{
          name: '使用手册',
          url: this.form.manual
        }]
      }
      if (this.form.modelFile) {
        this.modelFileList = [{
          name: '3D模型文件',
          url: this.form.modelFile
        }]
      }

      this.fromVisible = true   // 打开弹窗
    },
    handleManualSuccess(response) {
      // 把手册文件链接保存到表单中
      this.form.manual = response.data
    },
    handleModelSuccess(response) {
      // 把3D模型文件链接保存到表单中
      this.form.modelFile = response.data
    },
    save() {   // 保存按钮触发的逻辑  它会触发新增或者更新
      this.$refs.formRef.validate((valid) => {
        if (valid) {
          this.$request({
            url: this.form.id ? '/lab/update' : '/lab/add',
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
        this.$request.delete('/lab/delete/' + id).then(res => {
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
        this.$request.delete('/lab/delete/batch', {data: this.ids}).then(res => {
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
      this.$request.get('/lab/selectPage', {
        params: {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          name: this.name,
        }
      }).then(res => {
        this.tableData = res.data?.list
        this.total = res.data?.total
      })
    },
    reset() {
      this.name = null
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

</style>
