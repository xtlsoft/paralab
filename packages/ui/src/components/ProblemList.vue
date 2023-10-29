<script setup lang="ts">
import { RouterLink } from 'vue-router';

type Problem = {
  name: string;
  id: number;
  acceptance: number;
};

defineProps({
  problems: Array<Problem>
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
        </td>
        <td class="text-center">{{ item.acceptance }}%</td>
      </tr>
    </tbody>
  </v-table>
</template>