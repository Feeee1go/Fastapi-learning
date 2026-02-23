import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    user: null as any,
    token: '' as string,
  }),
  actions: {
    setUser(u: any) {
      this.user = u
    },
    setToken(t: string) {
      this.token = t
    },
  },
})
