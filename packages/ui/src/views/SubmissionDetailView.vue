<script setup lang="ts">

import { useRoute } from 'vue-router'
import { ref } from 'vue'
import VueMarkdown from 'vue-markdown-render'
import { onMounted } from 'vue';

import { fetchWithAuthInJson, getLoggedInUserInfo } from '@/api/authorization';
import type { User, Submission } from '@paralab/proto'
import { ROLE_CONTEST_ADMIN, ROLE_PROBLEMSET_ADMIN } from '@paralab/proto';

import SubmissionList from '@/components/SubmissionList.vue';

const route = useRoute()
const submissionId = parseInt(route.params.submissionid as string);

const cur_logged_in_user: User | undefined = getLoggedInUserInfo();

const submission = ref<Submission | null>(null)
onMounted(() => {
	fetchWithAuthInJson(`/api/submission/${submissionId}`, "GET", {}).then((res: Submission) => {
		submission.value = res
	}).catch((e) => {
		console.log(e)
		alert(`获取题目描述失败: ${e}`)
	})
})

function onClickDeleteSubmission() {
	if (confirm("确定要删除这次提交记录吗？")) {
		fetchWithAuthInJson(`/api/submission/${submissionId}`, "DELETE", {}).then((res) => {
			alert("删除成功")
			window.location.href = "/submissionlist"
		}).catch((e) => {
			console.log(e)
			alert(`删除失败: ${e}`)
		});
	}
}

function onClickRejudge() {
	alert("Not implemented yet")
}

function onClickDownloadButton() {
	alert("Not implemented yet")
}

</script>

<template>
	<v-row
	class="mt-6 mb-4">
		<v-col
		align-self="center">
			<h1>
				Submission
				#{{ submission?.id }}
			</h1>
		</v-col>
	</v-row>
	<v-row>
		<v-divider></v-divider>
	</v-row>
	<v-row v-if="submission">
		<v-col
		cols = "9">
			<SubmissionList
			:submissions="[submission]"
			></SubmissionList>
		</v-col>
		<v-col>
			<v-list>
				<v-list-item 
				:to="`/problem/${ submission.problem.id }`"
				prepend-icon="mdi-arrow-left" 
				title="转到题目"/>
				<v-list-item 
				v-if="submission && submission.contest?.id"
				:to="`/contest/${ submission.contest.id }`"
				prepend-icon="mdi-arrow-left"
				title="转到比赛"></v-list-item>
				<div v-if="cur_logged_in_user && (cur_logged_in_user.roleMask & (ROLE_PROBLEMSET_ADMIN | ROLE_CONTEST_ADMIN))">
					<v-divider class="mt-2 mb-2" thickness="2"></v-divider>
					<v-list-item
					link 
					prepend-icon="mdi-refresh"
					title="重新评测"
					@click="onClickRejudge"
					></v-list-item>
					<v-list-item
					link 
					prepend-icon="mdi-delete"
					title="删除"
					@click="onClickDeleteSubmission"
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