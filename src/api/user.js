import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/user/info',
    method: 'post'
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}

export function profile(data) {
  return request({
    url: '/user/profile',
    method: 'post',
    data
  })
}

export function password(data) {
  return request({
    url: '/user/password',
    method: 'post',
    data
  })
}
