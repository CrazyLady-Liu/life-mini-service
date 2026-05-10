import { createRouter, createWebHashHistory } from 'vue-router'
import TransactionList from '../views/TransactionList.vue'
import BudgetManagement from '../views/BudgetManagement.vue'
import DataStatistics from '../views/DataStatistics.vue'

const routes = [
  { path: '/', component: TransactionList },
  { path: '/budget', component: BudgetManagement },
  { path: '/stats', component: DataStatistics }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
