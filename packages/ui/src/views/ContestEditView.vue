<script setup lang="ts">

import { useRoute } from 'vue-router'
import { type Ref, ref } from 'vue'
import VueMarkdown from 'vue-markdown-render'
import { onMounted } from 'vue';

import { fetchWithAuthInJson, getLoggedInUserInfo } from '@/api/authorization';
import type { User, Contest } from '@paralab/proto';
import { ROLE_CONTEST_ADMIN } from '@paralab/proto';
import { on } from 'events';

const route = useRoute()
const contestId = parseInt(route.params.contestid as string);

const cur_logged_in_user: User | undefined = getLoggedInUserInfo();

let contest: Ref<Contest> = ref({
	id: 0,
	name: "",
	startTime: new Date(),
	endTime: new Date(),
	isPublic: true,
	metadata: {
		description: "",
		problems: []
	}
})

const entered_startTime = ref((new Date()).toLocaleString())
const entered_endTime = ref((new Date()).toLocaleString())

function required(value: string) {
	return !!value || "必填项"
}

onMounted(() => {
	fetchWithAuthInJson(`/api/contest/${contestId}`, "GET", {}).then((res: Contest) => {
		contest.value = res;
		entered_startTime.value = (new Date(res.startTime)).toLocaleString()
		entered_endTime.value = (new Date(res.endTime)).toLocaleString()
	}).catch((e) => {
		console.log(e)
		alert(`获取题目描述失败: ${e}`)
	})
})

function onClickMoveUp(index: number) {
	if (index === 0) {
		return;
	}
	contest.value.metadata.problems = Array.prototype.concat(
		contest.value.metadata.problems.slice(0, index - 1),
		contest.value.metadata.problems[index],
		contest.value.metadata.problems[index - 1],
		contest.value.metadata.problems.slice(index + 1)
	);
}

function onClickMoveDown(index: number) {
	if (index === contest.value.metadata.problems.length - 1) {
		return;
	}
	contest.value.metadata.problems = Array.prototype.concat(
		contest.value.metadata.problems.slice(0, index),
		contest.value.metadata.problems[index + 1],
		contest.value.metadata.problems[index],
		contest.value.metadata.problems.slice(index + 2)
	);
}

function onClickAddProblem() {
	contest.value.metadata.problems.push({
		id: 1,
		weight: 1
	});
}

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

function onClickSaveContest() {
	contest.value.startTime = new Date(entered_startTime.value)
	contest.value.endTime = new Date(entered_endTime.value)
	fetchWithAuthInJson(`/api/contest/${contestId}`, "PUT", contest.value
	).then((res) => {
		alert("保存成功")
	}).catch((e) => {
		console.log(e)
		alert(`保存失败: ${e}`)
	})
}

</script>

<template>
	<v-row
	class="mt-6 mb-4">
		<h1>
			#{{ contest.id }}
			{{ contest.name }}
		</h1>
	</v-row>
	<v-row>
		<v-divider></v-divider>
	</v-row>

	<v-row>
		<v-col
		cols="9"
		class="mt-4 pr-4">
			<v-row>
				<v-text-field
					label="比赛名称"
					v-model:model-value="contest.name"
					:rules="[required]"
					class="mb-2"
					clearable
					variant="solo"
					/>
			</v-row>

			<v-row>
				<v-switch
				v-model="contest.isPublic"
				label="公开"
				color="info"
				></v-switch>
			</v-row>

			<v-row class="mb-1">
				<h2>比赛时间</h2>
			</v-row>
			<v-row>
				<v-col cols="6" class="pr-0">
					<v-text-field
					label="开始时间"
					v-model:model-value="entered_startTime"
					density="default"
					hide-details="auto"
					></v-text-field>
				</v-col>
				<v-col cols="6" class="pr-0">
					<v-text-field
					label="结束时间"
					v-model:model-value="entered_endTime"
					density="default"
					hide-details="auto"
					></v-text-field>
				</v-col>
			</v-row>

			<v-row class="mb-1">
				<h2>赛题</h2>
			</v-row>
			<v-row v-for="problem in contest.metadata.problems" class="align-center">
				<v-col cols="3" class="pr-0">
					<v-text-field
					label="Problem ID"
					v-model:model-value="problem.id"
					density="default"
					hide-details="auto"
					></v-text-field>
				</v-col>
				<v-col cols="1" class="pl-0">
					<v-btn
					density="default"
					size="small"
					rounded="0"
					variant="text"
					icon="mdi-open-in-new"
					:href="`/problem/${problem.id}`"
					target="_blank"
					></v-btn>
				</v-col>
				<v-col cols="3" class="pr-0">
					<v-text-field
					label="Weight"
					v-model:model-value="problem.weight"
					density="default"
					hide-details="auto"
					></v-text-field>
				</v-col>
				<v-col cols="1">
				</v-col>
				<v-col cols="3">
					<v-btn-group
					:border="true"
					variant="outlined"
					divided>
						<v-btn
						size="small"
						rounded="0"
						variant="elevated"
						icon="mdi-close"
						@click="(contest.metadata.problems as any).splice(contest.metadata.problems.indexOf(problem), 1)"
						></v-btn>
						<v-btn
						size="small"
						rounded="0"
						variant="elevated"
						icon="mdi-arrow-up"
						:disabled="contest.metadata.problems.indexOf(problem) == 0"
						@click="onClickMoveUp(contest.metadata.problems.indexOf(problem))"
						></v-btn>
						<v-btn
						size="small"
						rounded="0"
						variant="elevated"
						icon="mdi-arrow-down"
						:disabled="contest.metadata.problems.indexOf(problem) == contest.metadata.problems.length - 1"
						@click="onClickMoveDown(contest.metadata.problems.indexOf(problem))"
						></v-btn>
				</v-btn-group>
				</v-col>
			</v-row>
			<v-row>
				<v-btn
				block
				text="添加赛题"
				prepend-icon="mdi-plus"
				color="blue"
				variant="outlined"
				class="mt-2"
				@click="onClickAddProblem"
				></v-btn>
			</v-row>

			<v-row>
				<h2>比赛介绍</h2>
			</v-row>
			<v-row>
				<v-col cols="6">
					<v-textarea
					label="比赛介绍"
					v-model:model-value="contest.metadata.description"
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
						:source="contest.metadata.description"/>
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
				@click="onClickSaveContest"
				></v-list-item>
				<v-list-item
				link 
				prepend-icon="mdi-delete"
				title="删除"
				@click="onClickDeleteContest"
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