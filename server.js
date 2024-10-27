const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require('crypto'); // для генерації унікальних ID
const app = express();
const port = 3000;

const VIEW_PASSWORD_HASH = bcrypt.hashSync('view', 10);
const EDIT_PASSWORD_HASH = bcrypt.hashSync('edit', 10);

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

mongoose.connect('mongodb+srv://nika32147:Lidochka1234_@note.fshpy.mongodb.net/')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const noteSchema = new mongoose.Schema({
  text: String,
  viewPasswordHash: String, // пароль для окремої нотатки
  shareId: String, // унікальний ID для нотатки
});

const Note = mongoose.model('Note', noteSchema);

// Отримання нотаток
app.post('/notes/view', async (req, res) => {
  const { password } = req.body;
  if (bcrypt.compareSync(password, VIEW_PASSWORD_HASH)) {
    const notes = await Note.find();
    res.json(notes);
  } else {
    res.status(401).json({ message: 'Неправильний пароль для перегляду.' });
  }
});

// Додавання нової нотатки
app.post('/notes/add', async (req, res) => {
  const { password, text } = req.body;
  if (bcrypt.compareSync(password, VIEW_PASSWORD_HASH)) {
    const newNote = new Note({ text, shareId: crypto.randomBytes(8).toString('hex') });
    await newNote.save();
    res.json({ message: 'Нотатку створено!' });
  } else {
    res.status(401).json({ message: 'Неправильний пароль.' });
  }
});

// Редагування нотатки
app.post('/notes/edit', async (req, res) => {
  const { password, noteId, newText } = req.body;
  if (bcrypt.compareSync(password, EDIT_PASSWORD_HASH)) {
    await Note.findByIdAndUpdate(noteId, { text: newText });
    res.json({ message: 'Нотатку відредаговано!' });
  } else {
    res.status(401).json({ message: 'Неправильний пароль для редагування.' });
  }
});

// Видалення нотатки
app.post('/notes/delete', async (req, res) => {
  const { password, noteId } = req.body;
  if (bcrypt.compareSync(password, EDIT_PASSWORD_HASH)) {
    await Note.findByIdAndDelete(noteId);
    res.json({ message: 'Нотатку видалено!' });
  } else {
    res.status(401).json({ message: 'Неправильний пароль для видалення.' });
  }
});

// Створення пароля для окремої нотатки
app.post('/notes/set-view-password', async (req, res) => {
  const { noteId, newPassword } = req.body;
  const viewPasswordHash = bcrypt.hashSync(newPassword, 10);
  await Note.findByIdAndUpdate(noteId, { viewPasswordHash });
  res.json({ message: 'Пароль для перегляду встановлено!' });
});

// Отримання окремої нотатки за унікальним посиланням
app.post('/notes/share/:shareId', async (req, res) => {
  const { password } = req.body;
  const note = await Note.findOne({ shareId: req.params.shareId });

  if (note && bcrypt.compareSync(password, note.viewPasswordHash)) {
    res.json({ note });
  } else {
    res.status(401).json({ message: 'Неправильний пароль для перегляду.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
