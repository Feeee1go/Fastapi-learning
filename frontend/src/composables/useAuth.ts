import { useRouter } from 'vue-router'

// Simple, centralized logout to avoid per-component duplication
export function useAuth() {
  const router = useRouter()

  const logout = () => {
    try {
      localStorage.removeItem('token')
    } catch {}
    try {
      localStorage.removeItem('rememberedCredentials')
    } catch {}
    router.push({ name: 'login' }).catch(() => {})
  }

  return { logout }
}
