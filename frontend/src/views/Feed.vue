<template>
  <div class="min-h-screen bg-zinc-950 text-white">
    <header class="p-4 border-b border-zinc-800 bg-zinc-900/90 sticky top-0 z-10">
      <div class="max-w-5xl mx-auto flex items-center justify-between text-sm">
        <div>Feed</div>
        <button @click="logout" class="px-3 py-1 rounded border border-zinc-700">退出</button>
      </div>
    </header>

    <main class="max-w-5xl mx-auto p-6 space-y-6">
      <!-- Search Bar -->
      <section class="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center gap-2">
        <input v-model="searchQuery" @keyup.enter="searchPosts" placeholder="搜索帖子..." class="flex-1 bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white" />
        <button @click="searchPosts" class="px-3 py-2 rounded bg-zinc-700">搜索</button>
      </section>

      <!-- Publish New Post -->
      <section class="p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
        <div class="flex flex-col md:flex-row md:items-end md:space-x-4">
          <input v-model="newPost.title" placeholder="帖子标题" class="flex-1 px-3 py-2 rounded bg-zinc-800 border border-zinc-700 mb-2 md:mb-0" />
          <button @click="createPost" class="px-4 py-2 rounded bg-accent-500 hover:bg-accent-600">发布</button>
        </div>
        <textarea v-model="newPost.content" rows="3" placeholder="帖子内容" class="w-full mt-2 resize-none px-3 py-2 rounded bg-zinc-800 border border-zinc-700"></textarea>
      </section>

      <!-- Posts List -->
      <section class="space-y-4">
        <div v-for="post in posts" :key="post.id" class="relative rounded-xl border border-zinc-800 bg-zinc-900 p-4 flex flex-col justify-between">
          <template v-if="canEdit(post)">
            <div class="absolute top-2 right-2 flex space-x-1 text-xs">
              <button @click="startEditing(post)" class="p-1 rounded bg-zinc-800">✎</button>
              <button @click="deletePost(post)" class="p-1 rounded bg-zinc-800">🗑</button>
            </div>
          </template>
          <div class="mb-2 text-sm text-zinc-400">{{ post.owner?.email ?? 'Unknown' }}</div>
          <div class="font-semibold text-lg mb-1">
            <template v-if="editingId === post.id">
              <input v-model="editingTitle" class="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1" />
            </template>
            <template v-else>{{ post.title }}</template>
          </div>
          <div class="text-sm text-zinc-300 mb-2">
            <template v-if="editingId === post.id">
              <textarea v-model="editingContent" rows="3" class="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1"></textarea>
            </template>
            <template v-else>
              {{ displayContent(post) }}
              <span v-if="!expanded[post.id] && post.content?.length > 100" class="text-accent-500 ml-1 cursor-pointer" @click="toggleExpanded(post)"> 阅读更多</span>
            </template>
          </div>
          <div v-if="editingId === post.id" class="flex items-center space-x-2 justify-end mt-2">
            <button @click="saveEdit(post)" class="px-3 py-1 rounded bg-accent-500">保存</button>
            <button @click="cancelEdit" class="px-3 py-1 rounded border border-zinc-700 bg-zinc-800">取消</button>
          </div>
          <div v-else class="flex items-center justify-between text-xs text-zinc-500 mt-2">
            <span>{{ formatDate(post.created_at) }}</span>
            <div class="flex items-center space-x-2">
              <span class="text-white">{{ post.votes ?? 0 }}</span>
              <button @click="vote(post)" :disabled="voteLoading[post.id]" class="px-2 py-1 rounded border border-zinc-700 bg-zinc-800 hover:bg-zinc-700">👍</button>
            </div>
          </div>
        </div>
      </section>

      <div class="flex justify-center py-6">
        <button @click="loadMore" class="px-4 py-2 rounded border border-zinc-700 bg-zinc-800">加载更多</button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import api from '@/utils/request'
import type { Post } from '@/types'
import { useUserStore } from '@/stores/user'

const limit = 5
const skip = ref(0)
const searchQuery = ref('')
const posts = ref<Post[]>([])
const voteLoading = ref<Record<number, boolean>>({})

const newPost = ref<{ title: string; content: string }>({ title: '', content: '' })

const editingId = ref<number | null>(null)
const editingTitle = ref('')
const editingContent = ref('')

const expanded = reactive<{ [key: number]: boolean }>({})

const userStore = useUserStore()
const currentUserEmail = computed(() => userStore.user?.email ?? '')
function canEdit(post: Post) {
  const currentUserId = userStore.user?.id
  const ownerId = post.owner_id ?? post.owner?.id
  return currentUserId != null && ownerId === currentUserId
}

function toggleExpanded(post: Post) {
  expanded[post.id] = !expanded[post.id]
}
function displayContent(post: Post) {
  const content = post.content ?? ''
  if (expanded[post.id] || content.length <= 100) return content
  return content.slice(0, 100) + '...'
}
function startEditing(post: Post) {
  editingId.value = post.id
  editingTitle.value = post.title
  editingContent.value = post.content
}
async function saveEdit(post: Post) {
  try {
    await api.put(`/posts/${post.id}`, { title: editingTitle.value, content: editingContent.value })
    editingId.value = null
    await fetchPosts(true)
  } catch {
    // handle softly
  }
}
function cancelEdit() {
  editingId.value = null
}
async function deletePost(post: Post) {
  if (!confirm('确定删除该帖子吗？')) return
  try {
    await api.delete(`/posts/${post.id}`)
    posts.value = posts.value.filter(p => p.id !== post.id)
  } catch {
    // ignore
  }
}
async function fetchPosts(reset = false) {
  if (reset) skip.value = 0
  try {
    const res = await api.get('/posts', { params: { limit, skip: skip.value, search: searchQuery.value } })
    const data = res.data?.data ?? res.data ?? []
    const fetched = Array.isArray(data) ? data : (data?.posts ?? data) ?? []
    if (reset || skip.value === 0) {
      posts.value = fetched
    } else {
      posts.value = posts.value.concat(fetched)
    }
  } catch {
    // ignore
  }
}
async function createPost() {
  if (!newPost.value.title || !newPost.value.content) return
  try {
    await api.post('/posts', { title: newPost.value.title, content: newPost.value.content })
  } catch {
    // ignore
  } finally {
    newPost.value = { title: '', content: '' }
    await fetchPosts(true)
  }
}
async function searchPosts() {
  skip.value = 0
  await fetchPosts(true)
}
async function loadMore() {
  skip.value += limit
  await fetchPosts()
}
function formatDate(date?: string) {
  if (!date) return ''
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return date
  const pad = (n: number) => (n < 10 ? `0${n}` : n)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
async function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('rememberedCredentials')
  window.location.assign('/login')
}
onMounted(() => {
  fetchPosts(true)
})
</script>
