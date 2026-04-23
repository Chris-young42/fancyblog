// 测试脚本 - 支持中文
const http = require('http')

const hostname = 'localhost'
const port = 3000

function request(method, path, data) {
  return new Promise((resolve, reject) => {
    const body = data ? JSON.stringify(data) : undefined
    const req = http.request(
      {
        hostname,
        port,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': body ? Buffer.byteLength(body) : 0,
        },
      },
      (res) => {
        let d = ''
        res.on('data', (c) => (d += c))
        res.on('end', () => {
          try {
            resolve(JSON.parse(d))
          } catch {
            resolve(d)
          }
        })
      }
    )
    req.on('error', reject)
    if (body) req.write(body)
    req.end()
  })
}

// 测试
;(async () => {
  // 创建
  const created = await request('POST', '/header', {
    label: '前端',
    path: '/frontend',
    order: 2,
  })
  console.log('创建:', created)

  // 查询
  const list = await request('GET', '/header')
  console.log('列表:', list)

  // 删除
  if (created.id) {
    await request('DELETE', `/header/${created.id}`)
    console.log('已删除 ID:', created.id)
  }
})()