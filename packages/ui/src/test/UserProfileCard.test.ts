import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from 'vue-router'
import UserProfileCard from "../components/UserProfileCard.vue";

describe('RanklistTable', () => {
    test('mount component', () => {
        expect(UserProfileCard).toBeTruthy()
        const wrapper = mount(UserProfileCard, {
            props: {
                user: {
                    id: 0,
                    name: "usr",
                    registerTime: 1e12,
                    password: "",
                    roleMask: 15,
                    metadata: {
                        motto: "hello world",
                        email: "123@456.789"
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
        expect(wrapper.text()).toContain('格言: hello world')
        expect(wrapper.text()).toContain('Email: 123@456.789')
        expect(wrapper.html()).not.toContain('权限')
    });
    test('mount component (display privileges)', () => {
        expect(UserProfileCard).toBeTruthy()
        const wrapper = mount(UserProfileCard, {
            props: {
                user: {
                    id: 0,
                    name: "usr",
                    registerTime: 1e12,
                    password: "",
                    roleMask: 15,
                    metadata: {
                        motto: "hello world",
                        email: "123@456.789"
                    }
                },
                display_privileges: true
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
        expect(wrapper.text()).toContain('格言: hello world')
        expect(wrapper.text()).toContain('Email: 123@456.789')
        expect(wrapper.text()).toContain('权限')
        expect(wrapper.html()).toContain('普通用户')
        expect(wrapper.html()).toContain('系统管理员')
        expect(wrapper.html()).toContain('题库管理员')
        expect(wrapper.html()).toContain('比赛管理员')
    })
})
