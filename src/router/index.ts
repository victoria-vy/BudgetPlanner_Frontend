import { createRouter, createWebHistory } from "vue-router";
import { isLoggedIn } from "@/service/authService";

import AccountView from "@/views/AccountView.vue";
import ExpensesView from "@/views/ExpensesView.vue";
import IncomeView from "@/views/IncomeView.vue";
import ReportView from "@/views/ReportView.vue";
import HomeView from "@/views/HomeView.vue";
import Impressum from "@/views/Impressum.vue";
import Datenschutzerklärung from "@/views/Datenschutzerklärung.vue";
import AGB from "@/views/AGB.vue";
import StocksView from "@/views/StocksView.vue";
import SavingView from "@/views/SavingView.vue";
import BudgetView from "@/views/BudgetView.vue";

import ProfileView from "@/views/ProfileView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/HomeView",
      component: HomeView,
      meta: { hideHeader: true },
    },

    // Public
    {
      path: "/AccountView",
      component: AccountView,
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
      path: "/ProfileView",
      component: ProfileView,
      meta: { requiresAuth: true },
    },
    {
      path: "/ExpensesView",
      component: ExpensesView,
      meta: { requiresAuth: true },
    },
    {
      path: "/IncomeView",
      component: IncomeView,
      meta: { requiresAuth: true },
    },
    {
      path: "/ReportView",
      component: ReportView,
      meta: { requiresAuth: true },
    },
    {
      path: "/StocksView",
      component: StocksView,
      meta: { requiresAuth: true },
    },
    {
      path: "/SavingView",
      component: SavingView,
      meta: { requiresAuth: true },
    },
    {
      path: "/BudgetView",
      component: BudgetView,
      meta: { requiresAuth: true },
    },

    // Standard-Redirect
    {
      path: "/",
      redirect: "/HomeView",
    },
  ],
});

router.beforeEach((to) => {
  //Nicht eingeloggt + geschützte Seite
  if (to.meta.requiresAuth && !isLoggedIn()) {
    return {
      path: "/AccountView",
      query: { reason: "login_required" },
    };
  }

  //Eingeloggt + AccountView -> ProfileView
  if (to.path === "/AccountView" && isLoggedIn()) {
    return "/ProfileView";
  }
});

export default router;
