<script setup lang="ts">

import { useRoute } from 'vue-router'
import { type Ref, ref, reactive } from 'vue'
import { onMounted } from 'vue';

import { fetchWithAuthInJson, getLoggedInUserInfo } from '@/api/authorization';
import type { User, ContestWithProblemName, Ranklist } from '@paralab/proto';

import CountDownTimer from '@/components/CountDownTimer.vue'
import RanklistTable from '@/components/RanklistTable.vue';

const route = useRoute()
const contestId = parseInt(route.params.contestid as string);

const cur_logged_in_user: User | undefined = getLoggedInUserInfo();

let contest: Ref<ContestWithProblemName> = ref({
	id: 0,
	name: "",
	startTime: 4e12,
	endTime: 6e12,
	isPublic: true,
	metadata: {
		description: "",
		problems: []
	}
})

let ranklist: Ref<Ranklist> = ref({
	players: []
})

onMounted(() => {
	fetchWithAuthInJson(`/api/contest/${contestId}`, "GET", {}).then((res: ContestWithProblemName) => {
		contest.value = res;

		fetchWithAuthInJson(`/api/contest/${contestId}/ranklist`, "GET", {}).then((res: Ranklist) => {
			ranklist.value = res;
			console.log(res)
		}).catch((e) => {
			console.log(e)
			alert(`获取排名失败: ${e}`)
		})
	}).catch((e) => {
		console.log(e)
		alert(`获取题目描述失败: ${e}`)
	})
})

</script>

<template>
	<v-row
	class="mt-6 mb-4">
		<v-col
		align-self="center">
			<h1>
				#{{ contest.id }}
				{{ contest.name }}
			</h1>
		</v-col>
		<v-col
		cols="6">
			<CountDownTimer 
				:start-time="contest.startTime"
				:end-time="contest.endTime"/>
		</v-col>
	</v-row>

	<v-row>
		<v-divider></v-divider>
	</v-row>

	<v-row> 
		<!-- ranklist -->
		<v-col
		cols = "9">
			<v-row>
				<RanklistTable
				:contest="contest"
				:ranklist="ranklist"/>
			</v-row>
		</v-col>

		<v-divider vertical class="ml-4 mr-4"></v-divider>

		<!-- small toolbar -->
		<v-col>
			<v-list>
				<v-list-item 
                :to="`/contest/${ contestId }`"                
				prepend-icon="mdi-arrow-left"
				title="转到比赛"></v-list-item>
				<v-list-item            
				prepend-icon="mdi-refresh"
				title="刷新"></v-list-item>
			</v-list>
		</v-col>
	</v-row>
</template>

<style scoped>
h2 {
  margin-top: 1rem;
}
</style>