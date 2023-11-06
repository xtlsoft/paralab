<script setup lang="ts">
import { RouterLink } from 'vue-router';
import type { Submission } from '@paralab/proto';

defineProps({
  contests: Array<Submission>
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
          比赛
        </th>
        <th class="text-center">
          开始时间
        </th>
        <th class="text-center">
          结束时间
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="item in contests"
        :key="item.id"
      >
        <td class="text-center">{{ item.id }}</td>
        <td>
          <RouterLink :to="`/contest/${item.id}`">
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
        </td>
        <td class="text-center">{{ (new Date(item.startTime)).toLocaleString() }}</td>
        <td class="text-center">{{ (new Date(item.endTime)).toLocaleString() }}</td>
      </tr>
    </tbody>
  </v-table>
</template>