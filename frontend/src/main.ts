import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './styles/globals.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
// 强制进入深色模式，确保全局仅有 Dark Mode
document.documentElement.classList.add('dark')
app.mount('#app')
