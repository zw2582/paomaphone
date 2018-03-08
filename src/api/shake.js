/**
 * http://usejsdoc.org/
 */
import Vue from 'vue'
import WSAction from '@/api/ws_action.js'

export default {
	shakePhone:function() {
		var _this = this;
		//监听手机摇动事件
		if (window.DeviceMotionEvent) {
			window.addEventListener('devicemotion', deviceMotionHandler, false);
		} else {
			Vue.$vux.toast.text('你的设备不支持摇动')
		}
		var SHAKE_THRESHOLD = 3000;
	    var last_update = 0;
	    var y = 0; var z=0; var last_x=0; var last_y=0; var last_z=0;var x=0;
		function deviceMotionHandler(eventData) {
	        var acceleration = eventData.accelerationIncludingGravity;
	        var curTime = new Date().getTime();
	        if ((curTime - last_update) > 100) {
	            var diffTime = curTime - last_update;
	            last_update = curTime;
	            x = acceleration.x;
	            y = acceleration.y;
	            z = acceleration.z;
	            var speed = Math.abs(x + y + z - last_x - last_y - last_z) / diffTime * 10000;
	            if (speed > SHAKE_THRESHOLD) {
	                if(!_this.shake) {
	                	Vue.$vux.toast.show({text:'还没有开始，别着急'});
	                } else {
	                	//发送数据
	                	WSAction.play(1);
	                }
	            }
	            last_x = x;
	            last_y = y;
	            last_z = z;
	        }
	    }
	}
}