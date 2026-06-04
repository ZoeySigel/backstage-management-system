<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { Lock, User } from '@element-plus/icons-vue'
import useUserStore from '@/store/modules/user'
import type { LoginForm } from '@/api/user/type'

const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref<FormInstance>()
const loading = ref(false)

const loginForm = reactive<LoginForm>({
  username: 'admin',
  password: '111111',
})

const loginRules: FormRules<LoginForm> = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应为 3 到 20 位', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应为 6 到 20 位', trigger: 'blur' },
  ],
}

const login = async () => {
  const valid = await loginFormRef.value?.validate().catch(() => false)

  if (!valid) {
    return
  }

  loading.value = true

  try {
    await userStore.userLogin(loginForm)
    ElMessage.success('登录成功')
    await router.push('/')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="login-page">
    <section class="brand-panel">
      <div class="brand-content">
        <img class="brand-visual" src="@/assets/hero.png" alt="" />
        <p class="eyebrow">Silicon Selection</p>
        <h1>硅谷甄选运营平台</h1>
        <p class="summary">统一管理商品、订单、权限与运营数据，让后台工作更清晰高效。</p>
      </div>
    </section>

    <section class="form-panel">
      <el-form
        ref="loginFormRef"
        class="login-form"
        :model="loginForm"
        :rules="loginRules"
        size="large"
        @keyup.enter="login"
      >
        <div class="form-heading">
          <h2>欢迎登录</h2>
          <p>请输入账号信息进入管理后台</p>
        </div>

        <el-form-item prop="username">
          <el-input
            v-model.trim="loginForm.username"
            placeholder="请输入用户名"
            :prefix-icon="User"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model.trim="loginForm.password"
            placeholder="请输入密码"
            type="password"
            show-password
            :prefix-icon="Lock"
          />
        </el-form-item>

        <div class="form-options">
          <el-checkbox>记住账号</el-checkbox>
          <el-button link type="primary">忘记密码？</el-button>
        </div>

        <el-button
          class="login-button"
          type="primary"
          size="large"
          :loading="loading"
          @click="login"
        >
          {{ loading ? '登录中...' : '登录' }}
        </el-button>
      </el-form>
    </section>
  </main>
</template>

<style scoped lang="scss">
.login-page {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(420px, 0.9fr);
  min-height: 100vh;
  overflow: hidden;
  background: #f6f8fb;
}

.brand-panel {
  position: relative;
  display: grid;
  place-items: center;
  padding: 64px;
  color: #fff;
  background:
    linear-gradient(135deg, rgb(18 28 45 / 92%), rgb(32 55 88 / 88%)),
    radial-gradient(circle at 28% 22%, rgb(64 158 255 / 42%), transparent 32%);
}

.brand-content {
  width: min(560px, 100%);
}

.brand-visual {
  width: min(320px, 72%);
  margin-bottom: 48px;
  filter: drop-shadow(0 28px 42px rgb(0 0 0 / 26%));
}

.eyebrow {
  margin: 0 0 14px;
  font-size: 14px;
  font-weight: 700;
  color: #9ed2ff;
  text-transform: uppercase;
  letter-spacing: 0;
}

h1 {
  margin: 0;
  font-size: 44px;
  line-height: 1.18;
}

.summary {
  max-width: 480px;
  margin: 22px 0 0;
  font-size: 17px;
  line-height: 1.8;
  color: rgb(255 255 255 / 78%);
}

.form-panel {
  display: grid;
  place-items: center;
  padding: 48px;
  background: #fff;
}

.login-form {
  width: min(420px, 100%);
}

.form-heading {
  margin-bottom: 34px;
}

.form-heading h2 {
  margin: 0;
  font-size: 30px;
  line-height: 1.3;
  color: #1f2d3d;
}

.form-heading p {
  margin: 10px 0 0;
  font-size: 15px;
  color: #7a8494;
}

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 4px 0 24px;
}

.login-button {
  width: 100%;
  font-weight: 700;
}

@media (width <= 900px) {
  .login-page {
    grid-template-columns: 1fr;
  }

  .brand-panel {
    min-height: 34vh;
    padding: 40px 28px;
  }

  .brand-visual {
    width: 160px;
    margin-bottom: 24px;
  }

  h1 {
    font-size: 32px;
  }

  .summary {
    font-size: 15px;
  }

  .form-panel {
    padding: 40px 24px;
  }
}
</style>
