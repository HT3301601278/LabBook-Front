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
            <div style="background-color: #ecf7fc" class="card">
              <div style="color: #474849">实验室编号：
                <span style="font-size: 16px; font-weight: 550; color: #0376bf">{{ item.labNumber }}</span>
              </div>
              <div style="color: #474849; margin-top: 10px">名称：{{ item.labName }}</div>
              <div style="color: #474849; margin-top: 5px">类型：{{ item.typeName }}</div>
              <div style="color: #474849; margin-top: 5px">状态：
                <span style="font-weight: 550; color: #3c9e25" v-if="item.usageStatus === '空闲中'">{{ item.usageStatus }}</span>
                <span style="font-weight: 550; color: #ea8282" v-else>{{ item.usageStatus }}</span>
              </div>
              <div style="color: #474849; margin-top: 5px">
                <span style="font-weight: 550">开放时间：</span>
                <span style="color: #0376bf">{{ item.startTime }}</span>
              </div>
              <div style="color: #474849; margin-top: 5px">
                <span style="font-weight: 550">关闭时间：</span>
                <span style="color: #0376bf">{{ item.endTime }}</span>
              </div>
              <div style="color: #474849; margin-top: 5px">最大预约时长：{{ item.maxReservationHours }} 小时</div>
              <div style="margin-top: 10px; display: flex; justify-content: space-between">
                <div v-if="item.manual">
                  <el-button type="text" size="mini" @click="openManual(item.manual)">
                    <i class="el-icon-document"></i> 使用手册
                  </el-button>
                </div>
                <div v-if="item.modelFile">
                  <el-button type="text" size="mini" @click="openModel(item.modelFile)">
                    <i class="el-icon-view"></i> 3D模型
                  </el-button>
                </div>
              </div>
              <div style="margin-top: 10px">
                <el-button type="primary" size="mini" @click="openReserveForm(item)" :disabled="item.usageStatus === '使用中'">预约</el-button>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
      <div class="pagination">
        <el-pagination
            background
            @current-change="handleCurrentChange"
            :current-page="pageNum"
            :page-sizes="[5, 10, 20]"
            :page-size="pageSize"
            layout="total, prev, pager, next"
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
.el-col-5{
  width: 20%;
  max-width: 20%;
  padding: 10px 10px;
}

::v-deep .el-dialog__body {
  padding: 10px;
  height: calc(100% - 55px);
  overflow: hidden;
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
</style>
