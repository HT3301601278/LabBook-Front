<template>
  <div class="error-container">
    <div id="particles-js" class="particles"></div>
    <div class="error-box">
      <div class="error-content">
        <i class="el-icon-question error-icon"></i>
        <h1 class="error-title">404</h1>
        <p class="error-message">抱歉，找不到您请求的页面</p>
        <router-link to="/" class="back-home">
          <el-button type="primary" class="home-button">
            <i class="el-icon-house"></i>
            返回首页
          </el-button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "404",
  data() {
    return {}
  },
  created() {
    // 初始化粒子效果
    if (window.particlesJS) {
      window.particlesJS('particles-js', {
        particles: {
          number: {
            value: 80,
            density: {
              enable: true,
              value_area: 800
            }
          },
          color: {
            value: '#FF6B6B'
          },
          shape: {
            type: 'circle'
          },
          opacity: {
            value: 0.5,
            random: false
          },
          size: {
            value: 3,
            random: true
          },
          line_linked: {
            enable: true,
            distance: 150,
            color: '#FF6B6B',
            opacity: 0.4,
            width: 1
          },
          move: {
            enable: true,
            speed: 6,
            direction: 'none',
            random: false,
            straight: false,
            out_mode: 'out',
            bounce: false
          }
        },
        interactivity: {
          detect_on: 'canvas',
          events: {
            onhover: {
              enable: true,
              mode: 'repulse'
            },
            onclick: {
              enable: true,
              mode: 'push'
            },
            resize: true
          }
        },
        retina_detect: true
      })
    }
  },
  methods: {}
}
</script>

<style scoped>
.error-container {
  height: 100vh;
  width: 100vw;
  position: relative;
  overflow: hidden;
  background: #f0f2f5;
}

.particles {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.error-box {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-content {
  text-align: center;
  padding: 40px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.error-icon {
  font-size: 80px;
  color: #FF6B6B;
  margin-bottom: 20px;
}

.error-title {
  font-size: 72px;
  color: #FF6B6B;
  margin: 0;
  font-weight: bold;
}

.error-message {
  font-size: 24px;
  color: #606266;
  margin: 20px 0 30px;
}

.back-home {
  text-decoration: none;
}

.home-button {
  padding: 12px 30px;
  font-size: 16px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.home-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

.home-button i {
  margin-right: 8px;
}
</style>