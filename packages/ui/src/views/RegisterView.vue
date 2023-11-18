<script setup lang="ts">
import { ref } from 'vue'

let form = ref(false)
let username = ref(null)
let email = ref(null)
let password0 = ref(null)
let password1 = ref(null)
let loading = ref(false)

function onSubmit() {
	console.log("onSubmit")
	if (!form.value) {
		alert("表单未填写完整")
		return
	}
    if (password0.value != password1.value) {
        alert("两次输入的密码不一致")
        return
    }
	fetch("/api/user/register", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			userName: username.value,
			email: email.value,
			password: password0.value
		})
	}).then(async (res) => {
		if (res.ok) {
			alert("注册成功")
			window.location.href = "/login"
		} else {
			const json = await res.json();
			alert(`注册失败: ${json["message"] || res.statusText}`)
		}
	}).catch((e) => {
		alert(e)
	})
}

function required(value: string) {
	return !!value || "必填项"
}

function isEmail(value: string) {
	return /.+@.+/.test(value) || 'Invalid Email address'
}

</script>

<template>
	<v-row
	class="mt-10"
	justify="center">
		<h1>
			注册新 ParaLab 账户
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
			label="Email"
			v-model:model-value="email"
			:readonly="loading"
			:rules="[required, isEmail]"
			class="mb-2"
			clearable
			variant="solo"
			prepend-inner-icon="mdi-email"
			autocomplete="email"
			/>

			<v-text-field
			label="密码"
			type="password"
			v-model:model-value="password0"
			:readonly="loading"
			:rules="[required]"
			class="mb-2"
			clearable
			variant="solo"
			prepend-inner-icon="mdi-lock"
			autocomplete="new-password"
			/>

            <v-text-field
			label="确认密码"
			type="password"
			v-model:model-value="password1"
			:readonly="loading"
			:rules="[required]"
			class="mb-2"
			clearable
			variant="solo"
			prepend-inner-icon="mdi-lock"
			autocomplete="new-password"
			/>
		
			<v-btn
			text="注册"
			:disabled="!form"
			:loading="loading"
			block
			color="blue"
			size="large"
			type="submit"
			variant="elevated"/>
		</v-form>
	</v-card>
	</v-row>
	
</template>
