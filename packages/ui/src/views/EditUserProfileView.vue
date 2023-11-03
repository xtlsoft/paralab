<script setup lang="ts">
import { useRoute } from 'vue-router'
import type { Suspense, Ref } from 'vue';
import { ref } from 'vue';
import { onMounted } from 'vue';

import UserProfileCard from '@/components/UserProfileCard.vue';
import type { User } from '@paralab/proto';
import { ROLE_SYS_ADMIN, ROLE_MASKS } from '@paralab/proto';
import { fetchWithAuthInJson, getLoggedInUserInfo } from '@/api/authorization';

const route = useRoute()

const userId = parseInt(route.params.userId as string);

let basic_info_form = ref(false);
let change_password_form = ref(false);
let change_permission_form = ref(false);

let user_info = ref({} as User);
let username = ref("");
let loaded = ref(false);

let entered_email = ref("");
let entered_motto = ref("");

let entered_old_password = ref("");
let entered_new_password = ref("");
let entered_repeat_password = ref("");

let selected_roles = ref([] as number[]);

function onSubmitBasicInfoForm() {
	fetchWithAuthInJson(`/api/user/${userId}/basic_info`, "PUT", {
		email: entered_email.value,
		motto: entered_motto.value,
	}).then((res) => {
		alert("修改成功")
	}).catch((e) => {
		console.log(e)
		alert(`修改失败: ${e}`)
	})
}

function onSubmitChangePasswordForm() {
	if (entered_new_password.value !== entered_repeat_password.value) {
		alert("两次输入的密码不一致")
		return
	}
	fetchWithAuthInJson(`/api/user/${userId}/password`, "PUT", {
		old_password: entered_old_password.value,
		new_password: entered_new_password.value,
	}).then((res) => {
		alert("修改成功")
	}).catch((e) => {
		console.log(e)
		alert(`修改失败: ${e}`)
	})
}

function onSubmitChangePermissionForm() {
	let new_roles = 0;
	for (let role of selected_roles.value) {
		new_roles |= role;
	}
	fetchWithAuthInJson(`/api/user/${userId}/role_mask`, "PUT", {
		new_roles: new_roles,
	}).then((res) => {
		alert("修改成功")
		// We force the user to refresh the window to invalidate the access token
		// since the access token contains the role mask which will read by
		// the backend to determine the user's permission.
		window.location.reload()
	}).catch((e) => {
		console.log(e)
		alert(`修改失败: ${e}`)
	})

}

function required(value: string) {
	return !!value || "必填项"
}

function isEmail(value: string) {
	return /.+@.+/.test(value) || 'Invalid Email address'
}

onMounted(async () => {
	user_info.value = (await fetchWithAuthInJson(`/api/user/${userId}`, "GET", {}).then((res) => {
		return res as User
	}).catch((e) => {
		console.log(e)
		alert(`获取用户信息失败: ${e}`)
	}))!;
	username.value = user_info.value.name;
	entered_email.value = user_info.value.metadata.email;
	entered_motto.value = user_info.value.metadata.motto;
	for (let role of ROLE_MASKS) {
		if ((user_info.value.roleMask & role.mask) !== 0) {
			selected_roles.value.push(role.mask)
		}
	}
	loaded.value = true;
})

</script>

<template>
	<h1 style="margin-top: 2rem">编辑用户信息</h1>
	<v-row
	style="margin-top: 1rem">
		<v-col
			cols="6"
		>
			<v-card
			v-if="loaded"
			:title="user_info.name"
			:subtitle="`UID: ${userId}`"
			class="px-3">
			</v-card>

			<v-card
			class="px-3 py-3 mt-6">
				<v-card-title>编辑基础信息</v-card-title>
				<v-form
				v-model="basic_info_form"
				@submit.prevent="onSubmitBasicInfoForm">
					<v-text-field
					label="邮箱"
					v-model:model-value="entered_email"
					:rules="[required, isEmail]"
					prepend-inner-icon="mdi-email"
					autocomplete="email"
					class="mt-2"
					/>

					<v-text-field
					label="格言"
					v-model:model-value="entered_motto"
					prepend-inner-icon="mdi-chat"
					/>

					<v-btn
					color="blue"
					text="提交"
					type="submit"
					/>
				</v-form>
			</v-card>
		</v-col>

		<v-col
			cols="6"
		>
			<v-card
			class="px-3 py-3">
				<v-card-title>更改密码</v-card-title>
				<v-form
				v-model="change_password_form"
				@submit.prevent="onSubmitChangePasswordForm">
					<!-- We put a hidden username field here to assist the password manager -->
					<v-text-field
					label="username"
					type="text"
					autocomplete="username"
					v-model:model-value="username"
					style="display: none"
					/>

					<v-text-field
					label="旧密码"
					type="password"
					v-model:model-value="entered_old_password"
					:rules="[required]"
					prepend-inner-icon="mdi-key"
					autocomplete="current-password"
					class="mt-2"
					/>

					<v-text-field
					label="新密码"
					type="password"
					v-model:model-value="entered_new_password"
					prepend-inner-icon="mdi-key-outline"
					autocomplete="new-password"
					/>

					<v-text-field
					label="确认密码"
					type="password"
					v-model:model-value="entered_repeat_password"
					prepend-inner-icon="mdi-key-outline"
					autocomplete="new-password"
					/>

					<v-btn
					color="blue"
					text="提交"
					type="submit"
					/>
				</v-form>
			</v-card>
			
			<v-card
			class="px-3 py-3 mt-6"
			v-if="getLoggedInUserInfo() && (getLoggedInUserInfo()!.roleMask & ROLE_SYS_ADMIN)">
				<v-card-title>更改用户权限</v-card-title>
				<v-form
				v-model="change_permission_form"
				@submit.prevent="onSubmitChangePermissionForm">
					<v-list density="compact">
						<v-list-item v-for="role in ROLE_MASKS" :key="role.mask">
							<v-switch
							:label="role.name"
							:value="role.mask"
							v-model="selected_roles"
							color="info"
							density="compact"
							style="padding-left: 10px;">
							</v-switch>
						</v-list-item>
					</v-list>

					<v-btn
					color="blue"
					text="提交"
					type="submit"
					/>
				</v-form>
			</v-card>
		</v-col>
	</v-row>
	
</template>
