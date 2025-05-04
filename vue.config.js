const { defineConfig } = require('@vue/cli-service')

// 打印环境变量信息
console.log('=== Vue配置环境变量信息 ===')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('VUE_APP_API_URL:', process.env.VUE_APP_API_URL)
console.log('=== 环境变量信息结束 ===')

module.exports = defineConfig({
  transpileDependencies: true,
  // 部署应用包时的基本URL，默认是'/'
  publicPath: '/',
  // 放置静态资源的目录
  assetsDir: 'static',
  devServer: {
    proxy: {
      '/api': {
        target: process.env.VUE_APP_API_URL || 'http://localhost:10001/api/backend',
        changeOrigin: true,
        pathRewrite: null,
        onProxyReq: (proxyReq, req) => {
          console.log('代理请求:', req.method, req.url)
        },
        onProxyRes: (proxyRes, req) => {
          console.log('代理响应:', proxyRes.statusCode, req.url)
        }
      }
    }
  }
})
