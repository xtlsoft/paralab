<script setup lang="ts">
import SubmissionList from '@/components/SubmissionList.vue'
import { ref, watch, type Ref } from 'vue'

import { fetchWithAuthInJson, getLoggedInUserInfo } from '@/api/authorization';
import { ROLE_PROBLEMSET_ADMIN } from '@paralab/proto';
import type { Problem, User, ProblemListItem } from '@paralab/proto';
import { onMounted } from 'vue';

const problems_per_page = 10;

const total_visible_problem_count = ref(0);
const total_pages = ref(0);

let current_page = ref(1);
let current_problems: Ref<ProblemListItem[]> = ref([]);

const cur_logged_in_user: User | undefined = getLoggedInUserInfo();

function updateCurrentProblems() {
  fetchWithAuthInJson('/api/problem/problemlist', 'GET', {
    startIndex: (current_page.value-1)*problems_per_page,
    count: problems_per_page,
  }).then((problem_list: {problems: ProblemListItem[], total_visible_problem_count: number}) => {
    current_problems.value = problem_list.problems;
    total_visible_problem_count.value = problem_list.total_visible_problem_count;
    total_pages.value = Math.ceil(total_visible_problem_count.value / problems_per_page);
  }).catch((e) => {
    console.log(e)
    alert(`获取题目列表失败: ${e}`)
  })
}

watch (current_page, (new_value) => {
  updateCurrentProblems();
})

onMounted(() => {
  updateCurrentProblems();
})

async function onClickCreateProblem() {
  fetchWithAuthInJson('/api/problem', 'POST', {}).then((problem: Problem) => {
    alert("创建成功")
    const problemId = problem.id;
    window.location.href = `/problem/${problemId}`
  }).catch((e) => {
    console.log(e)
    alert(`创建失败: ${e}`)
  })
}
</script>

<template>
  <main>
    <v-container
        fluid
    >
      <v-row v-if="cur_logged_in_user && (cur_logged_in_user.roleMask & ROLE_PROBLEMSET_ADMIN)">
        <v-col cols="10">
          <ProblemSearch />
        </v-col>
        <v-col cols="2" style="display: flex; align-items: center;">
          <v-btn
          prepend-icon="mdi-plus"
          block
          color="green"
          variant="outlined"
          @click="onClickCreateProblem"
          >
            新建题目
          </v-btn>
        </v-col>
      </v-row>
      <v-row v-else>
        <v-col cols="12">
          <ProblemSearch />
        </v-col>
      </v-row>
    </v-container>

    <ProblemList 
    :problems="current_problems"/>
    
    <v-pagination 
    :length="total_pages"
    v-model="current_page"
    :total-visible="5"
    ></v-pagination>
  </main>
</template>
