<script setup lang="ts">
import { RouterLink } from 'vue-router';
import type { Submission } from '@paralab/proto';

defineProps({
  submissions: Array<Submission>
})

function onClickDownloadButton(submission_id: number) {
  alert("Not implemented yet")
}

</script>

<template>
  <v-table>
    <thead>
      <tr>
        <th class="text-center">ID</th>
        <th class="text-center">提交者</th>
        <th class="text-center">题目</th>
        <th class="text-center">提交时间</th>
        <th class="text-center">状态</th>
        <th class="text-center">得分</th>
        <th class="text-center"></th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="item in submissions"
        :key="item.id"
      >
        <td class="text-center">
          <RouterLink :to="`/submission/${item.id}`">
          #{{ item.id }}
          </RouterLink>
        </td>
        <td class="text-center">
          <router-link :to="`/user/${ item.user.id }`">
            #{{ item.user.id }}. {{ item.user.name }}
          </router-link>
        </td>
        <td class="text-center">
          <router-link :to="`/problem/${ item.problem.id }`">
            #{{ item.problem.id }}. {{ item.problem.name }}
          </router-link>
        </td>
        <td class="text-center">
          {{ (new Date(item.submitTime)).toLocaleString() }}
        </td>
        <td class="text-center">
          {{ item.verdict }}
        </td>
        <td class="text-center">
          {{ item.score }}
        </td>
        <td>
          <v-btn
          @click="onClickDownloadButton(item.id)"
          color="green"
          size="small">
            下载
          </v-btn>
        </td>
      </tr>
    </tbody>
  </v-table>
</template>