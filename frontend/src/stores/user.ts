import { defineStore } from 'pinia'
import type { User, Token } from '@/types'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as User | null,
    token: '' as string,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    setUser(u: User) {
      this.user = u
    },
    setToken(t: string) {
      this.token = t
      localStorage.setItem('token', t)
    },
    clear() {
      this.user = null
      this.token = ''
      localStorage.removeItem('token')
    },
  },
})
