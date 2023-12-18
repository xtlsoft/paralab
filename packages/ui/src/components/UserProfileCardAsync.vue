<script setup lang="ts">
import type { User } from '@paralab/proto';
import { fetchWithAuthInJson } from '@/api/authorization';
import UserProfileCard from './UserProfileCard.vue';

const props = defineProps({
	userId: {
		type: Number,
		required: true
	},
	display_privileges: {
		type: Boolean,
		default: false
	}
})

const userId = props.userId;

const user: User = (await fetchWithAuthInJson(`/api/user/${userId}`, "GET", {}).then((res) => {
	return res as User
}).catch((e) => {
	console.log(e)
	alert(`获取用户信息失败: ${e}`)
}))!
</script>

<template>
	<UserProfileCard
		:user="user"
		:display_privileges="display_privileges"
	/>
</template>
