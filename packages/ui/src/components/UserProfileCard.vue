<script setup lang="ts">
import type { User } from '@paralab/proto';
import { ROLE_MASKS }  from '@paralab/proto';

const props = defineProps({
	user: {
		type: Object as () => User,
		required: true
	},
	display_privileges: {
		type: Boolean,
		default: false
	}
})

const user: User = props.user;
</script>

<template>
	<v-card
	:title="user.name"
	:subtitle="`UID: ${user.id}`"
	>
		<v-card-text>
			<div style="font-size: 1rem; line-height: 2rem">
				Email: {{ user.metadata.email }} <br />
				格言: {{ user.metadata.motto }} <br />
				注册时间: {{ (new Date(user.registerTime)).toLocaleString() }} <br />
			</div>
		</v-card-text>
		<v-card-title v-if="display_privileges"> 权限 </v-card-title>
		<v-card-text v-if="display_privileges">
			<v-list density="compact">
				<v-list-item
					v-for="role in ROLE_MASKS"
					:key="role.name"
					:title="role.name"
					>
					<template v-slot:prepend>
						<v-icon icon="mdi-check" v-if="user.roleMask & role.mask"></v-icon>
						<v-icon icon="mdi-close" v-else></v-icon>
					</template>
				</v-list-item>
			</v-list>
		</v-card-text>
	</v-card>
</template>
