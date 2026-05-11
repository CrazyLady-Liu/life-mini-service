<template>
  <div class="main-layout">
    <div class="content">
      <router-view />
    </div>
    <van-tabbar v-model="active" route>
      <van-tabbar-item to="/home" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item to="/record" icon="notes-o">成长记录</van-tabbar-item>
      <van-tabbar-item to="/vaccine" icon="shield-o">疫苗</van-tabbar-item>
      <van-tabbar-item to="/growth" icon="balance-o">身高体重</van-tabbar-item>
      <van-tabbar-item to="/profile" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useBabyStore } from '@/stores/baby'
import { useRecordStore } from '@/stores/record'
import { useVaccineStore } from '@/stores/vaccine'
import { useGrowthStore } from '@/stores/growth'

const route = useRoute()
const active = ref(0)

const userStore = useUserStore()
const babyStore = useBabyStore()
const recordStore = useRecordStore()
const vaccineStore = useVaccineStore()
const growthStore = useGrowthStore()

onMounted(() => {
  userStore.loadFromStorage()
  babyStore.loadFromStorage()
  recordStore.loadFromStorage()
  vaccineStore.loadFromStorage()
  growthStore.loadFromStorage()
})
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-bottom: 50px;
}

.content {
  flex: 1;
}
</style>
