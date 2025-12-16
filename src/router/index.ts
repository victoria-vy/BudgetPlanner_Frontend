import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Account from '@/views/Account.vue'
import Expenses from '@/views/Expenses.vue'
import Income from '@/views/Income.vue'
import Report from '@/views/Report.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [{
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
  }],
})

export default router
