import http from './http'

// 用户登录
export function login(data) {
  return http.post('v1/auth/login', data)
}

// 用户注册
export function register(data) {
  return http.post('v1/auth/register', data)
}

// 获取用户信息
export function getUserInfo() {
  return http.get('v1/user/info')
}

// 退出登录
export function logout() {
  return http.post('v1/auth/logout')
} 