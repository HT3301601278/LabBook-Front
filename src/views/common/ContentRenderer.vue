<template>
  <div class="content-renderer">
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">加载失败: {{ error }}</div>
    <div v-else class="rendered-content" v-html="renderedContent"></div>
  </div>
</template>

<script>
import Vue from 'vue';
import MarkdownIt from 'markdown-it';
import Katex from 'katex';
import 'katex/dist/katex.min.css';

export default {
  name: 'ContentRenderer',
  props: {
    jsonFile: {
      type: String,
      required: false
    },
    rawContent: {
      type: String,
      required: false
    }
  },
  data() {
    return {
      content: '',
      loading: true,
      error: null,
      md: new MarkdownIt({
        html: true,
        breaks: true,
        linkify: true,
        typographer: true
      })
    };
  },
  computed: {
    renderedContent() {
      if (!this.content) return '';
      
      // 处理LaTeX内容
      let processedContent = this.content;
      
      // 替换双反斜杠为单反斜杠
      processedContent = processedContent.replace(/\\\\/g, '\\');
      
      // 处理boxed环境
      processedContent = processedContent.replace(/\\boxed\{([\s\S]*?)\}/g, '<div class="boxed">$1</div>');
      
      // 处理显示公式 $$ ... $$
      processedContent = processedContent.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
        try {
          return Katex.renderToString(formula.trim(), { 
            displayMode: true,
            throwOnError: false,
            trust: true
          });
        } catch (e) {
          console.error('LaTeX显示公式渲染错误:', e);
          return `<div class="math-error">LaTeX显示公式渲染错误: ${e.message}</div>`;
        }
      });
      
      // 处理行内公式 $ ... $
      processedContent = processedContent.replace(/\$((?!\$)[\s\S]*?)\$/g, (match, formula) => {
        try {
          return Katex.renderToString(formula.trim(), { 
            displayMode: false,
            throwOnError: false,
            trust: true
          });
        } catch (e) {
          console.error('LaTeX行内公式渲染错误:', e);
          return `<span class="math-error">LaTeX行内公式渲染错误: ${e.message}</span>`;
        }
      });
      
      // 处理 \( ... \) 和 \[ ... \] 格式的公式
      processedContent = processedContent.replace(/\\\(([\s\S]*?)\\\)/g, (match, formula) => {
        try {
          return Katex.renderToString(formula.trim(), { 
            displayMode: false,
            throwOnError: false,
            trust: true
          });
        } catch (e) {
          console.error('LaTeX行内公式渲染错误:', e);
          return `<span class="math-error">LaTeX行内公式渲染错误: ${e.message}</span>`;
        }
      });
      
      processedContent = processedContent.replace(/\\\[([\s\S]*?)\\\]/g, (match, formula) => {
        try {
          return Katex.renderToString(formula.trim(), { 
            displayMode: true,
            throwOnError: false,
            trust: true
          });
        } catch (e) {
          console.error('LaTeX显示公式渲染错误:', e);
          return `<div class="math-error">LaTeX显示公式渲染错误: ${e.message}</div>`;
        }
      });
      
      // 渲染Markdown内容
      return this.md.render(processedContent);
    }
  },
  watch: {
    jsonFile: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.loadContent();
        }
      }
    },
    rawContent: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.content = newVal;
          this.loading = false;
        }
      }
    }
  },
  mounted() {
    // 如果提供了直接内容，则立即处理
    if (this.rawContent) {
      this.content = this.rawContent;
      this.loading = false;
    } else if (this.jsonFile) {
      this.loadContent();
    } else {
      this.error = "没有提供内容或JSON文件路径";
      this.loading = false;
    }
  },
  methods: {
    async loadContent() {
      if (!this.jsonFile) return;
      
      this.loading = true;
      this.error = null;
      
      try {
        const response = await fetch(`/json/${this.jsonFile}`);
        if (!response.ok) {
          throw new Error(`HTTP错误! 状态码: ${response.status}`);
        }
        
        const data = await response.json();
        if (data && data.content) {
          this.content = data.content;
        } else {
          throw new Error('JSON文件中没有content字段');
        }
      } catch (err) {
        console.error('加载内容失败:', err);
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style>
.content-renderer {
  margin: 0;
  padding: 0;
  border-radius: 0;
  background-color: transparent;
  box-shadow: none;
}

.rendered-content {
  font-family: 'Arial', sans-serif;
  line-height: 1.6;
  text-align: left;
}

.rendered-content blockquote {
  margin-left: 0;
  padding-left: 1em;
  border-left: 4px solid #ddd;
  color: #666;
}

.rendered-content code {
  background-color: #f0f0f0;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: monospace;
}

.rendered-content pre {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 5px;
  overflow-x: auto;
}

.rendered-content h1,
.rendered-content h2,
.rendered-content h3,
.rendered-content h4 {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  color: #2c3e50;
}

.rendered-content p {
  margin-bottom: 1em;
}

.rendered-content table {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 1em;
}

.rendered-content th,
.rendered-content td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.rendered-content th {
  background-color: #f2f2f2;
}

.math-error {
  color: red;
  background-color: #ffeeee;
  padding: 5px;
  border-radius: 3px;
  margin: 5px 0;
}

/* 为boxed环境添加样式 */
.boxed {
  border: 1px solid #ccc;
  padding: 15px;
  margin: 10px 0;
  border-radius: 5px;
  background-color: #f7f7f7;
}

/* 添加定理、证明等环境的样式 */
.theorem, .proof, .definition, .example, .note {
  margin: 15px 0;
  padding: 10px 15px;
  border-radius: 5px;
}

.theorem {
  background-color: #e6f7ff;
  border-left: 4px solid #1890ff;
}

.proof {
  background-color: #f6ffed;
  border-left: 4px solid #52c41a;
}

.definition {
  background-color: #fff7e6;
  border-left: 4px solid #fa8c16;
}

.example {
  background-color: #f9f0ff;
  border-left: 4px solid #722ed1;
}

.note {
  background-color: #fff1f0;
  border-left: 4px solid #f5222d;
}

/* 在聊天窗口中使用时的特殊样式 */
.message-markdown .content-renderer {
  margin: 0;
  padding: 0;
  background-color: transparent;
  box-shadow: none;
}

.message-markdown .rendered-content {
  font-size: 14px;
}

.assistant .message-markdown .rendered-content {
  color: #333;
}

.user .message-markdown .rendered-content {
  color: white;
}
</style> 