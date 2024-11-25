<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { db } from '@/db'
import { Button } from 'primevue'

const route = useRoute()
const router = useRouter()

const book = ref({ title: '', currentChapter: 0 })
const chapters = ref([])

const startedReading = computed(() => {
  return book.value.currentChapter > 0
})

const preview = (title) => {
  if (title.length < 20) {
    return title
  }
  return title.substring(0, 20) + '...'
}

onMounted(async () => {
  book.value = await db.books.get({ id: parseInt(route.params.id) })
  chapters.value = await db.chapters.toArray()
})
</script>

<template>
  <div class="flex justify-center m-4">
    <span class="text-4xl font-bold">{{ book.title }}</span>
  </div>
  <div class="flex justify-center m-4">
    <Button
      v-if="startedReading"
      label="繼續閱讀"
      @click="router.push('/book/' + route.params.id + '/ch/' + book.currentChapter)"
    />
    <Button v-else label="開始閱讀" @click="router.push('/book/' + route.params.id + '/ch/0')" />
  </div>
  <div class="flex flex-wrap gap-2">
    <RouterLink
      v-for="chapter in chapters"
      :key="chapter.id"
      :to="'/book/' + route.params.id + '/ch/' + chapter.id"
      class="border w-96 p-2"
    >
      {{ preview(chapter.title) }}
    </RouterLink>
  </div>
</template>

<style scoped></style>
