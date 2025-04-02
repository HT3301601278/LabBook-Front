<template>
  <div>
    <!-- 完整聊天窗口 -->
    <div class="ai-chat-container" v-if="visible && !isMinimized" :class="{'resizing': isResizing}" ref="chatContainer">
      <div class="resize-handle" @mousedown="startResize"></div>
      <div class="ai-chat-header">
        <div class="ai-chat-title">
          <img src="../../assets/imgs/deepseek.svg" class="chat-icon" />
          <span>智能助手</span>
        </div>
        <div class="ai-chat-actions">
          <el-button type="text" icon="el-icon-delete" @click="clearChat" title="清空聊天"></el-button>
          <el-button type="text" icon="el-icon-minus" @click="minimize"></el-button>
          <el-button type="text" icon="el-icon-close" @click="close"></el-button>
        </div>
      </div>
      <div class="ai-chat-body">
        <div class="ai-chat-messages" ref="messagesContainer">
          <div v-for="(message, index) in messages" :key="index" :class="['message', message.role]">
            <div class="message-avatar">
              <img :src="message.role === 'user' ? (user.avatar || defaultAvatar) : botAvatar" />
            </div>
            <div class="message-content">
              <template v-if="message.role === 'assistant' && message.thoughts">
                <div class="thoughts-toggle" @click="toggleThoughts(index)">
                  <i :class="['toggle-icon', message.showThoughts ? 'el-icon-arrow-down' : 'el-icon-arrow-right']"></i>
                  <span>已深度思考（用时 {{ message.thinkingTime || '?' }} 秒）</span>
                </div>
                <div class="message-thoughts" v-if="message.showThoughts">{{ message.thoughts }}</div>
              </template>
              <div class="message-text" v-if="!message.hasMarkdown">{{ message.content }}</div>
              <content-renderer v-else :rawContent="message.content" class="message-markdown"></content-renderer>
              <div class="message-footer">
                <div class="message-time">{{ message.time }}</div>
                <div class="message-actions">
                  <el-tooltip 
                    :content="message.role === 'assistant' ? '复制为Markdown' : '复制文本'" 
                    placement="top" 
                    :open-delay="500"
                  >
                    <el-button type="text" icon="el-icon-document-copy" size="mini" @click="copyMessage(message)"></el-button>
                  </el-tooltip>
                </div>
              </div>
            </div>
          </div>
          <div class="ai-typing" v-if="isTyping">AI正在思考...</div>
        </div>
        <div class="ai-chat-input">
          <el-input
            type="textarea"
            v-model="userInput"
            placeholder="请输入您的问题..."
            :rows="2"
            resize="none"
            @keyup.enter.native.exact="sendMessage"
          ></el-input>
          <el-button type="primary" icon="el-icon-s-promotion" @click="sendMessage" :loading="isTyping">发送</el-button>
        </div>
      </div>
    </div>

    <!-- 最小化为小球，使用独立的DOM元素，不复用聊天窗口 -->
    <div v-if="visible && isMinimized" class="ai-chat-bubble" @click="restore">
      <img src="../../assets/imgs/deepseek.svg" alt="AI助手" />
    </div>
  </div>
</template>

<script>
import ContentRenderer from './ContentRenderer.vue';

