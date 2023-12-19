import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import RanklistTable from '../components/RanklistTable.vue'

describe('RanklistTable', () => {
    test('mount component', () => {
        expect(RanklistTable).toBeTruthy()
        const wrapper = mount(RanklistTable, {
            props: {
                contest: {
                    id: 0,
                    name: "Contest",
                    startTime: 4e12,
                    endTime: 6e12,
                    isPublic: true,
                    metadata: {
                        description: "",
                        problems: [{
                            id: 0,
                            weight: 100,
                            name: "A"
                        }]
                    }
                },
                ranklist: {
                    players: [
                        {
                            userId: 0,
                            username: "a",
                            score: 100,
                            details: [
                                {
                                score: 100,
                                submitTime: 4.25e12
                                }
                            ]
                        },
                        {
                            userId: 1,
                            username: "b",
                            score: 75,
                            details: [
                                {
                                score: 75,
                                submitTime: 4.5e12
                                }
                            ]
                        },
                        {
                            userId: 2,
                            username: "c",
                            score: 50,
                            details: [
                                {
                                score: 50,
                                submitTime: 4.75e12
                                }
                            ]
                        },
                        {
                            userId: 3,
                            username: "d",
                            score: 25,
                            details: [
                                {
                                score: 25,
                                submitTime: 5e12
                                }
                            ]
                        },
                        {
                            userId: 4,
                            username: "e",
                            score: 0,
                            details: [
                                {
                                score: 0,
                                submitTime: 5.25e12
                                }
                            ]
                        }
                    ]
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
        expect(wrapper.text()).toContain('名次')
        expect(wrapper.text()).toContain('用户名')
        expect(wrapper.text()).toContain('总分')
        expect(wrapper.text()).toContain('A')
        expect(wrapper.text()).toContain('1')
        expect(wrapper.text()).toContain('2')
        expect(wrapper.text()).toContain('3')
        expect(wrapper.text()).toContain('4')
        expect(wrapper.text()).toContain('5')
        expect(wrapper.text()).toContain('a')
        expect(wrapper.text()).toContain('b')
        expect(wrapper.text()).toContain('c')
        expect(wrapper.text()).toContain('d')
        expect(wrapper.text()).toContain('e')
        expect(wrapper.text()).toContain('100')
        expect(wrapper.text()).toContain('75')
        expect(wrapper.text()).toContain('50')
        expect(wrapper.text()).toContain('25')
        expect(wrapper.text()).toContain('0')
    })
})
