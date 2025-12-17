import { createRouter, createWebHistory } from 'vue-router'
import Account from '@/views/Account.vue'
import Expenses from '@/views/Expenses.vue'
import Income from '@/views/Income.vue'
import Report from '@/views/Report.vue'
import Home from '@/views/Home.vue'
import Impressum from '@/views/Impressum.vue'
import Datenschutzerklärung from '@/views/Datenschutzerklärung.vue'
import AGB from '@/views/AGB.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [/*{
    path: '/',
    name: 'home',
    component: HomeAlt
  },*/
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/Account',
    name: 'Account',
    component: Account
  },
  {
    path: '/Expenses',
    name: 'Expenses',
    component: Expenses
  },
  {
    path: '/Income',
    name: 'Income',
    component: Income
  },
  {
    path: '/Report',
    name: 'Report',
    component: Report
  },
  {
   path: '/AGB',
   name: 'AGB',
   component: AGB
  },
  {
   path: '/Impressum',
   name: 'Impressum',
   component: Impressum
  },
  {
    path: '/Datenschutzerklärung',
    name: 'Datenschutzerklärung',
    component: Datenschutzerklärung
  }],
})

export default router
