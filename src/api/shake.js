/**
 * http://usejsdoc.org/
 */

export default (function(){
	 var callfn;
	 var motionData={
	   SHAKE_THRESHOLD:3000,
	   last_update:0,
	   x:0,
	   y:0,
	   z:0,
	   last_x:0,
	   last_y:0,
	   last_z:0
	  }
	 
	 return {bind,unbind}
	 
	 function bind(fn) {
	  callfn = fn;
	  console.log('bind listenser')
	  // devicemotion
	  window.addEventListener('devicemotion', deviceMotionHandler);
	 }
	 
	 function unbind() {
	  console.log('unbind listenser')
	  window.removeEventListener('devicemotion', deviceMotionHandler)
	 } 

	 function deviceMotionHandler(eventData) {
	  console.log('call callback')
	  var acceleration = eventData.accelerationIncludingGravity;
	        var curTime = new Date().getTime();
	        if ((curTime - motionData.last_update) > 100) {
	            var diffTime = curTime - motionData.last_update;
	            motionData.last_update = curTime;
	            motionData.x = acceleration.x;
	            motionData.y = acceleration.y;
	            motionData.z = acceleration.z;
	            var speed = Math.abs(motionData.x + motionData.y + motionData.z - motionData.last_x - motionData.last_y - motionData.last_z) / diffTime * 10000;
	            if (speed > motionData.SHAKE_THRESHOLD) {
	            		callfn && callfn()
	            }
	            motionData.last_x = motionData.x;
	            motionData.last_y = motionData.y;
	            motionData.last_z = motionData.z;
	        }
	 }
	})();