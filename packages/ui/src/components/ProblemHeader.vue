<script setup lang="ts">

import problems from '../problem_data'
import { useRoute } from 'vue-router'

const route = useRoute()
const pdata = problems.find ( 
    (item) => item.id === parseInt(route.params.problemid as string) 
)!;

</script>

<template>
    <v-row
    style="margin-top: 1rem">
        <v-col 
        align-self="center"
        cols="9"
        >
            <h1>
                #{{ pdata.id }}
                {{ pdata.name }}
            </h1>
        </v-col>
        <v-col 
        align-self="center">
            <v-card
            variant = "flat">
                <div style="text-align: center">
                    通过率
                </div>
                <div style="text-align: center">
                    {{ pdata.acceptance }}%
                </div>
            </v-card>
        </v-col>
    </v-row>  
        
    <v-row><v-divider></v-divider></v-row>
</template>