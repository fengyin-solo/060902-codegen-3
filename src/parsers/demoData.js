import { groupConversations } from './index'

export function generateDemoData() {
  const conversations = [
    {
      address: '+8613800138000',
      name: '亲爱的TA',
      messages: [
        { id: '1', body: '晚安，梦里见 🌙', date: Date.now() - 86400000 * 30 + 3600000 * 22, type: 2, isSent: true, isReceived: false },
        { id: '2', body: '晚安呀，明天见 ❤️', date: Date.now() - 86400000 * 30 + 3600000 * 22 + 60000, type: 1, isSent: false, isReceived: true },
        { id: '3', body: '今天好累，想你了', date: Date.now() - 86400000 * 25 + 3600000 * 19, type: 2, isSent: true, isReceived: false },
        { id: '4', body: '我也想你，抱抱你 🤗', date: Date.now() - 86400000 * 25 + 3600000 * 19 + 120000, type: 1, isSent: false, isReceived: true },
        { id: '5', body: '周末一起去看电影好不好？', date: Date.now() - 86400000 * 20 + 3600000 * 14, type: 1, isSent: false, isReceived: true },
        { id: '6', body: '好呀好呀，我也想你了', date: Date.now() - 86400000 * 20 + 3600000 * 14 + 300000, type: 2, isSent: true, isReceived: false },
        { id: '7', body: '对不起，今天不能陪你吃饭了', date: Date.now() - 86400000 * 15 + 3600000 * 12, type: 2, isSent: true, isReceived: false },
        { id: '8', body: '没关系啦，工作重要。晚上记得想我哦', date: Date.now() - 86400000 * 15 + 3600000 * 12 + 180000, type: 1, isSent: false, isReceived: true },
        { id: '9', body: '想你想你想你！', date: Date.now() - 86400000 * 10 + 3600000 * 23, type: 2, isSent: true, isReceived: false },
        { id: '10', body: '我也想你，晚安亲爱的', date: Date.now() - 86400000 * 10 + 3600000 * 23 + 120000, type: 1, isSent: false, isReceived: true },
        { id: '11', body: '今天好想你，你在干嘛呢', date: Date.now() - 86400000 * 5 + 3600000 * 15, type: 1, isSent: false, isReceived: true },
        { id: '12', body: '在想你呀 😘', date: Date.now() - 86400000 * 5 + 3600000 * 15 + 60000, type: 2, isSent: true, isReceived: false },
        { id: '13', body: '明天就是6月15日了，生日快乐亲爱的！🎂', date: Date.now() - 86400000 + 3600000 * 10, type: 2, isSent: true, isReceived: false },
        { id: '14', body: '哇！你居然记得我的生日，太感动了 😭', date: Date.now() - 86400000 + 3600000 * 10 + 60000, type: 1, isSent: false, isReceived: true },
        { id: '15', body: '当然记得啦，你的每一个重要日子我都记在心里', date: Date.now() - 86400000 + 3600000 * 10 + 120000, type: 2, isSent: true, isReceived: false },
        { id: '16', body: '明天晚上我订了你最爱的那家餐厅，还有惊喜哦 🎁', date: Date.now() - 86400000 + 3600000 * 10 + 180000, type: 2, isSent: true, isReceived: false },
        { id: '17', body: '好期待！爱你 ❤️❤️❤️', date: Date.now() - 86400000 + 3600000 * 10 + 240000, type: 1, isSent: false, isReceived: true },
        { id: '18', body: '亲爱的，情人节快乐！2月14日，这个属于我们的节日 🌹', date: new Date(2026, 1, 14, 8, 30).getTime(), type: 2, isSent: true, isReceived: false },
        { id: '19', body: '情人节快乐！我的宝贝，有你每天都是情人节', date: new Date(2026, 1, 14, 8, 31).getTime(), type: 1, isSent: false, isReceived: true },
        { id: '20', body: '晚上记得早点下班，我有惊喜给你 💝', date: new Date(2026, 1, 14, 8, 32).getTime(), type: 2, isSent: true, isReceived: false },
        { id: '21', body: '520快乐！我爱你，不是今天才爱，是今天更想大声说出来 💕', date: new Date(2026, 4, 20, 0, 1).getTime(), type: 1, isSent: false, isReceived: true },
        { id: '22', body: '520快乐！我也爱你，很爱很爱', date: new Date(2026, 4, 20, 0, 2).getTime(), type: 2, isSent: true, isReceived: false },
        { id: '23', body: '你知道吗，今天是我们在一起1000天的纪念日', date: new Date(2026, 2, 15, 20, 0).getTime(), type: 1, isSent: false, isReceived: true },
        { id: '24', body: '真的吗！时间过得好快，我们已经在一起1000天了', date: new Date(2026, 2, 15, 20, 1).getTime(), type: 2, isSent: true, isReceived: false },
        { id: '25', body: '对啊，2023年7月20日，那天你答应做我女朋友的', date: new Date(2026, 2, 15, 20, 2).getTime(), type: 2, isSent: true, isReceived: false },
        { id: '26', body: '你居然还记得那么清楚，感动哭了 😢', date: new Date(2026, 2, 15, 20, 3).getTime(), type: 1, isSent: false, isReceived: true },
        { id: '27', body: '2023年6月10日，还记得吗？那天是我们第一次见面', date: new Date(2024, 5, 10, 15, 30).getTime(), type: 1, isSent: false, isReceived: true },
        { id: '28', body: '当然记得！那天你穿了一件白色的裙子，特别好看', date: new Date(2024, 5, 10, 15, 31).getTime(), type: 2, isSent: true, isReceived: false },
        { id: '29', body: '哈哈，你还记得！那时候我好紧张，都不敢看你', date: new Date(2024, 5, 10, 15, 32).getTime(), type: 1, isSent: false, isReceived: true },
        { id: '30', body: '我也是，心跳得特别快。不过见到你的那一刻，我就知道是你了', date: new Date(2024, 5, 10, 15, 33).getTime(), type: 2, isSent: true, isReceived: false },
      ]
    },
    {
      address: '+8613900139000',
      name: '小傲娇',
      messages: [
        { id: '101', body: '哼，不理你了！', date: Date.now() - 86400000 * 20, type: 1, isSent: false, isReceived: true },
        { id: '102', body: '怎么啦，我错了还不行吗 😢', date: Date.now() - 86400000 * 20 + 60000, type: 2, isSent: true, isReceived: false },
        { id: '103', body: '哪里错了？', date: Date.now() - 86400000 * 20 + 120000, type: 1, isSent: false, isReceived: true },
        { id: '104', body: '我哪里都错了，不该让你不高兴的', date: Date.now() - 86400000 * 20 + 180000, type: 2, isSent: true, isReceived: false },
        { id: '105', body: '哼，算你识相。下次不许了！', date: Date.now() - 86400000 * 20 + 300000, type: 1, isSent: false, isReceived: true },
        { id: '106', body: '你最好了，原谅我嘛好不好', date: Date.now() - 86400000 * 18, type: 2, isSent: true, isReceived: false },
        { id: '107', body: '不要撒娇，没用的', date: Date.now() - 86400000 * 18 + 60000, type: 1, isSent: false, isReceived: true },
        { id: '108', body: '嘤嘤嘤，人家错了嘛 🥺', date: Date.now() - 86400000 * 18 + 120000, type: 2, isSent: true, isReceived: false },
        { id: '109', body: '圣诞节快乐！🎄🎅 有没有想我要什么礼物呀', date: new Date(2025, 11, 25, 9, 0).getTime(), type: 2, isSent: true, isReceived: false },
        { id: '110', body: '圣诞节快乐！你就是我最好的礼物啦 🎁', date: new Date(2025, 11, 25, 9, 5).getTime(), type: 1, isSent: false, isReceived: true },
        { id: '111', body: '油嘴滑舌！不过我喜欢，晚上一起看电影吧', date: new Date(2025, 11, 25, 9, 10).getTime(), type: 1, isSent: false, isReceived: true },
        { id: '112', body: '新年快乐！2026年，我们还要一直在一起哦 🎉', date: new Date(2026, 0, 1, 0, 1).getTime(), type: 1, isSent: false, isReceived: true },
        { id: '113', body: '新年快乐！新的一年，我会更加爱你', date: new Date(2026, 0, 1, 0, 2).getTime(), type: 2, isSent: true, isReceived: false },
        { id: '114', body: '新的一年，不许再惹我生气了！不然有你好看的', date: new Date(2026, 0, 1, 0, 3).getTime(), type: 1, isSent: false, isReceived: true },
        { id: '115', body: '遵命，我的女王大人！👑', date: new Date(2026, 0, 1, 0, 4).getTime(), type: 2, isSent: true, isReceived: false },
      ]
    },
    {
      address: '+8613700137000',
      name: '欢喜冤家',
      messages: [
        { id: '201', body: '你能不能别这么笨！', date: Date.now() - 86400000 * 40, type: 1, isSent: false, isReceived: true },
        { id: '202', body: '我怎么笨了？你才笨！', date: Date.now() - 86400000 * 40 + 30000, type: 2, isSent: true, isReceived: false },
        { id: '203', body: '说谁呢你！找打是吧？', date: Date.now() - 86400000 * 40 + 60000, type: 1, isSent: false, isReceived: true },
        { id: '204', body: '我说你呢，笨蛋笨蛋大笨蛋！', date: Date.now() - 86400000 * 40 + 90000, type: 2, isSent: true, isReceived: false },
        { id: '205', body: '你死定了！绝交！', date: Date.now() - 86400000 * 40 + 120000, type: 1, isSent: false, isReceived: true },
        { id: '206', body: '对不起对不起，我错了，别不理我', date: Date.now() - 86400000 * 40 + 300000, type: 2, isSent: true, isReceived: false },
        { id: '207', body: '晚了！', date: Date.now() - 86400000 * 40 + 360000, type: 1, isSent: false, isReceived: true },
        { id: '208', body: '我请你吃一周的奶茶！', date: Date.now() - 86400000 * 40 + 420000, type: 2, isSent: true, isReceived: false },
        { id: '209', body: '两周！', date: Date.now() - 86400000 * 40 + 480000, type: 1, isSent: false, isReceived: true },
        { id: '210', body: '成交！你最最好了！', date: Date.now() - 86400000 * 40 + 540000, type: 2, isSent: true, isReceived: false },
        { id: '211', body: '七夕快乐！虽然你很笨，但我还是喜欢你 🥮', date: new Date(2025, 7, 20, 12, 0).getTime(), type: 2, isSent: true, isReceived: false },
        { id: '212', body: '七夕快乐！谁喜欢你了，自作多情！😤', date: new Date(2025, 7, 20, 12, 2).getTime(), type: 1, isSent: false, isReceived: true },
        { id: '213', body: '口是心非的家伙，晚上老地方见，有礼物给你', date: new Date(2025, 7, 20, 12, 4).getTime(), type: 2, isSent: true, isReceived: false },
        { id: '214', body: '哼，谁要你的礼物...不过我勉为其难收一下吧', date: new Date(2025, 7, 20, 12, 6).getTime(), type: 1, isSent: false, isReceived: true },
        { id: '215', body: '妇女节快乐！女神节，我的女王大人 👑', date: new Date(2026, 2, 8, 9, 0).getTime(), type: 2, isSent: true, isReceived: false },
        { id: '216', body: '算你识相！今天我要吃大餐', date: new Date(2026, 2, 8, 9, 10).getTime(), type: 1, isSent: false, isReceived: true },
        { id: '217', body: '没问题，你说了算！', date: new Date(2026, 2, 8, 9, 15).getTime(), type: 2, isSent: true, isReceived: false },
      ]
    },
    {
      address: '+8613600136000',
      name: '温柔的人',
      messages: [
        { id: '301', body: '今天天气真好，想和你一起散步', date: Date.now() - 86400000 * 50, type: 2, isSent: true, isReceived: false },
        { id: '302', body: '好呀，晚上吃完饭一起吧', date: Date.now() - 86400000 * 50 + 600000, type: 1, isSent: false, isReceived: true },
        { id: '303', body: '和你在一起的每一天都很开心', date: Date.now() - 86400000 * 45, type: 2, isSent: true, isReceived: false },
        { id: '304', body: '我也是，谢谢你出现在我的生命里', date: Date.now() - 86400000 * 45 + 300000, type: 1, isSent: false, isReceived: true },
        { id: '305', body: '晚安，愿你做个好梦', date: Date.now() - 86400000 * 42, type: 2, isSent: true, isReceived: false },
        { id: '306', body: '晚安，梦里有你就是好梦', date: Date.now() - 86400000 * 42 + 120000, type: 1, isSent: false, isReceived: true },
        { id: '307', body: '想你了，真的好想', date: Date.now() - 86400000 * 35, type: 1, isSent: false, isReceived: true },
        { id: '308', body: '我也想你，等我忙完这段时间就去陪你', date: Date.now() - 86400000 * 35 + 180000, type: 2, isSent: true, isReceived: false },
        { id: '309', body: '做我女朋友吧，我会用一生来照顾你', date: new Date(2023, 6, 20, 20, 0).getTime(), type: 2, isSent: true, isReceived: false },
        { id: '310', body: '...我愿意', date: new Date(2023, 6, 20, 20, 5).getTime(), type: 1, isSent: false, isReceived: true },
        { id: '311', body: '真的吗？我太幸福了！', date: new Date(2023, 6, 20, 20, 10).getTime(), type: 2, isSent: true, isReceived: false },
        { id: '312', body: '傻瓜，我也很幸福，遇见你是我最大的幸运', date: new Date(2023, 6, 20, 20, 15).getTime(), type: 1, isSent: false, isReceived: true },
        { id: '313', body: '春节快乐！新的一年，愿我们的爱情更加甜蜜', date: new Date(2026, 1, 17, 0, 0).getTime(), type: 1, isSent: false, isReceived: true },
        { id: '314', body: '春节快乐！愿我们年年岁岁都相伴 🧧', date: new Date(2026, 1, 17, 0, 1).getTime(), type: 2, isSent: true, isReceived: false },
        { id: '315', body: '中秋快乐，月圆人团圆，愿我们永远在一起 🥮', date: new Date(2025, 8, 15, 20, 0).getTime(), type: 2, isSent: true, isReceived: false },
        { id: '316', body: '中秋快乐，但愿人长久，千里共婵娟', date: new Date(2025, 8, 15, 20, 2).getTime(), type: 1, isSent: false, isReceived: true },
        { id: '317', body: '亲爱的，9月10日教师节，也是我们认识3周年的日子', date: new Date(2026, 8, 10, 10, 0).getTime(), type: 1, isSent: false, isReceived: true },
        { id: '318', body: '是啊，时间过得真快，感谢你这3年的陪伴', date: new Date(2026, 8, 10, 10, 2).getTime(), type: 2, isSent: true, isReceived: false },
      ]
    }
  ]
  
  return groupConversations(conversations.flatMap(c => 
    c.messages.map(m => ({
      ...m,
      address: c.address,
      threadId: c.address
    }))
  ))
}