export default {
  name: "AIChat",
  components: {
    ContentRenderer
  },
  data() {
    return {
      visible: false,
      isMinimized: false,
      userInput: "",
      isTyping: false,
      messages: [],
      defaultAvatar: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
      botAvatar: require("@/assets/imgs/deepseek.svg"),
      apiKey: "sk-0893b211cd1c44448a5d14723273205b",
      user: JSON.parse(localStorage.getItem('labuser') || '{}'),
      isResizing: false,
      initialWidth: 0,
      initialHeight: 0,
      initialX: 0,
      initialY: 0,
      chatHistory: [
        {
          role: "system",
          content: "你是一个智能助手"
        }
      ]
    };
  },
  watch: {
    'localStorage.labuser': {
      handler() {
        this.user = JSON.parse(localStorage.getItem('labuser') || '{}');
      },
      deep: true
    }
  },
  methods: {
    show() {
      this.visible = true;
      if (this.messages.length === 0) {
        this.addBotMessage("您好！我是实验室预约系统的智能助手，有什么可以帮助您的吗？");
      }
    },
    close() {
      this.visible = false;
    },
    clearChat() {
      // 清空聊天历史
      this.messages = [];
      this.chatHistory = [
        {
          role: "system",
          content: "你是一个智能助手"
        }
      ];
      // 添加欢迎消息
      this.addBotMessage("聊天已清空。有什么可以帮助您的吗？");
    },
    minimize() {
      // 在最小化之前清除所有可能影响小球样式的内联样式
      this.isMinimized = true;
      // 确保在下一个渲染周期完成后，聊天窗口的样式被完全清除
      this.$nextTick(() => {
        if (this.$refs.chatContainer) {
          // 重置可能影响样式的属性
          this.$refs.chatContainer.style = null;
        }
      });
    },
    restore() {
      this.isMinimized = false;
      // 恢复后确保滚动到消息底部
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },
    formatMessage(content) {
      return content;
    },
    parseMarkdown(text) {
      return text;
    },
    getCurrentTime() {
      const now = new Date();
      return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    },
    addUserMessage(content) {
      const userMessage = {
        role: "user",
        content: content,
        hasMarkdown: false, // 用户消息一般不含Markdown
        time: this.getCurrentTime()
      };
      this.messages.push(userMessage);
      // 将用户消息添加到API历史记录
      this.chatHistory.push({
        role: "user",
        content: content
      });
      this.scrollToBottom();
    },
    addBotMessage(content, reasoning = null, thinkingTime = null) {
      // 检查内容是否包含Markdown或LaTeX格式
      const hasMarkdown = this.checkForMarkdown(content);
      
      const botMessage = {
        role: "assistant",
        content: content,
        thoughts: reasoning,
        thinkingTime: thinkingTime,
        showThoughts: false,
        hasMarkdown: hasMarkdown, // 添加标记是否包含Markdown
        time: this.getCurrentTime()
      };
      this.messages.push(botMessage);
      // 将AI回复添加到API历史记录（如果不是欢迎消息）
      if (this.chatHistory.length > 1 || this.chatHistory[0].role !== "system") {
        this.chatHistory.push({
          role: "assistant",
          content: content
        });
      }
      this.scrollToBottom();
    },
    // 检查文本是否包含Markdown或LaTeX格式
    checkForMarkdown(text) {
      // 检查常见的Markdown语法
      const markdownPatterns = [
        /#{1,6}\s+.+/,           // 标题
        /\*\*.+\*\*/,            // 粗体
        /\*.+\*/,                // 斜体
        /\[.+\]\(.+\)/,          // 链接
        /!\[.+\]\(.+\)/,         // 图片
        /```[\s\S]*?```/,        // 代码块
        /`[^`]+`/,               // 行内代码
        /^\s*>\s+.+/m,           // 引用
        /^\s*[-*+]\s+.+/m,       // 无序列表
        /^\s*\d+\.\s+.+/m,       // 有序列表
        /\|\s*[^|]+\s*\|/,       // 表格
        /\$\$.+\$\$/s,           // LaTeX块公式
        /\$.+\$/,                // LaTeX行内公式
        /\\begin\{.+?\}[\s\S]*?\\end\{.+?\}/  // LaTeX环境
      ];

      // 检查文本是否匹配任一模式
      return markdownPatterns.some(pattern => pattern.test(text));
    },
    scrollToBottom() {
      this.$nextTick(() => {
        if (this.$refs.messagesContainer) {
          this.$refs.messagesContainer.scrollTop = this.$refs.messagesContainer.scrollHeight;
        }
      });
    },
    toggleThoughts(index) {
      if (this.messages[index] && this.messages[index].thoughts) {
        this.$set(this.messages[index], 'showThoughts', !this.messages[index].showThoughts);
      }
    },
    async sendMessage() {
      if (!this.userInput.trim()) return;

      const userMessage = this.userInput.trim();
      this.addUserMessage(userMessage);
      this.userInput = "";
      this.isTyping = true;
      
      const startTime = new Date();

      try {
        // 使用新的API和请求格式
        const response = await fetch("https://api.deepseek.com/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "model": "deepseek-reasoner",
            "messages": this.chatHistory,
            "stream": false
          })
        });

        const data = await response.json();
        const endTime = new Date();
        const thinkingTime = Math.round((endTime - startTime) / 1000);
        
        if (data.choices && data.choices.length > 0) {
          const choice = data.choices[0];
          const message = choice.message;
          let botResponse = message.content;
          // 更新思考过程字段名称
          const reasoning = message.reasoning_content;
          
          // 保存原始回复内容到聊天历史
          this.chatHistory.push({
            role: "assistant",
            content: botResponse
          });
          
          // 检查内容是否包含Markdown或LaTeX
          const hasMarkdown = this.checkForMarkdown(botResponse);
          
          // 如果有思考过程，则显示
          if (reasoning) {
            // 直接使用原始回复内容添加到消息显示列表
            this.messages.push({
              role: "assistant",
              content: botResponse,
              thoughts: reasoning,
              thinkingTime: thinkingTime,
              showThoughts: false,
              hasMarkdown: hasMarkdown,
              time: this.getCurrentTime()
            });
          } else {
            // 直接使用原始回复内容添加到消息显示列表
            this.messages.push({
              role: "assistant",
              content: botResponse,
              hasMarkdown: hasMarkdown,
              time: this.getCurrentTime()
            });
          }
          this.scrollToBottom();
        } else {
          const errorMsg = "抱歉，我无法获取回复。请稍后再试。";
          this.messages.push({
            role: "assistant",
            content: errorMsg,
            hasMarkdown: false,
            time: this.getCurrentTime()
          });
          this.chatHistory.push({
            role: "assistant",
            content: errorMsg
          });
          this.scrollToBottom();
        }
      } catch (error) {
        console.error("AI聊天错误:", error);
        const errorMsg = "连接出错，请检查网络连接或API配置。";
        this.messages.push({
          role: "assistant",
          content: errorMsg,
          hasMarkdown: false,
          time: this.getCurrentTime()
        });
        this.chatHistory.push({
          role: "assistant",
          content: errorMsg
        });
        this.scrollToBottom();
      } finally {
        this.isTyping = false;
      }
    },
    startResize(e) {
      if (this.isMinimized) return;
      
      this.isResizing = true;
      
      // 直接引用DOM元素
      const container = this.$refs.chatContainer;
      
      // 存储初始信息
      this.initialWidth = container.offsetWidth;
      this.initialHeight = container.offsetHeight;
      this.initialX = e.clientX;
      this.initialY = e.clientY;
      
      // 添加鼠标移动和鼠标释放事件监听
      document.addEventListener('mousemove', this.handleMouseMove);
      document.addEventListener('mouseup', this.stopResize);
      
      // 取消默认行为
      e.preventDefault();
    },
    
    handleMouseMove(e) {
      if (!this.isResizing) return;
      
      // 使用requestAnimationFrame让动画更平滑
      window.requestAnimationFrame(() => this.doResize(e));
    },
    
    doResize(e) {
      if (!this.isResizing) return;
      
      const container = this.$refs.chatContainer;
      if (!container) return;
      
      // 计算鼠标移动的距离 - 反向计算使得拖动更直观
      const dx = this.initialX - e.clientX;
      const dy = this.initialY - e.clientY;
      
      // 直接计算新宽高
      const newWidth = Math.min(Math.max(300, this.initialWidth + dx), window.innerWidth * 0.8);
      const newHeight = Math.min(Math.max(400, this.initialHeight + dy), window.innerHeight * 0.8);
      
      // 直接设置样式，不经过计算
      container.style.width = `${newWidth}px`;
      container.style.height = `${newHeight}px`;
    },
    
    stopResize() {
      this.isResizing = false;
      
      // 移除事件监听
      document.removeEventListener('mousemove', this.handleMouseMove);
      document.removeEventListener('mouseup', this.stopResize);
    },
    copyMessage(message) {
      let textToCopy = message.content;
      
      // 如果是AI回复，保持其原始markdown格式
      // 用户消息直接使用文本内容
      
      // 创建一个临时文本区域来执行复制
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      
      try {
        document.execCommand('copy');
        this.$message({
          message: message.role === 'assistant' ? 'Markdown格式已复制到剪贴板' : '文本已复制到剪贴板',
          type: 'success',
          duration: 1500
        });
      } catch (err) {
        this.$message({
          message: '复制失败',
          type: 'error',
          duration: 1500
        });
      } finally {
        document.body.removeChild(textArea);
      }
    }
  }
};
</script>

<style scoped>
.ai-chat-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 380px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #e8e8e8;
  transition: all 0.3s ease;
  resize: none; /* 移除默认的resize属性 */
  min-width: 300px; /* 最小宽度 */
  min-height: 400px; /* 最小高度 */
  max-width: 80vw; /* 最大宽度为视口宽度的80% */
  max-height: 80vh; /* 最大高度为视口高度的80% */
  transform-origin: bottom right;
  animation: fade-in 0.25s ease;
}

.ai-chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
  color: white;
  cursor: pointer;
}

.ai-chat-title {
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
}

.chat-icon {
  width: 22px;
  height: 22px;
  margin-right: 10px;
  filter: brightness(0) invert(1); /* 将SVG图标转为白色 */
}

.ai-chat-actions .el-button {
  color: white;
  padding: 0 5px;
  transition: transform 0.2s;
}

.ai-chat-actions .el-button:hover {
  transform: scale(1.1);
}

.ai-chat-body {
  height: auto; /* 从固定高度改为自适应 */
  flex: 1; /* 填满剩余空间 */
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 防止溢出 */
  min-height: 200px; /* 最小高度 */
}

.ai-chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 18px;
  background-color: #f8fafc;
  scroll-behavior: smooth;
}

.message {
  display: flex;
  margin-bottom: 16px;
  max-width: 85%;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.message-avatar img {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  margin-right: 10px;
  object-fit: cover;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.user {
  margin-left: auto;
  flex-direction: row-reverse;
}

.user .message-avatar img {
  margin-right: 0;
  margin-left: 10px;
}

.user .message-content {
  align-items: flex-end;
}

.message-content {
  display: flex;
  flex-direction: column;
}

.message-text {
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.6;
  background-color: white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  max-width: 100%;
  word-break: break-word;
}

/* ContentRenderer相关样式 */
.message-markdown {
  width: 100%;
}

.message-markdown >>> .content-renderer {
  margin: 0;
  padding: 12px 16px;
  border-radius: 18px;
  background-color: white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}

.assistant .message-markdown >>> .content-renderer {
  border-top-left-radius: 4px;
  background-color: #f0f4ff;
  color: #333;
  border-left: 3px solid #cbd5e1;
}

.user .message-markdown >>> .content-renderer {
  border-top-right-radius: 4px;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
}

.user .message-markdown >>> .rendered-content {
  color: white;
}

.message-markdown >>> .rendered-content {
  margin: 0;
  padding: 0;
}

.message-markdown >>> .rendered-content pre {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.user .message-markdown >>> .rendered-content pre {
  background-color: rgba(255, 255, 255, 0.1);
}

.assistant .message-text {
  border-top-left-radius: 4px;
  background-color: #f0f4ff;
  color: #333;
  border-left: 3px solid #cbd5e1;
}

.user .message-text {
  border-top-right-radius: 4px;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  color: white;
}

.message-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.message-time {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 500;
}

.message-actions {
  display: flex;
  align-items: center;
}

.message-actions .el-button {
  padding: 0;
  margin-left: 5px;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.message-actions .el-button:hover {
  opacity: 1;
  color: #3b82f6;
}

.message:hover .message-actions {
  visibility: visible;
  opacity: 1;
}

.message .message-actions {
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.2s;
}

.ai-typing {
  font-size: 13px;
  color: #64748b;
  font-style: italic;
  padding: 8px 16px;
  display: flex;
  align-items: center;
}

.ai-typing:before {
  content: '';
  width: 8px;
  height: 8px;
  margin-right: 6px;
  background-color: #3b82f6;
  border-radius: 50%;
  display: inline-block;
  animation: pulse 1.5s infinite ease-in-out;
}

@keyframes pulse {
  0% { transform: scale(0.8); opacity: 0.5; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(0.8); opacity: 0.5; }
}

.ai-chat-input {
  padding: 14px;
  border-top: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  background-color: #fff;
  gap: 10px;
  flex-shrink: 0; /* 防止输入区域被压缩 */
}

.ai-chat-input .el-textarea {
  flex: 1;
}

.ai-chat-input .el-textarea >>> .el-textarea__inner {
  border-radius: 18px;
  padding: 8px 14px;
  border-color: #e2e8f0;
  resize: none;
  transition: all 0.3s;
  line-height: 1.5;
  color: #000000;
  font-size: 14px;
  font-weight: 750;  /* 增加文字粗细 */
}

.ai-chat-input .el-textarea >>> .el-textarea__inner::placeholder {
  color: #94a3b8;
  font-weight: 400;  /* 保持占位符文字正常粗细 */
}

.ai-chat-input .el-textarea >>> .el-textarea__inner:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
}

.ai-chat-input .el-button {
  border-radius: 12px;
  height: 40px;
  min-width: 40px;
  padding: 0 15px;
  font-weight: 600;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  border: none;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-chat-input .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.3);
}

.ai-chat-input .el-button:active {
  transform: translateY(0);
}

.ai-chat-container:after {
  display: none;
}

/* 添加左上角的resize手柄 */
.resize-handle {
  position: absolute;
  left: 0;
  top: 0;
  width: 20px; /* 增大点击区域 */
  height: 20px; /* 增大点击区域 */
  background: linear-gradient(315deg, transparent 50%, #3b82f6 50%);
  border-top-left-radius: 12px;
  cursor: nwse-resize;
  z-index: 10;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.resize-handle:hover, .resizing .resize-handle {
  opacity: 1;
}

/* 调整最小化状态时的样式 */
.ai-chat-container.minimized {
  display: none;
}

/* 拖动时的样式 */
.ai-chat-container.resizing {
  transition: none; /* 拖动时取消过渡效果 */
  user-select: none; /* 防止文本选择 */
}

.thoughts-toggle {
  display: flex;
  align-items: center;
  padding: 6px 10px;
  margin-bottom: 8px;
  background-color: #f1f5f9;
  border-radius: 12px;
  font-size: 12px;
  color: #64748b;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
}

.thoughts-toggle:hover {
  background-color: #e2e8f0;
}

.toggle-icon {
  margin-right: 5px;
  font-size: 12px;
  transition: transform 0.2s;
}

.message-thoughts {
  padding: 10px 12px;
  margin-bottom: 10px;
  background-color: #f8fafc;
  border-left: 2px solid #cbd5e1;
  border-radius: 6px;
  font-size: 13px;
  color: #64748b;
  white-space: pre-wrap;
  line-height: 1.5;
  animation: fadeIn 0.3s ease;
}

/* 小球样式 - 确保没有继承属性 */
.ai-chat-bubble {
  position: fixed !important;
  bottom: 20px !important;
  right: 20px !important;
  width: 60px !important;
  height: 60px !important;
  border-radius: 50% !important;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%) !important;
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.3) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  z-index: 9999 !important;
  transition: transform 0.3s, box-shadow 0.3s !important;
  animation: bubble-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
  
  /* 重置可能影响的属性 */
  margin: 0 !important;
  padding: 0 !important;
  transform: none !important;
  min-width: auto !important;
  min-height: auto !important;
  max-width: none !important;
  max-height: none !important;
  border: none !important;
  overflow: visible !important;
  resize: none !important;
}

/* 小球内图标样式 */
.ai-chat-bubble img {
  width: 48px !important;
  height: 48px !important;
  filter: brightness(0) invert(1) !important; /* 使图标反色为白色 */
  object-fit: contain !important;
}

/* 确保小球悬停效果正常工作 */
.ai-chat-bubble:hover {
  transform: scale(1.1) !important;
  box-shadow: 0 6px 16px rgba(30, 58, 138, 0.4) !important;
}

/* 添加气泡动画 */
@keyframes bubble-in {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* 窗口显示隐藏动画 */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
