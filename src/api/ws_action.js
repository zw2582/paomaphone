/**
 * http://usejsdoc.org/
 */
export default {
	//连接websocket，并返回
	conn:function(vue) {
		if (!vue.ws) {
			if (!vue.user.uid) {
				//用户没有登录
				vue.$vux.toast.text('请先登录');
				return null;
			}
			if (!this.onMessage || !this.onClose) {
				vue.$vux.alert.show({'title':'代码错误', 'content':'请设置onMessage和onClose'});
				return null;
			}
			vue.ws = new WebSocket(process.env.WS_ADDR+'?source=phone&uid='+User.uid);
			
			vue.ws.onmessage=this.onMessage;
			
			vue.ws.onclose=this.onClose;
		}
		return this.ws;
	},
	onMessage:null,
	onClose:null,
	//认证确认
	authConfirm:function(uuid) {
		if (!this.conn) {
			return false;
		}
		ws.send(JSON.stringify({action:'auth_confirm','uuid':uuid,'uid':this.uid}));
	},
	
	//加入房间
	enterRoom:function(room_no) {
		if (!this.conn) {
			return false;
		}
		ws.send(JSON.stringify({action:'enter','uid':this.uid,'room_no':room_no}));
	},
	
	//退出房间
	outRoom:function(vue) {
		if (!vue.user.room_no) {
			vue.$vux.toast.text('当前没有所在房间');
			return false;
		}
		if (!this.conn) {
			return false;
		}
		ws.send(JSON.stringify({action:'out','uid':vue.user.uid}));
		return true;
	},
	
	//准备比赛
	prepare:function() {
		if (!this.conn) {
			return false;
		}
		ws.send(JSON.stringify({action:'prepare','uid':this.uid}));
	},
	
	//开始比赛
	start:function() {
		if (!this.conn) {
			return false;
		}
		ws.send(JSON.stringify({action:'start','uid':this.uid}));
	},
	
	//摇动
	play:function(count) {
		if (!this.conn) {
			return false;
		}
		ws.send(JSON.stringify({action:'start','uid':this.uid,'count':count}));
	}
}