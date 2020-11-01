import request from '@/utils/request'

export function fetchList(data) {
  return request({
    url: '/option/page',
    method: 'post',
    data
  })
}

export function save(data) {
  return request({
    url: '/option/save',
    method: 'post',
    data
  })
}
