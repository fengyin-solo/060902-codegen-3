const holidayFixedDates = {
  '情人节': { month: 2, day: 14 },
  '白色情人节': { month: 3, day: 14 },
  '七夕': { month: 7, day: 7 },
  '520表白日': { month: 5, day: 20 },
  '圣诞节': { month: 12, day: 25 },
  '新年': { month: 1, day: 1 },
  '妇女节': { month: 3, day: 8 },
  '愚人节': { month: 4, day: 1 },
  '劳动节': { month: 5, day: 1 },
  '儿童节': { month: 6, day: 1 },
  '国庆节': { month: 10, day: 1 },
  '双11': { month: 11, day: 11 },
}

const holidayPatterns = {
  '情人节': /情人节|valentine/i,
  '白色情人节': /白色情人节/,
  '七夕': /七夕|乞巧/,
  '520表白日': /520|我爱你日/,
  '圣诞节': /圣诞|christmas/i,
  '新年': /元旦|新年|new year/i,
  '妇女节': /妇女节|女神节/,
  '愚人节': /愚人节/,
  '劳动节': /劳动节/,
  '儿童节': /儿童节/,
  '国庆节': /国庆/,
  '双11': /双十一|光棍节/,
}

const anniversaryKeywords = [
  { keyword: /生日|生日快乐|happy birthday/i, type: 'birthday', emoji: '🎂' },
  { keyword: /纪念日|周年|在一起.*天|认识.*天|相爱.*年/, type: 'anniversary', emoji: '💑' },
  { keyword: /第一次见面|初见|认识的那天|刚认识/, type: 'firstMeet', emoji: '🌸' },
  { keyword: /表白|告白|答应我|做我女朋友|做我男朋友|我愿意/, type: 'confession', emoji: '💕' },
  { keyword: /订婚|结婚|婚礼|领证/, type: 'wedding', emoji: '💒' },
  { keyword: /春节快乐|过年|除夕/, type: 'springFestival', emoji: '🧧' },
  { keyword: /中秋|月饼|团圆/, type: 'midAutumn', emoji: '🥮' },
  { keyword: /端午|粽子/, type: 'dragonBoat', emoji: '🐲' },
]

const datePatterns = [
  /(\d{4})[年\-\/\.](\d{1,2})[月\-\/\.](\d{1,2})[日号]?/,
  /(\d{1,2})[月\-\/\.](\d{1,2})[日号]?/,
  /(\d{4})(\d{2})(\d{2})/,
]

const DATE_SOURCE = {
  TEXT: 'text',
  HOLIDAY_FIXED: 'holiday_fixed',
  MSG_FALLBACK: 'msg_fallback',
}

function extractDateFromText(text, referenceDate) {
  for (const pattern of datePatterns) {
    const match = text.match(pattern)
    if (match) {
      let year, month, day
      if (match.length === 4) {
        year = parseInt(match[1])
        month = parseInt(match[2])
        day = parseInt(match[3])
      } else {
        year = referenceDate ? referenceDate.getFullYear() : new Date().getFullYear()
        month = parseInt(match[1])
        day = parseInt(match[2])
      }
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        return new Date(year, month - 1, day)
      }
    }
  }
  return null
}

function determineHolidayDate(holidayName, msgDate, textExtractedDate) {
  if (textExtractedDate) {
    const fixed = holidayFixedDates[holidayName]
    if (fixed && textExtractedDate.getMonth() + 1 === fixed.month && textExtractedDate.getDate() === fixed.day) {
      return { date: textExtractedDate, source: DATE_SOURCE.TEXT }
    }
  }
  const fixed = holidayFixedDates[holidayName]
  if (fixed) {
    const msgYear = msgDate.getFullYear()
    let holidayDate = new Date(msgYear, fixed.month - 1, fixed.day)
    const msgDateOnly = new Date(msgYear, msgDate.getMonth(), msgDate.getDate())
    const diffDays = Math.round((msgDateOnly - holidayDate) / (1000 * 60 * 60 * 24))
    if (diffDays > 30) {
      holidayDate = new Date(msgYear + 1, fixed.month - 1, fixed.day)
    } else if (diffDays < -30) {
      holidayDate = new Date(msgYear - 1, fixed.month - 1, fixed.day)
    }
    return { date: holidayDate, source: DATE_SOURCE.HOLIDAY_FIXED }
  }
  return { date: new Date(msgDate), source: DATE_SOURCE.MSG_FALLBACK }
}

