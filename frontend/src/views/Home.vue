<template>
  <div class="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
    <!-- Hero Section -->
    <section class="flex items-center justify-center py-20 px-6 bg-gradient-to-b from-black via-slate-900 to-slate-900/0">
      <div class="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div class="space-y-4">
          <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight" style="font-family: Inter, system-ui;">
            极简与高级感并存的前端框架入口
          </h1>
          <p class="text-lg text-slate-500 dark:text-slate-300 leading-relaxed">
            为 FastAPI 后端打造的现代化前端体系，基于 Vue 3 + Vite + TypeScript，沉浸式体验、极简留白与 Bento Box 式卡片布局。
          </p>
          <div class="flex items-center gap-3 mt-4">
            <button class="px-5 py-3 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white/20 transition transform hover:scale-105">
              快速开始
            </button>
            <button @click="toggleDark" class="px-4 py-2 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white/20 transition">
              深色模式
            </button>
            <button class="px-5 py-3 rounded-xl bg-accent-500 text-white border border-accent-500 hover:bg-accent-600 transition">
              查看文档
            </button>
          </div>
        </div>
        <div class="relative">
          <div class="rounded-3xl border border-slate-200/40 bg-white/5 p-6 shadow-md h-full min-h-[240px]">
            <div class="h-40 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 mb-6" />
            <div class="grid grid-cols-3 gap-4">
              <div class="h-8 rounded bg-slate-700/40" />
              <div class="h-8 rounded bg-slate-700/40" />
              <div class="h-8 rounded bg-slate-700/40" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Data cards (Bento Box style) -->
    <section class="max-w-5xl mx-auto px-6 py-12">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="item in stats" :key="item.id" class="rounded-2xl border border-slate-200/40 bg-white/5 p-4 shadow-sm hover:shadow-md transition">
          <div class="text-sm uppercase text-slate-300 mb-2">{{ item.title }}</div>
          <div class="text-3xl font-extrabold">{{ item.value }}</div>
        </div>
      </div>
    </section>
  </div>
  </template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import api from '@/utils/request'

type Stat = { id: number; title: string; value: number }
const stats = ref<Stat[]>([
  { id: 1, title: 'Total Users', value: 0 },
  { id: 2, title: 'Active Sessions', value: 0 },
  { id: 3, title: 'API Requests Today', value: 0 },
])

onMounted(async () => {
  try {
    const res = await api.get('/summary')
    const data = res.data?.data ?? res.data ?? {}
    stats.value = [
      { id: 1, title: 'Total Users', value: data.users ?? 0 },
      { id: 2, title: 'Active Sessions', value: data.sessions ?? 0 },
      { id: 3, title: 'API Requests Today', value: data.requests ?? 0 },
    ]
  } catch {
    // keep default zeros if API not available
  }
})

function toggleDark() {
  document.documentElement.classList.toggle('dark')
}
</script>
