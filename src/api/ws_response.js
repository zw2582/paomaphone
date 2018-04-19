/**
 * http://usejsdoc.org/
 */
import WSAction from '@/api/ws_action.js'
import Vue from 'vue'
import User from '@/api/user.js'
import Room from '@/api/room.js'

export default {
  onOpen: function () {
    var uuid = Vue.$route.query.uuid
    if (uuid) {
      // 认证确认
      WSAction.authConfirm(uuid)
    }
  },

  onMessage: function (evt) {
    var receivedMsg = evt.data
    console.log('接收到消息')
    console.log(receivedMsg)
    receivedMsg = JSON.parse(receivedMsg)
    if (receivedMsg.status === 0) {
      // 消息发生业务错误
      Vue.$vux.alert.show({ title: '错误提示', content: receivedMsg.message })
      return
    }
    var data = receivedMsg.data
    if (!data) {
      // 返回的data数据为空
      Vue.$vux.toast.text(receivedMsg.message)
      return
    }
    switch (data.action) {
      case 'join':
        // 加入房间
        if (data.uid === User.uid) {
          // 当前用户则修改当前房间room_no
          Room.setRoomNo(data.room_no)
        } else {
          // 其它用户提示新用户加入提醒
          Vue.$vux.toast.text(data.userinfo.uname + ' 加入房间')
        }
    }
  },

  onClose: function () {
    Vue.$vux.toast.text('连接已断开')
  }
}
