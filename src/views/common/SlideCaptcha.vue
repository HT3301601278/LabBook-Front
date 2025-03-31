<template>
  <div class="slide-captcha" :class="{ 'expanded': isExpanded }" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
    <div v-if="!loaded" class="loading">
      加载中...
    </div>
    <div v-else class="captcha-container">
      <div class="expansion-container" v-show="isExpanded">
        <div class="captcha-actions">
          <button class="refresh-button" @click="refreshCaptcha">刷新</button>
        </div>
        <div class="image-container" ref="imageContainer">
          <img :src="captchaData.originalImageBase64" class="original-image" />
          <div class="jigsaw-container" :style="jigsawStyle" ref="jigsawContainer">
            <img :src="captchaData.jigsawImageBase64" class="jigsaw-image" />
          </div>
        </div>
      </div>
      <div class="slider-wrapper">
        <div class="slider-container" ref="sliderContainer">
          <div class="slider-track">
            <div class="slider-mask" :style="sliderMaskStyle"></div>
            <div class="slider-button"
                :class="{ 'slider-button-success': verified, 'slider-button-error': verifyFailed }"
                ref="sliderButton"
                @mousedown="handleDragStart"
                @touchstart="handleDragStart">
              <span class="slider-icon" v-if="!verified && !verifyFailed">→</span>
              <span class="slider-icon success-icon" v-if="verified">✓</span>
              <span class="slider-icon error-icon" v-if="verifyFailed">✕</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'SlideCaptcha',
  props: {
    apiBaseUrl: {
      type: String,
      default: 'http://localhost:8080/captcha'
    },
    imageName: {
      type: String,
      default: 'default.jpg'
    },
    useRandomImage: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      captchaData: {},
      loaded: false,
      isDragging: false,
      startX: 0,
      moveX: 0,
      sliderWidth: 0,
      imageWidth: 0,
      imageScale: 1,
      maxMoveDistance: 0,
      verified: false,
      verifyFailed: false,
      isExpanded: false,
      containerWidth: 0,
      isImageSizeCalculated: false
    };
  },
  computed: {
    jigsawStyle() {
      if (!this.captchaData || !this.captchaData.y) {
        return { display: 'none' };
      }

      // 获取图片和滑块的宽度
      const imageWidth = this.imageWidth || 280;
      const jigsawWidth = this.captchaData.jigsawWidth * this.imageScale;
      
      // 计算拼图块的中心位置应该在图片上的哪个位置
      // 移动比例：滑块中心位置(moveX + 滑块宽度/2) / 滑动轨道总宽度
      const sliderButtonWidth = 45; // 滑块宽度
      const sliderCenterX = this.moveX + sliderButtonWidth / 2;
      const moveRatio = sliderCenterX / this.sliderWidth;
      
      // 根据比例计算拼图块的中心应该在的位置
      // 拼图块中心位置 = 图片宽度 * 移动比例
      const jigsawCenterX = imageWidth * moveRatio;
      
      // 计算拼图块左侧的位置 = 中心位置 - 拼图块宽度/2
      const left = jigsawCenterX - jigsawWidth / 2;
      
      // 确保位置在有效范围内
      const maxLeft = imageWidth - jigsawWidth;
      const adjustedLeft = Math.max(0, Math.min(left, maxLeft));
      
      // 添加20px的偏移来补偿滤镜效果带来的视觉差异
      const topOffset = 20;

      return {
        left: adjustedLeft + 'px',
        top: (this.captchaData.y * this.imageScale + topOffset) + 'px',
        width: jigsawWidth + 'px',
        height: (this.captchaData.jigsawHeight * this.imageScale) + 'px',
        display: 'block'
      };
    },
    sliderMaskStyle() {
      const maskWidth = Math.min(this.moveX + 40, this.maxMoveDistance + 40);
      return {
        width: maskWidth + 'px'
      };
    }
  },
  mounted() {
    this.initCaptcha();
    document.addEventListener('mousemove', this.handleDragMove);
    document.addEventListener('mouseup', this.handleDragEnd);
    document.addEventListener('touchmove', this.handleDragMove);
    document.addEventListener('touchend', this.handleDragEnd);
  },
  beforeDestroy() {
    document.removeEventListener('mousemove', this.handleDragMove);
    document.removeEventListener('mouseup', this.handleDragEnd);
    document.removeEventListener('touchmove', this.handleDragMove);
    document.removeEventListener('touchend', this.handleDragEnd);
  },
  methods: {
    handleMouseEnter() {
      this.isExpanded = true;
      this.$nextTick(() => {
        this.updateImageDimensions();
      });
    },

    handleMouseLeave() {
      this.isExpanded = false;
    },

    updateImageDimensions() {
      if (this.$refs.imageContainer && !this.isImageSizeCalculated) {
        // 获取滑动轨道宽度
        if (this.$refs.sliderContainer) {
          this.sliderWidth = this.$refs.sliderContainer.clientWidth;
          // 设置图片容器宽度与滑动轨道宽度一致
          this.$refs.imageContainer.style.width = `${this.sliderWidth}px`;
        }
        
        // 获取图片实际尺寸
        const imageElement = this.$refs.imageContainer.querySelector('.original-image');
        if (imageElement) {
          // 等待图片加载完成后再获取尺寸
          if (imageElement.complete) {
            // 使图片宽度与滑动轨道宽度一致
            this.imageWidth = this.sliderWidth;
            this.imageScale = this.imageWidth / this.captchaData.originalWidth;
            this.isImageSizeCalculated = true;
          } else {
            imageElement.onload = () => {
              // 使图片宽度与滑动轨道宽度一致
              this.imageWidth = this.sliderWidth;
              this.imageScale = this.imageWidth / this.captchaData.originalWidth;
              this.isImageSizeCalculated = true;
            };
          }
        }
      }
    },

    async initCaptcha() {
      this.loaded = false;
      this.verified = false;
      this.verifyFailed = false;
      this.moveX = 0;
      this.isImageSizeCalculated = false;

      // 重置滑块和进度条位置
      if (this.$refs.sliderButton) {
        this.$refs.sliderButton.style.transform = 'translateX(0)';

        const maskElement = this.$refs.sliderContainer?.querySelector('.slider-mask');
        if (maskElement) {
          maskElement.style.width = '40px';
        }
      }

      try {
        let response;
        if (this.useRandomImage) {
          // 使用随机图片端点
          response = await axios.get(`${this.apiBaseUrl}/random`);
        } else {
          // 使用指定图片名称的端点
          response = await axios.get(`${this.apiBaseUrl}/get`, {
            params: { imageName: this.imageName }
          });
        }

        this.captchaData = response.data;
        this.loaded = true;

        this.$nextTick(() => {
          if (this.$refs.sliderContainer) {
            // 计算滑块轨道的实际宽度
            this.sliderWidth = this.$refs.sliderContainer.clientWidth;
            // 调整最大移动距离，确保可以移动到最右侧
            this.maxMoveDistance = this.sliderWidth - 40;
          }

          // 无论是否展开，都先计算并设置图片尺寸
          this.updateImageDimensions();
        });
      } catch (error) {
        console.error('加载验证码失败:', error);
      }
    },
    handleDragStart(event) {
      event.preventDefault();
      if (this.verified) return;

      this.isDragging = true;
      this.startX = event.type === 'touchstart'
        ? event.touches[0].clientX
        : event.clientX;
    },
    handleDragMove(event) {
      if (!this.isDragging) return;

      if (event.preventDefault) event.preventDefault();
      if (event.stopPropagation) event.stopPropagation();

      const currentX = event.type === 'touchmove'
        ? event.touches[0].clientX
        : event.clientX;
      let moveDistance = currentX - this.startX;

      // 限制拖动范围到滑动轨道宽度
      if (moveDistance < 0) {
        moveDistance = 0;
      } else if (moveDistance > this.maxMoveDistance) {
        moveDistance = this.maxMoveDistance;
      }

      this.moveX = moveDistance;

      // 直接设置滑块位置
      if (this.$refs.sliderButton) {
        this.$refs.sliderButton.style.transform = `translateX(${moveDistance}px)`;
        this.$refs.sliderButton.style.transition = 'none';
      }

      // 更新进度条宽度
      const maskElement = this.$refs.sliderContainer.querySelector('.slider-mask');
      if (maskElement) {
        maskElement.style.width = (moveDistance + 40) + 'px';
      }
    },
    async handleDragEnd() {
      if (!this.isDragging) return;
      this.isDragging = false;

      // 只要拖动了一定距离就尝试验证
      if (this.moveX > 10) {
        try {
          // 计算滑块中心的位置比例
          const sliderButtonWidth = 45; // 滑块宽度
          const sliderCenterX = this.moveX + sliderButtonWidth / 2;
          const moveRatio = sliderCenterX / this.sliderWidth;

          // 获取原始图片信息
          const originalWidth = this.captchaData.originalWidth;
          const jigsawWidth = this.captchaData.jigsawWidth;

          // 根据比例计算拼图块中心在原始图片上的位置
          const jigsawCenterX = originalWidth * moveRatio;
          
          // 计算拼图块左侧的位置 = 中心位置 - 拼图块宽度/2
          const actualX = Math.round(jigsawCenterX - jigsawWidth / 2);

          if (actualX === null || isNaN(actualX)) {
            throw new Error("无效的X坐标");
          }

          const response = await axios.post(`${this.apiBaseUrl}/verify`, {
            capthatoken: this.captchaData.capthatoken,
            x: actualX,
            y: this.captchaData.y
          });

          console.log("验证响应:", response.data);

          if (response.data.success) {
            this.verified = true;
            // 在验证成功时，将验证状态保存到captchaData中，使用同一个token进行后续登录
            this.captchaData.verified = true;
            // 发送成功事件，并传递验证码token和状态
            this.$emit('success', this.captchaData.capthatoken);
          } else {
            this.verifyFailed = true;
            this.$emit('fail');
            this.animateReboundAndRefresh();
          }
        } catch (error) {
          console.error('验证失败:', error);
          this.verifyFailed = true;
          this.$emit('fail');
          this.animateReboundAndRefresh();
        }
      } else {
        this.animateRebound();
      }
    },
    animateRebound() {
      const startPosition = this.moveX;
      const duration = 300;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentPosition = startPosition * (1 - easeProgress);

        this.moveX = currentPosition;

        if (this.$refs.sliderButton) {
          this.$refs.sliderButton.style.transform = `translateX(${currentPosition}px)`;
        }

        const maskElement = this.$refs.sliderContainer?.querySelector('.slider-mask');
        if (maskElement) {
          maskElement.style.width = (currentPosition + 40) + 'px';
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    },
    animateReboundAndRefresh() {
      setTimeout(() => {
        this.animateRebound();
        setTimeout(() => {
          this.verifyFailed = false;
          this.refreshCaptcha();
        }, 300);
      }, 800);
    },
    async refreshCaptcha() {
      await this.initCaptcha();
    },
    /**
     * 获取当前验证码token
     */
    getCaptchaToken() {
      return this.captchaData && this.captchaData.capthatoken ? this.captchaData.capthatoken : null;
    }
  }
};
</script>

