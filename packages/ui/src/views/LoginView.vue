<script setup lang="ts">
import { tryLogin, fetchWithAuthInJson } from "../api/authorization";
import { ref } from 'vue'

let form = ref(false)
let username = ref(null)
let password = ref(null)
let loading = ref(false)

function onSubmit() {
	if (!form.value) {
		alert("表单未填写完整")
		return
	}
	try {
		tryLogin(username.value!, password.value!).then(() => {
			window.location.href = "/"
		}).catch((e) => {
			alert(e)
		})

	} catch (e) {
		alert(e)
	}
}

function required(value: string) {
	return !!value || "必填项"
}

</script>

<template>
	<v-row
	class="mt-10"
	justify="center">
		<h1>
			登录 ParaLab 账户
		</h1>
		<br>
	</v-row>
	<v-row
	class="mt-10"
	justify="center"
    >
	<v-card 
	width="500px"
	class="px-6 py-6">
		<v-form
		v-model="form"
        @submit.prevent="onSubmit">
			<v-text-field
				label="用户名"
				type="text"
				v-model:model-value="username"
				:readonly="loading"
				:rules="[required]"
				class="mb-2"
				clearable
				variant="solo"
				prepend-inner-icon="mdi-account"
				autocomplete="username"
			/>

			<v-text-field
				label="密码"
				type="password"
				v-model:model-value="password"
				:readonly="loading"
				:rules="[required]"
				class="mb-2"
				clearable
				variant="solo"
				prepend-inner-icon="mdi-lock"
				autocomplete="current-password"
			/>
		
			<v-btn
				text="登录"
				:disabled="!form"
				:loading="loading"
				block
				color="success"
				size="large"
				type="submit"
				variant="elevated"
			/>
		</v-form>
	</v-card>
	</v-row>
	
</template>
