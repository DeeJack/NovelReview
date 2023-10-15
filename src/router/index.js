import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'library',
      component: () => import('../views/Library.vue'),
      meta: {
        title: 'Library'
      }
    },
    {
      path: '/edit',
      name: 'Edit',
      params: true,
      component: () => import('../views/EditEntry.vue'),
      meta: {
        title: 'Edit Entry'
      }
    }
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => {}
    // }
  ]
})

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title}`
  next()
})

export default router