<style scoped>
.slide-captcha {
  width: 100%;
  margin: 0 auto;
  border-radius: 8px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.08);
  background-color: #fff;
  position: relative;
  transition: all 0.3s ease;
  box-sizing: border-box;
  overflow: visible;
  margin-top: 0;
}

.slide-captcha.expanded {
  box-shadow: 0 0 20px rgba(64, 158, 255, 0.15);
  z-index: 100;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #909399;
  font-size: 14px;
}

.captcha-container {
  position: relative;
  width: 100%;
  box-sizing: border-box;
}

.expansion-container {
  position: absolute;
  width: 100%;
  bottom: 100%;
  left: 0;
  z-index: 1000;
  background-color: #fff;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 -5px 15px rgba(0, 0, 0, 0.15);
  box-sizing: border-box;
  padding: 0;
  animation: fadeIn 0.3s ease;
  transform: translateY(0);
  margin-bottom: 0;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.image-container {
  width: 100%;
  position: relative;
  overflow: hidden;
  padding: 0;
  box-sizing: border-box;
  height: 200px;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.original-image {
  display: block;
  width: 100%;
  height: auto;
  object-fit: cover;
  margin: 0;
  padding: 0;
}

.jigsaw-container {
  position: absolute;
  cursor: pointer;
  box-sizing: border-box;
  overflow: visible;
  pointer-events: none;
  margin: 0;
  padding: 0;
}

.jigsaw-image {
  width: 100%;
  height: 100%;
  user-select: none;
  object-fit: contain;
  background-color: transparent;
}

.slider-wrapper {
  padding: 10px;
  box-sizing: border-box;
}

.slider-container {
  width: 100%;
  position: relative;
  box-sizing: border-box;
}

.slider-track {
  position: relative;
  height: 45px;
  border-radius: 8px;
  background-color: #f5f7fa;
  overflow: visible;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.slider-track::before {
  content: "向右滑动完成验证";
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: #909399;
  font-size: 14px;
  white-space: nowrap;
  z-index: 0;
  opacity: 0.8;
  pointer-events: none;
}

.slider-mask {
  position: absolute;
  height: 100%;
  border-radius: 8px;
  background: linear-gradient(135deg, #d1e9fa 0%, #a8d8ff 100%);
  left: 0;
  transition: none;
  z-index: 1;
  pointer-events: none;
}

.slider-button {
  position: absolute;
  width: 45px;
  height: 45px;
  border-radius: 8px;
  background: linear-gradient(135deg, #409EFF 0%, #3a8ee6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
  user-select: none;
  touch-action: none;
  transform: translateX(0);
  top: 0;
  left: 0;
  z-index: 10;
  transition: background 0.3s, box-shadow 0.3s, transform 0.3s;
}

.slider-button:hover {
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.5);
}

.slider-button-success {
  background: linear-gradient(135deg, #52c41a 0%, #49ad17 100%);
  box-shadow: 0 2px 8px rgba(82, 196, 26, 0.3);
}

.slider-button-error {
  background: linear-gradient(135deg, #f5222d 0%, #e01e2b 100%);
  box-shadow: 0 2px 8px rgba(245, 34, 45, 0.3);
}

.slider-icon {
  font-size: 18px;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.success-icon, .error-icon {
  font-weight: bold;
}

.slider-text {
  text-align: center;
  margin-top: 8px;
  color: #606266;
  font-size: 14px;
  font-weight: 500;
}

.success-text {
  color: #52c41a;
}

.error-text {
  color: #f5222d;
}

.captcha-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: linear-gradient(to right, #f8f9fa, #f0f2f5);
  border-radius: 8px 8px 0 0;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 0;
}

.refresh-button {
  background: linear-gradient(135deg, #409EFF 0%, #3a8ee6 100%);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
  box-shadow: 0 2px 5px rgba(64, 158, 255, 0.2);
}

.refresh-button:hover {
  background: linear-gradient(135deg, #3a8ee6 0%, #409EFF 100%);
  box-shadow: 0 4px 8px rgba(64, 158, 255, 0.3);
  transform: translateY(-1px);
}

.refresh-button:active {
  transform: translateY(1px);
  box-shadow: 0 2px 4px rgba(64, 158, 255, 0.2);
}
</style>
