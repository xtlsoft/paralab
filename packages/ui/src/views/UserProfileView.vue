<script setup lang="ts">
import { useRoute } from 'vue-router'
import type { User } from '@paralab/proto';

import UserProfileCardAsync from '@/components/UserProfileCardAsync.vue';
import type { Suspense } from 'vue';

const route = useRoute()

const userId = parseInt(route.params.userId as string);
</script>

<template>
	<h1 style="margin-top: 2rem">用户信息</h1>
	<v-row
	style="margin-top: 1rem">
		<v-col
			align-self="center"
			cols="4"
		>
			<Suspense>
				<UserProfileCardAsync
					:userId="userId"
					:display_privileges="true"
				/>
			</Suspense>
			
			<v-btn
			style="margin-top: 1rem"
			color="blue"
			text="编辑"
			:to="`/user/${userId}/edit`"
			/>
		</v-col>
	</v-row>
	
</template>
