<script setup lang="ts">
import { RouterLink } from 'vue-router';
import type { ContestWithProblemName } from '@paralab/proto';

// Extract type of problems field
type ContestProblemList =
  Extract<
    Extract< 
      ContestWithProblemName, 
      {metadata?:any}
    > ['metadata'],
    {problems?:any}
  > ['problems'];

defineProps<{
  problems : ContestProblemList
}>()
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
        <td class="text-center">
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