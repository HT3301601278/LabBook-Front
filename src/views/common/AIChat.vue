<template>
  <div class="ai-chat-container" v-if="visible">
    <div class="ai-chat-header">
      <div class="ai-chat-title">
        <img src="../../assets/imgs/deepseek.svg" class="chat-icon" />
        <span>智能助手</span>
      </div>
      <div class="ai-chat-actions">
        <el-button type="text" icon="el-icon-minus" @click="minimize" v-if="!isMinimized"></el-button>
        <el-button type="text" icon="el-icon-plus" @click="restore" v-else></el-button>
        <el-button type="text" icon="el-icon-close" @click="close"></el-button>
      </div>
    </div>
    <div class="ai-chat-body" v-show="!isMinimized">
      <div class="ai-chat-messages" ref="messagesContainer">
        <div v-for="(message, index) in messages" :key="index" :class="['message', message.role]">
          <div class="message-avatar">
            <img :src="message.role === 'user' ? (user.avatar || defaultAvatar) : botAvatar" />
          </div>
          <div class="message-content">
            <div class="message-text" v-html="formatMessage(message.content)"></div>
            <div class="message-time">{{ message.time }}</div>
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
</template>

<script>
export default {
  name: "AIChat",
  data() {
    return {
      visible: false,
      isMinimized: false,
      userInput: "",
      isTyping: false,
      messages: [],
      defaultAvatar: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
      botAvatar: require("@/assets/imgs/deepseek.svg"),
      apiKey: process.env.VUE_APP_OPENROUTER_API_KEY || "",
      user: JSON.parse(localStorage.getItem('labuser') || '{}')
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
    minimize() {
      this.isMinimized = true;
    },
    restore() {
      this.isMinimized = false;
    },
    formatMessage(content) {
      // 简单的文本格式化，可以处理换行和链接
      return content
        .replace(/\n/g, "<br>")
        .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
    },
    getCurrentTime() {
      const now = new Date();
      return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    },
    addUserMessage(content) {
      this.messages.push({
        role: "user",
        content: content,
        time: this.getCurrentTime()
      });
      this.scrollToBottom();
    },
    addBotMessage(content) {
      this.messages.push({
        role: "assistant",
        content: content,
        time: this.getCurrentTime()
      });
      this.scrollToBottom();
    },
    scrollToBottom() {
      this.$nextTick(() => {
        if (this.$refs.messagesContainer) {
          this.$refs.messagesContainer.scrollTop = this.$refs.messagesContainer.scrollHeight;
        }
      });
    },
    async sendMessage() {
      if (!this.userInput.trim()) return;

      const userMessage = this.userInput.trim();
      this.addUserMessage(userMessage);
      this.userInput = "";
      this.isTyping = true;

      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
            "HTTP-Referer": window.location.origin,
            "X-Title": "实验室预约系统",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "model": "deepseek/deepseek-r1-zero:free",
            "messages": this.messages.map(msg => ({
              role: msg.role,
              content: msg.content
            }))
          })
        });

        const data = await response.json();

        if (data.choices && data.choices.length > 0) {
          const botResponse = data.choices[0].message.content;
          this.addBotMessage(botResponse);
        } else {
          this.addBotMessage("抱歉，我无法获取回复。请稍后再试。");
        }
      } catch (error) {
        console.error("AI聊天错误:", error);
        this.addBotMessage("连接出错，请检查网络连接或API配置。");
      } finally {
        this.isTyping = false;
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
  height: 450px;
  display: flex;
  flex-direction: column;
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

.message-time {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 4px;
  font-weight: 500;
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
</style>
