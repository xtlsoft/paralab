<script setup lang="ts">
import ProblemList from '@/components/ProblemList.vue'
import ProblemSearch from '@/components/ProblemSearch.vue';
import problems from '../problem_data'
import { ref, watch } from 'vue'

const problem_total = problems.length;
const problems_per_page = 10;
const page_total = Math.ceil(problem_total / problems_per_page);

let current_page = ref(1);
let current_problems = ref(problems.slice(0, problems_per_page));


watch (current_page, (new_page) => {
  current_problems.value = problems.slice(
    (new_page - 1) * problems_per_page,
    new_page * problems_per_page
  );
})
</script>

<template>
  <main>
    <ProblemSearch />
    <ProblemList 
    :problems="current_problems"/>
    <v-pagination 
    :length="page_total"
    v-model="current_page"
    :total-visible="3"
    ></v-pagination>
  </main>
</template>
