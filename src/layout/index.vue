<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowDown,
  Expand,
  Fold,
  House,
  SwitchButton,
  User,
  UserFilled,
  Lock,
  Goods,
  SetUp,
  ShoppingCart,
  Box,
  CircleClose,
  Document,
  RefreshRight,
  Tickets,
} from '@element-plus/icons-vue'
import useUserStore from '@/store/modules/user'
import { constantRoute } from '@/router/routes'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const isCollapsed = ref(globalThis.localStorage.getItem('SIDEBAR_COLLAPSED') === 'true')

const iconMap: Record<string, Component> = {
  House,
  User,
  UserFilled,
  Lock,
  Goods,
  SetUp,
  ShoppingCart,
  Box,
  Tickets,
  Document,
}

type MenuMeta = {
  title?: string
  icon?: string
  hidden?: boolean
}

type VisitedTab = {
  path: string
  title: string
}

const visitedTabs = ref<VisitedTab[]>([{ path: '/home', title: '首页' }])
const refreshKey = ref(0)

const menuList = computed(() => {
  const layoutRoute = constantRoute.find((item) => item.name === 'layout')
  const children = layoutRoute?.children || []

  return children
    .filter((item) => !(item.meta as MenuMeta | undefined)?.hidden)
    .filter((item) => userStore.routes.includes(String(item.name)))
    .map((item) => {
      const meta = item.meta as MenuMeta | undefined

      return {
        path: item.path,
        title: String(meta?.title || item.name),
        icon: iconMap[String(meta?.icon)] || House,
      }
    })
})

const activeMenu = computed(() => route.path)
const pageTitle = computed(() => String(route.meta.title || '后台管理系统'))
const breadcrumbList = computed(() => {
  if (route.name === 'home') {
    return [{ title: '首页', path: '' }]
  }

  return [
    { title: '首页', path: '/home' },
    { title: pageTitle.value, path: '' },
  ]
})

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
  globalThis.localStorage.setItem('SIDEBAR_COLLAPSED', String(isCollapsed.value))
}

const closeTab = (path: string) => {
  const index = visitedTabs.value.findIndex((item) => item.path === path)

  if (index === -1 || path === '/home') {
    return
  }

  const nextTab = visitedTabs.value[index - 1] || visitedTabs.value[index + 1]
  visitedTabs.value.splice(index, 1)

  if (route.path === path) {
    router.push(nextTab?.path || '/home')
  }
}

const closeOtherTabs = () => {
  const currentTab = visitedTabs.value.find((item) => item.path === route.path)
  visitedTabs.value = [
    { path: '/home', title: '首页' },
    ...(currentTab && currentTab.path !== '/home' ? [currentTab] : []),
  ]
}

const refreshCurrentPage = () => {
  refreshKey.value++
}

const handleLogout = async () => {
  await userStore.userLogout()
  await router.push('/login')
}

