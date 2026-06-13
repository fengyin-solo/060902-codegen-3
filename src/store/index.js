import { reactive } from 'vue'

export const store = reactive({
  conversations: [],
  selectedConversation: null,
  loveLetters: [],
  anonymousPosts: [],
  anniversaries: [],
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
  }
})
