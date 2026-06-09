<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowDown,
  Fold,
  House,
  SwitchButton,
  User,
  UserFilled,
  Lock,
} from '@element-plus/icons-vue'
import useUserStore from '@/store/modules/user'
import { constantRoute } from '@/router/routes'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const iconMap: Record<string, Component> = {
  House,
  User,
  UserFilled,
  Lock,
}

type MenuMeta = {
  title?: string
  icon?: string
  hidden?: boolean
}

const menuList = computed(() => {
  const layoutRoute = constantRoute.find((item) => item.name === 'layout')
  const children = layoutRoute?.children || []

  return children
    .filter((item) => !(item.meta as MenuMeta | undefined)?.hidden)
    .filter((item) => !userStore.routes.length || userStore.routes.includes(String(item.name)))
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

const handleLogout = async () => {
  await userStore.userLogout()
  await router.push('/login')
}
</script>

<template>
  <div class="layout">
    <aside class="layout-aside">
      <div class="brand">
        <SvgIcon name="dashboard" :size="24" />
        <span>后台管理系统</span>
      </div>

      <el-menu class="menu" :default-active="activeMenu" router>
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
        <el-button :icon="Fold" text />

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

      <main class="layout-content">
        <router-view />
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

.layout-content {
  min-height: calc(100vh - 56px);
  padding: 18px;
}

@media (width <= 760px) {
  .layout {
    grid-template-columns: 64px minmax(0, 1fr);
  }

  .brand span,
  .menu span {
    display: none;
  }

  .brand {
    justify-content: center;
    padding: 0;
  }
}
</style>
