const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'lexue-secret-key-2024';

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

let db;
let SQL;

async function initDatabase() {
  SQL = await initSqlJs();
  
  const dbPath = path.join(dataDir, 'lexue.sqlite');
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
    console.log('📦 从文件加载数据库成功');
  } else {
    db = new SQL.Database();
    console.log('📦 创建新数据库成功');
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('teacher', 'student')),
      phone TEXT,
      email TEXT,
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS student_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      grade TEXT,
      class_name TEXT,
      strength TEXT,
      weakness TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS student_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      content TEXT NOT NULL,
      date DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS homeworks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      teacher_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL,
      questions TEXT NOT NULL,
      deadline DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS homework_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      homework_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      answers TEXT NOT NULL,
      score INTEGER,
      feedback TEXT,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (homework_id) REFERENCES homeworks(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS listening_materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      teacher_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      audio_url TEXT NOT NULL,
      transcript TEXT,
      questions TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS listening_practices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      material_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      answers TEXT NOT NULL,
      score INTEGER,
      duration INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (material_id) REFERENCES listening_materials(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  
  saveDatabase();
}

function saveDatabase() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(path.join(dataDir, 'lexue.sqlite'), buffer);
}

function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

function verifyPassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ code: 401, message: '未登录', data: null });
  }
  try {
    const token = authHeader.split(' ')[1];
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ code: 401, message: '登录已过期', data: null });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ code: 403, message: '无权限', data: null });
    }
    next();
  };
}

function initDefaultUsers() {
  const teacherCheck = db.exec('SELECT * FROM users WHERE username = ?', ['teacher']);
  if (teacherCheck.length === 0 || teacherCheck[0].values.length === 0) {
    db.run('INSERT INTO users (username, password, name, role, phone, email) VALUES (?, ?, ?, ?, ?, ?)', 
      ['teacher', hashPassword('123456'), '张老师', 'teacher', '13800138001', 'teacher@lexue.com']);
    console.log('✅ 教师账号创建成功: teacher / 123456');
  }

  const students = [
    { username: 'student', name: '小明', phone: '13800138002' },
    { username: 'student2', name: '小红', phone: '13800138003' },
    { username: 'student3', name: '小刚', phone: '13800138004' },
  ];

  for (let i = 0; i < students.length; i++) {
    const s = students[i];
    const check = db.exec('SELECT * FROM users WHERE username = ?', [s.username]);
    if (check.length === 0 || check[0].values.length === 0) {
      db.run('INSERT INTO users (username, password, name, role, phone) VALUES (?, ?, ?, ?, ?)', 
        [s.username, hashPassword('123456'), s.name, 'student', s.phone]);
      
      const userResult = db.exec('SELECT id FROM users WHERE username = ?', [s.username]);
      const userId = userResult[0].values[0][0];
      
      console.log(`✅ 学生账号创建成功: ${s.username} / 123456`);
      
      db.run('INSERT INTO student_profiles (user_id, grade, class_name, strength, weakness) VALUES (?, ?, ?, ?, ?)',
        [userId, '三年级', '1班', '听力理解能力强，发音标准', '语法基础薄弱，写作需要提升']);
      
      db.run('INSERT INTO student_records (student_id, type, content, date) VALUES (?, ?, ?, ?)',
        [userId, '课堂表现', s.name + '在课堂上积极参与讨论，听力部分表现优异', '2026-05-10']);
    }
  }

  const teacherResult = db.exec('SELECT id FROM users WHERE username = ?', ['teacher']);
  const teacherId = teacherResult[0].values[0][0];
  const homeworkCount = db.exec('SELECT COUNT(*) as count FROM homeworks')[0].values[0][0];
  
  if (homeworkCount === 0) {
    const questions = JSON.stringify([
      { id: 1, type: 'choice', question: '选择正确的单词：I ___ a student.', options: ['am', 'is', 'are'], answer: 'am' },
      { id: 2, type: 'choice', question: '选择正确的单词：She ___ to school every day.', options: ['go', 'goes', 'going'], answer: 'goes' },
      { id: 3, type: 'fill', question: '填空：I have ___ apple.', answer: 'an' },
    ]);
    
    db.run('INSERT INTO homeworks (teacher_id, title, description, type, questions, deadline) VALUES (?, ?, ?, ?, ?, ?)',
      [teacherId, '英语基础练习', '复习英语基础知识', 'daily', questions, '2026-05-20']);
    console.log('✅ 示例作业创建成功');
  }
  
  saveDatabase();
}

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const result = db.exec('SELECT * FROM users WHERE username = ?', [username]);
  
  if (result.length === 0 || result[0].values.length === 0) {
    return res.status(401).json({ code: 401, message: '用户名或密码错误', data: null });
  }
  
  const columns = result[0].columns;
  const row = result[0].values[0];
  const user = {};
  columns.forEach((col, idx) => user[col] = row[idx]);
  
  if (!verifyPassword(password, user.password)) {
    return res.status(401).json({ code: 401, message: '用户名或密码错误', data: null });
  }
  
  const token = generateToken(user);
  const { password: _, ...userData } = user;
  
  res.json({ code: 200, message: '登录成功', data: { token, user: userData } });
});

