<template>
  <div>
    <div class="search">
      <el-select v-model="typeId" placeholder="请选择实验室分类" style="width: 200px">
        <el-option v-for="item in typeData" :key="item.id" :label="item.name" :value="item.id"></el-option>
      </el-select>
      <el-input placeholder="请输入实验室编号" style="width: 200px; margin-left: 5px" v-model="name"></el-input>
      <el-button type="info" plain style="margin-left: 10px" @click="load(1)">查询</el-button>
      <el-button type="warning" plain style="margin-left: 10px" @click="reset">重置</el-button>
    </div>
    <div class="table">
      <div>
        <el-row :gutter="20">
          <el-col :span="5" v-for="item in tableData" :key="item.id">
            <div class="lab-card">
              <div class="lab-header">
                <div class="lab-number">实验室名称：
                  <span>{{ item.labName }}</span>
                </div>
              </div>
              <div class="lab-content">
                <div class="lab-item">
                  <i class="el-icon-office-building"></i>
                  <span class="label">编号：</span>
                  <span class="value">{{ item.labNumber }}</span>
                </div>
                <div class="lab-item">
                  <i class="el-icon-collection-tag"></i>
                  <span class="label">类型：</span>
                  <span class="value">{{ item.typeName }}</span>
                </div>
                <div class="lab-item">
                  <i class="el-icon-location"></i>
                  <span class="label">位置：</span>
                  <span class="value">{{ item.location }}</span>
                </div>  
                <div class="lab-item">
                  <i class="el-icon-circle-check"></i>
                  <span class="label">状态：</span>
                  <span class="value" :class="{'status-free': item.usageStatus === '空闲中', 'status-busy': item.usageStatus !== '空闲中'}">
                    {{ item.usageStatus }}
                  </span>
                </div>
                <div class="lab-item">
                  <i class="el-icon-time"></i>
                  <span class="label">开放时间：</span>
                  <span class="value time">{{ item.startTime }}</span>
                </div>
                <div class="lab-item">
                  <i class="el-icon-time"></i>
                  <span class="label">关闭时间：</span>
                  <span class="value time">{{ item.endTime }}</span>
                </div>
                <div class="lab-item">
                  <i class="el-icon-timer"></i>
                  <span class="label">最大预约时长：</span>
                  <span class="value">{{ item.maxReservationHours }} 小时</span>
                </div>
              </div>
              <div class="lab-footer">
                <div class="doc-buttons">
                  <el-button type="text" size="mini" :class="{'disabled-button': !item.manual}" @click="item.manual && openManual(item.manual)">
                    <i class="el-icon-document"></i> 使用手册
                  </el-button>
                  <el-button type="text" size="mini" :class="{'disabled-button': !item.modelFile}" @click="item.modelFile && openModel(item.modelFile)">
                    <i class="el-icon-view"></i> 3D模型
                  </el-button>
                </div>
                <div class="reserve-button">
                  <el-button type="primary" size="mini" @click="openReserveForm(item)" 
                    :disabled="item.usageStatus === '使用中'">预约</el-button>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
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

      <!-- 预约表单弹窗 -->
      <reserve-form :visible.sync="reserveFormVisible" :lab-info="currentLabInfo" @success="load(1)"></reserve-form>
    </div>
  </div>
</template>

<script>
import ModelViewer from './ModelViewer.vue';
import ReserveForm from './ReserveForm.vue';

export default {
  name: "Lab",
  components: {
    ModelViewer,
    ReserveForm
  },
  data() {
    return {
      tableData: [],  // 所有的数据
      pageNum: 1,   // 当前的页码
      pageSize: 10,  // 每页显示的个数
      total: 0,
      name: null,
      typeId: null,
      form: {},
      user: JSON.parse(localStorage.getItem('labuser') || '{}'),
      rules: {},
      typeData: [],
      manualDialogVisible: false,
      currentManual: '',
      modelDialogVisible: false,
      currentModel: '',
      reserveFormVisible: false,
      currentLabInfo: null
    }
  },
  created() {
    this.load(1)
    this.loadType()
  },
  methods: {
    openReserveForm(item) {
      this.currentLabInfo = item;
      this.reserveFormVisible = true;
    },
    loadType() {
      this.$request.get('/type/selectAll').then(res => {
        if (res.code === '200') {
          this.typeData = res.data
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    load(pageNum) {  // 分页查询
      if (pageNum) this.pageNum = pageNum
      this.$request.get('/lab/selectPage', {
        params: {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          name: this.name,
          typeId: this.typeId,
        }
      }).then(res => {
        this.tableData = res.data?.list
        this.total = res.data?.total
      })
    },
    reset() {
      this.name = null
      this.typeId = null
      this.load(1)
    },
    handleCurrentChange(pageNum) {
      this.load(pageNum)
    },
    handleSizeChange(pageSize) {
      this.pageSize = pageSize
      this.load(this.pageNum)
    },
    openManual(manual) {
      // 添加PDF.js查看器前缀，确保PDF在浏览器中预览而不是下载
      this.currentManual = manual.startsWith('http') ?
        `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(manual)}` :
        manual
      this.manualDialogVisible = true
    },
    downloadManual() {
      if (this.currentManual) {
        // 创建一个临时链接元素
        const link = document.createElement('a')
        link.href = this.currentManual
        link.setAttribute('download', '实验室使用手册.pdf') // 设置下载文件名
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        this.$message.warning('没有可下载的使用手册')
      }
    },
    openModel(modelFile) {
      if (modelFile) {
        this.currentModel = modelFile
        this.modelDialogVisible = true
      } else {
        this.$message.warning('没有可查看的3D模型')
      }
    },
  }
}
</script>

<style scoped>
.el-col-5 {
  width: 20%;
  max-width: 20%;
  padding: 10px;
}

.lab-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 16px;
  transition: all 0.3s ease;
}

.lab-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.lab-header {
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 12px;
  margin-bottom: 12px;
}

.lab-number {
  color: #606266;
  font-size: 14px;
}

.lab-number span {
  color: #0376bf;
  font-size: 16px;
  font-weight: 600;
  margin-left: 4px;
}

.lab-content {
  padding: 8px 0;
}

.lab-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  color: #606266;
}

.lab-content .lab-item:last-child {
  margin-bottom: 0;
}

.lab-item i {
  font-size: 16px;
  margin-right: 8px;
  color: #909399;
}

.lab-item .label {
  font-size: 14px;
  color: #606266;
  min-width: 90px;
}

.lab-item .value {
  flex: 1;
  color: #303133;
}

.lab-item .value.time {
  color: #0376bf;
}

.status-free {
  color: #67c23a !important;
  font-weight: 600;
}

.status-busy {
  color: #f56c6c !important;
  font-weight: 600;
}

.lab-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.doc-buttons {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.doc-buttons .el-button {
  padding: 0;
  font-size: 13px;
}

.doc-buttons .el-button i {
  margin-right: 4px;
}

.doc-buttons .el-button.disabled-button {
  cursor: not-allowed;
  color: #c0c4cc;
}

.doc-buttons .el-button.disabled-button:hover {
  color: #c0c4cc;
}

.reserve-button {
  text-align: center;
}

.reserve-button .el-button {
  width: 100%;
}

::v-deep .el-dialog {
  display: flex;
  flex-direction: column;
  margin: 0 !important;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-height: 90%;
  max-width: 90%;
}

::v-deep .el-dialog__body {
  padding: 10px;
  height: calc(100% - 55px);
  overflow: hidden;
}
</style>
