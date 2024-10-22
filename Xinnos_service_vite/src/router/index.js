// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

import ScheduleActivityMgmt from '../views/Schedule_ActivityMgmt.vue'
import Schedule_ScheduleMgmt from '../views/Schedule_ScheduleMgmt.vue'
import Digitalization_DocMgmt from '../views/Digitalization_DocMgmt.vue'
import Digitalization_DailyReport from '../views/Digitalization_DailyReport.vue'
import Personnel_PersonnelMgmt from '../views/Personnel_PersonnelMgmt.vue'
import Personnel_BoardingMgmt from '../views/Personnel_BoardingMgmt.vue'

import Test_01 from '../views/Test_01.vue'
import Test_02 from '../views/Test_02.vue'

const routes = [
  { path: '/schedule_ActivityMgmt', component: ScheduleActivityMgmt },
  { path: '/schedule_ScheduleMgmt', component: Schedule_ScheduleMgmt },
  { path: '/digitalization_DocMgmt', component: Digitalization_DocMgmt },
  { path: '/digitalization_DailyReport', component: Digitalization_DailyReport },
  { path: '/personnel_PersonnelMgmt', component: Personnel_PersonnelMgmt },
  { path: '/personnel_BoardingMgmt', component: Personnel_BoardingMgmt },

  { path: '/test_01', component: Test_01 },
  { path: '/test_02', component: Test_02 },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
