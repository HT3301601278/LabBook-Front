<template>
  <div>
    <div class="search">
      <el-input placeholder="请输入实验室名称" style="width: 250px" v-model="name"></el-input>
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
        <el-table-column prop="labName" label="实验室名称" show-overflow-tooltip></el-table-column>
        <el-table-column prop="labNumber" label="实验室编号" show-overflow-tooltip></el-table-column>
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


    <el-dialog :title="form.id ? '编辑实验室信息' : '新增实验室信息'" :visible.sync="fromVisible" width="50%" :close-on-click-modal="false" :append-to-body="true" destroy-on-close center class="lab-form-dialog">
      <el-form label-width="120px" :model="form" :rules="rules" ref="formRef" class="lab-form">
        <div class="form-section">
          <div class="section-title">基本信息</div>
          <el-form-item prop="labNumber" label="实验室编号">
            <el-input v-model="form.labNumber" placeholder="请输入实验室编号"></el-input>
          </el-form-item>
          <el-form-item prop="labName" label="实验室名称">
            <el-input v-model="form.labName" placeholder="请输入实验室名称"></el-input>
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
        </div>

        <div class="form-section">
          <div class="section-title">时间设置</div>
          <el-form-item prop="startTime" label="开放开始时间">
            <el-date-picker
                v-model="form.startTime"
                type="datetime"
                value-format="yyyy-MM-dd HH:mm"
                placeholder="请选择开放开始时间"
                style="width: 100%">
            </el-date-picker>
          </el-form-item>
          <el-form-item prop="endTime" label="开放结束时间">
            <el-date-picker
                v-model="form.endTime"
                type="datetime"
                value-format="yyyy-MM-dd HH:mm"
                placeholder="请选择开放结束时间"
                style="width: 100%">
            </el-date-picker>
          </el-form-item>
          <el-form-item prop="maxReservationHours" label="最大预约时长">
            <el-input-number 
                v-model="form.maxReservationHours" 
                :min="1" 
                :max="24"
                controls-position="right"
                style="width: 100%">
              <template slot="append">小时</template>
            </el-input-number>
          </el-form-item>
        </div>

        <div class="form-section">
          <div class="section-title">附件管理</div>
          <el-form-item label="使用手册">
            <div class="upload-container">
              <div class="upload-wrapper">
                <el-upload
                    class="upload-demo"
                    :action="$baseUrl + '/files/upload'"
                    :on-success="handleManualSuccess"
                    :file-list="manualFileList"
                    :limit="1">
                  <el-button size="small" type="primary" icon="el-icon-upload">上传手册</el-button>
                  <div slot="tip" class="el-upload__tip">支持 PDF 格式文件</div>
                </el-upload>
              </div>
              <div v-if="form.manual" class="file-info">
                <div class="file-name">
                  <i class="el-icon-document"></i>
                  <span>使用手册.pdf</span>
                </div>
                <el-button type="primary" size="small" plain @click="openManual(form.manual)" class="view-button">
                  <i class="el-icon-view"></i> 查看
                </el-button>
              </div>
            </div>
          </el-form-item>
          <el-form-item label="3D模型">
            <div class="upload-container">
              <div class="upload-wrapper">
                <el-upload
                    class="upload-demo"
                    :action="$baseUrl + '/files/upload'"
                    :on-success="handleModelSuccess"
                    :file-list="modelFileList"
                    :limit="1">
                  <el-button size="small" type="primary" icon="el-icon-upload">上传模型</el-button>
                  <div slot="tip" class="el-upload__tip">支持 3D 模型文件</div>
                </el-upload>
              </div>
              <div v-if="form.modelFile" class="file-info">
                <div class="file-name">
                  <i class="el-icon-document"></i>
                  <span>3D模型文件</span>
                </div>
                <el-button type="primary" size="small" plain @click="openModel(form.modelFile)" class="view-button">
                  <i class="el-icon-view"></i> 查看
                </el-button>
              </div>
            </div>
          </el-form-item>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="fromVisible = false">取 消</el-button>
        <el-button type="primary" @click="save">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 使用手册弹窗 -->
    <el-dialog title="使用手册" :visible.sync="manualDialogVisible" width="80%" :close-on-click-modal="false" :append-to-body="true" destroy-on-close>
      <div style="height: 80vh; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <iframe :src="currentManual" style="width: 100%; height: 100%; border: none;"></iframe>
      </div>
    </el-dialog>

    <!-- 3D模型查看弹窗 -->
    <el-dialog title="3D模型查看器" :visible.sync="modelDialogVisible" width="90%" :close-on-click-modal="false" :append-to-body="true" destroy-on-close>
      <div style="height: 80vh;">
        <model-viewer :model-path="currentModel"></model-viewer>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import ModelViewer from '../common/ModelViewer.vue';

