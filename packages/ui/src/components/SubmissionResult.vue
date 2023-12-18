<script setup lang="ts">
import { defineProps, ref } from 'vue';

import type { JudgeResult } from '@paralab/proto';

import RecursiveJson from './RecursiveJson.vue';


const props = defineProps<{
  result : JudgeResult
}>()

let msg = JSON.parse(props.result.message)
let extra = msg.extra

</script>

<template>
    <v-card
    style="width=100%;">
        <v-card-title>
        {{ msg.status }}
        </v-card-title>
        <v-card-text>
        总分: {{ msg.score }}
        </v-card-text>
        <RecursiveJson :json="extra"/>
    </v-card>
</template>