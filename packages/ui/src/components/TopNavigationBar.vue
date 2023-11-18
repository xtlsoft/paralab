<script setup lang="ts">
import { ref } from "vue"
import * as authorization from "@/api/authorization"

const user = authorization.getLoggedInUserInfo()
const is_logged_in = ref(user !== undefined);

function onClickLogout() {
	authorization.logout()
	window.location.reload()
}
</script>

<template>
	<v-app-bar
	:border=10>
		<template #prepend>
			<v-btn 
			to="/"
			class="mr-4 ml-4"
			rounded="0"
			variant="flat"
			:active="false"
			style="display: flex; align-items: center; height: 100%">
				<img src="/src/assets/hpcgame-logo.svg" style="height: 40px; margin-right: 14px;"/>
				<span style="font-size: 20px;">ParaLab</span>
			</v-btn>
			<v-btn
			to="/"
			class="mr-4"
			prepend-icon="mdi-home">
				首页
			</v-btn>
			<v-btn
			to="/problemlist"
			class="mr-4"
			prepend-icon="mdi-bookshelf">
				题库
			</v-btn>
			<v-btn
			to="/contestlist"
			class="mr-4"
			prepend-icon="mdi-sword-cross">
				比赛
			</v-btn>
			<v-btn
			to="/submissionlist"
			class="mr-4"
			prepend-icon="mdi-server-outline">
			评测记录
			</v-btn>
		</template>
		<template #append>
			<v-menu v-if="is_logged_in">
				<template v-slot:activator="{ props }">
					<v-btn
					v-bind="props"
					append-icon="mdi-menu-down"
					>
					{{ user?.name ?? "未登录" }}
					</v-btn>
				</template>

				<v-list>
					<v-list-item
					prepend-icon="mdi-account"
					title="Profile"
					:to="`/user/${ user?.id }`"/>
					<v-list-item
					prepend-icon="mdi-logout"
					title="Logout"
					@click="onClickLogout"/>
				</v-list>
			</v-menu>
			<div v-else>
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
			</div>
		</template>
	</v-app-bar>    
    
</template>