export default {
  name: "Lab",
  components: {
    ModelViewer
  },
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
      labadminData: [],
      manualDialogVisible: false,
      currentManual: '',
      modelDialogVisible: false,
      currentModel: ''
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
    openManual(manual) {
      // 添加PDF.js查看器前缀，确保PDF在浏览器中预览而不是下载
      this.currentManual = manual.startsWith('http') ?
        `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(manual)}` :
        manual
      this.manualDialogVisible = true
    },
    openModel(modelFile) {
      if (modelFile) {
        this.currentModel = modelFile
        this.modelDialogVisible = true
      } else {
        this.$message.warning('没有可查看的3D模型')
      }
    }
  }
}
</script>

<style scoped>
.pagination {
  margin-top: 20px;
  text-align: right;
}

/* 对话框样式 */
:deep(.el-dialog) {
  border-radius: 8px;
  overflow: hidden;
  margin-top: 0 !important;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
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
  overflow-y: auto;
}

:deep(.el-dialog__footer) {
  padding: 15px 20px;
  border-top: 1px solid #eee;
}

/* 上传组件样式 */
.upload-demo {
  margin-bottom: 10px;
}

:deep(.el-upload-list) {
  margin-top: 10px;
}

:deep(.el-upload-list__item) {
  transition: all 0.3s ease;
}

:deep(.el-upload-list__item:hover) {
  background-color: #f5f7fa;
}

:deep(.el-input-number) {
  width: 100%;
}

.upload-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  background: #fff;
  border-radius: 4px;
  padding: 15px;
  border: 1px solid #e4e7ed;
}

.upload-wrapper {
  .el-upload {
    width: 100%;
  }

  .el-button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    
    i {
      margin-right: 5px;
    }
  }
}

.file-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-top: 5px;

  .file-name {
    display: flex;
    align-items: center;
    color: #606266;
    font-size: 14px;

    i {
      margin-right: 8px;
      font-size: 16px;
      color: #409EFF;
    }
  }

  .view-button {
    padding: 5px 15px;
    
    &:hover {
      color: #409EFF;
      border-color: #c6e2ff;
      background-color: #ecf5ff;
    }
    
    i {
      margin-right: 4px;
    }
  }
}

.el-upload__tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  line-height: 1.4;
}

.upload-demo {
  :deep(.el-upload-list) {
    margin-top: 8px;
  }

  :deep(.el-upload-list__item) {
    transition: all 0.3s;
    
    &:hover {
      background-color: #f5f7fa;
    }
  }
}

/* 表单样式优化 */
.lab-form-dialog {
  :deep(.el-dialog__body) {
    padding: 20px 30px;
  }
}

.lab-form {
  .form-section {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 20px;
    padding-left: 10px;
    border-left: 4px solid #409EFF;
  }

  :deep(.el-form-item) {
    margin-bottom: 22px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(.el-form-item__label) {
    font-weight: 500;
    color: #606266;
  }

  :deep(.el-input__inner),
  :deep(.el-textarea__inner) {
    border-radius: 4px;
    transition: all 0.3s;
    
    &:hover {
      border-color: #409EFF;
    }
    
    &:focus {
      border-color: #409EFF;
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
    }
  }

  :deep(.el-select) {
    width: 100%;
  }

  :deep(.el-date-editor) {
    width: 100%;
  }

  :deep(.el-input-number) {
    width: 100%;
    
    .el-input__inner {
      text-align: left;
    }
  }
}

/* 对话框底部按钮样式 */
.dialog-footer {
  text-align: right;
  padding: 20px 30px;
  border-top: 1px solid #ebeef5;
  
  .el-button {
    padding: 9px 20px;
    
    & + .el-button {
      margin-left: 10px;
    }
  }
}
</style>
