<script setup lang="ts">

import ProblemHeader from '@/components/ProblemHeader.vue';
import { useRoute } from 'vue-router'
import { ref } from 'vue'
import VueMarkdown from 'vue-markdown-render'
import { onMounted } from 'vue';

import { fetchWithAuthInJson, getLoggedInUserInfo } from '@/api/authorization';
import type { User, Problem } from '@paralab/proto';
import { ROLE_PROBLEMSET_ADMIN } from '@paralab/proto';

const route = useRoute()
const problemId = parseInt(route.params.problemid as string);

const cur_logged_in_user: User | undefined = getLoggedInUserInfo();

const problem_name = ref('')
const problem_description = ref('')
const problem_acceptance = ref(0)

onMounted(() => {
	fetchWithAuthInJson(`/api/problem/${problemId}`, "GET", {}).then((res: Problem) => {
		problem_description.value = res.metadata.description
		problem_name.value = res.name
		problem_acceptance.value = 0.9
	}).catch((e) => {
		console.log(e)
		alert(`获取题目描述失败: ${e}`)
	})
})

function onClickDeleteProblem() {
	if (confirm("确定要删除这道题目吗？")) {
		fetchWithAuthInJson(`/api/problem/${problemId}`, "DELETE", {}).then((res) => {
			alert("删除成功")
			window.location.href = "/problemlist"
		}).catch((e) => {
			console.log(e)
			alert(`删除失败: ${e}`)
		});
	}
}
</script>

<template>
	<ProblemHeader
		:problemId="problemId"
		:problemName="problem_name"
		:problemAcceptance="problem_acceptance"
	/>
	<v-row> 
		<!-- under title line -->
		<v-col
		cols = "9">
			<VueMarkdown
				:source="problem_description"/>
		</v-col>
		<v-col>
			<v-list>
				<v-list-item 
				:to="`/problem/${ problemId }/submit`"
				prepend-icon="mdi-send-variant" 
				title="提交"/>
				<v-list-item 
				link 
				prepend-icon="mdi-format-list-bulleted"
				title="提交记录"></v-list-item>
				<v-list-item 
				link 
				prepend-icon="mdi-sort-ascending"
				title="统计"></v-list-item>
				<div v-if="cur_logged_in_user && (cur_logged_in_user.roleMask & ROLE_PROBLEMSET_ADMIN)">
					<v-divider class="mt-2 mb-2" thickness="2"></v-divider>
					<v-list-item
					link 
					prepend-icon="mdi-pencil"
					title="编辑"
					:to="`/problem/${ problemId }/edit`"
					></v-list-item>
					<v-list-item
					link 
					prepend-icon="mdi-delete"
					title="删除"
					@click="onClickDeleteProblem"
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