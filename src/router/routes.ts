export const constantRoute = [
  {
    path: '/login',
    component: () => import('@/views/login/index.vue'),
    name: 'login',
    meta: {
      hidden: true,
    },
  },
  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    name: 'layout',
    redirect: '/home',
    children: [
      {
        path: '/home',
        component: () => import('@/views/home/index.vue'),
        name: 'home',
        meta: {
          title: '首页',
          icon: 'House',
        },
      },
      {
        path: '/about',
        component: () => import('@/views/about/index.vue'),
        name: 'about',
        meta: {
          title: '关于系统',
          icon: 'User',
        },
      },
      {
        path: '/user',
        component: () => import('@/views/user/index.vue'),
        name: 'user',
        meta: {
          title: '用户管理',
          icon: 'User',
        },
      },
    ],
  },
  {
    path: '/404',
    component: () => import('@/views/404/index.vue'),
    name: '404',
    meta: {
      hidden: true,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
    name: 'Any',
    meta: {
      hidden: true,
    },
  },
]
