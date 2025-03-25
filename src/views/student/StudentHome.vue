<template>
  <div class="main-content">
    <!-- 学生用户首页 -->
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
                <i class="el-icon-notebook-1"></i>
                <span>学号：{{ user.studentNumber || '未知' }}</span>
              </div>
              <div class="info-item">
                <i class="el-icon-school"></i>
                <span>学院：{{ user.college || '未知' }}</span>
              </div>
              <div class="info-item">
                <i class="el-icon-reading"></i>
                <span>专业：{{ user.major || '未知' }}</span>
              </div>
            </div>
          </div>
          <div class="info-card glass-card">
            <div class="info-card-title">预约统计</div>
            <div class="info-card-content stats-grid">
              <div class="stat-item">
                <div class="stat-value">{{ stats.totalReserve }}</div>
                <div class="stat-label">总预约次数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ stats.monthReserve }}</div>
                <div class="stat-label">本月预约</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ stats.pendingReserve }}</div>
                <div class="stat-label">待审核</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ stats.approvedReserve }}</div>
                <div class="stat-label">已通过</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 快速预约区 -->
      <div class="dashboard-section">
        <div class="section-title">快速预约</div>
        <div class="card-container">
          <div class="glass-card">
            <div class="card-title">热门实验室</div>
            <div class="lab-list">
              <div v-for="lab in popularLabs" :key="lab.id" class="lab-item">
                <div class="lab-info">
                  <div class="lab-name">{{ lab.name }}</div>
                  <div class="lab-type">{{ lab.typeName }}</div>
                </div>
                <div class="lab-status" :class="getStatusClass(lab.status)">
                  {{ lab.status }}
                </div>
                <el-button size="mini" type="primary" @click="goToReserve(lab.id)" :disabled="lab.status !== '空闲'">预约</el-button>
              </div>
            </div>
          </div>
          <div class="glass-card">
            <div class="card-title">我常用的实验室</div>
            <div class="lab-list">
              <div v-for="lab in frequentLabs" :key="lab.id" class="lab-item">
                <div class="lab-info">
                  <div class="lab-name">{{ lab.name }}</div>
                  <div class="lab-type">{{ lab.typeName }}</div>
                </div>
                <div class="lab-status" :class="getStatusClass(lab.status)">
                  {{ lab.status }}
                </div>
                <el-button size="mini" type="primary" @click="goToReserve(lab.id)" :disabled="lab.status !== '空闲'">预约</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 我的预约中心 -->
      <div class="dashboard-section">
        <div class="section-title">我的预约中心</div>
        <div class="card-container">
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
                    <div class="timeline-info">位置：{{ reserve.location || '未知' }}</div>
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
          <div class="glass-card">
            <div class="card-title">近期预约列表</div>
            <div v-if="recentReserves.length > 0" class="reserve-list">
              <div v-for="reserve in recentReserves" :key="reserve.id" class="reserve-item">
                <div class="reserve-info">
                  <div class="reserve-lab">{{ reserve.labName }}</div>
                  <div class="reserve-time">{{ reserve.date }} {{ reserve.startTime }}-{{ reserve.endTime }}</div>
                </div>
                <div class="reserve-status" :class="getReserveStatusClass(reserve.status)">
                  {{ reserve.status }}
                </div>
              </div>
            </div>
            <div v-else class="empty-data">
              <i class="el-icon-document"></i>
              <span>暂无预约记录</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 实验室状态看板 -->
      <div class="dashboard-section">
        <div class="section-title">实验室状态看板</div>
        <div class="glass-card lab-status-board">
          <div class="status-summary">
            <div class="status-item">
              <div class="status-value">{{ labStats.total }}</div>
              <div class="status-label">总数</div>
            </div>
            <div class="status-item">
              <div class="status-value status-free">{{ labStats.free }}</div>
              <div class="status-label">空闲</div>
            </div>
            <div class="status-item">
              <div class="status-value status-using">{{ labStats.using }}</div>
              <div class="status-label">使用中</div>
            </div>
            <div class="status-item">
              <div class="status-value status-maintenance">{{ labStats.maintenance }}</div>
              <div class="status-label">维护中</div>
            </div>
          </div>
          <div class="lab-type-list">
            <div v-for="type in labTypes" :key="type.id" class="lab-type-item">
              <div class="type-name">{{ type.name }}</div>
              <div class="type-labs">
                <div 
                  v-for="lab in type.labs" 
                  :key="lab.id" 
                  class="type-lab-item"
                  :class="getStatusClass(lab.status)">
                  {{ lab.name }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 消息通知区 -->
      <div class="dashboard-section">
        <div class="section-title">消息通知</div>
        <div class="card-container">
          <div class="glass-card">
            <div class="card-title">系统公告</div>
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
          <div class="glass-card">
            <div class="card-title">预约通知</div>
            <div v-if="notifications.length > 0" class="notification-list">
              <div v-for="notification in notifications" :key="notification.id" class="notification-item">
                <div class="notification-icon" :class="notification.type">
                  <i :class="getNotificationIcon(notification.type)"></i>
                </div>
                <div class="notification-content">
                  <div class="notification-title">{{ notification.title }}</div>
                  <div class="notification-message">{{ notification.message }}</div>
                  <div class="notification-time">{{ notification.time }}</div>
                </div>
              </div>
            </div>
            <div v-else class="empty-data">
              <i class="el-icon-bell"></i>
              <span>暂无通知</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  data() {
    return {
      user: JSON.parse(localStorage.getItem('labuser') || '{}'),
      notices: [],
      // 模拟数据 - 实际应用中应通过API获取
      stats: {
        totalReserve: 12,
        monthReserve: 3,
        pendingReserve: 1,
        approvedReserve: 10
      },
      popularLabs: [
        { id: 1, name: '化学分析实验室', typeName: '化学类', status: '空闲' },
        { id: 2, name: '物理光学实验室', typeName: '物理类', status: '使用中' },
        { id: 3, name: '计算机网络实验室', typeName: '计算机类', status: '空闲' },
        { id: 4, name: '电子电路实验室', typeName: '电子类', status: '维护中' }
      ],
      frequentLabs: [
        { id: 3, name: '计算机网络实验室', typeName: '计算机类', status: '空闲' },
        { id: 5, name: '软件工程实验室', typeName: '计算机类', status: '空闲' },
        { id: 6, name: '数据库实验室', typeName: '计算机类', status: '使用中' }
      ],
      todayReserves: [
        { id: 101, labName: '计算机网络实验室', startTime: '09:00', endTime: '11:00', status: '已通过', location: '信息楼B201' },
        { id: 102, labName: '软件工程实验室', startTime: '14:00', endTime: '16:00', status: '待审核', location: '信息楼A305' }
      ],
      recentReserves: [
        { id: 101, labName: '计算机网络实验室', date: '2023-06-10', startTime: '09:00', endTime: '11:00', status: '已通过' },
        { id: 102, labName: '软件工程实验室', date: '2023-06-10', startTime: '14:00', endTime: '16:00', status: '待审核' },
        { id: 103, labName: '数据库实验室', date: '2023-06-09', startTime: '10:00', endTime: '12:00', status: '已拒绝' },
        { id: 104, labName: '电子电路实验室', date: '2023-06-08', startTime: '15:00', endTime: '17:00', status: '已通过' },
        { id: 105, labName: '化学分析实验室', date: '2023-06-07', startTime: '08:00', endTime: '10:00', status: '已通过' }
      ],
      labStats: {
        total: 30,
        free: 18,
        using: 9,
        maintenance: 3
      },
      labTypes: [
        { 
          id: 1, 
          name: '化学类', 
          labs: [
            { id: 1, name: '化学分析实验室', status: '空闲' },
            { id: 7, name: '有机化学实验室', status: '使用中' },
            { id: 8, name: '无机化学实验室', status: '空闲' }
          ]
        },
        { 
          id: 2, 
          name: '计算机类', 
          labs: [
            { id: 3, name: '计算机网络实验室', status: '空闲' },
            { id: 5, name: '软件工程实验室', status: '空闲' },
            { id: 6, name: '数据库实验室', status: '使用中' },
            { id: 9, name: '人工智能实验室', status: '维护中' }
          ]
        },
        { 
          id: 3, 
          name: '电子类', 
          labs: [
            { id: 4, name: '电子电路实验室', status: '维护中' },
            { id: 10, name: '数字信号处理实验室', status: '空闲' }
          ]
        }
      ],
      notifications: [
        { id: 201, type: 'success', title: '预约审核通过', message: '您预约的计算机网络实验室(6月10日 09:00-11:00)已通过审核', time: '2023-06-09 14:30' },
        { id: 202, type: 'warning', title: '预约即将开始', message: '您预约的计算机网络实验室将在30分钟后开始', time: '2023-06-10 08:30' },
        { id: 203, type: 'error', title: '预约被拒绝', message: '您预约的数据库实验室(6月9日 10:00-12:00)被拒绝，原因：时段已被占用', time: '2023-06-08 16:45' }
      ]
    }
  },
  mounted() {
    this.loadNotices()
  },
  methods: {
    loadNotices() {
      this.$request.get('/notice/selectAll').then(res => {
        this.notices = res.data || []
      })
    },
    getStatusClass(status) {
      if (status === '空闲') return 'status-free'
      if (status === '使用中') return 'status-using'
      if (status === '维护中') return 'status-maintenance'
      return ''
    },
    getReserveStatusClass(status) {
      if (status === '已通过') return 'status-approved'
      if (status === '待审核') return 'status-pending'
      if (status === '已拒绝') return 'status-rejected'
      return ''
    },
    getTimelineType(status) {
      if (status === '已通过') return 'success'
      if (status === '待审核') return 'warning'
      if (status === '已拒绝') return 'danger'
      return 'info'
    },
    getNotificationIcon(type) {
      if (type === 'success') return 'el-icon-check'
      if (type === 'warning') return 'el-icon-warning'
      if (type === 'error') return 'el-icon-close'
      return 'el-icon-message'
    },
    goToReserve(labId) {
      // 跳转到预约页面，实际应用中应该跳转到相应的预约表单页面
      this.$message.success('即将跳转到预约页面')
      // this.$router.push(`/reserve/${labId}`)
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

.lab-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.lab-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.5);
}

.lab-info {
  flex: 1;
}

.lab-name {
  font-weight: 500;
}

.lab-type {
  font-size: 12px;
  color: #909399;
}

.lab-status {
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

.status-approved {
  color: #67C23A;
  background-color: rgba(103, 194, 58, 0.1);
}

.status-pending {
  color: #E6A23C;
  background-color: rgba(230, 162, 60, 0.1);
}

.status-rejected {
  color: #F56C6C;
  background-color: rgba(245, 108, 108, 0.1);
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

.reserve-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reserve-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.5);
}

.reserve-lab {
  font-weight: 500;
}

.reserve-time {
  font-size: 12px;
  color: #909399;
}

.lab-status-board {
  width: 100%;
}

.status-summary {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.status-item {
  text-align: center;
}

.lab-type-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.lab-type-item {
  margin-bottom: 10px;
}

.type-name {
  font-weight: 600;
  margin-bottom: 10px;
}

.type-labs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.type-lab-item {
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.5);
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

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notification-item {
  display: flex;
  padding: 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.5);
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
}

.notification-icon.success {
  background-color: rgba(103, 194, 58, 0.1);
  color: #67C23A;
}

.notification-icon.warning {
  background-color: rgba(230, 162, 60, 0.1);
  color: #E6A23C;
}

.notification-icon.error {
  background-color: rgba(245, 108, 108, 0.1);
  color: #F56C6C;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: 500;
  margin-bottom: 5px;
}

.notification-message {
  font-size: 12px;
  color: #606266;
  margin-bottom: 5px;
}

.notification-time {
  font-size: 12px;
  color: #909399;
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
