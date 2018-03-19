/**
 * http://usejsdoc.org/
 */
export default {
	//连接websocket，并返回
	conn:function(vue, fn) {
		if (!vue.ws) {
			if (!vue.user.uid) {
				//用户没有登录
				vue.$vux.toast.text('请先登录');
				return null;
			}
			vue.ws = new WebSocket(process.env.WS_ADDR+'?source=phone&uid='+vue.user.uid);
			fn && fn(vue.ws)
		}
		return vue.ws;
	},
	//认证确认--使用request更多
	authConfirm:function(ws, uuid) {
		ws.send(JSON.stringify({action:'auth_confirm','uuid':uuid,'uid':this.uid}));
	},
	
	//加入房间--使用request更多
	enterRoom:function(ws, room_no) {
		ws.send(JSON.stringify({action:'enter','uid':this.uid,'room_no':room_no}));
	},
	
	//退出房间--使用request更多
	outRoom:function(ws, vue) {
		if (!vue.user.room_no) {
			vue.$vux.toast.text('当前没有所在房间');
			return false;
		}
		ws.send(JSON.stringify({action:'out','uid':vue.user.uid}));
		return true;
	},
	
	//准备比赛--使用request更多
	prepare:function(ws) {
		ws.send(JSON.stringify({action:'prepare','uid':this.uid}));
	},
	
	//开始比赛--使用request更多
	start:function(ws) {
		ws.send(JSON.stringify({action:'start','uid':this.uid}));
	},
	
	//摇动
	play:function(ws, uid) {
		ws.send(JSON.stringify({action:'play','uid':uid,'count':1}));
	}
}