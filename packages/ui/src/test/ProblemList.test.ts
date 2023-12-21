import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from 'vue-router'
import ProblemList from "../components/ProblemList.vue";

describe('RanklistTable', () => {
    test('mount component', () => {
        expect(ProblemList).toBeTruthy()
        const wrapper = mount(ProblemList, {
            props: {
                problems: [
                    {
                        id: 0,
                        name: "A",
                        isPublic: false,
                        allowSubmitFromProblemList: false
                    },
                    {
                        id: 1,
                        name: "B",
                        isPublic: true,
                        allowSubmitFromProblemList: true
                    },
                    {
                        id: 2,
                        name: "C",
                        isPublic: true,
                        allowSubmitFromProblemList: false
                    }
                ]
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
        expect(wrapper.text()).toContain('题目名称')
        expect(wrapper.text()).toContain('A')
        expect(wrapper.text()).toContain('B')
        expect(wrapper.text()).toContain('C')
        expect(wrapper.text()).toContain('0')
        expect(wrapper.text()).toContain('1')
        expect(wrapper.text()).toContain('2')
    })
})
