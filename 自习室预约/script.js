const TOTAL_SEATS = 48;
const STORAGE_KEY = 'study_room_bookings';
const USER_KEY = 'study_room_user';

let currentDate = new Date();
let selectedSeat = null;
let bookings = {};
let currentUser = null;

function init() {
    loadUser();
    loadBookings();
    renderDate();
    renderQuickDates();
    renderSeats();
    renderStats();
    renderMyBookings();
    bindEvents();
}

function loadUser() {
    const saved = localStorage.getItem(USER_KEY);
    if (saved) {
        currentUser = JSON.parse(saved);
    }
}

function saveUser() {
    if (currentUser) {
        localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
    }
}

function loadBookings() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        bookings = JSON.parse(saved);
    } else {
        bookings = generateMockBookings();
        saveBookings();
    }
}

function saveBookings() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}

function generateMockBookings() {
    const mockBookings = {};
    const today = formatDate(new Date());
    mockBookings[today] = {};
    
    const occupiedSeats = [3, 7, 12, 15, 18, 22, 25, 30, 33, 38, 41, 45];
    occupiedSeats.forEach(seat => {
        mockBookings[today][seat] = {
            name: '用户' + Math.floor(Math.random() * 1000),
            studentId: '2024' + String(Math.floor(Math.random() * 10000)).padStart(5, '0'),
            timeSlot: '08:00-22:00',
            timestamp: Date.now()
        };
    });
    
    return mockBookings;
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getWeekday(date) {
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    return weekdays[date.getDay()];
}

function renderDate() {
    document.getElementById('currentDate').textContent = formatDate(currentDate);
    document.getElementById('currentWeekday').textContent = getWeekday(currentDate);
}

function renderQuickDates() {
    const container = document.getElementById('quickDates');
    container.innerHTML = '';
    
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const dateStr = formatDate(date);
        const isToday = i === 0;
        const isSelected = dateStr === formatDate(currentDate);
        
        const btn = document.createElement('button');
        btn.className = 'quick-date-btn' + (isSelected ? ' active' : '');
        btn.textContent = isToday ? '今天' : `${date.getMonth() + 1}/${date.getDate()}`;
        btn.onclick = () => {
            currentDate = date;
            renderDate();
            renderQuickDates();
            renderSeats();
            renderStats();
            selectedSeat = null;
            document.getElementById('bookingPanel').style.display = 'none';
        };
        container.appendChild(btn);
    }
}

function renderSeats() {
    const grid = document.getElementById('seatGrid');
    grid.innerHTML = '';
    
    const dateKey = formatDate(currentDate);
    const dayBookings = bookings[dateKey] || {};
    
    for (let i = 1; i <= TOTAL_SEATS; i++) {
        const seat = document.createElement('div');
        seat.className = 'seat';
        seat.textContent = i;
        seat.dataset.seat = i;
        seat.setAttribute('role', 'button');
        seat.setAttribute('tabindex', '0');
        seat.setAttribute('aria-label', `${i}号座位`);
        
        if (dayBookings[i]) {
            const booking = dayBookings[i];
            if (currentUser && booking.studentId === currentUser.studentId) {
                seat.classList.add('my');
            } else {
                seat.classList.add('occupied');
                seat.title = `已被预约\n姓名：${booking.name}\n学号：${booking.studentId}\n时段：${booking.timeSlot}`;
            }
        }
        
        if (selectedSeat === i) {
            seat.classList.add('selected');
        }
        
        seat.onclick = () => handleSeatClick(i);
        grid.appendChild(seat);
    }
}

function handleSeatClick(seatNum) {
    const dateKey = formatDate(currentDate);
    const dayBookings = bookings[dateKey] || {};
    
    if (dayBookings[seatNum]) {
        const booking = dayBookings[seatNum];
        if (currentUser && booking.studentId === currentUser.studentId) {
            showModal('ℹ️', '我的预约', `座位 ${seatNum}\n时段：${booking.timeSlot}`);
        } else {
            showModal('⚠️', '座位已被预约', `该座位已被 ${booking.name} 预约`);
        }
        return;
    }
    
    selectedSeat = seatNum;
    renderSeats();
    document.getElementById('selectedSeatNum').textContent = seatNum + ' 号座位';
    document.getElementById('bookingPanel').style.display = 'block';
    
    if (currentUser) {
        document.getElementById('studentName').value = currentUser.name;
        document.getElementById('studentId').value = currentUser.studentId;
    }
    
    document.getElementById('bookingPanel').scrollIntoView({ behavior: 'smooth' });
}

