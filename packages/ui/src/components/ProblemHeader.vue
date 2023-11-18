<script setup lang="ts">

const props = defineProps({
    problemId: {
        type: Number,
        required: true
    },
	problemName: {
        type: String,
        required: true
    },
	problemAcceptance: {
        type: Number,
        required: true
    },
})

</script>

<template>
    <v-row
    style="margin-top: 1rem">
        <v-col 
        align-self="center"
        cols="9"
        >
            <h1>
                #{{ problemId }}
                {{ problemName }}
            </h1>
        </v-col>
        <v-col 
        align-self="center">
            <v-card
            variant = "flat">
                <div style="text-align: center">
                    通过率
                </div>
                <div style="text-align: center; font-size: x-large;">
                    {{ problemAcceptance*100 }}%
                </div>
            </v-card>
        </v-col>
    </v-row>  
        
    <v-row><v-divider></v-divider></v-row>
</template>