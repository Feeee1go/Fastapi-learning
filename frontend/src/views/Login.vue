<template>
  <div class="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
    <div class="w-full max-w-md p-6 bg-zinc-900/70 border border-zinc-800 rounded-xl shadow-sm">
      <h2 class="text-2xl font-semibold mb-4">登录</h2>
      <form @submit.prevent="onSubmit" class="space-y-4">
        <div>
          <label class="block text-sm mb-1">邮箱</label>
          <input v-model="email" type="email" required class="w-full px-3 py-2 rounded border border-zinc-700 bg-zinc-800 text-white" placeholder="name@example.com" />
        </div>
        <div>
          <label class="block text-sm mb-1">密码</label>
          <input v-model="password" type="password" required class="w-full px-3 py-2 rounded border border-zinc-700 bg-zinc-800 text-white" placeholder="******" />
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm text-zinc-400">使用邮箱作为用户名登录</span>
          <button type="submit" class="px-4 py-2 rounded bg-accent-500 hover:bg-accent-600">登录</button>
        </div>
        <div v-if="error" class="text-sm text-red-400">{{ error }}</div>
      </form>
      <div class="text-sm text-center mt-2">
        <span class="text-zinc-400">No account? </span>
        <a class="text-accent-500 hover:underline cursor-pointer" @click="goRegister">Create one</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import api from '@/utils/request'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()
const userStore = useUserStore()

async function onSubmit() {
  error.value = ''
  const form = new URLSearchParams()
  // OAuth2PasswordRequestForm 需要 grant_type、username、password，并可选 scope
  form.append('grant_type', 'password')
  form.append('username', email.value)
  form.append('password', password.value)
  form.append('scope', '')

  try {
    const res = await api.post('/login', form)
    // Support common token shapes
    const data = res.data ?? {}
    const token = data.access_token ?? data.token ?? null
    if (token) {
      userStore.setToken(token)
      // Basic user info, can be extended if backend returns user data
      userStore.setUser({ email: email.value })
      router.replace({ name: 'feed' })
    } else {
      error.value = '登录失败，请重试'
    }
  } catch (e) {
    error.value = '网络错误或用户名/密码错误'
  }
}

function goRegister() {
  router.push({ name: 'register' })
}
</script>
