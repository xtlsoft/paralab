<script setup lang="ts">

import ProblemHeader from '@/components/ProblemHeader.vue';
import { useRoute } from 'vue-router'
import { ref } from 'vue'
import VueMarkdown from 'vue-markdown-render'
import { onMounted } from 'vue';

import { fetchWithAuthInJson, getLoggedInUserInfo } from '@/api/authorization';
import type { User, Problem, JudgeConfig } from '@paralab/proto';
import { default_judge_config, ROLE_PROBLEMSET_ADMIN } from '@paralab/proto';
import { on } from 'events';

const route = useRoute()
const problemId = parseInt(route.params.problemid as string);

const cur_logged_in_user: User | undefined = getLoggedInUserInfo();

const entered_problem_name = ref('')
const entered_problem_description = ref('')
const entered_isPublic = ref(false)
const entered_allowSubmitFromProblemList = ref(false)

function required(value: string) {
	return !!value || "必填项"
}

onMounted(() => {
	fetchWithAuthInJson(`/api/problem/${problemId}`, "GET", {}).then((res: Problem) => {
		entered_problem_description.value = res.metadata.description
		entered_problem_name.value = res.name
		entered_isPublic.value = res.isPublic
		entered_allowSubmitFromProblemList.value = res.allowSubmitFromProblemList
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

function onClickSaveProblem(return_after_save: boolean) {
	fetchWithAuthInJson(`/api/problem/${problemId}`, "PUT", {
		problemName: entered_problem_name.value,
		isPublic: entered_isPublic.value,
		allowSubmitFromProblemList: entered_allowSubmitFromProblemList.value,
		metadata: {
			description: entered_problem_description.value,
			judgeConfig: default_judge_config
		}
	}).then((res) => {
		alert("保存成功")
		if (return_after_save) {
			window.location.href = `/problem/${problemId}`
		}
	}).catch((e) => {
		console.log(e)
		alert(`保存失败: ${e}`)
	})
}

</script>

<template>
	<v-row
    style="margin-top: 1rem">
        <v-col 
        align-self="center"
        cols="9"
        >
            <h1>
                #{{ problemId }}
                {{ entered_problem_name }}
            </h1>
        </v-col>
    </v-row>  
        
    <v-row><v-divider></v-divider></v-row>

	<v-row> 
		<!-- under title line -->
		<v-col
		cols="9"
		class="mt-4 pr-4">
			<v-row>
				<v-text-field
					label="题目名称"
					v-model:model-value="entered_problem_name"
					:rules="[required]"
					class="mb-2"
					clearable
					variant="solo"
					autocomplete="username"
					/>
			</v-row>
			<v-row>
				<v-switch
				v-model="entered_isPublic"
				label="公开"
				color="info"
				></v-switch>
				<v-switch
				v-model="entered_allowSubmitFromProblemList"
				label="允许从题目列表提交"
				color="info"
				></v-switch>
			</v-row>
			<v-row>
				<v-col cols="6">
					<v-textarea
					label="题面"
					v-model:model-value="entered_problem_description"
					auto-grow
					rows="40"
					variant="outlined"
					>
					</v-textarea>
				</v-col>
				<v-divider vertical></v-divider>
				<v-col cols="6">
					<h4>预览</h4>
					<VueMarkdown
						:source="entered_problem_description"/>
				</v-col>
			</v-row>
		</v-col>
		<v-divider vertical class="ml-4 mr-4"></v-divider>
		<v-col>
			<v-list>
				<v-list-item
				link 
				prepend-icon="mdi-floppy"
				title="保存"
				@click="onClickSaveProblem(false)"
				></v-list-item>
				<v-list-item
				link 
				prepend-icon="mdi-floppy"
				title="保存并返回"
				@click="onClickSaveProblem(true)"
				></v-list-item>
				<v-list-item
				link 
				prepend-icon="mdi-delete"
				title="删除题目"
				@click="onClickDeleteProblem"
				></v-list-item>
			</v-list>
		</v-col>
	</v-row>
</template>

<style scoped>
h2 {
  margin-top: 1rem;
}
</style>