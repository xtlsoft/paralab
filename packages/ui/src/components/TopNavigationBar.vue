<script setup lang="ts">
import user from '../user_data'
</script>

<template>
	<v-app-bar
	:border=10>
		<template #prepend>
			<v-btn
				to="/"
				prepend-icon="mdi-home">
				首页
			</v-btn>
			
			<v-btn
				to="/problemlist"
				prepend-icon="mdi-bookshelf">
				题库
			</v-btn>
		</template>

		<template #append>
			<v-menu>
				<template v-slot:activator="{ props }">
					<v-btn
					v-bind="props"
								append-icon="mdi-menu-down"
					>
					{{ user.name }}
					</v-btn>
				</template>

				<v-list>
					<v-list-item
					prepend-icon="mdi-account"
					title="Profile"
					:to="`/user/${ user.uid }`"/>
					<v-list-item
					prepend-icon="mdi-logout"
					title="Logout"/>
				</v-list>
			</v-menu>
		</template>
	</v-app-bar>    
    
</template>

