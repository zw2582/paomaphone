/**
 * 房间信息管理
 */

export default {
  // 创建房间
  createRoom: (vue, fn) => {
    // 创建房间，显示loading
    vue.$vux.loading.show({ text: '正在创建房间' })
    vue.$http.get(process.env.WEB_ADDR + '/room/create', { withCredentials: true }).then(res => {
      vue.$vux.loading.hide()
      var resdata = res.data
      if (!resdata.status) {
        // 创建房间失败
        vue.$vux.toast.text(resdata.message)
      } else {
        // 创建成功返回roomno
        fn(resdata.data)
      }
    }, err => {
      vue.$vux.loading.hide()
      vue.$vux.alert.show({ title: '创建房间失败', content: err.message })
    })
  },
  // 使用request退出房间
  outRoom: function (vue, fn) {
    if (!vue.user.uid) {
      vue.$vux.toast.text('请先登录')
      return
    }
    vue.$vux.loading.show({ text: '正在退出当前房间' })
    vue.$http.get(process.env.WS_REQ + '?action=out&uid=' + vue.user.uid, { withCredentials: false }).then(res => {
      vue.$vux.loading.hide()
      var resdata = res.data
      if (!resdata.status) {
        // 退出房间失败
        vue.$vux.toast.text(resdata.message)
      } else {
        // 退出成功
        fn()
      }
    }, err => {
      vue.$vux.loading.hide()
      vue.$vux.alert.show({ title: '退出房间失败', content: err.message })
    })
  },
  // 加入房间
  enterRoom: function (vue, roomNo, fn) {
    if (!vue.user.uid) {
      vue.$vux.toast.text('请先登录')
      return
    }
    vue.$vux.loading.show({ text: '正在加入当前房间' })
    vue.$http.get(process.env.WS_REQ + '?action=enter&uid=' + vue.user.uid + '&room_no=' + roomNo, { withCredentials: false }).then(res => {
      vue.$vux.loading.hide()
      var resdata = res.data
      if (!resdata.status) {
        // 加入房间失败
        vue.$vux.toast.text(resdata.message)
      } else {
        // 加入成功
        fn && fn()
      }
    }, err => {
      vue.$vux.loading.hide()
      vue.$vux.alert.show({ title: '加入房间失败', content: err.message })
    })
  },
  // 获取房间信息
  roomInfo: function (vue, roomNo, fn, errfn) {
    vue.$http.get(process.env.WEB_ADDR + '/room/info?room_no=' + roomNo, { withCredentials: true }).then(res => {
      var resdata = res.data
      if (!resdata.status) {
        // 获取房间信息失败
        vue.$vux.alert.show({ title: '获取房间信息失败', content: resdata.message })
        errfn && errfn()
      } else {
        // 获取房间信息成功
        fn(resdata.data)
      }
    }, err => {
      vue.$vux.alert.show({ title: '获取房间信息失败', content: err.message })
    })
  },
  // 获取房间用户
  roomUsers: function (vue, roomNo, fn) {
    vue.$http.get(process.env.WEB_ADDR + '/room/users?room_no=' + roomNo, { withCredentials: true }).then(res => {
      var resdata = res.data
      if (!resdata.status) {
        // 获取房间信息失败
        vue.$vux.alert.show({ title: '获取房间用户失败', content: resdata.message })
      } else {
        // 获取房间信息成功
        fn(resdata.data)
      }
    }, err => {
      vue.$vux.alert.show({ title: '获取房间用户失败', content: err.message })
    })
  },
  // 发送预备命令
  prepareCmd: function (vue, roomNo, fn) {
    if (!vue.user.uid) {
      vue.$vux.toast.text('请先登录')
      return
    }
    vue.$vux.loading.show()
    vue.$http.get(process.env.WS_REQ + '?action=prepare&uid=' + vue.user.uid + '&room_no=' + roomNo, { withCredentials: false }).then(res => {
      vue.$vux.loading.hide()
      var resdata = res.data
      if (!resdata.status) {
        // 发送预备命令失败
        vue.$vux.alert.show({ title: '预备比赛失败', content: resdata.message })
      } else {
        // 发送成功
        fn && fn()
      }
    }, err => {
      vue.$vux.loading.hide()
      vue.$vux.alert.show({ title: '预备比赛失败', content: err.message })
    })
  },
  // 发送开始命令
  startCmd: function (vue, roomNo, fn) {
    if (!vue.user.uid) {
      vue.$vux.toast.text('请先登录')
      return
    }
    vue.$vux.loading.show()
    vue.$http.get(process.env.WS_REQ + '?action=start&uid=' + vue.user.uid + '&room_no=' + roomNo, { withCredentials: false }).then(res => {
      vue.$vux.loading.hide()
      var resdata = res.data
      if (!resdata.status) {
        // 发送预备命令失败
        vue.$vux.alert.show({ title: '开始比赛失败', content: resdata.message })
      } else {
        // 发送成功
        fn && fn()
      }
    }, err => {
      vue.$vux.loading.hide()
      vue.$vux.alert.show({ title: '开始比赛失败', content: err.message })
    })
  },
  /**
   * 获取个人排名和奖金
   * @param vue
   * @param roomNo
   * @param runfn 正在比赛中的结果回调, max, data
   * @param resultfn 比赛结束的结果展示回调，rank，data
   * @returns
   */
  getReward: function (vue, roomNo, runfn) {
    vue.$http.get(process.env.WEB_ADDR + '/room/reward?room_no=' + roomNo + '&uid=' + vue.user.uid, { withCredentials: false }).then(res => {
      var resdata = res.data
      if (resdata.status === 1) {
        // 个人排名，奖金，积分
        runfn && runfn(resdata.data.rank, resdata.data.money, resdata.data.jifen)
      } else {
        // 比赛结束展示数据
        vue.$vux.alert.show({ 'title': '获取个人排名错误', 'text': resdata.message })
      }
    })
  },
  /**
   * 显示比赛结果
   */
  showResult: (vue, roomNo, fn) => {
    vue.$http.get(process.env.WEB_ADDR + '/room/result?room_no=' + roomNo, { withCredentials: false }).then(res => {
      var resdata = res.data
      if (resdata.status === 1) {
        // 个人排名，奖金，积分
        fn && fn(resdata.data)
      } else {
        // 比赛结束展示数据
        vue.$vux.alert.show({ 'title': '显示比赛结果错误', 'text': resdata.message })
      }
    })
  },

  /**
   * 房间列表
   */
  roomList: (vue, fn) => {
    vue.$vux.loading.show({ text: '正在获取房间列表' })
    vue.$http.get(process.env.WS_REQ + '?action=room_list', { withCredentials: false }).then(res => {
      vue.$vux.loading.hide()
      var resdata = res.data
      if (!resdata.status) {
        // 加入房间失败
        vue.$vux.toast.text(resdata.message)
      } else {
        // 加入成功
        fn && fn(resdata.data)
      }
    }, err => {
      vue.$vux.loading.hide()
      vue.$vux.alert.show({ title: '获取房间列表失败', content: err.message })
    })
  }
}
