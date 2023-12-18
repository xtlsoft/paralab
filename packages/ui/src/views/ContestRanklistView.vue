<script setup lang="ts">

import { useRoute } from 'vue-router'
import { type Ref, ref, reactive } from 'vue'
import VueMarkdown from 'vue-markdown-render'
import { onMounted } from 'vue';

import { fetchWithAuthInJson, getLoggedInUserInfo } from '@/api/authorization';
import type { User, ContestWithProblemName, Ranklist } from '@paralab/proto';
import { ROLE_CONTEST_ADMIN } from '@paralab/proto';

import CountDownTimer from '@/components/CountDownTimer.vue'
import ContestProblemList from '@/components/ContestProblemList.vue';
import RanklistTable from '@/components/RanklistTable.vue';

const route = useRoute()
const contestId = parseInt(route.params.contestid as string);

const cur_logged_in_user: User | undefined = getLoggedInUserInfo();

let contest: Ref<ContestWithProblemName> = ref({
	id: 0,
	name: "See who learns from SYC better!",
	startTime: 4e12,
	endTime: 6e12,
	isPublic: true,
	metadata: {
		description: "看看谁软工学的好！",
		problems: []
	}
})

let ranklist: Ref<Ranklist> = ref({
	contestId: 0,
	problems: [
		{
			name: "A",
		},
		{
			name: "B",
		}
	],
	players: [
		{
			userId: 0,
			username: "楼下的爸爸",
			score: 1919810,
			rank: 1,
			details : [
				{
					points : 1919800,
					status : "AC",
				},
				{
					points : 10,
					status : "WA",
				}
			]
		},
		{
			userId: 1,
			username: "楼上的爷爷",
			score: 114514,
			rank: 2,
			details : [
				{
					points : 4,
					status : "WA",
				},
				{
					points : 114510,
					status : "AC",
				}
			]
		},
		{
			userId: 2,
			username: "第一的父亲",
			score: 233,
			rank: 3,
			details : [
				{
					points : 0,
					status : "N/A",
				},
				{
					points : 233,
					status : "AC",
				}
			]
		}
	]
})

onMounted(() => {
	fetchWithAuthInJson(`/api/contest/${contestId}`, "GET", {}).then((res: ContestWithProblemName) => {
		contest.value = res;
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