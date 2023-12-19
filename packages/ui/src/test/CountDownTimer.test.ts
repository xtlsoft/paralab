import { mount } from '@vue/test-utils'
import CountDownTimer from '../components/CountDownTimer.vue'

describe('CountDownTimer', () => {
    test('mount component', () => {
        expect(CountDownTimer).toBeTruthy()
        const wrapper = mount(CountDownTimer, {
            props: {
                startTime : 0,
                endTime : 100
            }
        })
        expect(wrapper).toBeTruthy()
        expect(wrapper.text()).toContain('天')
    });
})
