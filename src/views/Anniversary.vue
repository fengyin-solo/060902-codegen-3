<template>
  <div class="anniversary-page">
    <div class="anniversary-header">
      <h2>📅 时光纪念册</h2>
      <p>从短信中发现的每一个特别的日子，都值得被铭记</p>
    </div>

    <div v-if="upcomingCount > 0" class="upcoming-banner">
      <span class="icon">⏰</span>
      <span>还有 <strong>{{ upcomingCount }}</strong> 个纪念日即将到来，别忘了准备惊喜哦！</span>
    </div>

    <div v-if="store.anniversaries.length === 0" class="empty-state">
      <div class="icon">📭</div>
      <h3>还没有发现纪念日</h3>
      <p>上传短信后，我们会自动识别生日、节日、初见日等特殊日期</p>
      <router-link to="/" class="btn btn-primary">上传短信</router-link>
    </div>

    <div v-else class="anniversaries-grid">
      <div 
        v-for="(anniv, idx) in store.anniversaries" 
        :key="idx"
        class="anniversary-card card"
        :class="{ 
          'is-today': anniv.daysAway === 0,
          'is-upcoming': anniv.daysAway > 0 && anniv.daysAway <= 7,
          'is-soon': anniv.daysAway > 7 && anniv.daysAway <= 30
        }"
        @click="toggleExpand(idx)"
      >
        <div class="card-header">
          <div class="anniv-emoji">{{ anniv.emoji }}</div>
          <div class="anniv-info">
            <h3 class="anniv-title">{{ anniv.label }}</h3>
            <p class="anniv-with">与 {{ anniv.conversationName }}</p>
          </div>
          <div class="days-badge" :class="getDaysBadgeClass(anniv.daysAway)">
            <span v-if="anniv.daysAway === 0" class="today-text">今天！</span>
            <span v-else-if="anniv.daysAway === 1">明天</span>
            <span v-else>{{ anniv.daysAway }} 天后</span>
          </div>
        </div>

        <div class="anniv-date-section">
          <div class="date-display">
            <span class="date-label">📆 日期</span>
            <span class="date-value">{{ formatDate(anniv.date) }}</span>
          </div>
          <div class="years-display" v-if="anniv.yearsPassed > 0">
            <span class="years-label">✨ 已走过</span>
            <span class="years-value">{{ anniv.yearsPassed }} 年</span>
          </div>
        </div>

        <div class="expand-toggle">
          <span>{{ expandedIdx === idx ? '收起对话 ▲' : '查看当时的对话 ▼' }}</span>
        </div>

        <transition name="slide">
          <div v-show="expandedIdx === idx" class="messages-section">
            <div class="section-label">💬 当时的代表对话</div>
            <div class="messages-list">
              <div 
                v-for="msg in anniv.messages" 
                :key="msg.id"
                class="message-item"
                :class="{ sent: msg.isSent, received: msg.isReceived }"
              >
                <div class="message-bubble">
                  <span class="msg-time">{{ formatMessageTime(msg.date) }}</span>
                  <span class="msg-body">{{ msg.body }}</span>
                </div>
              </div>
            </div>
          </div>
        </transition>

        <div class="card-footer">
          <button 
            class="btn btn-secondary btn-sm" 
            @click.stop="setReminder(anniv)"
          >
            🔔 设置提醒
          </button>
          <button 
            class="btn btn-primary btn-sm"
            @click.stop="shareAnniversary(anniv)"
          >
            💝 分享
          </button>
        </div>
      </div>
    </div>

    <div v-if="expandedIdx !== null" class="modal-backdrop" @click="expandedIdx = null">
      <div class="modal-content card" @click.stop>
        <div class="modal-header">
          <h3>{{ store.anniversaries[expandedIdx]?.emoji }} {{ store.anniversaries[expandedIdx]?.label }}</h3>
          <button class="close-btn" @click="expandedIdx = null">✕</button>
        </div>
        <div class="modal-body">
          <p class="modal-date">📅 {{ formatDate(store.anniversaries[expandedIdx]?.date) }}</p>
          <p v-if="store.anniversaries[expandedIdx]?.yearsPassed > 0" class="modal-years">
            ✨ 已经走过 {{ store.anniversaries[expandedIdx]?.yearsPassed }} 年
          </p>
          <div class="modal-messages">
            <div 
              v-for="msg in store.anniversaries[expandedIdx]?.messages" 
              :key="msg.id"
              class="message-item"
              :class="{ sent: msg.isSent, received: msg.isReceived }"
            >
              <div class="message-bubble">
                <span class="msg-time">{{ formatMessageTime(msg.date) }}</span>
                <span class="msg-body">{{ msg.body }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { store } from '@/store'
import { findAllAnniversaries } from '@/detectors'

const expandedIdx = ref(null)

const upcomingCount = computed(() => {
  return store.anniversaries.filter(a => a.daysAway > 0 && a.daysAway <= 30).length
})

function formatDate(date) {
  const d = new Date(date)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

function formatMessageTime(timestamp) {
  const d = new Date(timestamp)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')
  return `${month}/${day} ${hours}:${minutes}`
}

function getDaysBadgeClass(daysAway) {
  if (daysAway === 0) return 'badge-today'
  if (daysAway <= 7) return 'badge-upcoming'
  if (daysAway <= 30) return 'badge-soon'
  return 'badge-later'
}

function toggleExpand(idx) {
  expandedIdx.value = expandedIdx.value === idx ? null : idx
}

function setReminder(anniv) {
  const nextDate = getNextAnniversaryDate(anniv.date)
  const message = `${anniv.emoji} ${anniv.label}（${formatDate(anniv.date)}）还有 ${anniv.daysAway} 天就到了！`
  
  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification('纪念日提醒', { body: message })
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('纪念日提醒', { body: message })
        }
      })
    }
  }
  
  alert(`已设置提醒：\n${message}`)
}

