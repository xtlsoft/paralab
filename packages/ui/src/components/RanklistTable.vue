<script setup lang="ts">
import { RouterLink } from 'vue-router';
import type { Ranklist } from '@paralab/proto';

defineProps<{
  ranklist : Ranklist
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
        v-for="item in ranklist.problems"
        class="text-center">
          <RouterLink
          :to = "`${$route.path}/problem/${item.name}`">
          {{ item.name  }}
          </RouterLink>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="item in ranklist.players"
        :key="item.rank"
      >
        <td class="text-center">{{ item.rank }}</td>
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