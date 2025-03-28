const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 8081,
    host: 'localhost',
    client: {
      webSocketURL: 'ws://localhost:8081/ws'
    },
    proxy: {
      '/': {
        target: 'http://localhost:8080',  // 后端服务器地址
        changeOrigin: true
      }
    }
  },
  chainWebpack: config =>{
    config.plugin('html')
        .tap(args => {
          args[0].title = "实验室预约管理系统";
          return args;
        })
  }
})