function getNextAnniversaryDate(date) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const anniversary = new Date(today.getFullYear(), date.getMonth(), date.getDate())
  
  if (anniversary < today) {
    anniversary.setFullYear(today.getFullYear() + 1)
  }
  
  return anniversary
}

function shareAnniversary(anniv) {
  const text = `${anniv.emoji} ${anniv.label}（${formatDate(anniv.date)}）\n` +
    `还有 ${anniv.daysAway} 天就到了！\n` +
    `我们已经一起走过 ${anniv.yearsPassed} 年 ❤️`
  
  if (navigator.share) {
    navigator.share({
      title: `${anniv.label} 纪念日`,
      text: text
    })
  } else {
    navigator.clipboard.writeText(text).then(() => {
      alert('已复制到剪贴板，快去分享吧！')
    })
  }
}

onMounted(() => {
  if (store.conversations.length > 0 && store.anniversaries.length === 0) {
    const anniversaries = findAllAnniversaries(store.conversations)
    store.setAnniversaries(anniversaries)
  }
})
</script>

<style scoped>
.anniversary-page {
  max-width: 1200px;
  margin: 0 auto;
}

.anniversary-header {
  text-align: center;
  margin-bottom: 2rem;
}

.anniversary-header h2 {
  font-size: 2rem;
  color: var(--love-red);
  margin-bottom: 0.5rem;
}

.anniversary-header p {
  color: var(--text-light);
}

.upcoming-banner {
  background: linear-gradient(135deg, #fff3e0, #ffe0b2);
  border-radius: 12px;
  padding: 1rem 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #e65100;
  font-weight: 500;
}

.upcoming-banner .icon {
  font-size: 1.5rem;
}

.upcoming-banner strong {
  color: var(--love-red);
  font-size: 1.2rem;
}

.anniversaries-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.anniversary-card {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.3s;
  overflow: hidden;
}

.anniversary-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(231, 76, 60, 0.15);
}

.anniversary-card.is-today {
  border: 2px solid var(--love-red);
  background: linear-gradient(135deg, #fff5f5, #ffe0e0);
}

.anniversary-card.is-upcoming {
  border: 2px solid var(--love-orange);
}

.anniversary-card.is-soon {
  border: 2px solid var(--love-pink);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.anniv-emoji {
  font-size: 3rem;
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-light);
  border-radius: 50%;
  flex-shrink: 0;
}

.anniv-info {
  flex: 1;
  min-width: 0;
}

.anniv-title {
  font-size: 1.3rem;
  color: var(--text-dark);
  margin-bottom: 0.25rem;
}

.anniv-with {
  color: var(--text-light);
  font-size: 0.9rem;
}

.days-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.badge-today {
  background: linear-gradient(135deg, var(--love-red), var(--love-pink));
  color: white;
  animation: pulse 2s infinite;
}

.badge-upcoming {
  background: linear-gradient(135deg, var(--love-orange), #ff8c00);
  color: white;
}

.badge-soon {
  background: linear-gradient(135deg, var(--love-pink), #ff6b9d);
  color: white;
}

.badge-later {
  background: var(--bg-light);
  color: var(--text-light);
}

.today-text {
  animation: blink 1s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.anniv-date-section {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border);
}

.date-display,
.years-display {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.date-label,
.years-label {
  font-size: 0.8rem;
  color: var(--text-light);
}

.date-value,
.years-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-dark);
}

.expand-toggle {
  text-align: center;
  padding: 0.75rem;
  color: var(--love-pink);
  font-size: 0.9rem;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.3s;
}

.expand-toggle:hover {
  background: var(--bg-light);
}

.messages-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
}

.section-label {
  font-size: 0.9rem;
  color: var(--text-light);
  margin-bottom: 1rem;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.message-item {
  display: flex;
}

.message-item.sent {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 85%;
  padding: 0.75rem 1rem;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.message-item.sent .message-bubble {
  background: linear-gradient(135deg, var(--love-red), var(--love-pink));
  color: white;
  border-bottom-right-radius: 4px;
}

.message-item.received .message-bubble {
  background: white;
  border: 1px solid var(--border);
  border-bottom-left-radius: 4px;
}

.msg-time {
  font-size: 0.7rem;
  opacity: 0.7;
}

.msg-body {
  font-size: 0.95rem;
  line-height: 1.5;
}

.card-footer {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  flex: 1;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  max-height: 500px;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border);
}

.modal-header h3 {
  font-size: 1.5rem;
  color: var(--love-red);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-light);
  padding: 0.5rem;
}

.close-btn:hover {
  color: var(--love-red);
}

.modal-date {
  font-size: 1.2rem;
  color: var(--text-dark);
  margin-bottom: 0.5rem;
}

.modal-years {
  font-size: 1.1rem;
  color: var(--love-pink);
  margin-bottom: 1.5rem;
}

.modal-messages {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

@media (max-width: 768px) {
  .anniversaries-grid {
    grid-template-columns: 1fr;
  }
  
  .card-header {
    flex-wrap: wrap;
  }
  
  .days-badge {
    order: 3;
    width: 100%;
    text-align: center;
  }
}
</style>