function normalizeDate(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function daysBetween(a, b) {
  const na = normalizeDate(a)
  const nb = normalizeDate(b)
  return Math.round((na - nb) / (1000 * 60 * 60 * 24))
}

function sourcePriority(source) {
  switch (source) {
    case DATE_SOURCE.TEXT: return 3
    case DATE_SOURCE.HOLIDAY_FIXED: return 2
    case DATE_SOURCE.MSG_FALLBACK: return 1
    default: return 0
  }
}

function makeAnniversaryKey(entry, conversationAddress) {
  const d = normalizeDate(entry.date)
  return `${conversationAddress}|${entry.type}|${entry.holidayName || ''}|${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

function makeTypeKey(entry) {
  return `${entry.type}|${entry.holidayName || ''}`
}

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

    const rawEntries = []

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i]
      if (!msg.body) continue

      const msgDate = new Date(msg.date)
      const textDate = extractDateFromText(msg.body, msgDate)

      let detected = null

      for (const kw of anniversaryKeywords) {
        if (kw.keyword.test(msg.body)) {
          detected = {
            type: kw.type,
            emoji: kw.emoji,
            sourceIndex: i,
          }
          break
        }
      }

      if (!detected) {
        for (const [holidayName, pattern] of Object.entries(holidayPatterns)) {
          if (pattern.test(msg.body)) {
            detected = {
              type: 'holiday',
              emoji: '🎉',
              holidayName,
              sourceIndex: i,
            }
            break
          }
        }
      }

      if (!detected) continue

      let actualDate = null
      let dateSource = DATE_SOURCE.MSG_FALLBACK

      if (detected.type === 'holiday' && detected.holidayName) {
        const result = determineHolidayDate(detected.holidayName, msgDate, textDate)
        actualDate = result.date
        dateSource = result.source
      } else if (textDate) {
        actualDate = textDate
        dateSource = DATE_SOURCE.TEXT
      } else {
        actualDate = new Date(msgDate)
        dateSource = DATE_SOURCE.MSG_FALLBACK
      }

      const contextMessages = this.getContextMessages(messages, i, 2, 2)

      rawEntries.push({
        date: actualDate,
        dateSource,
        type: detected.type,
        emoji: detected.emoji,
        holidayName: detected.holidayName || null,
        sourceIndex: detected.sourceIndex,
        messages: contextMessages,
      })
    }

    const exactDedup = new Map()
    for (const entry of rawEntries) {
      const fullKey = makeAnniversaryKey(entry, conversation.address)
      if (!exactDedup.has(fullKey)) {
        exactDedup.set(fullKey, {
          ...entry,
          messages: [...entry.messages],
        })
      } else {
        const existing = exactDedup.get(fullKey)
        for (const m of entry.messages) {
          if (!existing.messages.find(x => x.id === m.id)) {
            existing.messages.push(m)
          }
        }
        if (sourcePriority(entry.dateSource) > sourcePriority(existing.dateSource)) {
          existing.dateSource = entry.dateSource
          existing.date = entry.date
        }
        if (entry.sourceIndex < existing.sourceIndex) {
          existing.sourceIndex = entry.sourceIndex
        }
      }
    }

    const proximityGroups = new Map()
    const exactEntries = Array.from(exactDedup.values())
    for (const entry of exactEntries) {
      const tk = makeTypeKey(entry)
      if (!proximityGroups.has(tk)) {
        proximityGroups.set(tk, [])
      }
      proximityGroups.get(tk).push(entry)
    }

    const dedupedEntries = []
    for (const [, group] of proximityGroups) {
      const clusterUsed = new Set()
      for (let i = 0; i < group.length; i++) {
        if (clusterUsed.has(i)) continue
        const base = group[i]
        const cluster = [base]
        clusterUsed.add(i)
        for (let j = i + 1; j < group.length; j++) {
          if (clusterUsed.has(j)) continue
          const diff = Math.abs(daysBetween(base.date, group[j].date))
          if (diff <= 3) {
            cluster.push(group[j])
            clusterUsed.add(j)
          }
        }
        let best = cluster[0]
        for (let k = 1; k < cluster.length; k++) {
          const cand = cluster[k]
          const candScore = sourcePriority(cand.dateSource) * 1000 + cand.messages.length * 10
          const bestScore = sourcePriority(best.dateSource) * 1000 + best.messages.length * 10
          if (candScore > bestScore) {
            best = cand
          }
        }
        for (const item of cluster) {
          if (item !== best) {
            for (const m of item.messages) {
              if (!best.messages.find(x => x.id === m.id)) {
                best.messages.push(m)
              }
            }
          }
        }
        dedupedEntries.push({
          ...best,
          messages: best.messages.sort((a, b) => a.date - b.date),
        })
      }
    }

    const typeLabels = {
      birthday: '生日',
      anniversary: '纪念日',
      firstMeet: '初见日',
      confession: '表白日',
      wedding: '结婚日',
      springFestival: '春节',
      midAutumn: '中秋节',
      dragonBoat: '端午节',
      holiday: (name) => name || '节日'
    }

    for (const entry of dedupedEntries) {
      const daysAway = this.calculateDaysAway(entry.date)
      let label
      if (entry.type === 'holiday') {
        label = typeLabels.holiday(entry.holidayName)
      } else {
        label = typeLabels[entry.type] || '特殊日'
      }
      const yearsPassed = this.calculateYearsPassed(entry.date)

      anniversaries.push({
        date: entry.date,
        type: entry.type,
        emoji: entry.emoji,
        holidayName: entry.holidayName,
        messages: entry.messages,
        label,
        daysAway,
        yearsPassed,
        conversationName: conversation.name,
        conversationAddress: conversation.address,
      })

      if (yearsPassed > 0) {
        tags.push(`${entry.emoji} ${label} ${yearsPassed}周年`)
      } else {
        tags.push(`${entry.emoji} ${label}`)
      }

      score += this.calculateScore({ ...entry, daysAway, yearsPassed })
    }

    anniversaries.sort((a, b) => a.daysAway - b.daysAway)

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
  const globalDedup = new Map()

  for (const conv of conversations) {
    const result = anniversaryDetector.detect(conv)
    if (result.anniversaries && result.anniversaries.length > 0) {
      for (const anniv of result.anniversaries) {
        const d = normalizeDate(anniv.date)
        const mdKey = `${anniv.conversationAddress}|${anniv.type}|${anniv.holidayName || ''}|${d.getMonth() + 1}-${d.getDate()}`
        if (!globalDedup.has(mdKey)) {
          globalDedup.set(mdKey, anniv)
          allAnniversaries.push(anniv)
        } else {
          const prev = globalDedup.get(mdKey)
          if (anniv.messages.length > prev.messages.length) {
            const idx = allAnniversaries.indexOf(prev)
            if (idx !== -1) allAnniversaries[idx] = anniv
            globalDedup.set(mdKey, anniv)
          }
        }
      }
    }
  }

  allAnniversaries.sort((a, b) => a.daysAway - b.daysAway)

  return allAnniversaries
}

export default anniversaryDetector
