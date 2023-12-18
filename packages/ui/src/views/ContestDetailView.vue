<script setup lang="ts">

import { useRoute } from 'vue-router'
import { type Ref, ref, reactive } from 'vue'
import VueMarkdown from 'vue-markdown-render'
import { onMounted } from 'vue';

import { fetchWithAuthInJson, getLoggedInUserInfo } from '@/api/authorization';
import type { User, Contest, ContestWithProblemName } from '@paralab/proto';
import { ROLE_CONTEST_ADMIN } from '@paralab/proto';

import CountDownTimer from '@/components/CountDownTimer.vue'
import ContestProblemList from '@/components/ContestProblemList.vue';

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

onMounted(() => {
	fetchWithAuthInJson(`/api/contest/${contestId}`, "GET", {}).then((res: ContestWithProblemName) => {
		contest.value = res;
	}).catch((e) => {
		console.log(e)
		alert(`获取题目描述失败: ${e}`)
	})
})

function onClickDeleteContest() {
	if (confirm("确定要删除这场比赛吗？")) {
		fetchWithAuthInJson(`/api/contest/${contestId}`, "DELETE", {}).then((res) => {
			alert("删除成功")
			window.location.href = "/contestlist"
		}).catch((e) => {
			console.log(e)
			alert(`删除失败: ${e}`)
		});
	}
}
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
		<v-col
		cols = "9">
			<v-row
			class="pa-3">
				<VueMarkdown
				:source="contest.metadata.description"/>
			</v-row>
			<v-row>
				<v-divider></v-divider>
			</v-row>
			<v-row>
				<ContestProblemList
				:problems="contest.metadata.problems"/>
			</v-row>
		</v-col>
		<v-divider vertical class="ml-4 mr-4"></v-divider>
		<v-col>
			<v-list>
				<v-list-item 
				link 
				prepend-icon="mdi-format-list-bulleted"
				title="提交记录"></v-list-item>
				<v-list-item 
				link 
				prepend-icon="mdi-sort-ascending"
				title="统计"></v-list-item>
				<div v-if="cur_logged_in_user && (cur_logged_in_user.roleMask & ROLE_CONTEST_ADMIN)">
					<v-divider class="mt-2 mb-2" thickness="2"></v-divider>
					<v-list-item
					link 
					prepend-icon="mdi-pencil"
					title="编辑"
					:to="`/contest/${ contestId }/edit`"
					></v-list-item>
					<v-list-item
					link 
					prepend-icon="mdi-delete"
					title="删除"
					@click="onClickDeleteContest"
					></v-list-item>
				</div>
			</v-list>
		</v-col>
	</v-row>
</template>

<style scoped>
h2 {
  margin-top: 1rem;
}
</style>