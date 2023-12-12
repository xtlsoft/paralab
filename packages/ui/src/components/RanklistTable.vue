<script setup lang="ts">
import { RouterLink } from 'vue-router';
import type { ContestWithProblemName, Ranklist } from '@paralab/proto';

defineProps<{
  contest: ContestWithProblemName
  ranklist: Ranklist
}>()
</script>

<template>
  <v-table
  class="px-4"
  style="width: 100%;">
    <thead>
      <tr>
        <th class="text-center">
          名次
        </th>
        <th class="text-center">
          用户名
        </th>
        <th class="text-center">
          总分
        </th>
        <th 
        v-for="problem in contest.metadata.problems"
        class="text-center">
          <RouterLink
          :to = "`/contest/${contest.id}/problem/${problem.id}`">
          {{ problem.name }}
          </RouterLink>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(item, index) in ranklist.players"
      >
        <td class="text-center">{{ index + 1 }}</td>
        <td class="text-center">
          <RouterLink 
          :to="`/user/${item.userId}`"
          class="text-blue">
            {{ item.username }}
          </RouterLink>
        </td>
        <td class="text-center">
            {{ item.score }}
        </td>
        <td 
        v-for="detail in item.details"
        class="text-center">
            {{ detail.points }}
        </td>
      </tr>
    </tbody>
  </v-table>
</template>