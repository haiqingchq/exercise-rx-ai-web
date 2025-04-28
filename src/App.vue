<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  height: 100vh;
  width: 100%;
  overflow-x: hidden; /* 防止水平滚动 */
}
</style>
