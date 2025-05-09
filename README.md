# 基于多模态大模型的个性化处方生成系统

这是一个基于 Vue.js 3 开发的医疗健康领域的前端应用程序，主要功能是利用多模态大模型生成个性化处方。

## 功能特点

- 用户认证：登录和注册功能
- 聊天界面：与大模型进行实时对话，支持文本、图片和文件上传

## 技术栈

- Vue 3.2.13
- Vue Router 4.x
- Pinia 状态管理
- Element Plus UI 组件库
- Axios HTTP 客户端
- SCSS 样式预处理

## 项目设置
```
npm install
```

### 开发环境编译和热更新
```
npm run serve
```

### 生产环境编译和压缩
```
npm run build
```

### 代码质量检查和修复
```
npm run lint
```

## 项目结构

```
src/
  |-- api/         # API 请求
  |-- assets/      # 静态资源
  |-- components/  # 组件
  |     |-- chat/    # 聊天相关组件
  |     |-- common/  # 通用组件
  |-- router/      # 路由配置
  |-- store/       # 状态管理
  |-- utils/       # 工具函数
  |-- views/       # 页面视图
  |-- App.vue      # 根组件
  |-- main.js      # 入口文件
```

## 主要功能页面

1. 登录/注册页面 - 用户认证
2. 聊天界面 - 与大模型交互，上传各类资料
3. 患者信息管理 - 管理患者信息和病历
4. 运动康复处方生成 - 生成个性化康复处方

## API 接口

应用程序默认连接到 `http://localhost:10001/api/backend` 的后端服务，可以通过设置环境变量 `VUE_APP_API_URL` 来更改。
