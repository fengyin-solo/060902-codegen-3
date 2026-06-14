import { reactive, watch } from 'vue'

const STORAGE_KEYS = {
  CONVERSATIONS: 'love_letter_conversations_v1',
  LOVE_LETTERS: 'love_letter_loveLetters_v1',
  ANNIVERSARIES: 'love_letter_anniversaries_v1',
  ANONYMOUS_POSTS: 'love_letter_anonymousPosts_v1'
}

function safeParse(json, fallback) {
  try {
    const parsed = JSON.parse(json)
    return parsed || fallback
  } catch {
    return fallback
  }
}

function reviveAnniversaries(list) {
  if (!Array.isArray(list)) return []
  return list.map(item => ({
    ...item,
    date: item.date ? new Date(item.date) : new Date(),
    messages: Array.isArray(item.messages) ? item.messages.map(m => ({
      ...m,
      date: m.date ? new Date(m.date) : new Date()
    })) : []
  }))
}

function reviveConversations(list) {
  if (!Array.isArray(list)) return []
  return list.map(conv => ({
    ...conv,
    messages: Array.isArray(conv.messages) ? conv.messages.map(m => ({
      ...m,
      date: m.date ? new Date(m.date) : new Date()
    })) : []
  }))
}

function reviveLoveLetters(list) {
  if (!Array.isArray(list)) return []
  return list.map(letter => ({
    ...letter,
    messages: Array.isArray(letter.messages) ? letter.messages.map(m => ({
      ...m,
      date: m.date ? new Date(m.date) : new Date()
    })) : []
  }))
}

function loadFromStorage() {
  try {
    if (typeof localStorage === 'undefined') return null
    return {
      conversations: reviveConversations(
        safeParse(localStorage.getItem(STORAGE_KEYS.CONVERSATIONS), [])
      ),
      loveLetters: reviveLoveLetters(
        safeParse(localStorage.getItem(STORAGE_KEYS.LOVE_LETTERS), [])
      ),
      anniversaries: reviveAnniversaries(
        safeParse(localStorage.getItem(STORAGE_KEYS.ANNIVERSARIES), [])
      ),
      anonymousPosts: safeParse(localStorage.getItem(STORAGE_KEYS.ANONYMOUS_POSTS), [])
    }
  } catch {
    return null
  }
}

function saveToStorage(state) {
  try {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(state.conversations))
    localStorage.setItem(STORAGE_KEYS.LOVE_LETTERS, JSON.stringify(state.loveLetters))
    localStorage.setItem(STORAGE_KEYS.ANNIVERSARIES, JSON.stringify(state.anniversaries))
    localStorage.setItem(STORAGE_KEYS.ANONYMOUS_POSTS, JSON.stringify(state.anonymousPosts))
  } catch {}
}

function clearStorage() {
  try {
    if (typeof localStorage === 'undefined') return
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key))
  } catch {}
}

const persisted = loadFromStorage() || {}

export const store = reactive({
  conversations: persisted.conversations || [],
  selectedConversation: null,
  loveLetters: persisted.loveLetters || [],
  anonymousPosts: persisted.anonymousPosts || [],
  anniversaries: persisted.anniversaries || [],
  selectedAnniversary: null,
  processing: false,
  error: null,

  setConversations(convs) {
    this.conversations = convs
  },

  setLoveLetters(letters) {
    this.loveLetters = letters
  },

  setAnniversaries(annivs) {
    this.anniversaries = annivs
  },

  setSelectedConversation(conv) {
    this.selectedConversation = conv
  },

  setSelectedAnniversary(anniv) {
    this.selectedAnniversary = anniv
  },

  addAnonymousPost(post) {
    this.anonymousPosts.unshift(post)
  },

  setProcessing(val) {
    this.processing = val
  },

  setError(err) {
    this.error = err
  },

  clearAll() {
    this.conversations = []
    this.selectedConversation = null
    this.loveLetters = []
    this.anniversaries = []
    this.selectedAnniversary = null
    this.error = null
    clearStorage()
  }
})

watch(
  () => [store.conversations, store.loveLetters, store.anniversaries, store.anonymousPosts],
  () => {
    saveToStorage({
      conversations: store.conversations,
      loveLetters: store.loveLetters,
      anniversaries: store.anniversaries,
      anonymousPosts: store.anonymousPosts
    })
  },
  { deep: true }
)
