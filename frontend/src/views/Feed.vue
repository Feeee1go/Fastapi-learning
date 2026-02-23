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
        <div v-for="post in posts" :key="postKey(post)" class="relative rounded-xl border border-zinc-800 bg-zinc-900 p-4 flex flex-col justify-between">
          <template v-if="canEdit(post)">
            <div class="absolute top-2 right-2 flex space-x-1 text-xs">
              <button @click="startEditing(post)" class="p-1 rounded bg-zinc-800">✎</button>
              <button @click="deletePost(post)" class="p-1 rounded bg-zinc-800">🗑</button>
            </div>
          </template>
          <div class="mb-2 text-sm text-zinc-400">{{ postOwnerEmail(post) }}</div>
          <div class="font-semibold text-lg mb-1">
            <template v-if="isEditing(post)">
              <input v-model="editingTitle" class="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1" />
            </template>
            <template v-else>{{ postTitle(post) }}</template>
          </div>
          <div class="text-sm text-zinc-300 mb-2">
            <template v-if="isEditing(post)">
              <textarea v-model="editingContent" rows="3" class="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1"></textarea>
            </template>
            <template v-else>
              {{ postContentPreview(post) }}
              <span v-if="postContentFull(post) === true" class="text-accent-500 ml-1 cursor-pointer" @click="toggleExpanded(post)"> 阅读更多</span>
            </template>
          </div>
          <div v-if="isEditing(post)" class="flex items-center space-x-2 justify-end mt-2">
            <button @click="saveEdit(post)" class="px-3 py-1 rounded bg-accent-500">保存</button>
            <button @click="cancelEdit" class="px-3 py-1 rounded border border-zinc-700 bg-zinc-800">取消</button>
          </div>
          <div v-else class="flex items-center justify-between text-xs text-zinc-500 mt-2">
            <span>{{ postDate(post) }}</span>
            <div class="flex items-center space-x-2">
              <span class="text-white">{{ postVotes(post) }}</span>
              <button @click="vote(post)" :disabled="voteLoading[postId(post)]" class="px-2 py-1 rounded border border-zinc-700 bg-zinc-800 hover:bg-zinc-700">👍</button>
            </div>
          </div>
        </div>
      </section>

      <div class="flex justify-center py-6">
        <button @click="loadMore" class="px-4 py-2 rounded border border-zinc-700 bg-zinc-800">加载更多</button>
      </div>
    </main>
  </div>
  
  <!-- Toast -->
  <div v-if="toast" class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded shadow">{{ toast }}</div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import api from '@/utils/request'
import type { Post } from '@/types'
import { useUserStore } from '@/stores/user'

type PostOut = { Post: Post; votes: number }

const limit = 5
const skip = ref(0)
const searchQuery = ref('')
const posts = ref<PostOut[]>([])
const voteLoading = ref<Record<number, boolean>>({})

const newPost = ref<{ title: string; content: string }>({ title: '', content: '' })

const editingId = ref<number | null>(null)
const editingTitle = ref('')
const editingContent = ref('')

const expanded = reactive<{ [key: number]: boolean }>({})

const toast = ref<string | null>(null)

const userStore = useUserStore()
const currentUserId = computed(() => userStore.user?.id)

