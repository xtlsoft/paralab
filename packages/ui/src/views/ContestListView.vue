<script setup lang="ts">
import ContestList from '@/components/ContestList.vue'
import { ref, watch, type Ref } from 'vue'

import { fetchWithAuthInJson, getLoggedInUserInfo } from '@/api/authorization';
import { ROLE_CONTEST_ADMIN } from '@paralab/proto';
import type { Contest, User, ContestListItem } from '@paralab/proto';
import { onMounted } from 'vue';

const contests_per_page = 10;

const total_visible_contest_count = ref(0);
const total_pages = ref(0);

let current_page = ref(1);
let current_contests: Ref<ContestListItem[]> = ref([]);

const cur_logged_in_user: User | undefined = getLoggedInUserInfo();

function updateCurrentContests() {
  fetchWithAuthInJson('/api/contest/contestlist', 'GET', {
    startIndex: (current_page.value-1)*contests_per_page,
    count: contests_per_page,
  }).then((contest_list: {contests: ContestListItem[], total_visible_contest_count: number}) => {
    current_contests.value = contest_list.contests;
    total_visible_contest_count.value = contest_list.total_visible_contest_count;
    total_pages.value = Math.ceil(total_visible_contest_count.value / contests_per_page);
  }).catch((e) => {
    console.log(e)
    alert(`获取题目列表失败: ${e}`)
  })
}

watch (current_page, (new_value) => {
  updateCurrentContests();
})

onMounted(() => {
  updateCurrentContests();
})

async function onClickCreateContest() {
  fetchWithAuthInJson('/api/contest', 'POST', {}).then((contest: Contest) => {
    alert("创建成功")
    const contestId = contest.id;
    window.location.href = `/contest/${contestId}`
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
      <v-row v-if="cur_logged_in_user && (cur_logged_in_user.roleMask & ROLE_CONTEST_ADMIN)">
        <v-col cols="10">
        </v-col>
        <v-col cols="2" style="display: flex; align-items: center;">
          <v-btn
          prepend-icon="mdi-plus"
          block
          color="green"
          variant="outlined"
          @click="onClickCreateContest"
          >
            新建比赛
          </v-btn>
        </v-col>
      </v-row>
    </v-container>

    <ContestList 
    :contests="current_contests"/>
    
    <v-pagination 
    :length="total_pages"
    v-model="current_page"
    :total-visible="5"
    ></v-pagination>
  </main>
</template>
