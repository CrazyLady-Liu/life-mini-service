const CATEGORIES = [
  { name: '蔬菜', icon: '🥬', color: '#52c41a' },
  { name: '肉类', icon: '🥩', color: '#ff4d4f' },
  { name: '水果', icon: '🍎', color: '#faad14' },
  { name: '调料', icon: '🧂', color: '#722ed1' }
];

const CATEGORY_COLOR_MAP = {};
CATEGORIES.forEach(c => {
  CATEGORY_COLOR_MAP[c.name] = c.color;
});

function getCategoryColor(name) {
  return CATEGORY_COLOR_MAP[name] || '#999';
}

function processCategories(selectedCategory) {
  return CATEGORIES.map(c => ({
    ...c,
    activeStyle: c.name === selectedCategory ? `background-color: ${c.color}; color: #fff;` : ''
  }));
}

module.exports = {
  CATEGORIES,
  getCategoryColor,
  processCategories
};
