const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require('crypto');
const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

mongoose.connect('mongodb+srv://nika32147:Lidochka1234_@note.fshpy.mongodb.net/note?retryWrites=true&w=majority')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Модель нотатки
const noteSchema = new mongoose.Schema({
  encryptedText: String,
  passwordHash: String
});
const Note = mongoose.model('Note', noteSchema);

// Функції шифрування та розшифрування
function encrypt(text, password) {
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(password, 'salt', 32);
  const cipher = crypto.createCipheriv('aes-256-ctr', key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return {
    iv: iv.toString('hex'),
    content: encrypted.toString('hex')
  };
}

function decrypt(encryptedText, iv, password) {
  const key = crypto.scryptSync(password, 'salt', 32);
  const decipher = crypto.createDecipheriv('aes-256-ctr', key, Buffer.from(iv, 'hex'));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedText, 'hex')), decipher.final()]);
  return decrypted.toString('utf8');
}

// Додавання нової нотатки
app.post('/notes/add', async (req, res) => {
  const { text, password } = req.body;
  const encrypted = encrypt(text, password);
  const passwordHash = bcrypt.hashSync(password, 10);
  const newNote = new Note({
    encryptedText: JSON.stringify(encrypted),
    passwordHash
  });
  await newNote.save();
  res.json({ message: 'Нотатку створено!' });
});

// Отримання всіх нотаток
app.get('/notes', async (req, res) => {
  const notes = await Note.find();
  res.json(notes);
});

// Отримання і розшифрування нотатки
app.post('/notes/view-content', async (req, res) => {
  const { noteId, password } = req.body;
  const note = await Note.findById(noteId);
  if (!note) {
    return res.status(404).json({ message: 'Нотатку не знайдено.' });
  }
  if (bcrypt.compareSync(password, note.passwordHash)) {
    const { iv, content } = JSON.parse(note.encryptedText);
    const decryptedText = decrypt(content, iv, password);
    res.json({ text: decryptedText });
  } else {
    res.status(401).json({ message: 'Неправильний пароль.' });
  }
});

// Видалення нотатки
app.post('/notes/delete', async (req, res) => {
  const { noteId } = req.body;
  try {
    await Note.findByIdAndDelete(noteId);
    res.json({ message: 'Нотатку видалено!' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ message: 'Помилка при видаленні нотатки.' });
  }
});

app.post('/notes/edit', async (req, res) => {
  const { noteId, password, newText } = req.body;

  if (!noteId || !password || !newText) {
    return res.status(400).json({ message: 'Всі поля є обов’язковими.' });
  }

  try {
    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: 'Нотатку не знайдено.' });
    }

    // Перевірка правильності пароля
    if (!bcrypt.compareSync(password, note.passwordHash)) {
      return res.status(401).json({ message: 'Неправильний пароль для редагування.' });
    }

    // Шифруємо новий текст і оновлюємо нотатку
    const encrypted = encrypt(newText, password);
    note.encryptedText = JSON.stringify(encrypted);
    await note.save();

    res.json({ message: 'Нотатку відредаговано!' });
  } catch (error) {
    console.error('Error editing note:', error);
    res.status(500).json({ message: 'Помилка при редагуванні нотатки.' });
  }
});



// Отримання зашифрованої нотатки за посиланням
app.get('/notes/share/:noteId', async (req, res) => {
  const { noteId } = req.params;
  try {
    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: 'Нотатку не знайдено.' });
    }
    res.json({ encryptedText: note.encryptedText });
  } catch (error) {
    console.error('Error fetching shared note:', error);
    res.status(500).json({ message: 'Помилка при отриманні нотатки.' });
  }
});

// Розшифровка нотатки для перегляду за посиланням
app.post('/notes/share/view', async (req, res) => {
  const { noteId, password } = req.body;
  try {
    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: 'Нотатку не знайдено.' });
    }
    const { iv, content } = JSON.parse(note.encryptedText);
    const decryptedText = decrypt(content, iv, password);
    res.json({ text: decryptedText });
  } catch (error) {
    console.error('Error viewing shared note:', error);
    res.status(401).json({ message: 'Помилка при розшифровці нотатки.' });
  }
});




app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
