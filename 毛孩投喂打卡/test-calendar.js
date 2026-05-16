function getTodayString() {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
}

function getAnimalTypeLabel(type) {
  const labels = {
    cat: '猫咪',
    dog: '狗狗',
    other: '其他'
  }
  return labels[type]
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

function generateMockRecords() {
  const records = []
  const today = new Date()
  const locations = ['小区花园', '楼下便利店', '公园长椅', '停车场入口', '学校后门', '图书馆门口', '食堂旁']
  const foods = ['猫粮', '狗粮', '火腿肠', '剩饭', '专用罐头', '鸡胸肉', '小鱼干']
  const animalTypes = ['cat', 'dog', 'other']
  const notes = [
    '小家伙吃得很香',
    '小橘猫很亲人',
    '小黑狗一直摇尾巴',
    '喂了三只小猫',
    '今天带了罐头来',
    '流浪猫妈妈带着崽',
    '狗狗看起来很饿',
    '吃得干干净净',
    '明天还要来',
    ''
  ]
  
  console.log('\n========== 模拟数据生成规则 ==========')
  console.log('📅 时间范围: 过去45天')
  console.log('📍 地点: 7种不同地点')
  console.log('🍖 食物: 7种不同食物')
  console.log('🐾 动物类型: 猫(50%) / 狗(35%) / 其他(15%)')
  console.log('⏰ 时间分布: 早晨(7-9点) / 中午(12-14点) / 傍晚(17-20点)')
  console.log('📊 周末投喂次数更多(2-4次), 工作日较少(1-2次)')
  console.log('========================================\n')
  
  for (let i = 45; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    
    let count
    const dayOfWeek = date.getDay()
    
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      count = Math.floor(Math.random() * 3) + 2
    } else if (dayOfWeek === 5) {
      count = Math.floor(Math.random() * 2) + 2
    } else {
      count = Math.floor(Math.random() * 2) + 1
    }
    
    if (i % 7 === 0) {
      count = Math.floor(Math.random() * 2) + 3
    }
    
    if (i === 0 || i === 1 || i === 2 || i === 3 || i === 5 || i === 7 || i === 10 || i === 14) {
      count = Math.max(count, Math.floor(Math.random() * 2) + 2)
    }
    
    for (let j = 0; j < count; j++) {
      let hour
      if (j === 0) {
        hour = Math.floor(Math.random() * 3) + 7
      } else if (j === 1) {
        hour = Math.floor(Math.random() * 3) + 12
      } else {
        hour = Math.floor(Math.random() * 4) + 17
      }
      const minute = Math.floor(Math.random() * 60)
      const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
      
      let animalType
      const rand = Math.random()
      if (rand < 0.5) {
        animalType = 'cat'
      } else if (rand < 0.85) {
        animalType = 'dog'
      } else {
        animalType = 'other'
      }
      
      let food
      if (animalType === 'cat') {
        const catFoods = ['猫粮', '小鱼干', '鸡胸肉', '火腿肠', '剩饭']
        food = catFoods[Math.floor(Math.random() * catFoods.length)]
      } else if (animalType === 'dog') {
        const dogFoods = ['狗粮', '火腿肠', '剩饭', '鸡胸肉', '专用罐头']
        food = dogFoods[Math.floor(Math.random() * dogFoods.length)]
      } else {
        food = foods[Math.floor(Math.random() * foods.length)]
      }
      
      records.push({
        id: generateId(),
        timestamp: date.getTime() + (hour * 60 + minute) * 60000,
        date: dateStr,
        time: timeStr,
        location: locations[Math.floor(Math.random() * locations.length)],
        animalType,
        animalTypeLabel: getAnimalTypeLabel(animalType),
        food,
        notes: notes[Math.floor(Math.random() * notes.length)]
      })
    }
  }
  
  return records.sort((a, b) => b.timestamp - a.timestamp)
}

