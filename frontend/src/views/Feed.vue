<template>
  <div class="min-h-screen bg-zinc-950 text-white">
    <header class="p-4 border-b border-zinc-800 bg-zinc-900/90 sticky top-0 z-10">
      <div class="max-w-5xl mx-auto flex items-center justify-between text-sm">
        <div>Micro Feed</div>
        <button @click="logout" class="px-3 py-1 rounded border border-zinc-700">退出</button>
      </div>
    </header>

    <main class="max-w-5xl mx-auto p-6 space-y-6">
      <!-- Publish New Post -->
      <section class="p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
        <div class="flex flex-col md:flex-row md:items-end md:space-x-4">
          <input v-model="newPost.title" placeholder="帖子标题" class="flex-1 px-3 py-2 rounded bg-zinc-800 border border-zinc-700 mb-2 md:mb-0" />
          <button @click="createPost" class="px-4 py-2 rounded bg-accent-500 hover:bg-accent-600">发布</button>
        </div>
        <textarea v-model="newPost.content":rows="3" placeholder="帖子内容" class="w-full mt-2 resize-none px-3 py-2 rounded bg-zinc-800 border border-zinc-700" />
      </section>

      <!-- Feed -->
      <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="post in posts" :key="post.id" class="rounded-xl border border-zinc-800 bg-zinc-900 p-4 flex flex-col justify-between">
          <div class="mb-2 text-sm text-zinc-400">{{ post.owner?.email ?? 'Unknown' }}</div>
          <div class="font-semibold text-lg mb-1">{{ post.title }}</div>
          <div class="text-sm text-zinc-300 mb-2">{{ post.content }}</div>
          <div class="flex items-center justify-between text-xs text-zinc-500">
            <span>{{ formatDate(post.created_at) }}</span>
            <div class="flex items-center space-x-2">
              <span class="text-white">{{ post.votes ?? 0 }}</span>
              <button @click="vote(post)" :disabled="voteLoading[post.id]" class="px-2 py-1 rounded border border-zinc-700 bg-zinc-800 hover:bg-zinc-700">👍</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/utils/request'
import type { Post } from '@/types'

type NewPost = { title: string; content: string }
const newPost = ref<NewPost>({ title: '', content: '' })
const posts = ref<Post[]>([])
const voteLoading = ref<Record<number, boolean>>({})

async function fetchPosts() {
  try {
    const res = await api.get('/posts')
    const data = res.data?.data ?? res.data ?? []
    posts.value = Array.isArray(data) ? data : []
  } catch {
    // ignore fetch errors for now
  }
}

async function createPost() {
  if (!newPost.value.title || !newPost.value.content) return
  await api.post('/posts', newPost.value)
  newPost.value = { title: '', content: '' }
  await fetchPosts()
}

async function vote(post: Post) {
  const hasVoted = !!voteLoading.value[post.id]
  // simple upvote logic: if current votes is null, assume not voted
  const dir = 1
  voteLoading.value[post.id] = true
  try {
    const params = new URLSearchParams()
    params.append('post_id', post.id.toString())
    params.append('dir', dir.toString())
    await api.post('/vote', params)
    post.votes = (post.votes ?? 0) + 1
  } catch {
    // ignore error for now
  } finally {
    voteLoading.value[post.id] = false
  }
}

function formatDate(date?: string) {
  if (!date) return ''
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return date
  const pad = (n: number) => (n < 10 ? `0${n}` : n)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

async function logout() {
  // simple local logout
  localStorage.removeItem('token')
  localStorage.removeItem('rememberedCredentials')
  window.location.assign('/login')
}

onMounted(() => {
  fetchPosts()
})
</script>
