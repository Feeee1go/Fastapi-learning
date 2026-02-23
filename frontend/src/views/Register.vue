<template>
  <div class="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
    <div class="w-full max-w-md p-6 bg-zinc-900/70 border border-zinc-800 rounded-xl shadow-sm">
      <h2 class="text-2xl font-semibold mb-4">注册</h2>
      <form @submit.prevent="onSubmit" class="space-y-4">
        <div>
          <label class="block text-sm mb-1">邮箱</label>
          <input v-model="email" type="email" required class="w-full px-3 py-2 rounded border border-zinc-700 bg-zinc-800 text-white" placeholder="name@example.com" />
        </div>
        <div>
          <label class="block text-sm mb-1">密码</label>
          <input v-model="password" type="password" required class="w-full px-3 py-2 rounded border border-zinc-700 bg-zinc-800 text-white" placeholder="******" />
        </div>
        <div>
          <label class="block text-sm mb-1">确认密码</label>
          <input v-model="confirmPassword" type="password" required class="w-full px-3 py-2 rounded border border-zinc-700 bg-zinc-800 text-white" placeholder="******" />
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm text-zinc-400">已有账户？请登录</span>
          <button type="submit" class="px-4 py-2 rounded bg-accent-500 hover:bg-accent-600">注册</button>
        </div>
        <div v-if="error" class="text-sm text-red-400">{{ error }}</div>
      </form>
      <div class="text-sm text-center mt-3">
        <span class="text-zinc-400">Already have an account? </span>
        <a class="text-accent-500 hover:underline cursor-pointer" @click="goLogin">Sign in</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import api from '@/utils/request'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const router = useRouter()

async function onSubmit() {
  error.value = ''
  if (password.value !== confirmPassword.value) {
    error.value = '两次输入的密码不一致'
    return
  }
  // Use JSON payload to align with typical UserCreate model
  const payload = { email: email.value, password: password.value }

  try {
    const res = await api.post('/users/', payload)
    if ((res.status ?? 0) === 201) {
      router.push({ name: 'login' })
    } else {
      error.value = '注册失败，请稍后重试'
    }
  } catch (e) {
    if ((e as any)?.response?.status === 409) {
      error.value = '邮箱已存在'
    } else {
      error.value = '注册失败，请稍后重试'
    }
  }
}

function goLogin() {
  router.push({ name: 'login' })
}
</script>