app.get('/api/auth/profile', authenticate, (req, res) => {
  const result = db.exec('SELECT id, username, name, role, phone, email, avatar, created_at FROM users WHERE id = ?', [req.user.id]);
  if (result.length === 0 || result[0].values.length === 0) {
    return res.status(404).json({ code: 404, message: '用户不存在', data: null });
  }
  const columns = result[0].columns;
  const row = result[0].values[0];
  const user = {};
  columns.forEach((col, idx) => user[col] = row[idx]);
  res.json({ code: 200, message: '成功', data: user });
});

app.get('/api/users/students', authenticate, requireRole('teacher'), (req, res) => {
  const result = db.exec(`
    SELECT u.*, sp.grade, sp.class_name, sp.strength, sp.weakness 
    FROM users u 
    LEFT JOIN student_profiles sp ON u.id = sp.user_id 
    WHERE u.role = 'student'
  `);
  
  const students = [];
  if (result.length > 0) {
    const columns = result[0].columns;
    result[0].values.forEach(row => {
      const obj = {};
      columns.forEach((col, idx) => obj[col] = row[idx]);
      students.push(obj);
    });
  }
  
  res.json({ code: 200, message: '成功', data: students });
});

app.get('/api/users/:id', authenticate, (req, res) => {
  const result = db.exec('SELECT id, username, name, role, phone, email, avatar, created_at FROM users WHERE id = ?', [req.params.id]);
  if (result.length === 0 || result[0].values.length === 0) {
    return res.status(404).json({ code: 404, message: '用户不存在', data: null });
  }
  const columns = result[0].columns;
  const row = result[0].values[0];
  const user = {};
  columns.forEach((col, idx) => user[col] = row[idx]);
  res.json({ code: 200, message: '成功', data: user });
});

app.get('/api/students/profile/:userId', authenticate, (req, res) => {
  const profileResult = db.exec('SELECT * FROM student_profiles WHERE user_id = ?', [req.params.userId]);
  const recordsResult = db.exec('SELECT * FROM student_records WHERE student_id = ? ORDER BY date DESC', [req.params.userId]);
  
  let profile = null;
  if (profileResult.length > 0 && profileResult[0].values.length > 0) {
    const columns = profileResult[0].columns;
    const row = profileResult[0].values[0];
    profile = {};
    columns.forEach((col, idx) => profile[col] = row[idx]);
  }
  
  const records = [];
  if (recordsResult.length > 0) {
    const columns = recordsResult[0].columns;
    recordsResult[0].values.forEach(row => {
      const obj = {};
      columns.forEach((col, idx) => obj[col] = row[idx]);
      records.push(obj);
    });
  }
  
  res.json({ code: 200, message: '成功', data: { profile, records } });
});