function postKey(p: PostOut) {
  return p.Post?.id ?? p.id
}
function postOwnerEmail(p: PostOut) {
  return p.Post?.owner?.email ?? p.Post?.owner_id?.toString() ?? ''
}
function postTitle(p: PostOut) {
  return p.Post?.title ?? (p as any).title ?? ''
}
function postContentPreview(p: PostOut) {
  const c = p.Post?.content ?? (p as any).content ?? ''
  const id = p.Post?.id ?? (p as any).id
  const showAll = !!expanded[id]
  return showAll || c.length <= 100 ? c : c.substring(0, 100) + '...'
}
function postContentFull(p: PostOut) {
  const c = p.Post?.content ?? (p as any).content ?? ''
  const id = p.Post?.id ?? (p as any).id
  return c.length > 100 && !expanded[id]
}
function postDate(p: PostOut) {
  const d = p.Post?.created_at ?? (p as any).created_at
  if (!d) return ''
  const dt = new Date(d)
  const Y = dt.getFullYear()
  const M = String(dt.getMonth() + 1).padStart(2, '0')
  const D = String(dt.getDate()).padStart(2, '0')
  const h = String(dt.getHours()).padStart(2, '0')
  const m = String(dt.getMinutes()).padStart(2, '0')
  return `${Y}-${M}-${D} ${h}:${m}`
}
function postVotes(p: PostOut) {
  return p.votes ?? p.Post?.votes ?? 0
}
function postId(p: PostOut) {
  return p.Post?.id ?? p.id
}
function isMine(p: PostOut) {
  const ownerId = p.Post?.owner?.id ?? p.Post?.owner_id ?? p.owner?.id ?? p.owner_id
  return currentUserId.value != null && ownerId === currentUserId.value
}
function canEdit(post: PostOut) {
  const ownerId = post.Post?.owner?.id ?? post.Post?.owner_id ?? (post as any).owner?.id ?? (post as any).owner_id
  return currentUserId.value != null && ownerId === currentUserId.value
}
function isEditing(p: PostOut) {
  return editingId.value === postId(p)
}
function isEditingInline(p: PostOut) { return isEditing(p) }
function toggleExpanded(p: PostOut) {
  const id = postId(p)
  expanded[id] = !expanded[id]
}
function displayContent(p: PostOut) {
  const content = p.Post?.content ?? (p as any).content ?? ''
  const id = postId(p)
  if (expanded[id] || content.length <= 100) return content
  return content.substring(0, 100) + '...'
}
async function vote(p: PostOut) {
  const id = postId(p)
  voteLoading.value[id] = true
  try {
    const payload = new URLSearchParams()
    payload.append('post_id', id.toString())
    payload.append('dir', '1')
    await api.post('/vote/', payload)
    // optimistic update
    p.votes = (p.votes ?? p.Post?.votes ?? 0) + 1
  } catch {
    // ignore
  } finally {
    voteLoading.value[id] = false
  }
}
async function fetchPosts(reset = false) {
  if (reset) skip.value = 0
  try {
    const res = await api.get('/posts/', { params: { limit, skip: skip.value, search: searchQuery.value } })
    const data = res.data?.data ?? res.data ?? []
    const fetched = (Array.isArray(data) ? data : []) as any[]
    // Normalize to PostOut[]
    const normalized = fetched.map((it: any) => {
      if (it?.Post) return it as PostOut
      const post = it as Post
      return { Post: post, votes: post?.votes ?? 0 } as PostOut
    })
    if (reset || skip.value === 0) {
      posts.value = normalized
    } else {
      posts.value = posts.value.concat(normalized)
    }
  } catch {
    // ignore
  }
}

async function deletePost(post: PostOut) {
  const id = post.Post?.id ?? post.id
  if (!confirm('确定删除该帖子吗？')) return
  try {
    await api.delete(`/posts/${id}/`)
    posts.value = posts.value.filter(p => (p.Post?.id ?? p.id) !== id)
  } catch {
    // ignore
  }
}
async function createPost() {
  if (!newPost.value.title || !newPost.value.content) return
  try {
    const res = await api.post('/posts/', { title: newPost.value.title, content: newPost.value.content })
    if ((res.status ?? 0) === 201) {
      const createdPost = res.data as Post
      const newOut: PostOut = { Post: createdPost, votes: 0 }
      // Optimistic update: prepend to list
      posts.value.unshift(newOut)
      // Clear input
      newPost.value = { title: '', content: '' }
      // Toast feedback
      showToast('发布成功')
    }
  } catch {
    // ignore
  }
}
function showToast(msg: string) {
  toast.value = msg
  setTimeout(() => { toast.value = null }, 1500)
}
async function searchPosts() {
  skip.value = 0
  await fetchPosts(true)
}
async function loadMore() {
  skip.value += limit
  await fetchPosts()
}
function postKeySimple(p: PostOut) {
  return postId(p)
}
function postContentSearchable(p: PostOut) {
  return displayContent(p)
}
function logOutAndReload() {
  logout()
}
function postOwner(p: PostOut) {
  return p.Post?.owner ?? p.owner ?? null
}
function postOwnerEmailLocal(p: PostOut) {
  return postOwner(p)?.email ?? ''
}
function postOwnerEmail2(p: PostOut) {
  return postOwnerEmailLocal(p) // alias for template readability
}
function postOwnerEmailDisplay(p: PostOut) { return postOwnerEmailLocal(p) }
function postOwnerEmailFinal(p: PostOut) { return postOwnerEmailDisplay(p) }
async function logoutFn() { await logout() }

// init
onMounted(() => { fetchPosts(true) })
</script>
