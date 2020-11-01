import request from '@/utils/request'

export function page(data) {
  return request({
    url: '/content/page',
    method: 'post',
    data
  })
}

export function updateStatus(data) {
  return request({
    url: '/content/status',
    method: 'post',
    data
  })
}

export function deleteContent(data) {
  return request({
    url: '/content/delete',
    method: 'post',
    data
  })
}

export function details(data) {
  return request({
    url: '/content/details',
    method: 'post',
    data
  })
}

export function save(data) {
  return request({
    url: '/content/save',
    method: 'post',
    data
  })
}
