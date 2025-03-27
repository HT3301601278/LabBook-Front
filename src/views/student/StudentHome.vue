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
              <div class="status-label">已预约</div>
            </div>
          </div>
          <el-collapse v-model="activeTypes">
            <el-collapse-item v-for="type in labTypes" :key="type.id" :title="type.name" :name="type.id">
              <div class="lab-grid">
                <div v-for="lab in type.labs" 
                  :key="lab.id" 
                  class="lab-grid-item"
                  :class="getStatusClass(lab.status)">
                  <div class="lab-grid-name">{{ lab.name }}</div>
                  <div class="lab-grid-status">{{ lab.status }}</div>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
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
      stats: {
        totalReserve: 0,
        monthReserve: 0,
        pendingReserve: 0,
        approvedReserve: 0
      },
      frequentLabs: [],
      todayReserves: [],
      recentReserves: [],
      labStats: {
        total: 0,
        free: 0,
        using: 0,
        maintenance: 0
      },
      labTypes: [],
      activeTypes: [],
      notifications: [
        { id: 201, type: 'success', title: '预约审核通过', message: '您预约的计算机网络实验室(6月10日 09:00-11:00)已通过审核', time: '2023-06-09 14:30' },
        { id: 202, type: 'warning', title: '预约即将开始', message: '您预约的计算机网络实验室将在30分钟后开始', time: '2023-06-10 08:30' },
        { id: 203, type: 'error', title: '预约被拒绝', message: '您预约的数据库实验室(6月9日 10:00-12:00)被拒绝，原因：时段已被占用', time: '2023-06-08 16:45' }
      ]
    }
  },
  mounted() {
    this.loadNotices()
    this.loadReserveStats()
    this.loadReserveData()
    this.loadLabStats()
  },
  methods: {
    loadNotices() {
      this.$request.get('/notice/selectAll').then(res => {
        this.notices = res.data || []
      })
    },
    loadReserveStats() {
      // 获取所有预约
      this.$request.get('/reserve/selectPage', {
        params: {
          pageNum: 1,
          pageSize: 1000
        }
      }).then(res => {
        if (res.code === '200' && res.data) {
          this.stats.totalReserve = res.data.total
          
          // 计算本月预约数
          const currentMonth = new Date().getMonth() + 1
          const currentYear = new Date().getFullYear()
          this.stats.monthReserve = res.data.list.filter(item => {
            const reserveDate = new Date(item.reserveStartTime)
            return reserveDate.getMonth() + 1 === currentMonth && 
                   reserveDate.getFullYear() === currentYear
          }).length
        }
      })

      // 获取待审核预约数
      this.$request.get('/reserve/selectPage', {
        params: {
          pageNum: 1,
          pageSize: 10,
          status: '待审核'
        }
      }).then(res => {
        if (res.code === '200' && res.data) {
          this.stats.pendingReserve = res.data.total
        }
      })

      // 获取已通过预约数
      this.$request.get('/reserve/selectPage', {
        params: {
          pageNum: 1,
          pageSize: 10,
          status: '已通过'
        }
      }).then(res => {
        if (res.code === '200' && res.data) {
          this.stats.approvedReserve = res.data.total
        }
      })
    },
    loadReserveData() {
      // 获取所有预约数据
      this.$request.get('/reserve/selectPage', {
        params: {
          pageNum: 1,
          pageSize: 1000
        }
      }).then(res => {
        if (res.code === '200' && res.data) {
          const allReserves = res.data.list

          // 处理今日预约
          const today = new Date().toISOString().split('T')[0]
          this.todayReserves = allReserves
            .filter(reserve => reserve.reserveStartTime.startsWith(today))
            .map(reserve => ({
              id: reserve.id,
              labName: reserve.labName,
              startTime: reserve.reserveStartTime.split(' ')[1],
              endTime: reserve.reserveEndTime.split(' ')[1],
              status: reserve.status
            }))

          // 处理近期预约列表（按时间降序排序）
          this.recentReserves = allReserves
            .sort((a, b) => new Date(b.reserveStartTime) - new Date(a.reserveStartTime))
            .slice(0, 4)
            .map(reserve => ({
              id: reserve.id,
              labName: reserve.labName,
              date: reserve.reserveStartTime.split(' ')[0],
              startTime: reserve.reserveStartTime.split(' ')[1],
              endTime: reserve.reserveEndTime.split(' ')[1],
              status: reserve.status
            }))

          // 处理常用实验室（统计实验室使用频次）
          const labFrequency = {}
          allReserves.forEach(reserve => {
            labFrequency[reserve.labId] = labFrequency[reserve.labId] || {
              id: reserve.labId,
              name: reserve.labName,
              count: 0
            }
            labFrequency[reserve.labId].count++
          })

          // 转换为数组并按使用频次降序排序，取前3个
          this.frequentLabs = Object.values(labFrequency)
            .sort((a, b) => b.count - a.count)
            .slice(0, 3)
            .map(lab => ({
              id: lab.id,
              name: lab.name,
              typeName: '常用',
              status: '空闲' // 这里需要从另一个API获取实验室实时状态
            }))
        }
      })
    },
    loadLabStats() {
      this.$request.get('/lab/selectPage', {
        params: {
          pageNum: 1,
          pageSize: 1000
        }
      }).then(res => {
        if (res.code === '200' && res.data && res.data.page) {
          const labs = res.data.page.list
          
          // 更新实验室统计数据
          this.labStats.total = labs.length
          this.labStats.free = labs.filter(lab => lab.usageStatus === '空闲中').length
          this.labStats.using = labs.filter(lab => lab.usageStatus === '使用中').length
          this.labStats.maintenance = labs.filter(lab => lab.usageStatus === '已预约').length

          // 按类型分组实验室
          const typeMap = new Map()
          labs.forEach(lab => {
            if (!typeMap.has(lab.typeId)) {
              typeMap.set(lab.typeId, {
                id: lab.typeId,
                name: lab.typeName,
                labs: []
              })
            }
            typeMap.get(lab.typeId).labs.push({
              id: lab.id,
              name: lab.labName,
              status: lab.usageStatus === '空闲中' ? '空闲' : 
                     lab.usageStatus === '使用中' ? '使用中' : '维护中'
            })
          })
          
          // 转换为数组
          this.labTypes = Array.from(typeMap.values())
        }
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

/* 添加滚动容器样式 */
.lab-status-board .el-collapse {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 10px;
}

/* 自定义滚动条样式 */
.lab-status-board .el-collapse::-webkit-scrollbar {
  width: 6px;
}

.lab-status-board .el-collapse::-webkit-scrollbar-thumb {
  background-color: rgba(144, 147, 153, 0.3);
  border-radius: 3px;
}

.lab-status-board .el-collapse::-webkit-scrollbar-track {
  background-color: transparent;
}

.lab-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  padding: 10px 0;
}

.lab-grid-item {
  padding: 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
}

.lab-grid-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.lab-grid-name {
  font-weight: 500;
  margin-bottom: 5px;
}

.lab-grid-status {
  font-size: 12px;
}

.lab-grid-item.status-free {
  background: rgba(103, 194, 58, 0.1);
  color: #67C23A;
}

.lab-grid-item.status-using {
  background: rgba(230, 162, 60, 0.1);
  color: #E6A23C;
}

.lab-grid-item.status-maintenance {
  background: rgba(245, 108, 108, 0.1);
  color: #F56C6C;
}

/* 自定义折叠面板样式 */
.lab-status-board /deep/ .el-collapse {
  border: none;
}

.lab-status-board /deep/ .el-collapse-item__header {
  font-size: 16px;
  font-weight: 500;
  color: #2c3e50;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding: 15px 0;
}

.lab-status-board /deep/ .el-collapse-item__content {
  padding: 15px 0;
}

.lab-status-board /deep/ .el-collapse-item__wrap {
  border-bottom: none;
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
