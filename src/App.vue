<script setup>
import { ref } from 'vue'
import { useRouter, RouterView } from 'vue-router'

import Menubar from 'primevue/menubar'

const router = useRouter()

const items = ref([
  {
    label: 'Home',
    icon: 'pi pi-home',
    command: () => {
      router.push('/')
    },
  },
  {
    label: 'Upload',
    icon: 'pi pi-upload',
    command: () => {
      router.push('/upload')
    },
  },
])
</script>

<template>
  <Menubar :model="items"></Menubar>
  <RouterView class="mt-2" />
</template>

<style scoped></style>