function renderStats() {
    const dateKey = formatDate(currentDate);
    const dayBookings = bookings[dateKey] || {};
    
    const occupied = Object.keys(dayBookings).length;
    const available = TOTAL_SEATS - occupied;
    
    let myCount = 0;
    if (currentUser) {
        Object.values(dayBookings).forEach(b => {
            if (b.studentId === currentUser.studentId) myCount++;
        });
    }
    
    document.getElementById('totalSeats').textContent = TOTAL_SEATS;
    document.getElementById('availableSeats').textContent = available;
    document.getElementById('occupiedSeats').textContent = occupied;
    document.getElementById('myBookings').textContent = myCount;
}

function renderMyBookings() {
    const list = document.getElementById('bookingsList');
    
    if (!currentUser) {
        list.innerHTML = '<p class="empty-tip">预约座位后可在此查看记录</p>';
        return;
    }
    
    const myBookings = [];
    
    Object.keys(bookings).forEach(dateKey => {
        Object.keys(bookings[dateKey]).forEach(seatNum => {
            const booking = bookings[dateKey][seatNum];
            if (booking.studentId === currentUser.studentId) {
                myBookings.push({
                    date: dateKey,
                    seat: seatNum,
                    ...booking
                });
            }
        });
    });
    
    myBookings.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (myBookings.length === 0) {
        list.innerHTML = '<p class="empty-tip">暂无预约记录</p>';
        return;
    }
    
    list.innerHTML = '';
    myBookings.forEach(booking => {
        const item = document.createElement('div');
        item.className = 'booking-item';
        
        const isPast = new Date(booking.date) < new Date(formatDate(new Date()));
        
        item.innerHTML = `
            <div class="booking-info">
                <span class="booking-seat">座位 ${booking.seat} 号</span>
                <span class="booking-details">📅 ${booking.date} | ⏰ ${booking.timeSlot}${isPast ? ' | ⏹️ 已结束' : ''}</span>
            </div>
            ${!isPast ? `<button class="btn btn-danger" onclick="cancelBooking('${booking.date}', ${booking.seat})" style="flex: none; width: auto; padding: 8px 20px;">取消预约</button>` : ''}
        `;
        
        list.appendChild(item);
    });
}

function checkBookingConflict(studentId, dateKey, newTimeSlot, newSeat) {
    const dayBookings = bookings[dateKey] || {};
    
    const timeSlotRanges = {
        '08:00-12:00': { start: '08:00', end: '12:00' },
        '14:00-18:00': { start: '14:00', end: '18:00' },
        '19:00-22:00': { start: '19:00', end: '22:00' },
        '08:00-22:00': { start: '08:00', end: '22:00' }
    };
    
    const newRange = timeSlotRanges[newTimeSlot];
    
    for (const seatNum in dayBookings) {
        const booking = dayBookings[seatNum];
        if (booking.studentId === studentId && parseInt(seatNum) !== newSeat) {
            const existingRange = timeSlotRanges[booking.timeSlot];
            
            const hasOverlap = (
                newRange.start < existingRange.end &&
                newRange.end > existingRange.start
            );
            
            if (hasOverlap) {
                const timeSlotNames = {
                    '08:00-12:00': '上午',
                    '14:00-18:00': '下午',
                    '19:00-22:00': '晚上',
                    '08:00-22:00': '全天'
                };
                
                return {
                    hasConflict: true,
                    message: `预约冲突！\n您已预约了 ${dateKey} ${timeSlotNames[booking.timeSlot]}时段的座位 ${seatNum} 号\n同一时段不能预约多个座位`
                };
            }
        }
    }
    
    return { hasConflict: false };
}

