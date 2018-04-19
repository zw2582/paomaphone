'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  WS_ADDR:'"ws://127.0.0.1:9502"',	//websocket地址
  WS_REQ:'"http://127.0.0.1:9502"',	//websocket request请求地址
  WEB_ADDR:'"http://127.0.0.1"',	//服务端地址
})
