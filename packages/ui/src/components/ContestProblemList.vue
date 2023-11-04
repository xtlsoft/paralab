<script setup lang="ts">
import { RouterLink } from 'vue-router';
import type { ContestProblemListItem } from '@paralab/proto';

defineProps({
  problems: Array<ContestProblemListItem>
})
</script>

<template>
  <v-table
  class="px-4"
  style="width: 100%;">
    <thead>
      <tr>
        <th class="text-center">
          #
        </th>
        <th class="text-center">
          题目名称
        </th>
        <th class="text-center">
          权重
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="item in problems"
        :key="item.id"
      >
        <td class="text-center">{{ item.id }}</td>
        <td>
          <RouterLink :to="`${$route.path}/problem/${item.id}`">
          {{ item.name }}
          </RouterLink>
        </td>
        <td class="text-center">
            {{ item.weight }}
        </td>
      </tr>
    </tbody>
  </v-table>
</template>