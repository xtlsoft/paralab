import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from 'vue-router'
import ContestList from "../components/ContestList.vue";

describe('RanklistTable', () => {
    test('mount component', () => {
        expect(ContestList).toBeTruthy()
        const wrapper = mount(ContestList, {
            props: {
                contests: [
                    {
                        id : 0,
                        name : "X",
                        startTime : 4e12,
                        endTime : 6e12,
                        isPublic : true
                    },
                    {
                        id : 1,
                        name : "Y",
                        startTime : 5e12,
                        endTime : 7e12,
                        isPublic : true
                    },
                    {
                        id : 2,
                        name : "Z",
                        startTime : 6e12,
                        endTime : 8e12,
                        isPublic : true
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
        expect(wrapper.text()).toContain('比赛')
        expect(wrapper.text()).toContain('开始时间')
        expect(wrapper.text()).toContain('结束时间')
        expect(wrapper.text()).toContain('10/2/2096')
        expect(wrapper.text()).toContain('0')
        expect(wrapper.text()).toContain('1')
        expect(wrapper.text()).toContain('2')
    })
})
