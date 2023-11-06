<script setup lang="ts">
import SubmissionList from '@/components/SubmissionList.vue'
import { ref, watch, type Ref } from 'vue'

import { fetchWithAuthInJson, getLoggedInUserInfo } from '@/api/authorization';
import type { Submission, User } from '@paralab/proto';
import { onMounted } from 'vue';

const submissions_per_page = 10;

const total_visible_submission_count = ref(0);
const total_pages = ref(0);

let current_page = ref(1);
let current_submissions: Ref<Submission[]> = ref([]);

const cur_logged_in_user: User | undefined = getLoggedInUserInfo();

function updateCurrentSubmissions() {
  fetchWithAuthInJson('/api/submission/submissionlist', 'GET', {
    startIndex: (current_page.value-1)*submissions_per_page,
    count: submissions_per_page,
  }).then((submission_list: {submissions: Submission[], total_visible_submission_count: number}) => {
    current_submissions.value = submission_list.submissions;
    total_visible_submission_count.value = submission_list.total_visible_submission_count;
    total_pages.value = Math.ceil(total_visible_submission_count.value / submissions_per_page);
  }).catch((e) => {
    console.log(e)
    alert(`获取评测记录失败: ${e}`)
  })
}

watch (current_page, (new_value) => {
  updateCurrentSubmissions();
})

onMounted(() => {
  updateCurrentSubmissions();
})
</script>

<template>
  <main>
    <SubmissionList 
    class="mt-3"
    :submissions="current_submissions"/>
    
    <v-pagination 
    :length="total_pages"
    v-model="current_page"
    :total-visible="5"
    ></v-pagination>
  </main>
</template>
