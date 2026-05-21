const express = require('express');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'submissions.json');

const ADMIN_LOGIN = 'admin';
const ADMIN_PASSWORD = '0987';

app.use(express.json());
app.use(express.static(path.join(__dirname)));

function loadSubmissions() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, '[]', 'utf8');
    }
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (error) {
    console.error('Ошибка чтения базы данных:', error);
    return [];
  }
}

function saveSubmissions(submissions) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(submissions, null, 2), 'utf8');
  } catch (error) {
    console.error('Ошибка записи базы данных:', error);
  }
}

app.post('/api/contact', (req, res) => {
  const { initials, email, comment } = req.body;

  if (!initials || !email || !comment) {
    return res.status(400).json({ message: 'Все поля обязательны.' });
  }

  const submissions = loadSubmissions();
  const newEntry = {
    initials,
    email,
    comment,
    date: new Date().toISOString(),
  };

  submissions.push(newEntry);
  saveSubmissions(submissions);

  res.status(201).json({ message: 'Сообщение сохранено.' });
});

app.get('/api/export', async (req, res) => {
  const format = (req.query.format || '').toLowerCase();
  const password = req.query.password;
  const submissions = loadSubmissions();

  if (password !== '0987') {
    return res.status(401).json({ message: 'Неверный пароль.' });
  }

  if (format !== 'xlsx') {
    return res.status(400).json({ message: 'Неверный формат. Используйте format=xlsx.' });
  }

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Submissions');

  sheet.columns = [
    { header: 'Инициалы', key: 'initials', width: 25 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Комментарий', key: 'comment', width: 50 },
    { header: 'Дата', key: 'date', width: 25 },
  ];

  submissions.forEach((entry) => {
    sheet.addRow({
      initials: entry.initials,
      email: entry.email,
      comment: entry.comment,
      date: new Date(entry.date).toLocaleString('ru-RU'),
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="submissions.xlsx"');
  return res.send(buffer);
});

app.post('/api/admin/login', (req, res) => {
  const { login, password } = req.body;

  if (login === ADMIN_LOGIN && password === ADMIN_PASSWORD) {
    return res.status(200).json({ message: 'Успешный вход' });
  }

  res.status(401).json({ message: 'Неверный логин или пароль' });
});

app.get('/api/admin/submissions', (req, res) => {
  const submissions = loadSubmissions();
  res.status(200).json(submissions);
});

app.get('/api/admin/export/xlsx', async (req, res) => {
  const submissions = loadSubmissions();

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Submissions');

  sheet.columns = [
    { header: 'Инициалы', key: 'initials', width: 25 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Комментарий', key: 'comment', width: 50 },
    { header: 'Дата', key: 'date', width: 25 },
  ];

  submissions.forEach((entry) => {
    sheet.addRow({
      initials: entry.initials,
      email: entry.email,
      comment: entry.comment,
      date: new Date(entry.date).toLocaleString('ru-RU'),
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="submissions.xlsx"');
  return res.send(buffer);
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
