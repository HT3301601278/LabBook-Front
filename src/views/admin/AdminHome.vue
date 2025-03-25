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
        totalLabs: 30,
        totalUsers: 120,
        totalReserves: 450,
        totalFixes: 25
      },
      recentUsers: [
        { id: 1, name: '张三', role: 'STUDENT', avatar: '', createTime: '2023-06-10' },
        { id: 2, name: '李四', role: 'LABADMIN', avatar: '', createTime: '2023-06-09' },
        { id: 3, name: '王五', role: 'STUDENT', avatar: '', createTime: '2023-06-08' },
        { id: 4, name: '赵六', role: 'STUDENT', avatar: '', createTime: '2023-06-07' }
      ],
      pendingReserves: [
        { id: 101, labName: '计算机网络实验室', userName: '张三', date: '2023-06-12', startTime: '09:00', endTime: '11:00' },
        { id: 102, labName: '软件工程实验室', userName: '李四', date: '2023-06-12', startTime: '14:00', endTime: '16:00' }
      ],
      pendingFixes: [
        { id: 201, labName: '电子电路实验室', userName: '王五', description: '示波器无法正常显示', createTime: '2023-06-10' },
        { id: 202, labName: '计算机网络实验室', userName: '赵六', description: '路由器故障', createTime: '2023-06-09' }
      ]
    }
  },
  mounted() {
    this.loadNotices()
    this.initCharts()
  },
  methods: {
    loadNotices() {
      this.$request.get('/notice/selectAll').then(res => {
        this.notices = res.data || []
      })
    },
    initCharts() {
      this.initUserPieChart()
      this.initLabPieChart()
      this.initLabBarChart()
    },
    initUserPieChart() {
      const chartDom = document.getElementById('userPie');
      const myChart = echarts.init(chartDom);
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 10,
          data: ['系统管理员', '实验室管理员', '学生']
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
            data: [
              { value: 5, name: '系统管理员' },
              { value: 15, name: '实验室管理员' },
              { value: 100, name: '学生' }
            ]
          }
        ]
      };
      myChart.setOption(option);
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
              { value: 18, name: '空闲', itemStyle: { color: '#67C23A' } },
              { value: 9, name: '使用中', itemStyle: { color: '#E6A23C' } },
              { value: 3, name: '维护中', itemStyle: { color: '#F56C6C' } }
            ]
          }
        ]
      };
      myChart.setOption(option);
    },
    initLabBarChart() {
      const chartDom = document.getElementById('labBar');
      const myChart = echarts.init(chartDom);
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        xAxis: {
          type: 'category',
          data: ['化学类', '物理类', '计算机类', '电子类', '机械类']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '实验室数量',
            type: 'bar',
            data: [8, 6, 10, 4, 2],
            itemStyle: {
              normal: {
                color: function() {
                  return "#" + Math.floor(Math.random() * (256 * 256 * 256 - 1)).toString(16);
                }
              }
            }
          }
        ]
      };
      myChart.setOption(option);
    },
    getRoleName(role) {
      if (role === 'ADMIN') return '系统管理员'
      if (role === 'LABADMIN') return '实验室管理员'
      if (role === 'STUDENT') return '学生'
      return '未知角色'
    },
    handleReserve(id, action) {
      // 处理预约审核，实际应用中应调用API
      this.$message.success(`已${action === 'approve' ? '通过' : '拒绝'}预约申请`)
      this.pendingReserves = this.pendingReserves.filter(item => item.id !== id)
    },
    handleFix(id) {
      // 处理报修，实际应用中应跳转到报修详情页或调用API
      this.$message.success('已开始处理报修')
      this.pendingFixes = this.pendingFixes.filter(item => item.id !== id)
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