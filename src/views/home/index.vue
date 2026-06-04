<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)

const increase = () => {
  count.value++
}
</script>

<template>
  <main class="home-page">
    <h1>后台首页</h1>
    <p>欢迎进入后台管理系统</p>

    <el-button type="primary" @click="increase"> 点击次数：{{ count }} </el-button>
  </main>
</template>

<style scoped lang="scss">
.home-page {
  padding: 24px;
}

h1 {
  margin: 0 0 12px;
  font-size: 24px;
}

p {
  margin: 0 0 16px;
  color: #606266;
}
</style>
