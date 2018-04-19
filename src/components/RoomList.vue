<style>
html,
body {
  height: 100%;
  width: 100%;
  overflow-x: hidden;
}
</style>
<template>
	<div style="height:100%">
		<view-box>
			<x-header slot="header"><span>房间列表</span></x-header>
			<group>
			<cell v-for="(room,i) in rooms" :title="'房间号:'+room.room_no" :key="i" 
				@click.native="joinRoom(room.room_no)">
				<img :src="room.headimg" slot="icon" height="60px" />
				<span slot="after-title">房主:{{room.uname}}</span>
				<!-- <span slot="inline-desc">inline desc</span> -->
				<div>
					<span>{{room.online}}人({{room.zaixian?'在线':'下线'}})</span><br/>
					<span>{{room.isactive==1?'准备中':room.isactive==2?'进行中':'比赛结束'}}</span>
				</div>
			</cell>
			</group>
		</view-box>
		
	</div>
</template>

<script>
import { ViewBox, XHeader, Tabbar, Cell, Group } from "vux";
import Room from "../api/room";
import User from "../api/user";

export default {
  components: { ViewBox, XHeader, Tabbar, Cell, Group },
  data() {
    return {
      rooms: []
    };
  },
  methods: {
    joinRoom(roomNo) {
		console.log(roomNo)
      var _this = this;
      if (!User.loginFilter(this)) {
        return;
      }

      if (_this.user.room_no && roomNo != _this.user.room_no) {
        //请先退出当前房间
        _this.$vux.confirm.show({
          title: "提示",
          content: "是否退出当前所在房间",
          onCancel() {},
          onConfirm() {
            //确认退出当前房间
            Room.outRoom(_this, function() {
              //显示奖励设置
              _this.user.room_no = 0;
              _this.$router.push({
                path: "/room",
                query: { room_no: roomNo }
              });
            });
          }
        });
      } else {
		  _this.$router.push({path:'/room', query:{'room_no':roomNo}})
	  }
    }
  },
  mounted() {
    var _this = this;
    //获取房间列表
    Room.roomList(_this, rooms => {
      this.$set(this, "rooms", rooms);
    });
  }
};
</script>