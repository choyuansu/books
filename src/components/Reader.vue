<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { db } from '@/db'

import Button from 'primevue/button'
import Drawer from 'primevue/drawer'

const route = useRoute()
const router = useRouter()

const synth = window.speechSynthesis

if (localStorage.getItem('rate') == null) {
  localStorage.setItem('rate', 10)
}

const chapter = ref({ title: '', content: '' })
const drawerVisible = ref(false)
const speakingParagraph = ref(-1)
const rate = ref(parseFloat(localStorage.getItem('rate')))
const paragraphRefs = ref([])
let wakeLock = null;

const paragraphs = computed(() => {
  return chapter.value.content
    .split('\n')
    .map((p) => p.trim())
    .filter((p) => p)
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

const updateRate = (r) => {
  rate.value = r
  localStorage.setItem('rate', rate.value)
}
async function startSpeechSynthesis(index) {
  if (synth.speaking) {
    stopSpeech()
    return
  }

  try {
    wakeLock = await navigator.wakeLock.request("screen");
  } catch (err) {
    console.error(err)
  }

  const voice = synth.getVoices().filter((voice) => voice.lang == 'zh-TW')[0]
  try {
    for (const [i, paragraph] of paragraphs.value.slice(index).entries()) {
      let utterance = new SpeechSynthesisUtterance(paragraph)
      utterance.lang = 'zh-TW'
      utterance.voice = voice
      utterance.rate = rate.value / 10
      utterance.onstart = () => {
        speakingParagraph.value = i + index
        paragraphRefs.value[Math.max(i + index - 1, 0)].scrollIntoView({ behavior: 'smooth', block: "end", inline: "nearest" })
      }
      utterance.onend = () => {
        if (!synth.speaking && !synth.pending && wakeLock) {
          wakeLock.release().then(() => {
            wakeLock = null;
          });
        }
      }
      synth.speak(utterance)
    }
  } catch (err) {
    console.error(err)
  }
}

function stopSpeech() {
  synth.cancel()
  speakingParagraph.value = -1
  if (wakeLock) {
    wakeLock.release().then(() => {
      wakeLock = null;
    });
  }
}

watch(
  [() => route.params.bookId, () => route.params.chapterId],
  async ([newBookId, newChapterId]) => {
    stopSpeech()
    getChapterData(parseInt(newBookId), parseInt(newChapterId))
    db.books.update(parseInt(newBookId), { currentChapter: parseInt(newChapterId) })
    window.scrollTo(0, 0)
  },
)
onMounted(async () => {
  stopSpeech()
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
    <p v-for="(paragraph, index) in paragraphs" :ref="(el) => { paragraphRefs[index] = el }"
      class="indent-8 my-6 select-none cursor-pointer" @click="startSpeechSynthesis(index)">
      <span v-if="speakingParagraph != index">{{ paragraph }}</span>
      <span v-else>
        <mark class="text-white bg-sky-800">{{ paragraph }}</mark>
      </span>
    </p>
  </div>
  <div class="flex justify-between m-2">
    <Button label="上一頁" severity="secondary" @click="previousPage" />
    <Button label="下一頁" severity="secondary" @click="nextPage" />
  </div>
  <div class="w-full h-20"></div>

  <Drawer v-model:visible="drawerVisible" position="bottom" header="Speech" :modal="false">
    <div class="flex gap-4 items-center">
      <span class="text-xl">Rate:</span>
      <Button icon="pi pi-minus" severity="secondary" rounded @click="updateRate(rate - 1)" />
      <span class="text-xl">{{ rate / 10 }}</span>
      <Button icon="pi pi-plus" severity="secondary" rounded @click="updateRate(rate + 1)" />
    </div>
  </Drawer>

  <div class="fixed bottom-4 right-4">
    <Button icon="pi pi-cog" severity="secondary" rounded @click="drawerVisible = true" />
  </div>
</template>

<style scoped></style>
