<script setup lang="ts">

import { DeprecationTypes } from 'vue';
import { ref } from 'vue'

const props = defineProps({
  startTime: {
	type: Date,
	required: true,
  },
  endTime: {
	type: Date,
	required: true,
  },
})

let status = ref("not-started")
let prompt = ref("距离比赛开始还有")
let daysleft = ref(0)
let hoursleft = ref(0)
let minutesleft = ref(0)
let secondsleft = ref(1)

// stored in milliseconds
let timeleft = ref(1)

setInterval(()=>{
	let currentTime = new Date()
	console.log(currentTime.valueOf())
	console.log(props.startTime.valueOf())
	if (currentTime < props.startTime) {
		status.value = "not-started"
		prompt.value = "距离比赛开始还有"
		timeleft.value = props.startTime.valueOf() - currentTime.valueOf()
	} else if (currentTime > props.endTime) {
		status.value = "ended"
		prompt.value = "比赛已经结束"
		timeleft.value = 0
	} else {
		status.value = "running"
		prompt.value = "距离比赛结束还有"
		timeleft.value = props.endTime.valueOf() - currentTime.valueOf()
	}
	secondsleft.value = Math.floor(timeleft.value / 1000) % 60
	minutesleft.value = Math.floor(timeleft.value / 1000 / 60) % 60
	hoursleft.value = Math.floor(timeleft.value / 1000 / 60 / 60) % 24
	daysleft.value = Math.floor(timeleft.value / 1000 / 60 / 60 / 24)
}, 1000);

</script>

<template>
	<v-card
	variant="flat"
	:color="status === 'ended' ? 'red' : status === 'not-started' ? 'indigo' : 'success'"
	class="mx-auto">
		<v-card-item
		class="text-center text-h6">
		{{ prompt }}
		</v-card-item>
		<v-card-text
		class="text-center text-h6 font-weight-bold"
		v-if="status !== 'ended'">
			{{ daysleft }} 天
			{{ hoursleft }} 小时
			{{ minutesleft }} 分钟
			{{ secondsleft }} 秒
		</v-card-text>
	</v-card>
</template>