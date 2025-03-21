<template>
  <div class="model-viewer">
    <div class="controls-panel">
      <div class="toolbar">
        <div class="toolbar-group">
          <button class="toolbar-btn" @click="showLightPanel = !showLightPanel" :class="{ active: showLightPanel }">
            <i class="fas fa-lightbulb"></i>
            <span>光照</span>
          </button>
          <div class="light-panel" v-if="showLightPanel">
            <div class="light-control">
              <label>环境光</label>
              <input type="range" v-model.number="lightSettings.ambientIntensity" min="0" max="2" step="0.1">
            </div>
            <div class="light-control">
              <label>点光源</label>
              <input type="range" v-model.number="lightSettings.pointIntensity" min="0" max="2" step="0.1">
            </div>
            <div class="light-control">
              <label>点光源位置</label>
              <div class="light-presets">
                <button class="preset-btn" @click="setPointLightPreset('top')">顶光</button>
                <button class="preset-btn" @click="setPointLightPreset('front')">前光</button>
                <button class="preset-btn" @click="setPointLightPreset('left')">左侧光</button>
                <button class="preset-btn" @click="setPointLightPreset('right')">右侧光</button>
                <button class="preset-btn" @click="setPointLightPreset('back')">背光</button>
              </div>

              <button class="reset-btn" @click="resetPointLightPosition">重置位置</button>
            </div>
            <div class="light-control">
              <label>平行光</label>
              <input type="range" v-model.number="lightSettings.directionalIntensity" min="0" max="2" step="0.1">
            </div>
            <div class="light-control">
              <label>平行光方向</label>
              <div class="light-presets">
                <button class="preset-btn" @click="setDirectionalLightPreset('top')">顶光</button>
                <button class="preset-btn" @click="setDirectionalLightPreset('front')">前光</button>
                <button class="preset-btn" @click="setDirectionalLightPreset('left')">左侧光</button>
                <button class="preset-btn" @click="setDirectionalLightPreset('right')">右侧光</button>
                <button class="preset-btn" @click="setDirectionalLightPreset('back')">背光</button>
              </div>

              <button class="reset-btn" @click="resetDirectionalLightPosition">重置方向</button>
            </div>
          </div>
        </div>
        <div class="toolbar-group">
          <button class="toolbar-btn" @click="toggleFullscreen">
            <i class="fas" :class="isFullscreen ? 'fa-compress' : 'fa-expand'"></i>
            <span>{{ isFullscreen ? '退出全屏' : '全屏' }}</span>
          </button>
        </div>
      </div>
    </div>
    <div class="model-container" ref="container"></div>
  </div>
</template>

<script>
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';