app.post('/api/students/profile', authenticate, requireRole('teacher'), (req, res) => {
  const { userId, grade, class_name, strength, weakness, notes } = req.body;
  const existing = db.exec('SELECT id FROM student_profiles WHERE user_id = ?', [userId]);
  
  if (existing.length > 0 && existing[0].values.length > 0) {
    db.run('UPDATE student_profiles SET grade = ?, class_name = ?, strength = ?, weakness = ?, notes = ? WHERE user_id = ?',
      [grade, class_name, strength, weakness, notes, userId]);
  } else {
    db.run('INSERT INTO student_profiles (user_id, grade, class_name, strength, weakness, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, grade, class_name, strength, weakness, notes]);
  }
  
  saveDatabase();
  res.json({ code: 200, message: '保存成功', data: null });
});

app.post('/api/students/record', authenticate, requireRole('teacher'), (req, res) => {
  const { studentId, type, content, date } = req.body;
  db.run('INSERT INTO student_records (student_id, type, content, date) VALUES (?, ?, ?, ?)',
    [studentId, type, content, date]);
  saveDatabase();
  res.json({ code: 200, message: '记录添加成功', data: null });
});

app.get('/api/homeworks', authenticate, (req, res) => {
  let result;
  if (req.user.role === 'teacher') {
    result = db.exec('SELECT h.*, u.name as teacher_name FROM homeworks h LEFT JOIN users u ON h.teacher_id = u.id WHERE h.teacher_id = ? ORDER BY h.created_at DESC', [req.user.id]);
  } else {
    result = db.exec('SELECT h.*, u.name as teacher_name FROM homeworks h LEFT JOIN users u ON h.teacher_id = u.id ORDER BY h.created_at DESC');
  }
  
  const homeworks = [];
  if (result.length > 0) {
    const columns = result[0].columns;
    result[0].values.forEach(row => {
      const obj = {};
      columns.forEach((col, idx) => obj[col] = row[idx]);
      obj.questions = JSON.parse(obj.questions);
      homeworks.push(obj);
    });
  }
  
  res.json({ code: 200, message: '成功', data: homeworks });
});

app.get('/api/homeworks/:id', authenticate, (req, res) => {
  const result = db.exec('SELECT h.*, u.name as teacher_name FROM homeworks h LEFT JOIN users u ON h.teacher_id = u.id WHERE h.id = ?', [req.params.id]);
  if (result.length === 0 || result[0].values.length === 0) {
    return res.status(404).json({ code: 404, message: '作业不存在', data: null });
  }
  
  const columns = result[0].columns;
  const row = result[0].values[0];
  const homework = {};
  columns.forEach((col, idx) => homework[col] = row[idx]);
  homework.questions = JSON.parse(homework.questions);
  
  if (req.user.role === 'student') {
    const subResult = db.exec('SELECT * FROM homework_submissions WHERE homework_id = ? AND student_id = ?', [req.params.id, req.user.id]);
    if (subResult.length > 0 && subResult[0].values.length > 0) {
      const subColumns = subResult[0].columns;
      const subRow = subResult[0].values[0];
      const submission = {};
      subColumns.forEach((col, idx) => submission[col] = subRow[idx]);
      submission.answers = JSON.parse(submission.answers);
      homework.submission = submission;
    }
  } else {
    const subsResult = db.exec(`
      SELECT hs.*, u.name as student_name 
      FROM homework_submissions hs 
      LEFT JOIN users u ON hs.student_id = u.id 
      WHERE hs.homework_id = ?
    `, [req.params.id]);
    
    const submissions = [];
    if (subsResult.length > 0) {
      const subColumns = subsResult[0].columns;
      subsResult[0].values.forEach(row => {
        const obj = {};
        subColumns.forEach((col, idx) => obj[col] = row[idx]);
        obj.answers = JSON.parse(obj.answers);
        submissions.push(obj);
      });
    }
    homework.submissions = submissions;
  }
  
  res.json({ code: 200, message: '成功', data: homework });
});

app.post('/api/homeworks', authenticate, requireRole('teacher'), (req, res) => {
  const { title, description, type, questions, deadline } = req.body;
  const stmt = db.run('INSERT INTO homeworks (teacher_id, title, description, type, questions, deadline) VALUES (?, ?, ?, ?, ?, ?)',
    [req.user.id, title, description, type, JSON.stringify(questions), deadline]);
  saveDatabase();
  res.json({ code: 200, message: '作业创建成功', data: { id: stmt.lastInsertRowid } });
});

app.post('/api/homeworks/:id/submit', authenticate, requireRole('student'), (req, res) => {
  const { answers } = req.body;
  const hwResult = db.exec('SELECT * FROM homeworks WHERE id = ?', [req.params.id]);
  if (hwResult.length === 0 || hwResult[0].values.length === 0) {
    return res.status(404).json({ code: 404, message: '作业不存在', data: null });
  }
  
  const homework = {};
  hwResult[0].columns.forEach((col, idx) => homework[col] = hwResult[0].values[0][idx]);
  
  const existing = db.exec('SELECT id FROM homework_submissions WHERE homework_id = ? AND student_id = ?', [req.params.id, req.user.id]);
  const questions = JSON.parse(homework.questions);
  const answersObj = JSON.parse(answers);
  
  let score = 0;
  questions.forEach(q => {
    if (answersObj[q.id] === q.answer) {
      score += Math.floor(100 / questions.length);
    }
  });
  
  if (existing.length > 0 && existing[0].values.length > 0) {
    db.run('UPDATE homework_submissions SET answers = ?, score = ?, submitted_at = CURRENT_TIMESTAMP WHERE id = ?',
      [answers, score, existing[0].values[0][0]]);
  } else {
    db.run('INSERT INTO homework_submissions (homework_id, student_id, answers, score) VALUES (?, ?, ?, ?)',
      [req.params.id, req.user.id, answers, score]);
  }
  
  saveDatabase();
  res.json({ code: 200, message: '提交成功', data: { score } });
});

app.post('/api/homeworks/:id/grade', authenticate, requireRole('teacher'), (req, res) => {
  const { submissionId, score, feedback } = req.body;
  db.run('UPDATE homework_submissions SET score = ?, feedback = ? WHERE id = ?', [score, feedback, submissionId]);
  saveDatabase();
  res.json({ code: 200, message: '批改成功', data: null });
});

app.get('/api/listening', authenticate, (req, res) => {
  const result = db.exec('SELECT lm.*, u.name as teacher_name FROM listening_materials lm LEFT JOIN users u ON lm.teacher_id = u.id ORDER BY lm.created_at DESC');
  
  const materials = [];
  if (result.length > 0) {
    const columns = result[0].columns;
    result[0].values.forEach(row => {
      const obj = {};
      columns.forEach((col, idx) => obj[col] = row[idx]);
      obj.questions = JSON.parse(obj.questions);
      materials.push(obj);
    });
  }
  
  res.json({ code: 200, message: '成功', data: materials });
});

app.get('/api/listening/:id', authenticate, (req, res) => {
  const result = db.exec('SELECT lm.*, u.name as teacher_name FROM listening_materials lm LEFT JOIN users u ON lm.teacher_id = u.id WHERE lm.id = ?', [req.params.id]);
  if (result.length === 0 || result[0].values.length === 0) {
    return res.status(404).json({ code: 404, message: '材料不存在', data: null });
  }
  
  const columns = result[0].columns;
  const row = result[0].values[0];
  const material = {};
  columns.forEach((col, idx) => material[col] = row[idx]);
  material.questions = JSON.parse(material.questions);
  
  if (req.user.role === 'student') {
    const pracResult = db.exec('SELECT * FROM listening_practices WHERE material_id = ? AND student_id = ? ORDER BY created_at DESC LIMIT 1', [req.params.id, req.user.id]);
    if (pracResult.length > 0 && pracResult[0].values.length > 0) {
      const pracColumns = pracResult[0].columns;
      const pracRow = pracResult[0].values[0];
      const practice = {};
      pracColumns.forEach((col, idx) => practice[col] = pracRow[idx]);
      practice.answers = JSON.parse(practice.answers);
      material.practice = practice;
    }
  }
  
  res.json({ code: 200, message: '成功', data: material });
});

app.post('/api/listening', authenticate, requireRole('teacher'), (req, res) => {
  const { title, audio_url, transcript, questions } = req.body;
  const stmt = db.run('INSERT INTO listening_materials (teacher_id, title, audio_url, transcript, questions) VALUES (?, ?, ?, ?, ?)',
    [req.user.id, title, audio_url, transcript, JSON.stringify(questions)]);
  saveDatabase();
  res.json({ code: 200, message: '创建成功', data: { id: stmt.lastInsertRowid } });
});

app.post('/api/listening/:id/submit', authenticate, requireRole('student'), (req, res) => {
  const { answers, duration } = req.body;
  const matResult = db.exec('SELECT * FROM listening_materials WHERE id = ?', [req.params.id]);
  if (matResult.length === 0 || matResult[0].values.length === 0) {
    return res.status(404).json({ code: 404, message: '材料不存在', data: null });
  }
  
  const material = {};
  matResult[0].columns.forEach((col, idx) => material[col] = matResult[0].values[0][idx]);
  
  const questions = JSON.parse(material.questions);
  const answersObj = JSON.parse(answers);
  
  let score = 0;
  questions.forEach(q => {
    if (answersObj[q.id] === q.answer) {
      score += Math.floor(100 / questions.length);
    }
  });
  
  db.run('INSERT INTO listening_practices (material_id, student_id, answers, score, duration) VALUES (?, ?, ?, ?, ?)',
    [req.params.id, req.user.id, answers, score, duration]);
  saveDatabase();
  
  res.json({ code: 200, message: '提交成功', data: { score } });
});

app.get('/api/analysis/class', authenticate, requireRole('teacher'), (req, res) => {
  const studentsResult = db.exec("SELECT id, name FROM users WHERE role = 'student'");
  const students = [];
  if (studentsResult.length > 0) {
    studentsResult[0].values.forEach(row => students.push({ id: row[0], name: row[1] }));
  }
  
  const hwStats = db.exec('SELECT AVG(score) as avg_score, COUNT(*) as total_submissions FROM homework_submissions')[0].values[0];
  const lsStats = db.exec('SELECT AVG(score) as avg_score, COUNT(*) as total_practices FROM listening_practices')[0].values[0];
  
  const weakResult = db.exec(`
    SELECT sp.weakness, COUNT(*) as count 
    FROM student_profiles sp
    WHERE sp.weakness IS NOT NULL AND sp.weakness != ''
    GROUP BY sp.weakness
    ORDER BY count DESC
    LIMIT 5
  `);
  
  const weakPoints = [];
  if (weakResult.length > 0) {
    weakResult[0].values.forEach(row => weakPoints.push({ weakness: row[0], count: row[1] }));
  }
  
  const studentPerformance = students.map(s => {
    const hs = db.exec('SELECT AVG(score) as avg FROM homework_submissions WHERE student_id = ?', [s.id])[0].values[0][0];
    const ls = db.exec('SELECT AVG(score) as avg FROM listening_practices WHERE student_id = ?', [s.id])[0].values[0][0];
    return {
      id: s.id,
      name: s.name,
      homeworkAvg: Math.round(hs || 0),
      listeningAvg: Math.round(ls || 0),
    };
  });
  
  res.json({
    code: 200,
    message: '成功',
    data: {
      totalStudents: students.length,
      avgHomeworkScore: Math.round(hwStats[0] || 0),
      avgListeningScore: Math.round(lsStats[0] || 0),
      homeworkSubmissionRate: students.length > 0 ? Math.round((hwStats[1] / (students.length * 2)) * 100) : 0,
      weakPoints,
      studentPerformance,
    }
  });
});

app.get('/api/analysis/student/:studentId', authenticate, (req, res) => {
  const { studentId } = req.params;
  
  const profileResult = db.exec('SELECT * FROM student_profiles WHERE user_id = ?', [studentId]);
  let profile = null;
  if (profileResult.length > 0 && profileResult[0].values.length > 0) {
    profile = {};
    profileResult[0].columns.forEach((col, idx) => profile[col] = profileResult[0].values[0][idx]);
  }
  
  const hwResult = db.exec(`
    SELECT hs.*, h.title 
    FROM homework_submissions hs 
    LEFT JOIN homeworks h ON hs.homework_id = h.id 
    WHERE hs.student_id = ? 
    ORDER BY hs.submitted_at DESC
  `, [studentId]);
  
  const homeworkHistory = [];
  if (hwResult.length > 0) {
    hwResult[0].values.forEach(row => {
      const obj = {};
      hwResult[0].columns.forEach((col, idx) => obj[col] = row[idx]);
      homeworkHistory.push(obj);
    });
  }
  
  const lsResult = db.exec(`
    SELECT lp.*, lm.title 
    FROM listening_practices lp 
    LEFT JOIN listening_materials lm ON lp.material_id = lm.id 
    WHERE lp.student_id = ? 
    ORDER BY lp.created_at DESC
  `, [studentId]);
  
  const listeningHistory = [];
  if (lsResult.length > 0) {
    lsResult[0].values.forEach(row => {
      const obj = {};
      lsResult[0].columns.forEach((col, idx) => obj[col] = row[idx]);
      listeningHistory.push(obj);
    });
  }
  
  const homeworkAvg = homeworkHistory.length > 0 
    ? Math.round(homeworkHistory.reduce((sum, h) => sum + h.score, 0) / homeworkHistory.length)
    : 0;
  
  const listeningAvg = listeningHistory.length > 0
    ? Math.round(listeningHistory.reduce((sum, l) => sum + l.score, 0) / listeningHistory.length)
    : 0;
  
  const strengths = [];
  const weaknesses = [];
  
  if (homeworkAvg >= 80) strengths.push('作业完成质量高');
  else if (homeworkAvg < 60) weaknesses.push('作业需要加强');
  
  if (listeningAvg >= 80) strengths.push('听力理解能力强');
  else if (listeningAvg < 60) weaknesses.push('听力需要多练习');
  
  if (profile && profile.strength) strengths.push(profile.strength);
  if (profile && profile.weakness) weaknesses.push(profile.weakness);
  
  const recentActivity = [
    ...homeworkHistory.slice(0, 5).map(h => ({ type: 'homework', title: h.title, score: h.score, date: h.submitted_at })),
    ...listeningHistory.slice(0, 5).map(l => ({ type: 'listening', title: l.title, score: l.score, date: l.created_at }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
  
  res.json({
    code: 200,
    message: '成功',
    data: {
      homeworkAvg,
      listeningAvg,
      homeworkHistory,
      listeningHistory,
      strengths,
      weaknesses,
      recentActivity,
    }
  });
});

app.get('/', (req, res) => {
  res.send('🎉 乐学App后端服务运行中...');
});

async function start() {
  await initDatabase();
  initDefaultUsers();
  
  app.listen(PORT, () => {
    console.log('\n========================================');
    console.log('🎉 乐学App后端服务已启动');
    console.log(`📡 服务地址: http://localhost:${PORT}`);
    console.log(`📚 API前缀: http://localhost:${PORT}/api`);
    console.log('========================================');
    console.log('\n📋 测试账号:');
    console.log('   👨‍🏫 教师: teacher / 123456');
    console.log('   👨‍🎓 学生1: student / 123456');
    console.log('   👩‍🎓 学生2: student2 / 123456');
    console.log('   👨‍🎓 学生3: student3 / 123456');
    console.log('\n🚀 现在可以启动前端小程序了！');
    console.log('========================================\n');
  });
}

start().catch(console.error);
