<script setup lang="ts">
import user from '../user_data'
</script>

<template>
	<v-app-bar
	:border=10>
		<template #prepend>
			<v-btn
			to="/"
			class="mr-4"
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
			<v-btn
			to="/login"
			class="mr-4"
			variant="flat"
			color="success"
			>
				登录
			</v-btn>
			<v-btn
			to="/register"
			class="mr-4"
			variant="flat"
			color="blue"
			>
				注册
			</v-btn>
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

