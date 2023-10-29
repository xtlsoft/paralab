<script setup lang="ts">
import ProblemSearch from './ProblemSearch.vue';
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
  </v-row>

</template>
