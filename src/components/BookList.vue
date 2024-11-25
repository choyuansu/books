<script setup>
import { onMounted, ref } from 'vue'

import { db } from '@/db'

const books = ref([])

onMounted(async () => {
  books.value = await db.books.toArray()
})
</script>

<template>
  <div class="flex justify-center m-4">
    <span class="text-4xl font-bold">Books</span>
  </div>
  <div class="m-2">
    <RouterLink v-for="book of books" :to="'/book/' + book.id" class="border p-2">{{
      book.title
    }}</RouterLink>
  </div>
</template>

<style scoped></style>