function confirmBooking() {
    if (!selectedSeat) {
        showModal('⚠️', '请选择座位', '请先选择一个空闲座位');
        return;
    }
    
    const name = document.getElementById('studentName').value.trim();
    const studentId = document.getElementById('studentId').value.trim();
    const timeSlot = document.getElementById('timeSlot').value;
    
    if (!name || !studentId) {
        showModal('⚠️', '信息不完整', '请填写姓名和学号');
        return;
    }
    
    const dateKey = formatDate(currentDate);
    
    if (!bookings[dateKey]) {
        bookings[dateKey] = {};
    }
    
    if (bookings[dateKey][selectedSeat]) {
        showModal('⚠️', '预约失败', '该座位已被预约，请选择其他座位');
        selectedSeat = null;
        renderSeats();
        document.getElementById('bookingPanel').style.display = 'none';
        return;
    }
    
    const conflictCheck = checkBookingConflict(studentId, dateKey, timeSlot, selectedSeat);
    if (conflictCheck.hasConflict) {
        showModal('⚠️', '预约冲突', conflictCheck.message);
        return;
    }
    
    const seatNum = selectedSeat;
    bookings[dateKey][seatNum] = {
        name,
        studentId,
        timeSlot,
        timestamp: Date.now()
    };
    
    currentUser = { name, studentId };
    saveUser();
    saveBookings();
    
    selectedSeat = null;
    document.getElementById('bookingPanel').style.display = 'none';
    document.getElementById('studentName').value = '';
    document.getElementById('studentId').value = '';
    
    renderSeats();
    renderStats();
    renderMyBookings();
    
    showModal('✅', '预约成功', `座位 ${seatNum} 号预约成功！\n日期：${dateKey}\n时段：${timeSlot}`);
}

function cancelBooking(date, seatNum) {
    if (!confirm(`确定要取消 ${date} 座位 ${seatNum} 号的预约吗？`)) {
        return;
    }
    
    if (bookings[date] && bookings[date][seatNum]) {
        delete bookings[date][seatNum];
        
        if (Object.keys(bookings[date]).length === 0) {
            delete bookings[date];
        }
        
        saveBookings();
        renderSeats();
        renderStats();
        renderMyBookings();
        
        showModal('✅', '取消成功', `已取消 ${date} 座位 ${seatNum} 号的预约`);
    }
}

function showModal(icon, title, message) {
    document.getElementById('modalIcon').textContent = icon;
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMessage').textContent = message;
    document.getElementById('modal').classList.add('show');
}

function closeModal() {
    document.getElementById('modal').classList.remove('show');
}

function bindEvents() {
    document.getElementById('prevDay').onclick = () => {
        currentDate.setDate(currentDate.getDate() - 1);
        renderDate();
        renderQuickDates();
        renderSeats();
        renderStats();
        selectedSeat = null;
        document.getElementById('bookingPanel').style.display = 'none';
    };
    
    document.getElementById('nextDay').onclick = () => {
        currentDate.setDate(currentDate.getDate() + 1);
        renderDate();
        renderQuickDates();
        renderSeats();
        renderStats();
        selectedSeat = null;
        document.getElementById('bookingPanel').style.display = 'none';
    };
    
    document.getElementById('cancelSelect').onclick = () => {
        selectedSeat = null;
        renderSeats();
        document.getElementById('bookingPanel').style.display = 'none';
    };
    
    document.getElementById('confirmBooking').onclick = confirmBooking;
    
    document.getElementById('modalClose').onclick = closeModal;
    
    document.getElementById('modal').onclick = (e) => {
        if (e.target.id === 'modal') {
            closeModal();
        }
    };
    
    document.getElementById('demoBtn').onclick = startDemo;
}

async function startDemo() {
    const demoSeat = 10;
    const dateKey = formatDate(currentDate);
    
    if (bookings[dateKey] && bookings[dateKey][demoSeat]) {
        showModal('⚠️', '演示提示', '10号座位已被预约，请选择其他日期或等待演示完成');
        return;
    }
    
    selectedSeat = demoSeat;
    renderSeats();
    document.getElementById('selectedSeatNum').textContent = demoSeat + ' 号座位';
    document.getElementById('bookingPanel').style.display = 'block';
    document.getElementById('bookingPanel').scrollIntoView({ behavior: 'smooth' });
    
    await sleep(800);
    
    document.getElementById('timeSlot').value = '08:00-12:00';
    await sleep(500);
    
    document.getElementById('studentName').value = '张三';
    await sleep(500);
    
    document.getElementById('studentId').value = '2024001001';
    await sleep(800);
    
    confirmBooking();
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

window.cancelBooking = cancelBooking;

document.addEventListener('DOMContentLoaded', init);
