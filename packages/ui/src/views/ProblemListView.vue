<script setup lang="ts">
import ProblemList from '@/components/ProblemList.vue'
import ProblemSearch from '@/components/ProblemSearch.vue';
import problems from '../problem_data'
import { ref, watch } from 'vue'

import { fetchWithAuthInJson, getLoggedInUserInfo } from '@/api/authorization';
import { ROLE_PROBLEMSET_ADMIN } from '@paralab/proto';
import type { Problem, User } from '@paralab/proto';

const problem_total = problems.length;
const problems_per_page = 10;
const page_total = Math.ceil(problem_total / problems_per_page);

let current_page = ref(1);
let current_problems = ref(problems.slice(0, problems_per_page));

const cur_logged_in_user: User | undefined = getLoggedInUserInfo();

watch (current_page, (new_page) => {
  current_problems.value = problems.slice(
    (new_page - 1) * problems_per_page,
    new_page * problems_per_page
  );
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
    :length="page_total"
    v-model="current_page"
    :total-visible="3"
    ></v-pagination>
  </main>
</template>
