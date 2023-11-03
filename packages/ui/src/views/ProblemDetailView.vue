<script setup lang="ts">

import problems from '../problem_data'
import SampleCard from '@/components/SampleCard.vue'
import ProblemHeader from '@/components/ProblemHeader.vue';
import { useRoute } from 'vue-router'
import { ref } from 'vue'
import VueMarkdown from 'vue-markdown-render'

const route = useRoute()
const pdata = problems.find ( 
  (item) => item.id === parseInt(route.params.problemid as string) 
)!;

const desciption_md = ref(pdata.desciption_md)

let str = "## fuck\n### fucker"
</script>

<template>
	<ProblemHeader />
	<v-row> 
		<!-- under title line -->
		<v-col
		cols = "9">
			<VueMarkdown
				:source="pdata.desciption_md"/>
		</v-col>
			<!-- problem text -->
			<!-- <v-row>
				
				<h2>
						题目描述
				</h2>
			</v-row>
			<v-row>
				<div>{{ pdata.desciption }}</div>
			</v-row>
			<v-row v-if="pdata.input_format">
				<h2>
						输入格式
				</h2>
			</v-row>
			<v-row v-if="pdata.input_format">
				<div>{{ pdata.input_format }}</div>
			</v-row>
			<v-row v-if="pdata.output_format">
				<h2>
						输出格式
				</h2>
			</v-row>
			<v-row v-if="pdata.output_format">
					<div>{{ pdata.output_format }}</div>
			</v-row>
			<v-row>
				<h2>
						样例
				</h2>
			</v-row>
			
			
			<v-row>
				<v-col v-if="pdata.input_sample">
					<SampleCard
					title = "样例输入" 
					:text="pdata.input_sample"
					/>
				</v-col>
				<v-col>
					<SampleCard
					title = "样例输出" 
					:text="pdata.output_sample"
					/>
				</v-col>
			</v-row>
		</v-col> -->

		<v-col>
			<v-list>
				<v-list-item 
				:to="`/submit/${ pdata.id }`"
				prepend-icon="mdi-send-variant" 
				title="提交"/>
				<v-list-item 
				link 
				prepend-icon="mdi-format-list-bulleted"
				title="提交记录"></v-list-item>
				<v-list-item 
				link 
				prepend-icon="mdi-sort-ascending"
				title="统计"></v-list-item>
			</v-list>
		</v-col>
	</v-row>
</template>

<style scoped>
h2 {
  margin-top: 1rem;
}
</style>