const anniversaryDetector = {
  name: 'anniversary',
  label: '纪念日',
  description: '识别对话中的生日、节日、初见等特殊日期',

  detect(conversation) {
    const messages = conversation.messages
    if (messages.length === 0) {
      return { score: 0, tags: [], anniversaries: [] }
    }

    let score = 0
    const tags = []
    const anniversaries = []

    const datePatterns = [
      /(\d{4})[年\-\/](\d{1,2})[月\-\/](\d{1,2})[日号]?/,
      /(\d{1,2})[月\-\/](\d{1,2})[日号]?/,
      /(\d{4})(\d{2})(\d{2})/,
    ]

    const holidayPatterns = {
      '情人节': /2[\/\-]?14|情人节|valentine/i,
      '白色情人节': /3[\/\-]?14|白色情人节/,
      '七夕': /7[\/\-]?7|七夕|乞巧/,
      '520表白日': /5[\/\-]?20|520|我爱你日/,
      '圣诞节': /12[\/\-]?25|圣诞|christmas/i,
      '新年': /1[\/\-]?1|元旦|新年|new year/i,
      '妇女节': /3[\/\-]?8|妇女节|女神节/,
      '愚人节': /4[\/\-]?1|愚人节/,
      '劳动节': /5[\/\-]?1|劳动节/,
      '儿童节': /6[\/\-]?1|儿童节/,
      '国庆节': /10[\/\-]?1|国庆/,
      '双11': /11[\/\-]?11|双十一|光棍节/,
    }

    const anniversaryKeywords = [
      { keyword: /生日|生日快乐|happy birthday/i, type: 'birthday', emoji: '🎂' },
      { keyword: /纪念日|周年|在一起.*天|认识.*天|相爱.*年/, type: 'anniversary', emoji: '💑' },
      { keyword: /第一次见面|初见|认识的那天|刚认识/, type: 'firstMeet', emoji: '🌸' },
      { keyword: /表白|告白|答应我|做我女朋友|做我男朋友/, type: 'confession', emoji: '💕' },
      { keyword: /订婚|结婚|婚礼|领证/, type: 'wedding', emoji: '💒' },
      { keyword: /新年快乐|春节快乐|过年|除夕/, type: 'springFestival', emoji: '🧧' },
      { keyword: /中秋|月饼|团圆/, type: 'midAutumn', emoji: '🥮' },
      { keyword: /端午|粽子/, type: 'dragonBoat', emoji: '🐲' },
    ]

    const foundDates = new Map()

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i]
      if (!msg.body) continue

      let detectedType = null
      let detectedEmoji = null

      for (const pattern of anniversaryKeywords) {
        if (pattern.keyword.test(msg.body)) {
          detectedType = pattern.type
          detectedEmoji = pattern.emoji
          break
        }
      }

      for (const [holidayName, pattern] of Object.entries(holidayPatterns)) {
        if (pattern.test(msg.body) && !detectedType) {
          detectedType = 'holiday'
          detectedEmoji = '🎉'
          break
        }
      }

      let parsedDate = null
      for (const pattern of datePatterns) {
        const match = msg.body.match(pattern)
        if (match) {
          let year, month, day
          if (match.length === 4) {
            year = parseInt(match[1])
            month = parseInt(match[2])
            day = parseInt(match[3])
          } else {
            year = new Date().getFullYear()
            month = parseInt(match[1])
            day = parseInt(match[2])
          }

          if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            parsedDate = new Date(year, month - 1, day)
            break
          }
        }
      }

      if (!parsedDate && detectedType) {
        parsedDate = new Date(msg.date)
      }

      if (parsedDate && detectedType) {
        const dateKey = `${parsedDate.getFullYear()}-${parsedDate.getMonth() + 1}-${parsedDate.getDate()}`
        
        if (!foundDates.has(dateKey)) {
          foundDates.set(dateKey, {
            date: parsedDate,
            type: detectedType,
            emoji: detectedEmoji,
            messages: [],
            messageIndex: i
          })
        }
        
        const entry = foundDates.get(dateKey)
        const contextMessages = this.getContextMessages(messages, i, 2, 2)
        entry.messages.push(...contextMessages)
        entry.messages = entry.messages.filter((m, index, self) =>
          index === self.findIndex(t => t.id === m.id)
        )
      }
    }

    for (const [holidayName, pattern] of Object.entries(holidayPatterns)) {
      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i]
        if (!msg.body) continue
        
        if (pattern.test(msg.body)) {
          const msgDate = new Date(msg.date)
          const dateKey = `${msgDate.getFullYear()}-${msgDate.getMonth() + 1}-${msgDate.getDate()}`
          
          if (!foundDates.has(dateKey)) {
            foundDates.set(dateKey, {
              date: msgDate,
              type: 'holiday',
              emoji: '🎉',
              holidayName,
              messages: [],
              messageIndex: i
            })
          }
          
          const entry = foundDates.get(dateKey)
          if (!entry.holidayName) {
            entry.holidayName = holidayName
          }
          const contextMessages = this.getContextMessages(messages, i, 2, 2)
          entry.messages.push(...contextMessages)
          entry.messages = entry.messages.filter((m, index, self) =>
            index === self.findIndex(t => t.id === m.id)
          )
        }
      }
    }

    for (const entry of foundDates.values()) {
      const daysAway = this.calculateDaysAway(entry.date)
      const typeLabels = {
        birthday: '生日',
        anniversary: '纪念日',
        firstMeet: '初见日',
        confession: '表白日',
        wedding: '结婚日',
        springFestival: '春节',
        midAutumn: '中秋节',
        dragonBoat: '端午节',
        holiday: entry.holidayName || '节日'
      }

      const label = typeLabels[entry.type] || '特殊日'
      const yearsPassed = this.calculateYearsPassed(entry.date)

      anniversaries.push({
        ...entry,
        label,
        daysAway,
        yearsPassed,
        conversationName: conversation.name,
        conversationAddress: conversation.address
      })

      if (yearsPassed > 0) {
        tags.push(`${entry.emoji} ${label} ${yearsPassed}周年`)
      } else {
        tags.push(`${entry.emoji} ${label}`)
      }

      score += this.calculateScore(entry)
    }

    const uniqueTags = [...new Set(tags)]

    return { score, tags: uniqueTags, anniversaries }
  },

  getContextMessages(messages, index, before, after) {
    const start = Math.max(0, index - before)
    const end = Math.min(messages.length, index + after + 1)
    return messages.slice(start, end)
  },

  calculateDaysAway(date) {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    const thisYearAnniversary = new Date(
      today.getFullYear(),
      date.getMonth(),
      date.getDate()
    )
    
    if (thisYearAnniversary < today) {
      thisYearAnniversary.setFullYear(today.getFullYear() + 1)
    }
    
    const diffTime = thisYearAnniversary - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays === 365 ? 0 : diffDays
  },

  calculateYearsPassed(date) {
    const now = new Date()
    let years = now.getFullYear() - date.getFullYear()
    
    const monthDiff = now.getMonth() - date.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < date.getDate())) {
      years--
    }
    
    return Math.max(0, years)
  },

  calculateScore(entry) {
    let score = 0
    const daysAway = entry.daysAway
    const yearsPassed = entry.yearsPassed

    if (daysAway <= 7) score += 50
    else if (daysAway <= 30) score += 30
    else if (daysAway <= 90) score += 15
    else score += 5

    if (yearsPassed >= 5) score += 30
    else if (yearsPassed >= 3) score += 20
    else if (yearsPassed >= 1) score += 10

    if (entry.type === 'birthday') score += 15
    else if (entry.type === 'anniversary') score += 20
    else if (entry.type === 'wedding') score += 25
    else if (entry.type === 'confession') score += 15
    else if (entry.type === 'firstMeet') score += 10

    if (entry.messages && entry.messages.length > 0) {
      score += Math.min(entry.messages.length * 2, 10)
    }

    return score
  }
}

export function findAllAnniversaries(conversations) {
  const allAnniversaries = []
  
  for (const conv of conversations) {
    const result = anniversaryDetector.detect(conv)
    if (result.anniversaries && result.anniversaries.length > 0) {
      allAnniversaries.push(...result.anniversaries)
    }
  }

  allAnniversaries.sort((a, b) => a.daysAway - b.daysAway)
  
  return allAnniversaries
}

export default anniversaryDetector
