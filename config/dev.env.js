'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  WS_ADDR:'"ws://192.168.90.50:9502"',	//websocket地址
  WS_REQ:'"http://192.168.90.50:9502"',	//websocket request请求地址
  WEB_ADDR:'"http://192.168.90.50"',	//服务端地址
})
