import type { Context } from '@koishijs/client'
import Home from './home.vue'

// eslint-disable-next-line import/no-default-export
export default (ctx: Context) => {
  // 此 Context 非彼 Context
  // 我们只是在前端同样实现了一套插件逻辑
  ctx.slot({
    type: 'home',
    component: Home,
    order: 2000,
  })
}
