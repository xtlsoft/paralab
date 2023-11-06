<script setup lang="ts">

import { useRoute } from 'vue-router'
import { ref } from 'vue'
import VueMarkdown from 'vue-markdown-render'
import { onMounted } from 'vue';

import { fetchWithAuthInJson, getLoggedInUserInfo } from '@/api/authorization';
import type { User, Submission } from '@paralab/proto'
import { ROLE_CONTEST_ADMIN, ROLE_PROBLEMSET_ADMIN } from '@paralab/proto';

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
	<v-row>
		<v-col
		cols = "9">
			<v-table v-if="submission">
				<thead>
					<tr>
						<th class="text-center">Submission ID</th>
						<th class="text-center">Problem</th>
						<th class="text-center">User</th>
						<th class="text-center">提交时间</th>
						<th class="text-center">状态</th>
						<th class="text-center"></th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td class="text-center">{{ submission.id }}</td>
						<td class="text-center">{{ submission.problemId }}</td>
						<td class="text-center">{{ submission.userId }}</td>
						<td class="text-center">{{ (new Date(submission.submitTime)).toLocaleString() }}</td>
						<td class="text-center">{{ submission.verdict }}</td>
						<td>
							<v-btn>
								下载
							</v-btn>
						</td>
					</tr>
				</tbody>
			</v-table>
		</v-col>
		<v-col>
			<v-list>
				<v-list-item 
				:to="`/problem/${ submission?.problemId }`"
				prepend-icon="mdi-arrow-left" 
				title="转到题目"/>
				<v-list-item 
				v-if="submission && submission.contestId"
				:to="`/contest/${ submission?.contestId }`"
				prepend-icon="mdi-arrow-left"
				title="转到比赛"></v-list-item>
				<div v-if="cur_logged_in_user && (cur_logged_in_user.roleMask & (ROLE_PROBLEMSET_ADMIN | ROLE_CONTEST_ADMIN))">
					<v-divider class="mt-2 mb-2" thickness="2"></v-divider>
					<v-list-item
					link 
					prepend-icon="mdi-refresh"
					title="重新评测"
					></v-list-item>
					<v-list-item
					link 
					prepend-icon="mdi-delete"
					title="删除"
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