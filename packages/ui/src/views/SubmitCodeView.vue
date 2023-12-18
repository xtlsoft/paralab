<script setup lang="ts">

import ProblemHeader from '@/components/ProblemHeader.vue';
import { useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'

import { fetchWithAuthInJson, fetchWithAuthInRaw, getLoggedInUserInfo } from '@/api/authorization';
import type { User, Problem } from '@paralab/proto';

const route = useRoute()
const problemId: number = parseInt(route.params.problemid as string);
const contestId: number | undefined = route.params.contestid ? parseInt(route.params.contestid as string) : undefined;

const cur_logged_in_user: User | undefined = getLoggedInUserInfo();

const problem_name = ref('')
const problem_description = ref('')
const problem_acceptance = ref(0)

const selected_file = ref<File[] | undefined>(undefined)

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

function onClickSubmit() {
    if (!selected_file || !selected_file.value || !selected_file.value.length) {
        alert("请选择文件")
        return
    }
    const formData = new FormData()
    formData.append("file", selected_file.value[0])
    formData.append("problemId", problemId.toString())
    if (contestId) {
        formData.append("contestId", contestId.toString())
    }
    fetchWithAuthInRaw(`/api/submission`, {
        method: "POST",
        body: formData
    }).then(async (res) => {
        const json = await res.json();
        alert("提交成功")
        const submissionId = json.submissionId;
        window.location.href = `/submission/${submissionId}`
    }).catch((e) => {
        alert(`提交失败: ${e}`)
    })
}
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
            <v-file-input
            label="Select your file"
            variant="outlined"
            v-model:model-value="selected_file"
            show-size></v-file-input>
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
                title="提交"
                @click="onClickSubmit"></v-list-item>
            </v-list>
        </v-col>
</v-row>
</template>