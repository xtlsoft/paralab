<script setup lang="ts">
import { defineProps, ref } from 'vue';

const props = defineProps({
    json : {
        type : Object,
        required : true,
    }
})

let tabs = ref(Object.keys(props.json))

</script>

<template>
    <v-expansion-panels
    variant="accordion"
    v-model="tabs"
    multiple>
        <v-expansion-panel
        v-for="(value, key) in json"
        :key="key"
        :title="(key as unknown as string)"
        :value="key">
            <v-expansion-panel-text
            v-if="(value instanceof Object)">
                <RecursiveJson :json="value"/>
            </v-expansion-panel-text>
            <v-expansion-panel-text
            v-else>
               {{ value }}
            </v-expansion-panel-text>
        </v-expansion-panel>
    </v-expansion-panels>
</template>