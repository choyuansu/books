<script setup>
import { ref, watch } from 'vue'
import { computedAsync } from '@vueuse/core'

import FileUpload from 'primevue/fileupload'
import Button from 'primevue/button'
import Panel from 'primevue/panel'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import FloatLabel from 'primevue/floatlabel'
import Divider from 'primevue/divider'
import Checkbox from 'primevue/checkbox'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'

import { db } from '@/db'

const toast = useToast()

const fileupload = ref()
const raw = ref()
const chaptersPreview = ref()
const totalChapters = ref()
const title = ref('')
const chapterName = ref('(?=第.+章\\s.+\\s*\\n)')
const selectedEncoding = ref('gb2312')
const ignoreFirstChapter = ref(true)
const uploading = ref(false)

const titleIsValid = computedAsync(async () => {
  if (!title.value) {
    return false
  }
  try {
    const book = await db.books.get({ title: title.value })
    if (book) {
      return false
    }
  } catch (_) {}
  return true
}, false)

const encodings = ['utf-8', 'gb2312']

const upload = () => {
  uploading.value = true
  fileupload.value.upload()
}

const onUpload = () => {
  const reader = new FileReader()

  reader.onload = async (e) => {
    try {
      const bookId = await db.books.add({
        title: title.value,
        currentChapter: 0,
      })

      const r = new RegExp(chapterName.value)
      var firstIndex = 0
      if (ignoreFirstChapter.value) {
        firstIndex = 1
      }
      const chapters = e.target.result.split(r).slice(firstIndex)
      for (const [i, chapter] of chapters.entries()) {
        await db.chapters.put({
          bookId: bookId,
          id: i,
          title: chapter.split('\n')[0].trim(),
          content: chapter.split('\n').slice(1).join('\n'),
        })
      }
      toast.add({
        severity: 'success',
        summary: 'Upload success',
        detail: `Successfully added ${title.value}`,
        life: 3000,
      })
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Upload failed',
        detail: error.message,
        life: 3000,
      })
      console.error(error)
    }
    uploading.value = false
  }

  reader.readAsText(raw.value, selectedEncoding.value)
}

const read = (event) => {
  raw.value = event.files[0]
  title.value = event.files[0].name.split('.')[0]
}

watch([raw, selectedEncoding, chapterName], ([newRaw, newEncoding, newChapterName]) => {
  const reader = new FileReader()

  reader.onload = async (e) => {
    const r = new RegExp(newChapterName)
    chaptersPreview.value = e.target.result
      .split(r)
      .slice(0, 30)
      .map((s, i) => {
        var previewString = (i + 1).toString() + ' ' + s.substring(0, 50)
        if (s.length > 30) previewString += '...'
        return previewString
      })
    totalChapters.value = e.target.result.split(r).filter((chapter) => chapter.length > 0).length
  }

  reader.readAsText(newRaw, newEncoding)
})
</script>

<template>
  <div class="flex flex-col gap-8 m-2">
    <FileUpload
      ref="fileupload"
      mode="basic"
      accept=".txt"
      customUpload
      @select="read"
      @uploader="onUpload"
      @clear=""
    />
    <div v-if="raw" class="flex flex-col gap-2">
      <div class="flex gap-8 md:gap-2 flex-wrap">
        <FloatLabel>
          <InputText id="title" v-model="title" :invalid="!titleIsValid" />
          <label for="title">Title* (titleIsValid: {{ titleIsValid }})</label>
        </FloatLabel>
        <FloatLabel>
          <Select id="encoding" v-model="selectedEncoding" :options="encodings" editable filter />
          <label for="encoding">Encoding</label>
        </FloatLabel>
        <FloatLabel>
          <InputText id="chapter-name" v-model="chapterName" />
          <label for="chapter-name">Chapter name</label>
        </FloatLabel>
        <div class="flex items-center gap-2">
          <Checkbox id="ignore-first-chapter" v-model="ignoreFirstChapter" binary />
          <label for="ignore-first-chapter">Ignore first chapter</label>
        </div>
      </div>
      <Panel v-if="chaptersPreview" header="Preview">
        <p v-for="chapter in chaptersPreview">{{ chapter }}</p>
        <Divider />
        <span>Total {{ totalChapters }} chapters</span>
      </Panel>
      <div class="flex flex-col items-center">
        <Button
          label="Upload"
          @click="upload"
          severity="secondary"
          :disabled="!titleIsValid || !selectedEncoding || uploading"
          :loading="uploading"
        />
      </div>
    </div>
  </div>
  <Toast />
</template>

<style scoped></style>
