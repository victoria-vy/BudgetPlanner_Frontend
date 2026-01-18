import { createRouter, createWebHistory } from "vue-router";
import { isLoggedIn } from "@/service/authService";

import Account from "@/views/Account.vue";
import Expenses from "@/views/Expenses.vue";
import Income from "@/views/Income.vue";
import Report from "@/views/Report.vue";
import Home from "@/views/Home.vue";
import Impressum from "@/views/Impressum.vue";
import Datenschutzerklärung from "@/views/Datenschutzerklärung.vue";
import AGB from "@/views/AGB.vue";
import Stocks from "@/views/Stocks.vue";
import Saving from "@/views/Saving.vue";
import Budget from "@/views/Budget.vue";

import Profile from "@/views/Profile.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/home",
      component: Home,
      meta: { hideHeader: true },
    },

    // Public
    {
      path: "/Account",
      component: Account,
    },
    {
      path: "/AGB",
      component: AGB,
    },
    {
      path: "/Impressum",
      component: Impressum,
    },
    {
      path: "/Datenschutzerklärung",
      component: Datenschutzerklärung,
    },

    //Protected (nur eingeloggt)
    {
      path: "/Profile",
      component: Profile,
      meta: { requiresAuth: true },
    },
    {
      path: "/Expenses",
      component: Expenses,
      meta: { requiresAuth: true },
    },
    {
      path: "/Income",
      component: Income,
      meta: { requiresAuth: true },
    },
    {
      path: "/Report",
      component: Report,
      meta: { requiresAuth: true },
    },
    {
      path: "/Stocks",
      component: Stocks,
      meta: { requiresAuth: true },
    },
    {
      path: "/Saving",
      component: Saving,
      meta: { requiresAuth: true },
    },
    {
      path: "/Budget",
      component: Budget,
      meta: { requiresAuth: true },
    },

    // Standard-Redirect
    {
      path: "/",
      redirect: "/home",
    },
  ],
});

router.beforeEach((to) => {
  //Nicht eingeloggt + geschützte Seite
  if (to.meta.requiresAuth && !isLoggedIn()) {
    return {
      path: "/Account",
      query: { reason: "login_required" },
    };
  }

  //Eingeloggt + Account -> Profile
  if (to.path === "/Account" && isLoggedIn()) {
    return "/Profile";
  }
});

export default router;
