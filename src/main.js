import { createApp } from 'vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import * as bootstrap from 'bootstrap'
import '@fortawesome/fontawesome-free/css/all.min.css'
import App from './App.vue'

// Make Bootstrap available globally
window.bootstrap = bootstrap

createApp(App).mount('#app')
