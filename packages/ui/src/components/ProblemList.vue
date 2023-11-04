<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { ProblemListItem } from '@paralab/proto';

defineProps({
  problems: Array<ProblemListItem>
})
</script>

<template>
  <v-table>
    <thead>
      <tr>
        <th class="text-center">
          #
        </th>
        <th class="text-center">
          题目名称
        </th>
        <th class="text-center">
          通过率
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="item in problems"
        :key="item.name"
      >
        <td class="text-center">{{ item.id }}</td>
        <td>
          <RouterLink :to="`/problem/${item.id}`">
          {{ item.name }}
          </RouterLink>
          <v-chip
          v-if="!item.isPublic"
          color="primary"
          size="small"
          class="ml-4"
          >
            非公开
          </v-chip>
          <v-chip
          v-if="!item.allowSubmitFromProblemList"
          color="red"
          text-color="white"
          size="small"
          class="ml-4"
          >
            不可从题目列表提交
          </v-chip>
        </td>
        <td class="text-center">{{ item.acceptance }}%</td>
      </tr>
    </tbody>
  </v-table>
</template>