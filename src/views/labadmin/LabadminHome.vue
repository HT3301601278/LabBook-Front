<template>
  <div class="main-content">
    <!-- 实验室管理员用户首页 -->
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
                <span>角色：实验室管理员</span>
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
            <div class="info-card-title">管理统计</div>
            <div class="info-card-content stats-grid">
              <div class="stat-item">
                <div class="stat-value">{{ stats.managedLabs }}</div>
                <div class="stat-label">管理实验室</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ stats.pendingReserves }}</div>
                <div class="stat-label">待审核预约</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ stats.todayReserves }}</div>
                <div class="stat-label">今日预约</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ stats.pendingFixes }}</div>
                <div class="stat-label">待处理报修</div>
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
            <div class="card-title">我管理的实验室</div>
            <div class="lab-list">
              <div v-for="lab in managedLabs" :key="lab.id" class="lab-item">
                <div class="lab-info">
                  <div class="lab-name">{{ lab.name }}</div>
                  <div class="lab-type">{{ lab.typeName }}</div>
                </div>
                <div class="lab-status" :class="getStatusClass(lab.status)">
                  {{ lab.status }}
                </div>
                <el-button size="mini" type="primary" @click="viewLabDetail(lab.id)">查看</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 预约管理 -->
      <div class="dashboard-section">
        <div class="section-title">预约管理</div>
        <div class="card-container">
          <div class="glass-card">
            <div class="card-title">待审核预约</div>
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
            <div class="card-title">今日预约</div>
            <div v-if="todayReserves.length > 0" class="timeline-container">
              <el-timeline>
                <el-timeline-item 
                  v-for="reserve in todayReserves" 
                  :key="reserve.id"
                  :timestamp="reserve.startTime + ' - ' + reserve.endTime"
                  :type="getTimelineType(reserve.status)">
                  <div class="timeline-content">
                    <div class="timeline-title">{{ reserve.labName }}</div>
                    <div class="timeline-info">申请人：{{ reserve.userName }}</div>
                    <div class="timeline-info">状态：{{ reserve.status }}</div>
                  </div>
                </el-timeline-item>
              </el-timeline>
            </div>
            <div v-else class="empty-data">
              <i class="el-icon-date"></i>
              <span>今日暂无预约</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 报修管理 -->
      <div class="dashboard-section">
        <div class="section-title">报修管理</div>
        <div class="card-container">
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
          <div class="glass-card">
            <div class="card-title">最近检修记录</div>
            <div v-if="recentChecks.length > 0" class="check-list">
              <div v-for="check in recentChecks" :key="check.id" class="check-item">
                <div class="check-info">
                  <div class="check-lab">{{ check.labName }}</div>
                  <div class="check-desc">{{ check.description }}</div>
                  <div class="check-time">{{ check.createTime }}</div>
                </div>
                <div class="check-status">{{ check.status }}</div>
              </div>
            </div>
            <div v-else class="empty-data">
              <i class="el-icon-finished"></i>
              <span>暂无检修记录</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 系统公告 -->
      <div class="dashboard-section">
        <div class="section-title">系统公告</div>
        <div class="glass-card">
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
  </div>
</template>

<script>
import * as echarts from "echarts";

