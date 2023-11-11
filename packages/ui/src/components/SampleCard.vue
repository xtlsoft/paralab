<script setup lang = "ts">
defineProps({
    text : String,
    title : String,
})
</script>

<template>
    <v-card
    :title = "title"
    :text = "text"
    >
    <template #actions>
        <v-btn
        prepend-icon="mdi-content-copy"
        >
            copy
        </v-btn>
    </template>
    </v-card>
</template>