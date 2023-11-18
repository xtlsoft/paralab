<script setup lang="ts">
const rules = [
    (value:string) => !value || value.length <= 20 || 'Too Long.',
]
</script>

<template>
    <v-text-field
        prepend-inner-icon="mdi-magnify"
        label="题目名称/题号/..."
        :rules="rules"
        hide-details="auto"
        variant="solo"
        rounded
    />
</template>