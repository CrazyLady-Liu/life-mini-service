const categories = {
  recyclable: {
    name: '可回收物',
    color: '#4CAF50',
    icon: '♻️',
    description: '可回收物是指适宜回收和可资源化利用的生活废弃物',
    tips: '投放前请尽量保持清洁干燥，避免污染',
    notes: [
      '废纸应保持平整',
      '塑料瓶应清空内容物并压扁',
      '玻璃制品应小心轻放',
      '金属制品应去除尖锐部分'
    ]
  },
  kitchen: {
    name: '厨余垃圾',
    color: '#FF9800',
    icon: '🥬',
    description: '厨余垃圾是指易腐烂的、含有机质的生活垃圾',
    tips: '投放时请沥干水分，用垃圾袋装好',
    notes: [
      '剩菜剩饭应沥干水分',
      '果皮果核应单独投放',
      '蛋壳应去除内膜',
      '大骨头请投放到其他垃圾'
    ]
  },
  hazardous: {
    name: '有害垃圾',
    color: '#F44336',
    icon: '⚠️',
    description: '有害垃圾是指对人体健康或者自然环境造成直接或者潜在危害的生活废弃物',
    tips: '请妥善包装后投放，避免破损泄漏',
    notes: [
      '电池请放入专用回收箱',
      '灯管请用报纸包裹',
      '过期药品请保持原包装',
      '油漆桶请确保无残留'
    ]
  },
  other: {
    name: '其他垃圾',
    color: '#9E9E9E',
    icon: '🗑️',
    description: '其他垃圾是指除可回收物、厨余垃圾、有害垃圾以外的其他生活废弃物',
    tips: '请确保已破碎物品不外露',
    notes: [
      '一次性餐具应去除食物残留',
      '烟头应熄灭后投放',
      '陶瓷制品应小心轻放',
      '大骨头、贝壳类请投放此桶'
    ]
  }
}

const garbageList = [
  { name: '废纸', category: 'recyclable', keywords: ['废纸', '报纸', '书本', '杂志', '纸箱', '纸盒'] },
  { name: '塑料瓶', category: 'recyclable', keywords: ['塑料瓶', '饮料瓶', '矿泉水瓶', 'PET瓶'] },
  { name: '玻璃瓶', category: 'recyclable', keywords: ['玻璃瓶', '酒瓶', '饮料瓶', '罐头瓶'] },
  { name: '金属罐', category: 'recyclable', keywords: ['金属罐', '易拉罐', '罐头盒', '铁皮盒'] },
  { name: '旧衣服', category: 'recyclable', keywords: ['旧衣服', '衣物', '鞋子', '包包', '布料'] },
  { name: '电子产品', category: 'recyclable', keywords: ['手机', '电脑', '充电器', '电线', '电器'] },
  { name: '塑料玩具', category: 'recyclable', keywords: ['玩具', '塑料玩具', '积木', '玩偶'] },
  { name: '塑料盆', category: 'recyclable', keywords: ['塑料盆', '脸盆', '水桶', '收纳盒'] },
  { name: '剩菜', category: 'kitchen', keywords: ['剩菜', '剩饭', '菜渣', '面条', '米饭'] },
  { name: '果皮', category: 'kitchen', keywords: ['果皮', '苹果皮', '香蕉皮', '橙子皮', '柚子皮'] },
  { name: '蔬菜', category: 'kitchen', keywords: ['蔬菜', '菜叶', '菜根', '胡萝卜', '土豆'] },
  { name: '骨头', category: 'kitchen', keywords: ['骨头', '鸡骨', '鱼骨', '排骨', '小骨头'] },
  { name: '蛋壳', category: 'kitchen', keywords: ['蛋壳', '鸡蛋壳', '鸭蛋壳'] },
  { name: '茶叶渣', category: 'kitchen', keywords: ['茶叶渣', '咖啡渣', '茶包'] },
  { name: '过期食品', category: 'kitchen', keywords: ['过期食品', '变质食品', '发霉食物'] },
  { name: '电池', category: 'hazardous', keywords: ['电池', '电池', '纽扣电池', '锂电池', '蓄电池'] },
  { name: '灯管', category: 'hazardous', keywords: ['灯管', '荧光灯', '节能灯', '灯泡'] },
  { name: '药品', category: 'hazardous', keywords: ['药品', '过期药品', '药片', '药瓶'] },
  { name: '油漆', category: 'hazardous', keywords: ['油漆', '涂料', '颜料', '稀释剂'] },
  { name: '杀虫剂', category: 'hazardous', keywords: ['杀虫剂', '农药', '消毒剂', '清洁剂'] },
  { name: '温度计', category: 'hazardous', keywords: ['温度计', '体温计', '血压计'] },
  { name: '一次性餐具', category: 'other', keywords: ['一次性餐具', '筷子', '餐盒', '塑料袋'] },
  { name: '烟头', category: 'other', keywords: ['烟头', '烟蒂', '烟灰'] },
  { name: '陶瓷', category: 'other', keywords: ['陶瓷', '瓷砖', '花盆', '瓷器'] },
  { name: '大骨头', category: 'other', keywords: ['大骨头', '牛骨', '猪骨', '骨头渣'] },
  { name: '餐巾纸', category: 'other', keywords: ['餐巾纸', '卫生纸', '湿巾', '纸巾'] },
  { name: '尿不湿', category: 'other', keywords: ['尿不湿', '纸尿裤', '卫生巾', '护垫'] },
  { name: '塑料袋', category: 'other', keywords: ['塑料袋', '保鲜膜', '垃圾袋'] },
  { name: '贝壳', category: 'other', keywords: ['贝壳', '螺蛳壳', '蛤蜊壳'] },
  { name: '口香糖', category: 'other', keywords: ['口香糖', '泡泡糖'] },
  { name: '创可贴', category: 'other', keywords: ['创可贴', '医用敷料', '绷带'] }
]

function searchGarbage(keyword) {
  if (!keyword || keyword.trim() === '') {
    return null
  }
  const lowerKeyword = keyword.toLowerCase().trim()
  for (const garbage of garbageList) {
    if (garbage.name.toLowerCase().includes(lowerKeyword)) {
      return { ...garbage, categoryInfo: categories[garbage.category] }
    }
    for (const kw of garbage.keywords) {
      if (kw.toLowerCase().includes(lowerKeyword)) {
        return { ...garbage, categoryInfo: categories[garbage.category] }
      }
    }
  }
  return null
}

function getCategoryInfo(category) {
  return categories[category] || null
}

function getSimilarGarbage(category, excludeName) {
  return garbageList
    .filter(g => g.category === category && g.name !== excludeName)
    .slice(0, 5)
}

function getAllCategories() {
  return Object.keys(categories).map(key => ({
    key,
    ...categories[key]
  }))
}

module.exports = {
  categories,
  garbageList,
  searchGarbage,
  getCategoryInfo,
  getSimilarGarbage,
  getAllCategories
}