watch(
  () => route.path,
  () => {
    if (route.meta.hidden) {
      return
    }

    const exists = visitedTabs.value.some((item) => item.path === route.path)

    if (!exists) {
      visitedTabs.value.push({
        path: route.path,
        title: String(route.meta.title || route.name),
      })
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="layout" :class="{ 'layout--collapsed': isCollapsed }">
    <aside class="layout-aside">
      <div class="brand">
        <SvgIcon name="dashboard" :size="24" />
        <span v-show="!isCollapsed">后台管理系统</span>
      </div>

      <el-menu class="menu" :default-active="activeMenu" :collapse="isCollapsed" router>
        <el-menu-item v-for="item in menuList" :key="item.path" :index="item.path">
          <el-icon>
            <component :is="item.icon" />
          </el-icon>
          <span>{{ item.title }}</span>
        </el-menu-item>
      </el-menu>
    </aside>

    <section class="layout-main">
      <header class="layout-header">
        <div class="header-left">
          <el-tooltip :content="isCollapsed ? '展开菜单' : '收起菜单'" placement="bottom">
            <el-button
              :icon="isCollapsed ? Expand : Fold"
              text
              aria-label="切换侧边栏"
              @click="toggleSidebar"
            />
          </el-tooltip>

          <el-breadcrumb separator="/">
            <el-breadcrumb-item
              v-for="item in breadcrumbList"
              :key="item.title"
              :to="item.path || undefined"
            >
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <el-dropdown>
          <button class="user-entry" type="button">
            <el-avatar :size="32" :src="userStore.avatar">
              {{ userStore.username.slice(0, 1).toUpperCase() }}
            </el-avatar>
            <span>{{ userStore.username || '管理员' }}</span>
            <el-icon>
              <ArrowDown />
            </el-icon>
          </button>

          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item :icon="SwitchButton" @click="handleLogout"
                >退出登录</el-dropdown-item
              >
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </header>

      <nav class="tags-view" aria-label="已访问页面">
        <div class="tags-scroll">
          <el-tag
            v-for="tab in visitedTabs"
            :key="tab.path"
            :type="route.path === tab.path ? 'primary' : 'info'"
            :effect="route.path === tab.path ? 'dark' : 'plain'"
            :closable="tab.path !== '/home'"
            class="page-tag"
            @click="router.push(tab.path)"
            @close="closeTab(tab.path)"
          >
            {{ tab.title }}
          </el-tag>
        </div>

        <div class="tag-actions">
          <el-tooltip content="刷新当前页" placement="bottom">
            <el-button
              :icon="RefreshRight"
              text
              aria-label="刷新当前页"
              @click="refreshCurrentPage"
            />
          </el-tooltip>
          <el-tooltip content="关闭其他页签" placement="bottom">
            <el-button :icon="CircleClose" text aria-label="关闭其他页签" @click="closeOtherTabs" />
          </el-tooltip>
        </div>
      </nav>

      <main class="layout-content">
        <router-view v-slot="{ Component: routeComponent }">
          <component :is="routeComponent" :key="`${route.fullPath}-${refreshKey}`" />
        </router-view>
      </main>
    </section>
  </div>
</template>

<style scoped lang="scss">
.layout {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  min-height: 100vh;
  background: #eef2f6;
  transition: grid-template-columns 0.2s ease;
}

.layout--collapsed {
  grid-template-columns: 64px minmax(0, 1fr);
}

.layout-aside {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  color: #dbe7f6;
  background: #1f2a37;
}

.brand {
  display: flex;
  gap: 10px;
  align-items: center;
  height: 56px;
  padding: 0 18px;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  border-bottom: 1px solid rgb(255 255 255 / 8%);
}

.menu {
  flex: 1;
  border-right: 0;
}

.layout--collapsed .brand {
  justify-content: center;
  padding: 0;
}

.layout--collapsed .menu {
  width: 64px;
}

.layout-aside :deep(.el-menu) {
  background: transparent;
}

.layout-aside :deep(.el-menu-item) {
  color: #c8d3df;
}

.layout-aside :deep(.el-menu-item:hover),
.layout-aside :deep(.el-menu-item.is-active) {
  color: #fff;
  background: #2f80ed;
}

.layout-main {
  min-width: 0;
}

.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 18px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
}

.header-left {
  display: flex;
  gap: 14px;
  align-items: center;
  min-width: 0;
}

.user-entry {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  height: 40px;
  padding: 0 6px;
  color: #303133;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.tags-view {
  display: flex;
  align-items: center;
  height: 42px;
  padding: 0 10px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 1px 3px rgb(31 42 55 / 6%);
}

.tags-scroll {
  display: flex;
  flex: 1;
  gap: 8px;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: thin;
}

.page-tag {
  flex: 0 0 auto;
  cursor: pointer;
  border-radius: 3px;
}

.tag-actions {
  display: flex;
  flex: 0 0 auto;
  padding-left: 8px;
  margin-left: 8px;
  border-left: 1px solid #e4e7ed;
}

.layout-content {
  min-height: calc(100vh - 98px);
  padding: 18px;
}

@media (width <= 760px) {
  .layout {
    grid-template-columns: 64px minmax(0, 1fr);
  }

  .brand span {
    display: none;
  }

  .brand {
    justify-content: center;
    padding: 0;
  }

  .menu,
  .layout-aside :deep(.el-menu) {
    width: 64px;
  }

  .layout-aside :deep(.el-menu-item span) {
    display: none;
  }

  .layout-aside :deep(.el-menu-item) {
    justify-content: center;
    padding: 0;
  }

  .layout-header {
    padding: 0 10px;
  }

  .header-left {
    gap: 6px;
  }

  .user-entry span,
  .user-entry .el-icon {
    display: none;
  }

  .tags-view {
    padding: 0 6px;
  }

  .tag-actions {
    padding-left: 4px;
    margin-left: 4px;
  }
}
</style>
