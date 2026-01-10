import { createRouter, createWebHistory } from 'vue-router'
import Account from '@/views/Account.vue'
import Expenses from '@/views/Expenses.vue'
import Income from '@/views/Income.vue'
import Report from '@/views/Report.vue'
import Home from '@/views/Home.vue'
import Impressum from '@/views/Impressum.vue'
import Datenschutzerklärung from '@/views/Datenschutzerklärung.vue'
import AGB from '@/views/AGB.vue'
import Stocks from '@/views/Stocks.vue'
import Saving from '@/views/Saving.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
  {
    path: '/home',
    component: Home
  },
  {
    path: '/Account',
    component: Account
  },
  {
    path: '/Expenses',
    component: Expenses
  },
  {
    path: '/Income',
    component: Income
  },
  {
    path: '/Report',
    component: Report
  },
  {
   path: '/AGB',
   component: AGB
  },
  {
   path: '/Impressum',
   component: Impressum
  },
  {
    path: '/Datenschutzerklärung',
    component: Datenschutzerklärung
  },
  {
    path: '/Stocks',
    component: Stocks
  },
  {
    path: '/Saving',
    component: Saving
  }],
})

export default router