export default {
  name: 'ModelViewer',
  watch: {
    'lightSettings': {
      deep: true,
      handler() {
        this.updateLights();
      }
    }
  },
  props: {
    modelPath: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      scene: null,
      camera: null,
      renderer: null,
      model: null,
      controls: null,
      ambientLight: null,
      pointLight: null,
      directionalLight: null,
      isFullscreen: false,
      showLightPanel: false,
      lightSettings: {
        ambientIntensity: 0.5,
        pointIntensity: 1.0,
        directionalIntensity: 1.0,
        pointPosition: { x: 2, y: 2, z: 2 },
        directionalPosition: { x: 1, y: 1, z: 1 }
      },
      lightPresets: {
        point: {
          top: { x: 0, y: 5, z: 0 },
          front: { x: 0, y: 0, z: 5 },
          left: { x: -5, y: 0, z: 0 },
          right: { x: 5, y: 0, z: 0 },
          back: { x: 0, y: 0, z: -5 }
        },
        directional: {
          top: { x: 0, y: 1, z: 0 },
          front: { x: 0, y: 0, z: 1 },
          left: { x: -1, y: 0, z: 0 },
          right: { x: 1, y: 0, z: 0 },
          back: { x: 0, y: 0, z: -1 }
        }
      }
    };
  },
  mounted() {
    this.initThree();
    this.loadModel();
    this.animate();
    window.addEventListener('resize', this.onWindowResize);
    document.addEventListener('fullscreenchange', () => {
      this.isFullscreen = !!document.fullscreenElement;
    });
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onWindowResize);
    document.removeEventListener('fullscreenchange', () => {
      this.isFullscreen = !!document.fullscreenElement;
    });
    this.dispose();
  },
  methods: {
    initThree() {
      // 创建场景
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0xf0f0f0);

      // 创建相机
      this.camera = new THREE.PerspectiveCamera(
        75,
        this.$refs.container.clientWidth / this.$refs.container.clientHeight,
        0.1,
        1000
      );
      this.camera.position.z = 5;

      // 创建渲染器
      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setSize(
        this.$refs.container.clientWidth,
        this.$refs.container.clientHeight
      );
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.$refs.container.appendChild(this.renderer.domElement);

      // 添加轨道控制器
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.25;

      // 添加灯光
      this.ambientLight = new THREE.AmbientLight(0xffffff, this.lightSettings.ambientIntensity);
      this.scene.add(this.ambientLight);

      this.pointLight = new THREE.PointLight(0xffffff, this.lightSettings.pointIntensity);
      this.pointLight.position.set(2, 2, 2);
      this.scene.add(this.pointLight);

      this.directionalLight = new THREE.DirectionalLight(0xffffff, this.lightSettings.directionalIntensity);
      this.directionalLight.position.set(1, 1, 1);
      this.scene.add(this.directionalLight);
    },
    loadModel() {
      const loader = new GLTFLoader();
      
      loader.load(
        this.modelPath,
        (gltf) => {
          this.model = gltf.scene;
          
          // 自动调整模型大小和位置
          const box = new THREE.Box3().setFromObject(this.model);
          const size = box.getSize(new THREE.Vector3()).length();
          const center = box.getCenter(new THREE.Vector3());
          
          this.model.position.x = -center.x;
          this.model.position.y = -center.y;
          this.model.position.z = -center.z;
          

          
          this.camera.position.z = size * 2;
          this.camera.lookAt(0, 0, 0);
          
          this.scene.add(this.model);
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
        },
        (error) => {
          console.error('加载模型时出错:', error);
        }
      );
    },
    animate() {
      requestAnimationFrame(this.animate);
      
      if (this.controls) {
        this.controls.update();
      }
      
      this.renderer.render(this.scene, this.camera);
    },
    onWindowResize() {
      if (this.camera && this.renderer) {
        this.camera.aspect = this.$refs.container.clientWidth / this.$refs.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(
          this.$refs.container.clientWidth,
          this.$refs.container.clientHeight
        );
      }
    },
    dispose() {
      if (this.model) {
        this.scene.remove(this.model);
      }
      
      if (this.renderer) {
        this.renderer.dispose();
      }

      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    },
    toggleFullscreen() {
      // 获取整个model-viewer元素而不是仅container
      const modelViewer = this.$el;
      if (!document.fullscreenElement) {
        modelViewer.requestFullscreen();
        this.isFullscreen = true;
      } else {
        document.exitFullscreen();
        this.isFullscreen = false;
      }
    },
    updateLights() {
      if (this.ambientLight) {
        this.ambientLight.intensity = this.lightSettings.ambientIntensity;
      }
      if (this.pointLight) {
        this.pointLight.intensity = this.lightSettings.pointIntensity;
        this.pointLight.position.set(
          this.lightSettings.pointPosition.x,
          this.lightSettings.pointPosition.y,
          this.lightSettings.pointPosition.z
        );
      }
      if (this.directionalLight) {
        this.directionalLight.intensity = this.lightSettings.directionalIntensity;
        this.directionalLight.position.set(
          this.lightSettings.directionalPosition.x,
          this.lightSettings.directionalPosition.y,
          this.lightSettings.directionalPosition.z
        );
        // 更新平行光的方向（从原点指向光源位置）
        this.directionalLight.lookAt(0, 0, 0);
      }
    },
    resetPointLightPosition() {
      this.lightSettings.pointPosition = { x: 2, y: 2, z: 2 };
    },
    resetDirectionalLightPosition() {
      this.lightSettings.directionalPosition = { x: 1, y: 1, z: 1 };
    },
    

    
    setPointLightPreset(preset) {
      const position = this.lightPresets.point[preset];
      this.lightSettings.pointPosition = { ...position };
    },
    
    setDirectionalLightPreset(preset) {
      const position = this.lightPresets.directional[preset];
      this.lightSettings.directionalPosition = { ...position };
    }
  }
};
</script>

<style scoped>
.model-viewer {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.model-container {
  flex: 1;
  width: 100%;
  overflow: hidden;
}

.controls-panel {
  width: 100%;
  background: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  padding: 8px 16px;
}

.toolbar-group {
  display: flex;
  gap: 8px;
  position: relative;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: transparent;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
}

.toolbar-btn:hover {
  background: #f5f5f5;
}

.toolbar-btn.active {
  background: #e3f2fd;
  border-color: #2196f3;
  color: #2196f3;
}

.toolbar-btn i {
  font-size: 16px;
}

.light-panel {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 8px;
  padding: 16px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  min-width: 240px;
}

.light-control {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.light-control:last-child {
  margin-bottom: 0;
}

.light-control label {
  font-size: 14px;
  color: #666;
}

.light-control input[type="range"] {
  width: 100%;
}

.position-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
}

.position-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.position-control span {
  width: 20px;
  font-size: 14px;
  color: #666;
}

.position-control input[type="range"] {
  flex: 1;
}

.position-input {
  width: 60px;
  padding: 2px 4px;
  border: 1px solid #ddd;
  border-radius: 3px;
}

.reset-btn {
  margin-top: 8px;
  padding: 4px 8px;
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 12px;
  cursor: pointer;
  align-self: flex-end;
}

.reset-btn:hover {
  background: #e0e0e0;
}

:fullscreen .model-viewer {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

:fullscreen .model-container {
  width: 100%;
  flex: 1;
}

:fullscreen .controls-panel {
  position: relative;
  z-index: 1000;
}
</style>