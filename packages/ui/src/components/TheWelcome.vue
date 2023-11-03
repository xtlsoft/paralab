<script setup lang="ts">
import ProblemSearch from './ProblemSearch.vue';
import { try_login, fetch_with_auth_in_json } from "../api/authorization";

const test1 = async () => {
  const res = await try_login("intlsy2",
    "12312314151524123123");
  console.log(res);
}

const test2 = async () => {
  const res = await fetch_with_auth_in_json("/api/user/register", "POST", {
    "userName": "!23123"
  });
  console.log(res)
}

</script>

<template>
  <v-row
  style="margin-top: 1rem;">
  <h1>
    欢迎访问 ParaLab
  </h1>
  </v-row>
  
  <v-row>
    <v-divider/>
  </v-row>

  <v-row>
    <v-col
    cols="8">
      <v-card
      title="公告"
      style="margin-bottom: 1rem;"/>
      <v-card
      title="最新题目"/>
    </v-col>

    <v-col>
      <v-card
      title="比赛"
      style="margin-bottom: 1rem;"/>
      <v-card
      title="搜索题目">
        <ProblemSearch />
      </v-card>
    </v-col>

    <v-col>
      <v-btn @click="test1">test1</v-btn>
      <v-btn @click="test2">test2</v-btn>
    </v-col>
  </v-row>

</template>
