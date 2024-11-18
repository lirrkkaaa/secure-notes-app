document.addEventListener('DOMContentLoaded', loadNotes);

function addNote() {
  const text = document.getElementById('newNoteText').value;
  const password = document.getElementById('notePassword').value;
  if (!text || !password) {
    alert('Будь ласка, введіть текст та пароль.');
    return;
  }
  fetch('/notes/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, password })
  })
  .then(response => response.json())
  .then(data => {
    alert(data.message);
    document.getElementById('newNoteText').value = '';
    document.getElementById('notePassword').value = '';
    loadNotes();
  })
  .catch(error => console.error('Error:', error));
}

function loadNotes() {
  fetch('/notes')
  .then(response => response.json())
  .then(notes => {
    const noteList = document.getElementById('noteList');
    noteList.innerHTML = notes.map(note => `
      <div class="note-container">
        <p>Зашифрована нотатка (ID: ${note._id})</p>
        <button class="btn" onclick="viewNoteContentPrompt('${note._id}')">Переглянути вміст</button>
        <div class="note-actions">
          <button class="btn" onclick="editNotePrompt('${note._id}')">Редагувати вміст</button>
          <button class="btn" onclick="deleteNotePrompt('${note._id}')">Видалити</button>
        </div>
      </div>
    `).join('');
  })
  .catch(error => console.error('Error:', error));
}

function viewNoteContentPrompt(noteId) {
  const password = prompt("Введіть пароль для перегляду вмісту:");
  fetch('/notes/view-content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ noteId, password })
  })
  .then(response => response.json())
  .then(data => {
    if (data.message) {
      alert(data.message);
    } else {
      alert(`Вміст нотатки: ${data.text}`);
    }
  })
  .catch(error => console.error('Error:', error));
}

function editNotePrompt(noteId) {
  console.log('Note ID:', noteId); // Додайте для перевірки, що `noteId` передається правильно
  const password = prompt("Введіть пароль для редагування:");
  const newText = prompt("Введіть новий текст нотатки:");
  

  
  if (!newText) {
    alert('Новий текст не може бути порожнім.');
    return;
  }

  fetch('/notes/edit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ noteId, password, newText })
  })
  .then(response => response.json())
  .then(data => {
    alert(data.message);
    loadNotes(); // Оновлюємо список нотаток після редагування
  })
  .catch(error => console.error('Error:', error));
}


  fetch('/notes/edit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ noteId, password, newText })
  })
  .then(response => response.json())
  .then(data => {
    alert(data.message);
    loadNotes();
  })
  .catch(error => console.error('Error:', error));


function deleteNotePrompt(noteId) {
  const confirmDelete = confirm("Ви впевнені, що хочете видалити цю нотатку?");
  if (!confirmDelete) return;

  fetch(`/notes/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ noteId })
  })
  .then(response => response.json())
  .then(data => {
    alert(data.message);
    loadNotes(); // Оновлюємо список нотаток після видалення
  })
  .catch(error => console.error('Error:', error));
}