function testCalendarStats(records) {
  console.log('\n========== 📊 日历统计功能测试 ==========\n')
  
  const today = getTodayString()
  const todayRecords = records.filter(r => r.date === today)
  console.log(`📅 今日(${today})投喂记录: ${todayRecords.length}条`)
  
  todayRecords.forEach((r, idx) => {
    console.log(`   ${idx + 1}. ${r.time} | ${r.animalTypeLabel} | ${r.food} | ${r.location}`)
  })
  
  console.log('')
  
  const statsMap = new Map()
  records.forEach(record => {
    if (!statsMap.has(record.date)) {
      statsMap.set(record.date, {
        date: record.date,
        records: [],
        totalCount: 0,
        catCount: 0,
        dogCount: 0,
        otherCount: 0
      })
    }
    const stats = statsMap.get(record.date)
    stats.records.push(record)
    stats.totalCount++
    if (record.animalType === 'cat') stats.catCount++
    else if (record.animalType === 'dog') stats.dogCount++
    else stats.otherCount++
  })
  
  const dailyStats = Array.from(statsMap.values()).sort((a, b) => b.date.localeCompare(a.date))
  
  console.log(`📆 有记录的天数: ${dailyStats.length}天`)
  console.log(`📝 总投喂记录数: ${records.length}条`)
  console.log('')
  
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const monthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`
  const monthRecords = records.filter(r => r.date.startsWith(monthStr))
  
  console.log(`📅 本月(${currentYear}年${currentMonth + 1}月)统计:`)
  console.log(`   投喂次数: ${monthRecords.length}次`)
  
  const monthDays = new Set(monthRecords.map(r => r.date)).size
  console.log(`   投喂天数: ${monthDays}天`)
  
  let catCount = 0, dogCount = 0, otherCount = 0
  monthRecords.forEach(r => {
    if (r.animalType === 'cat') catCount++
    else if (r.animalType === 'dog') dogCount++
    else otherCount++
  })
  console.log(`   猫咪: ${catCount}次 | 狗狗: ${dogCount}次 | 其他: ${otherCount}次`)
  console.log('')
  
  console.log('📆 最近10天投喂情况:')
  console.log('────────────────────────────────────────')
  console.log('   日期       | 次数 | 猫 | 狗 | 其他')
  console.log('────────────────────────────────────────')
  
  for (let i = 0; i < Math.min(10, dailyStats.length); i++) {
    const stats = dailyStats[i]
    const isToday = stats.date === today ? ' 今天' : ''
    console.log(`   ${stats.date}${isToday} | ${String(stats.totalCount).padStart(2, ' ')}次 | ${stats.catCount} | ${stats.dogCount} | ${stats.otherCount}`)
  }
  console.log('────────────────────────────────────────')
  console.log('')
  
  let currentStreak = 0
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(now)
    checkDate.setDate(checkDate.getDate() - i)
    const dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`
    
    const hasRecord = dailyStats.some(s => s.date === dateStr)
    if (hasRecord) {
      currentStreak++
    } else if (i > 0) {
      break
    }
  }
  console.log(`🔥 连续投喂天数: ${currentStreak}天`)
  
  const maxCount = Math.max(...dailyStats.map(s => s.totalCount))
  const maxDay = dailyStats.find(s => s.totalCount === maxCount)
  console.log(`📈 单日最高投喂: ${maxCount}次 (${maxDay?.date || '-'})`)
  console.log('')
  
  const calendar = []
  const firstDay = new Date(currentYear, currentMonth, 1)
  const lastDay = new Date(currentYear, currentMonth + 1, 0)
  const startPadding = firstDay.getDay()
  
  for (let i = startPadding - 1; i >= 0; i--) {
    calendar.push({ day: '', dateStr: '', currentMonth: false, hasRecord: false, count: 0 })
  }
  
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const dayRecords = records.filter(r => r.date === dateStr)
    calendar.push({
      day,
      dateStr,
      currentMonth: true,
      isToday: dateStr === today,
      hasRecord: dayRecords.length > 0,
      count: dayRecords.length
    })
  }
  
  console.log('📅 本月日历视图:')
  console.log('   日  一  二  三  四  五  六')
  console.log('─────────────────────────────')
  
  for (let i = 0; i < calendar.length; i += 7) {
    let row = '   '
    for (let j = 0; j < 7; j++) {
      const cell = calendar[i + j]
      if (!cell) {
        row += '    '
      } else if (!cell.currentMonth || !cell.day) {
        row += '    '
      } else {
        let dayStr = String(cell.day).padStart(2, ' ')
        if (cell.isToday) {
          dayStr = `[${dayStr}]`
        } else if (cell.hasRecord) {
          dayStr = ` ${dayStr} `
        } else {
          dayStr = ` ${dayStr} `
        }
        if (cell.hasRecord && !cell.isToday) {
          dayStr = `\x1b[33m${dayStr}\x1b[0m`
        }
        if (cell.isToday) {
          dayStr = `\x1b[31m${dayStr}\x1b[0m`
        }
        row += dayStr
      }
    }
    console.log(row)
  }
  console.log('')
  console.log('图例: [今天]  黄色=有投喂记录')
  
  console.log('\n========== ✅ 测试完成 ==========\n')
  
  return {
    totalRecords: records.length,
    totalDays: dailyStats.length,
    currentStreak,
    monthRecords: monthRecords.length,
    monthDays
  }
}

console.log('\n🐱🐶 毛孩投喂打卡 - 模拟数据生成与日历统计测试')
console.log('='.repeat(50))

const records = generateMockRecords()
const result = testCalendarStats(records)

console.log('📋 测试总结:')
console.log(`   总记录数: ${result.totalRecords}`)
console.log(`   总天数: ${result.totalDays}`)
console.log(`   连续天数: ${result.currentStreak}`)
console.log(`   本月记录: ${result.monthRecords}条 / ${result.monthDays}天`)
console.log('')
console.log('💡 提示: 日历视图应正确显示:')
console.log('   1. 每日投喂次数标记')
console.log('   2. 今日高亮显示')
console.log('   3. 点击日期查看详情')
console.log('   4. 月度统计数据正确')
console.log('')
