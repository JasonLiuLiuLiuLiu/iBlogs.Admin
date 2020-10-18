import request from '@/utils/request'

export function page(data) {
  return request({
    url: '/comment/comments',
    method: 'post',
    data
  })
}

export function deleteComment(data) {
  return request({
    url: '/delete/delete',
    method: 'post',
    data
  })
}

export function updateStatus(data) {
  return request({
    url: '/comment/status',
    method: 'post',
    data
  })
}
