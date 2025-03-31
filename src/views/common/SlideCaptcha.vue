<template>
  <div class="slide-captcha" :class="{ 'expanded': isExpanded }" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
    <div v-if="!loaded" class="loading">
      加载中...
    </div>
    <div v-else class="captcha-container">
      <div class="expansion-container" v-show="isExpanded">
        <div class="captcha-actions">
          <button class="refresh-button" @click="refreshCaptcha">刷新</button>
          <div class="slider-text success-text" v-if="verified">验证成功</div>
          <div class="slider-text error-text" v-if="verifyFailed">验证失败，请重试</div>
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

      // 计算滑块最大可移动距离
      const maxX = imageWidth - jigsawWidth;

      // 计算滑块位置，确保从图片左边界开始，且能移动到右边界
      const moveRatio = this.moveX / this.maxMoveDistance;
      const left = moveRatio * maxX;

      // 确保位置在有效范围内
      const adjustedLeft = Math.max(0, Math.min(left, maxX));

      return {
        left: adjustedLeft + 'px',
        top: (this.captchaData.y * this.imageScale) + 'px',
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
        // 获取图片实际尺寸
        const imageElement = this.$refs.imageContainer.querySelector('.original-image');
        if (imageElement) {
          // 等待图片加载完成后再获取尺寸
          if (imageElement.complete) {
            this.imageWidth = imageElement.clientWidth;
            this.imageScale = this.imageWidth / this.captchaData.originalWidth;
            this.isImageSizeCalculated = true;
          } else {
            imageElement.onload = () => {
              this.imageWidth = imageElement.clientWidth;
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

          // 如果已经展开，立即更新图片尺寸
          if (this.isExpanded) {
            this.updateImageDimensions();
          }
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
          // 计算拖动比例
          const moveRatio = this.moveX / this.maxMoveDistance;

          // 获取原始图片信息
          const originalWidth = this.captchaData.originalWidth;
          const jigsawWidth = this.captchaData.jigsawWidth;

          // 计算滑块在原始图片上可移动的最大距离
          const maxOriginalX = originalWidth - jigsawWidth;

          // 根据拖动比例计算原始图片上的实际x坐标
          const actualX = Math.round(moveRatio * maxOriginalX);

          if (actualX === null || isNaN(actualX)) {
            throw new Error("无效的X坐标");
          }

          const response = await axios.post(`${this.apiBaseUrl}/verify`, {
            capthatoken: this.captchaData.capthatoken,
            x: actualX,
            y: this.captchaData.y
          });

          if (response.data.success) {
            this.verified = true;
            this.$emit('success');
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
    }
  }
};
</script>

<style scoped>
.slide-captcha {
  width: 300px;
  margin: 0 auto;
  border-radius: 4px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  position: relative;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.slide-captcha.expanded {
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  z-index: 100;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #999;
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
  z-index: 101;
  background-color: #fff;
  border-radius: 4px 4px 0 0;
  box-shadow: 0 -5px 10px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  padding: 0;
}

.image-container {
  width: 100%;
  position: relative;
  overflow: hidden;
  padding: 0;
  box-sizing: border-box;
  max-height: 280px;
  margin: 0;
}

.original-image {
  display: block;
  width: 100%;
  height: auto;
  max-width: 100%;
  object-fit: contain;
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
  filter: drop-shadow(0 0 3px rgba(0, 0, 0, 0.3));
}

.jigsaw-image {
  width: 100%;
  height: 100%;
  user-select: none;
  object-fit: contain;
  background-color: transparent;
  filter: brightness(1.05) contrast(1.05);
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
  height: 40px;
  border-radius: 20px;
  background-color: #f5f5f5;
  overflow: visible;
}

.slider-mask {
  position: absolute;
  height: 100%;
  border-radius: 20px;
  background-color: #d1e9fa;
  left: 0;
  transition: none;
  z-index: 1;
  pointer-events: none;
}

.slider-button {
  position: absolute;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #1890ff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
  user-select: none;
  touch-action: none;
  transform: translateX(0);
  top: 0;
  left: 0;
  z-index: 10;
}

.slider-button-success {
  background-color: #52c41a;
}

.slider-button-error {
  background-color: #f5222d;
}

.slider-icon {
  font-size: 18px;
}

.success-icon, .error-icon {
  font-weight: bold;
}

.slider-text {
  text-align: center;
  margin-top: 8px;
  color: #666;
  font-size: 14px;
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
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px 4px 0 0;
  margin-bottom: 0;
}

.refresh-button {
  background-color: #1890ff;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.refresh-button:hover {
  background-color: #40a9ff;
}
</style>
