<script setup lang="ts">

import problems from '../problem_data'
import ProblemHeader from '@/components/ProblemHeader.vue';
import { useRoute } from 'vue-router'

const route = useRoute()
const pdata = problems.find ( 
    (item) => item.id === parseInt(route.params.problemid as string) 
)!;

</script>

<template>
    <ProblemHeader />
    <v-row>
        <v-col
        cols = "9">
            <!-- the coding area -->
            <v-textarea>
                code here
            </v-textarea>
        </v-col>

        <v-col>
            <!-- options -->
            <v-list>
                <v-list-item 
                :to="`/problem/${ pdata.id }`"
                prepend-icon="mdi-arrow-left" 
                title="返回题目"></v-list-item>
                <v-list-item 
                link 
                prepend-icon="mdi-send-variant"
                title="提交"></v-list-item>
            </v-list>
        </v-col>
</v-row>
</template>