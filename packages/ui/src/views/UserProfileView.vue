<script setup lang="ts">
import user from '../user_data'
</script>

<template>
	<v-row
	style="margin-top: 1rem">
		<v-col
			align-self="center"
			cols="3"
		>
		<v-card
		:title="user.name"
		:subtitle="`UID: ${user.uid}`"
		>
		<template #text>
			<v-btn
			text="edit"/>
		</template>
		</v-card>
		</v-col>
	</v-row>
	
</template>
