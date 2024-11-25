<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { db } from '@/db'

import Button from 'primevue/button'
import Drawer from 'primevue/drawer'

const route = useRoute()
const router = useRouter()

const synth = window.speechSynthesis

const chapter = ref({ title: '', content: '' })
const drawerVisible = ref(false)

const paragraphs = computed(() => {
  return chapter.value.content.split('\n').map((p) => p.trim())
})

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

function startSpeechSynthesis(index) {
  console.log(synth.paused, synth.speaking)
  if (synth.paused) {
    synth.resume()
    return
  } else if (synth.speaking) {
    synth.cancel()
    return
  }
  const voice = synth.getVoices().filter((voice) => voice.lang == 'zh-TW')[0]
  try {
    for (const paragraph of paragraphs.value.slice(index)) {
      let utterance = new SpeechSynthesisUtterance(paragraph)
      utterance.lang = 'zh-TW'
      utterance.voice = voice
      synth.speak(utterance)
    }
  } catch (err) {
    console.error(err)
  }
}

watch(
  [() => route.params.bookId, () => route.params.chapterId],
  async ([newBookId, newChapterId]) => {
    synth.cancel()
    getChapterData(parseInt(newBookId), parseInt(newChapterId))
    db.books.update(parseInt(newBookId), { currentChapter: parseInt(newChapterId) })
    window.scrollTo(0, 0)
  },
)
onMounted(async () => {
  synth.cancel()
  getChapterData(parseInt(route.params.bookId), parseInt(route.params.chapterId))
  db.books.update(parseInt(route.params.bookId), {
    currentChapter: parseInt(route.params.chapterId),
  })
})
</script>

<template>
  <div class="flex flex-col justify-center m-4 h-36">
    <span class="text-4xl font-bold">{{ chapter.title.split(' ')[0] }}</span>
    <span class="text-4xl font-bold">{{ chapter.title.split(' ')[1] }}</span>
  </div>
  <div class="flex justify-between m-2">
    <Button label="上一頁" severity="secondary" @click="previousPage" />
    <Button label="目錄" severity="secondary" @click="bookPage" />
    <Button label="下一頁" severity="secondary" @click="nextPage" />
  </div>
  <div class="m-4 text-2xl">
    <p
      v-for="(paragraph, index) in paragraphs"
      class="indent-8 my-6 select-none"
      @click="startSpeechSynthesis(index)"
    >
      <mark class="bg-transparent text-white hover:bg-sky-800 hover:cursor-pointer">
        {{ paragraph }}
      </mark>
    </p>
  </div>
  <div class="flex justify-between m-2">
    <Button label="上一頁" severity="secondary" @click="previousPage" />
    <Button label="下一頁" severity="secondary" @click="nextPage" />
  </div>
  <div class="w-full h-20"></div>

  <Drawer v-model:visible="drawerVisible" position="bottom" header="Speech" :modal="false">
    <div class="flex gap-2">
      <Button icon="pi pi-play" severity="secondary" rounded @click="startSpeechSynthesis(0)" />
      <Button icon="pi pi-pause" severity="secondary" rounded @click="synth.pause()" />
      <Button icon="pi pi-stop" severity="secondary" rounded @click="synth.cancel()" />
    </div>
  </Drawer>

  <div class="fixed bottom-4 right-4">
    <Button icon="pi pi-cog" severity="secondary" rounded @click="drawerVisible = true" />
  </div>
</template>

<style scoped></style>
