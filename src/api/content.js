import request from '@/utils/request'

export function page(data) {
  return request({
    url: '/content/page',
    method: 'post',
    data
  })
}
