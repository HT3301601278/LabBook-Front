<template>
  <div class="main-content">
    <!-- 管理员用户首页 -->
    <div class="dashboard-container">
      <!-- 个人信息概览 -->
      <div class="dashboard-section">
        <div class="section-title">个人信息概览</div>
        <div class="card-container">
          <div class="info-card glass-card">
            <div class="info-card-title">基本信息</div>
            <div class="info-card-content">
              <div class="info-item">
                <i class="el-icon-user"></i>
                <span>姓名：{{ user.name || '未知' }}</span>
              </div>
              <div class="info-item">
                <i class="el-icon-s-custom"></i>
                <span>角色：系统管理员</span>
              </div>
              <div class="info-item">
                <i class="el-icon-phone"></i>
                <span>电话：{{ user.phone || '未知' }}</span>
              </div>
              <div class="info-item">
                <i class="el-icon-message"></i>
                <span>邮箱：{{ user.email || '未知' }}</span>
              </div>
            </div>
          </div>
          <div class="info-card glass-card">
            <div class="info-card-title">系统统计</div>
            <div class="info-card-content stats-grid">
              <div class="stat-item">
                <div class="stat-value">{{ stats.totalLabs }}</div>
                <div class="stat-label">实验室总数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ stats.totalUsers }}</div>
                <div class="stat-label">用户总数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ stats.totalReserves }}</div>
                <div class="stat-label">预约总数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ stats.totalFixes }}</div>
                <div class="stat-label">报修总数</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 用户管理概览 -->
      <div class="dashboard-section">
        <div class="section-title">用户管理概览</div>
        <div class="card-container">
          <div class="glass-card">
            <div class="card-title">用户分布</div>
            <div id="userPie" style="height: 300px;"></div>
          </div>
          <div class="glass-card">
            <div class="card-title">最近注册用户</div>
            <div class="user-list">
              <div v-for="user in recentUsers" :key="user.id" class="user-item">
                <div class="user-avatar">
                  <el-avatar :src="user.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"></el-avatar>
                </div>
                <div class="user-info">
                  <div class="user-name">{{ user.name }}</div>
                  <div class="user-role">{{ getRoleName(user.role) }}</div>
                </div>
                <div class="user-time">{{ user.createTime }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 实验室管理概览 -->
      <div class="dashboard-section">
        <div class="section-title">实验室管理概览</div>
        <div class="card-container">
          <div class="glass-card">
            <div class="card-title">实验室状态分布</div>
            <div id="labPie" style="height: 300px;"></div>
          </div>
          <div class="glass-card">
            <div class="card-title">实验室分类统计</div>
            <div id="labBar" style="height: 300px;"></div>
          </div>
        </div>
      </div>

      <!-- 预约与报修概览 -->
      <div class="dashboard-section">
        <div class="section-title">预约与报修概览</div>
        <div class="card-container">
          <div class="glass-card">
            <div class="card-title">待处理预约</div>
            <div v-if="pendingReserves.length > 0" class="reserve-list">
              <div v-for="reserve in pendingReserves" :key="reserve.id" class="reserve-item">
                <div class="reserve-info">
                  <div class="reserve-lab">{{ reserve.labName }}</div>
                  <div class="reserve-user">申请人：{{ reserve.userName }}</div>
                  <div class="reserve-time">{{ reserve.date }} {{ reserve.startTime }}-{{ reserve.endTime }}</div>
                </div>
                <div class="reserve-status status-pending">待审核</div>
                <div class="reserve-actions">
                  <el-button size="mini" type="success" @click="handleReserve(reserve.id, 'approve')">通过</el-button>
                  <el-button size="mini" type="danger" @click="handleReserve(reserve.id, 'reject')">拒绝</el-button>
                </div>
              </div>
            </div>
            <div v-else class="empty-data">
              <i class="el-icon-date"></i>
              <span>暂无待处理预约</span>
            </div>
          </div>
          <div class="glass-card">
            <div class="card-title">待处理报修</div>
            <div v-if="pendingFixes.length > 0" class="fix-list">
              <div v-for="fix in pendingFixes" :key="fix.id" class="fix-item">
                <div class="fix-info">
                  <div class="fix-lab">{{ fix.labName }}</div>
                  <div class="fix-user">报修人：{{ fix.userName }}</div>
                  <div class="fix-desc">{{ fix.description }}</div>
                  <div class="fix-time">{{ fix.createTime }}</div>
                </div>
                <div class="fix-status status-pending">待处理</div>
                <div class="fix-actions">
                  <el-button size="mini" type="primary" @click="handleFix(fix.id)">处理</el-button>
                </div>
              </div>
            </div>
            <div v-else class="empty-data">
              <i class="el-icon-tools"></i>
              <span>暂无待处理报修</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 系统公告 -->
      <div class="dashboard-section">
        <div class="section-title">系统公告</div>
        <div class="glass-card">
          <div class="card-title-with-action">
            <div>公告列表</div>
            <el-button size="small" type="primary" @click="$router.push('/notice')">管理公告</el-button>
          </div>
          <div class="notice-list">
            <el-timeline>
              <el-timeline-item 
                v-for="notice in notices" 
                :key="notice.id"
                :timestamp="notice.createTime ? notice.createTime.split('T')[0] : ''"
                placement="top">
                <el-card class="notice-card">
                  <div slot="header" class="notice-header">
                    <span>{{ notice.title }}</span>
                  </div>
                  <div class="notice-content">{{ notice.content }}</div>
                </el-card>
              </el-timeline-item>
            </el-timeline>
          </div>
        </div>
      </div>
    </div>

    <!-- 报修处理对话框 -->
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
import * as echarts from "echarts";

export default {
  data() {
    return {
      user: JSON.parse(localStorage.getItem('labuser') || '{}'),
      notices: [],
      labTypes: [],
      labStatus: {},
      userStats: {},
      // 系统统计数据
      stats: {
        totalLabs: 0,
        totalUsers: 0,
        totalReserves: 0,
        totalFixes: 0
      },
      recentUsers: [
        { id: 1, name: '张三', role: 'STUDENT', avatar: '', createTime: '2023-06-10' },
        { id: 2, name: '李四', role: 'LABADMIN', avatar: '', createTime: '2023-06-09' },
        { id: 3, name: '王五', role: 'STUDENT', avatar: '', createTime: '2023-06-08' },
        { id: 4, name: '赵六', role: 'STUDENT', avatar: '', createTime: '2023-06-07' }
      ],
      pendingReserves: [],
      pendingFixes: [],
      form: {
        labId: '',
        fixId: '',
        inspectorName: '',
        phone: '',
        content: '',
        department: '',
        description: '',
        fixTime: null
      },
      fromVisible: false,
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
      }
    }
  },
  mounted() {
    this.loadNotices()
    this.loadLabTypes()
    this.loadLabStatus()
    this.loadUserStats()
    this.loadPendingReserves()
    this.loadPendingFixes()
    this.loadSystemStats()
    this.initCharts()
  },
  methods: {
    loadSystemStats() {
      // 获取实验室总数
      this.$request.get('/lab/selectAll').then(res => {
        if (res.code === '200' && res.data && res.data.stats) {
          this.stats.totalLabs = res.data.stats.total || 0
        }
      })
      
      // 获取用户总数
      this.$request.get('/userStats').then(res => {
        if (res.code === '200' && res.data) {
          this.stats.totalUsers = res.data.totalUsers || 0
        }
      })
      
      // 获取预约总数
      this.$request.get('/reserve/selectAll').then(res => {
        if (res.code === '200' && res.data) {
          this.stats.totalReserves = res.data.total || 0
        }
      })
      
      // 获取报修总数
      this.$request.get('/fix/selectAll').then(res => {
        if (res.code === '200' && res.data) {
          this.stats.totalFixes = res.data.total || 0
        }
      })
    },
    
    loadNotices() {
      this.$request.get('/notice/selectAll').then(res => {
        this.notices = res.data || []
      })
    },
    loadLabTypes() {
      this.$request.get('/type/selectAll').then(res => {
        this.labTypes = res.data || []
        this.updateLabBarChart()
      })
    },
    loadLabStatus() {
      this.$request.get('/lab/selectAll').then(res => {
        if (res.code === '200' && res.data) {
          this.labStatus = res.data.stats || {}
          this.updateLabPieChart()
        }
      })
    },
    loadUserStats() {
      this.$request.get('/userStats').then(res => {
        if (res.code === '200' && res.data) {
          this.userStats = res.data
          this.updateUserPieChart()
        }
      })
    },
    loadPendingReserves() {
      this.$request.get('/reserve/selectPage?pageNum=1&pageSize=1000&status=待审核').then(res => {
        if (res.code === '200' && res.data) {
          this.pendingReserves = res.data.list.map(item => ({
            id: item.id,
            labName: item.labName,
            userName: item.studentName,
            date: item.reserveStartTime.split(' ')[0],
            startTime: item.reserveStartTime.split(' ')[1],
            endTime: item.reserveEndTime.split(' ')[1],
            createTime: item.createTime
          }))
        }
      })
    },
    loadPendingFixes() {
      this.$request.get('/fix/searchPage', {
        params: {
          pageNum: 1,
          pageSize: 1000,
          status: '待处理'
        }
      }).then(res => {
        if (res.code === '200' && res.data) {
          this.pendingFixes = res.data.list.map(item => ({
            id: item.id,
            labName: item.labName,
            userName: item.studentName,
            description: item.description,
            createTime: item.createTime
          }))
        }
      })
    },
    initCharts() {
      this.initUserPieChart()
      this.initLabPieChart()
      this.initLabBarChart()
    },
    initUserPieChart() {
      const chartDom = document.getElementById('userPie');
      this.userPieChart = echarts.init(chartDom);
      this.updateUserPieChart()
    },
    updateUserPieChart() {
      if (!this.userPieChart || !this.userStats.data) return
      
      const option = {
        title: {
          text: this.userStats.text || '用户分布',
          subtext: this.userStats.subtext || '统计维度：用户角色',
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 10,
          data: this.userStats.data.map(item => item.name)
        },
        series: [
          {
            name: '用户分布',
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '18',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: this.userStats.data.map(item => ({
              ...item,
              itemStyle: {
                color: item.name === '管理员' ? '#409EFF' : 
                       item.name === '实验室管理员' ? '#67C23A' : '#E6A23C'
              }
            }))
          }
        ]
      };
      this.userPieChart.setOption(option);
    },
    initLabPieChart() {
      const chartDom = document.getElementById('labPie');
      this.labPieChart = echarts.init(chartDom);
      this.updateLabPieChart()
    },
    updateLabPieChart() {
      if (!this.labPieChart) return
      
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 10,
          data: Object.keys(this.labStatus)
        },
        series: [
          {
            name: '实验室状态',
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '18',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: Object.entries(this.labStatus).map(([name, value]) => ({
              name,
              value,
              itemStyle: {
                color: name === '空闲中' ? '#67C23A' : 
                       name === '使用中' ? '#E6A23C' : '#909399'
              }
            })).filter(item => item.name !== 'total')
          }
        ]
      };
      this.labPieChart.setOption(option);
    },
    initLabBarChart() {
      const chartDom = document.getElementById('labBar');
      this.labBarChart = echarts.init(chartDom);
      this.updateLabBarChart()
    },
    updateLabBarChart() {
      if (!this.labBarChart) return
      
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          containLabel: true
        },
        dataZoom: [
          {
            type: 'slider',
            show: true,
            xAxisIndex: [0],
            start: 0,
            end: 100
          }
        ],
        xAxis: {
          type: 'category',
          data: this.labTypes.map(type => type.name),
          axisLabel: {
            interval: 0,
            rotate: 45,
            textStyle: {
              fontSize: 12
            }
          }
        },
        yAxis: {
          type: 'value',
          name: '实验室数量'
        },
        series: [
          {
            name: '实验室数量',
            type: 'bar',
            data: this.labTypes.map(type => type.labCount),
            itemStyle: {
              color: '#409EFF'
            }
          }
        ]
      };
      this.labBarChart.setOption(option);
    },
    getRoleName(role) {
      if (role === 'ADMIN') return '系统管理员'
      if (role === 'LABADMIN') return '实验室管理员'
      if (role === 'STUDENT') return '学生'
      return '未知角色'
    },
    handleReserve(id, action) {
      const status = action === 'approve' ? '已通过' : '已拒绝'
      const actionText = action === 'approve' ? '通过' : '拒绝'
      
      this.$confirm(`确认${actionText}此预约申请？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$request.put('/reserve/update', {
          id: id,
          status: status
        }).then(res => {
          if (res.code === '200') {
            this.$message.success('操作成功')
            this.loadPendingReserves() // 重新加载待处理预约列表
          } else {
            this.$message.error(res.msg || '操作失败')
          }
        })
      }).catch(() => {})
    },
    handleFix(id) {
      // 获取报修详情
      this.$request.get('/fix/searchPage', {
        params: {
          pageNum: 1,
          pageSize: 1000,
          id: id
        }
      }).then(res => {
        if (res.code === '200' && res.data && res.data.list && res.data.list.length > 0) {
          const fixData = res.data.list[0]
          this.form = {
            labId: fixData.labId,
            fixId: fixData.id,
            inspectorName: '',
            phone: '',
            content: '',
            department: '',
            description: '',
            fixTime: null
          }
          this.fromVisible = true
        } else {
          this.$message.error('获取报修详情失败')
        }
      })
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
                  this.loadPendingFixes() // 重新加载待处理报修列表
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
  }
}
</script>

<style scoped>
.dashboard-container {
  padding: 20px 0;
}

.dashboard-section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #2c3e50;
  position: relative;
  padding-left: 12px;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 18px;
  background: linear-gradient(135deg, #409EFF 0%, #3a8ee6 100%);
  border-radius: 2px;
}

.card-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 10px;
}

.glass-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 20px;
  transition: all 0.3s ease;
  flex: 1;
  min-width: 300px;
}

.glass-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.info-card {
  display: flex;
  flex-direction: column;
}

.info-card-title, .card-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #2c3e50;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding-bottom: 10px;
}

.card-title-with-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #2c3e50;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding-bottom: 10px;
}

.info-card-content {
  flex: 1;
}

.info-item {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}

.info-item i {
  margin-right: 8px;
  color: #409EFF;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.stat-item {
  text-align: center;
  padding: 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.5);
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #409EFF;
}

.stat-label {
  font-size: 12px;
  color: #606266;
  margin-top: 5px;
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.5);
}

.user-avatar {
  margin-right: 10px;
}

.user-info {
  flex: 1;
}

.user-name {
  font-weight: 500;
}

.user-role {
  font-size: 12px;
  color: #909399;
}

.user-time {
  font-size: 12px;
  color: #909399;
}

.reserve-list, .fix-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reserve-item, .fix-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.5);
}

.reserve-info, .fix-info {
  flex: 1;
}

.reserve-lab, .fix-lab {
  font-weight: 500;
}

.reserve-user, .fix-user, .reserve-time, .fix-time, .fix-desc {
  font-size: 12px;
  color: #909399;
  margin-top: 3px;
}

.reserve-status, .fix-status {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin: 0 10px;
}

.status-pending {
  color: #E6A23C;
  background-color: rgba(230, 162, 60, 0.1);
}

.notice-list {
  max-height: 400px;
  overflow-y: auto;
}

.notice-card {
  margin-bottom: 10px;
}

.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notice-content {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

.empty-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
  color: #909399;
}

.empty-data i {
  font-size: 30px;
  margin-bottom: 10px;
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

/* 响应式调整 */
@media (max-width: 768px) {
  .card-container {
    flex-direction: column;
  }
  
  .glass-card {
    min-width: auto;
  }
}
</style>