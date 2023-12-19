import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from 'vue-router'
import RecursiveJson from "../components/RecursiveJson.vue";

describe('RanklistTable', () => {
    test('mount component', () => {
        expect(RecursiveJson).toBeTruthy()
        const wrapper = mount(RecursiveJson, {
            props: {
                json: {
                    subtask1 : {
                        score : 100,
                        time : "1s",
                        memory : "1.0GB"
                    },
                    subtask2 : {
                        score : 200,
                        time : "2s",
                        memory : "2.0GB"
                    }
                }
            },
            global: {
                plugins: [createRouter({
                  history : createWebHistory(),
                  routes: [
                    {
                      path: '/',
                      component: () => import('../views/HomeView.vue')
                    }
                  ]
                })]
            }
        })
        expect(wrapper).toBeTruthy()
        expect(wrapper.html()).toContain('subtask1')
        expect(wrapper.html()).toContain('subtask2')
        expect(wrapper.html()).toContain('score')
        expect(wrapper.html()).toContain('time')
        expect(wrapper.html()).toContain('memory')
        expect(wrapper.text()).toContain('100')
        expect(wrapper.text()).toContain('200')
        expect(wrapper.text()).toContain('1s')
        expect(wrapper.text()).toContain('2s')
        expect(wrapper.text()).toContain('1.0GB')
        expect(wrapper.text()).toContain('2.0GB')
    })
})
