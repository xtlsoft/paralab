<script setup lang="ts">
import user from '../user_data'
import { ref } from 'vue'

let form = ref(false)
let username = ref(null)
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
			/>
			<!-- hide password -->
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
