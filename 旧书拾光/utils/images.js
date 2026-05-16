const DEFAULT_COVERS = [
  'https://picsum.photos/seed/book1/300/400',
  'https://picsum.photos/seed/book2/300/400',
  'https://picsum.photos/seed/book3/300/400',
  'https://picsum.photos/seed/book4/300/400',
  'https://picsum.photos/seed/book5/300/400',
  'https://picsum.photos/seed/book6/300/400',
  'https://picsum.photos/seed/book7/300/400',
  'https://picsum.photos/seed/book8/300/400',
  'https://picsum.photos/seed/book9/300/400',
  'https://picsum.photos/seed/book10/300/400'
];

const BOOK_COLORS = [
  '#8B4513',
  '#2E8B57',
  '#4682B4',
  '#CD853F',
  '#708090',
  '#556B2F',
  '#A0522D',
  '#6B8E23',
  '#483D8B',
  '#BC8F8F'
];

function getRandomCover(index) {
  const idx = index !== undefined ? index % DEFAULT_COVERS.length : Math.floor(Math.random() * DEFAULT_COVERS.length);
  return DEFAULT_COVERS[idx];
}

function getRandomColor(index) {
  const idx = index !== undefined ? index % BOOK_COLORS.length : Math.floor(Math.random() * BOOK_COLORS.length);
  return BOOK_COLORS[idx];
}

function generateBookCover(title, author, index) {
  const color = getRandomColor(index);
  const canvas = wx.createOffscreenCanvas({ type: '2d', width: 300, height: 400 });
  const ctx = canvas.getContext('2d');
  
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 300, 400);
  
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center';
  
  const titleChars = title.split('');
  const titleY = 80;
  const lineHeight = 32;
  titleChars.forEach((char, i) => {
    ctx.fillText(char, 150, titleY + i * lineHeight);
  });
  
  ctx.font = '14px sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fillText(author, 150, 360);
  
  return canvas;
}

function getSafeImageUrl(url, index) {
  if (!url) {
    return getRandomCover(index);
  }
  
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  if (url.startsWith('wxfile://') || url.startsWith('tmp://')) {
    return url;
  }
  
  return getRandomCover(index);
}

module.exports = {
  DEFAULT_COVERS,
  BOOK_COLORS,
  getRandomCover,
  getRandomColor,
  generateBookCover,
  getSafeImageUrl
};
