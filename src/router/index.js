import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: {
      title: '登录',
      requiresAuth: false
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: {
      title: '注册',
      requiresAuth: false
    }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('../views/Chat.vue'),
    meta: {
      title: '智能问诊',
      requiresAuth: true
    }
  },
  {
    path: '/video',
    name: 'Video',
    component: () => import('../views/Video.vue'),
    meta: {
      title: '视频解析',
      requiresAuth: true
    }
  },
  {
    path: '/user-center',
    name: 'UserCenter',
    component: () => import('../views/UserCenter.vue'),
    meta: {
      title: '用户中心',
      requiresAuth: true
    }
  },
  {
    path: '/patient-info',
    name: 'PatientInfo',
    component: () => import('../views/PatientInfo.vue'),
    meta: {
      title: '患者信息管理',
      requiresAuth: true
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title || '基于多模态大模型的个性化处方生成系统'
  
  // 检查是否需要身份验证
  if (to.meta.requiresAuth) {
    // 检查用户是否已登录
    const token = localStorage.getItem('token')
    if (!token) {
      // 如果未登录，重定向到登录页
      next({ name: 'Login' })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router 