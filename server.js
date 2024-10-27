const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3000;

// Налаштування паролів (замініть на власні)
const VIEW_PASSWORD_HASH = bcrypt.hashSync('view', 10);
const EDIT_PASSWORD_HASH = bcrypt.hashSync('edit', 10);

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Підключення до MongoDB
mongoose.connect('mongodb+srv://nika32147:Lidochka1234_@note.fshpy.mongodb.net/note', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Модель нотатки
const noteSchema = new mongoose.Schema({
  text: String,
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
    const newNote = new Note({ text });
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

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
