<script setup lang="ts">

import ProblemHeader from '@/components/ProblemHeader.vue';
import { useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'

import { fetchWithAuthInJson, getLoggedInUserInfo } from '@/api/authorization';
import type { User, Problem } from '@paralab/proto';

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
</script>

<template>
    <ProblemHeader
		:problemId="problemId"
		:problemName="problem_name"
		:problemAcceptance="problem_acceptance"
	/>
    <v-row>
        <v-col
        cols = "9" v-if="cur_logged_in_user !== undefined">
            <!-- the coding area -->
            <v-textarea
            auto-grow
            label="code"
            variant="outlined"
            autofocus>
                code here
            </v-textarea>
        </v-col>
        <v-col cols="9" v-else>
            <v-alert
            type="warning"
            >
                请先登录
            </v-alert>
        </v-col>

        <v-col>
            <!-- options -->
            <v-list>
                <v-list-item 
                :to="`/problem/${problemId }`"
                prepend-icon="mdi-arrow-left" 
                title="返回题目"></v-list-item>
                <v-list-item 
                link 
                prepend-icon="mdi-send-variant"
                title="提交"></v-list-item>
            </v-list>
        </v-col>
</v-row>
</template>