export default {
  data() {
    return {
      user: JSON.parse(localStorage.getItem('labuser') || '{}'),
      notices: [],
      // 模拟数据 - 实际应用中应通过API获取
      stats: {
        managedLabs: 5,
        pendingReserves: 3,
        todayReserves: 8,
        pendingFixes: 2
      },
      managedLabs: [
        { id: 1, name: '化学分析实验室', typeName: '化学类', status: '空闲' },
        { id: 3, name: '计算机网络实验室', typeName: '计算机类', status: '空闲' },
        { id: 5, name: '软件工程实验室', typeName: '计算机类', status: '空闲' },
        { id: 7, name: '有机化学实验室', typeName: '化学类', status: '使用中' },
        { id: 10, name: '数字信号处理实验室', typeName: '电子类', status: '维护中' }
      ],
      pendingReserves: [
        { id: 101, labName: '计算机网络实验室', userName: '张三', date: '2023-06-12', startTime: '09:00', endTime: '11:00' },
        { id: 102, labName: '软件工程实验室', userName: '李四', date: '2023-06-12', startTime: '14:00', endTime: '16:00' },
        { id: 103, labName: '化学分析实验室', userName: '王五', date: '2023-06-13', startTime: '10:00', endTime: '12:00' }
      ],
      todayReserves: [
        { id: 101, labName: '计算机网络实验室', userName: '张三', startTime: '09:00', endTime: '11:00', status: '已通过' },
        { id: 102, labName: '软件工程实验室', userName: '李四', startTime: '14:00', endTime: '16:00', status: '待审核' }
      ],
      pendingFixes: [
        { id: 201, labName: '数字信号处理实验室', userName: '王五', description: '示波器无法正常显示', createTime: '2023-06-10' },
        { id: 202, labName: '计算机网络实验室', userName: '赵六', description: '路由器故障', createTime: '2023-06-09' }
      ],
      recentChecks: [
        { id: 301, labName: '有机化学实验室', description: '更换损坏的烧杯和试管', createTime: '2023-06-08', status: '已完成' },
        { id: 302, labName: '软件工程实验室', description: '更新电脑操作系统', createTime: '2023-06-05', status: '已完成' }
      ]
    }
  },
  mounted() {
    this.loadNotices()
    this.initLabPieChart()
  },
  methods: {
    loadNotices() {
      this.$request.get('/notice/selectAll').then(res => {
        this.notices = res.data || []
      })
    },
    initLabPieChart() {
      const chartDom = document.getElementById('labPie');
      const myChart = echarts.init(chartDom);
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 10,
          data: ['空闲', '使用中', '维护中']
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
            data: [
              { value: 3, name: '空闲', itemStyle: { color: '#67C23A' } },
              { value: 1, name: '使用中', itemStyle: { color: '#E6A23C' } },
              { value: 1, name: '维护中', itemStyle: { color: '#F56C6C' } }
            ]
          }
        ]
      };
      myChart.setOption(option);
    },
    getStatusClass(status) {
      if (status === '空闲') return 'status-free'
      if (status === '使用中') return 'status-using'
      if (status === '维护中') return 'status-maintenance'
      return ''
    },
    getTimelineType(status) {
      if (status === '已通过') return 'success'
      if (status === '待审核') return 'warning'
      if (status === '已拒绝') return 'danger'
      return 'info'
    },
    viewLabDetail(labId) {
      // 查看实验室详情，实际应用中应跳转到实验室详情页
      this.$message.success('查看实验室详情：' + labId)
      // this.$router.push(`/lab/detail/${labId}`)
    },
    handleReserve(id, action) {
      // 处理预约审核，实际应用中应调用API
      this.$message.success(`已${action === 'approve' ? '通过' : '拒绝'}预约申请`)
      this.pendingReserves = this.pendingReserves.filter(item => item.id !== id)
    },
    handleFix(id) {
      // 跳转到报修记录页面
      this.$router.push({
        path: '/manager/fix',
        query: { id: id }
      })
    }
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

.lab-list, .reserve-list, .fix-list, .check-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.lab-item, .reserve-item, .fix-item, .check-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.5);
}

.lab-info, .reserve-info, .fix-info, .check-info {
  flex: 1;
}

.lab-name, .reserve-lab, .fix-lab, .check-lab {
  font-weight: 500;
}

.lab-type, .reserve-user, .reserve-time, .fix-user, .fix-desc, .fix-time, .check-desc, .check-time {
  font-size: 12px;
  color: #909399;
  margin-top: 3px;
}

.lab-status, .reserve-status, .fix-status, .check-status {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin: 0 10px;
}

.status-free {
  color: #67C23A;
  background-color: rgba(103, 194, 58, 0.1);
}

.status-using {
  color: #E6A23C;
  background-color: rgba(230, 162, 60, 0.1);
}

.status-maintenance {
  color: #F56C6C;
  background-color: rgba(245, 108, 108, 0.1);
}

.status-pending {
  color: #E6A23C;
  background-color: rgba(230, 162, 60, 0.1);
}

.timeline-container {
  padding: 10px 0;
}

.timeline-content {
  padding: 5px 0;
}

.timeline-title {
  font-weight: 500;
  margin-bottom: 5px;
}

.timeline-info {
  font-size: 12px;
  color: #606266;
  margin-bottom: 3px;
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