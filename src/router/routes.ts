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
      {
        path: '/role',
        component: () => import('@/views/role/index.vue'),
        name: 'role',
        meta: {
          title: '角色管理',
          icon: 'UserFilled',
        },
      },
      {
        path: '/permission',
        component: () => import('@/views/permission/index.vue'),
        name: 'permission',
        meta: {
          title: '权限管理',
          icon: 'Lock',
        },
      },
      {
        path: '/brand',
        component: () => import('@/views/brand/index.vue'),
        name: 'brand',
        meta: {
          title: '品牌管理',
          icon: 'Goods',
        },
      },
      {
        path: '/attr',
        component: () => import('@/views/attr/index.vue'),
        name: 'attr',
        meta: {
          title: '平台属性',
          icon: 'SetUp',
        },
      },
      {
        path: '/spu',
        component: () => import('@/views/spu/index.vue'),
        name: 'spu',
        meta: {
          title: 'SPU 管理',
          icon: 'ShoppingCart',
        },
      },
      {
        path: '/sku',
        component: () => import('@/views/sku/index.vue'),
        name: 'sku',
        meta: {
          title: 'SKU 管理',
          icon: 'Box',
        },
      },
      {
        path: '/order',
        component: () => import('@/views/order/index.vue'),
        name: 'order',
        meta: {
          title: '订单管理',
          icon: 'Tickets',
        },
      },
      {
        path: '/operation-log',
        component: () => import('@/views/operationLog/index.vue'),
        name: 'operationLog',
        meta: {
          title: '操作日志',
          icon: 'Document',
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
