<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { db } from '@/db'

import { Button } from 'primevue'

const route = useRoute()
const router = useRouter()

const chapter = ref({ content: '' })

const previousPage = () => {
  router.push(`/book/${route.params.bookId}/ch/${parseInt(route.params.chapterId) - 1}`)
}
const nextPage = () => {
  router.push(`/book/${route.params.bookId}/ch/${parseInt(route.params.chapterId) + 1}`)
}
const bookPage = () => {
  router.push(`/book/${route.params.bookId}`)
}

const getChapterData = async (bookId, chapterId) => {
  chapter.value = await db.chapters.get({
    bookId: parseInt(bookId),
    id: parseInt(chapterId),
  })
}

watch(
  [() => route.params.bookId, () => route.params.chapterId],
  async ([newBookId, newChapterId]) => {
    getChapterData(parseInt(newBookId), parseInt(newChapterId))
    db.books.update(parseInt(newBookId), { currentChapter: parseInt(newChapterId) })
  },
)
onMounted(async () => {
  getChapterData(parseInt(route.params.bookId), parseInt(route.params.chapterId))
  db.books.update(parseInt(route.params.bookId), {
    currentChapter: parseInt(route.params.chapterId),
  })
})
</script>

<template>
  <div class="flex justify-center m-4">
    <span class="text-4xl font-bold">{{ chapter.title }}</span>
  </div>
  <div class="flex justify-between m-2">
    <Button label="上一頁" severity="secondary" @click="previousPage" />
    <Button label="目錄" severity="secondary" @click="bookPage" />
    <Button label="下一頁" severity="secondary" @click="nextPage" />
  </div>
  <div class="m-4 text-2xl">
    <p v-for="paragraph in chapter.content.split('\n')" class="indent-8 my-6">{{ paragraph }}</p>
  </div>
  <div class="flex justify-between m-2">
    <Button label="上一頁" severity="secondary" @click="previousPage" />
    <Button label="下一頁" severity="secondary" @click="nextPage" />
  </div>
</template>

<style scoped></style>
