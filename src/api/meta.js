import request from '@/utils/request'

export function page(data) {
  return request({
    url: '/meta/page',
    method: 'post',
    data
  })
}

export function save(data) {
  return request({
    url: '/meta/save',
    method: 'post',
    data
  })
}

export function deleteMeta(data) {
  return request({
    url: '/meta/delete',
    method: 'post',
    data
  })
}
