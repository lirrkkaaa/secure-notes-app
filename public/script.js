function showPasswordPrompt() {
  const password = prompt("Введіть пароль для перегляду нотаток:");
  fetch('/notes/view', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  })
  .then(response => response.json())
  .then(data => {
    if (data.message) {
      alert(data.message);
    } else {
      displayNotes(data, password);
      showAddNoteOption(password);
    }
  })
  .catch(error => console.error('Error:', error));
}

function displayNotes(notes, viewPassword) {
  const noteList = document.getElementById('noteList');
  noteList.innerHTML = notes.map(note => `
    <div>
      <p>${note.text}</p>
      <button class="btn" onclick="editNotePrompt('${note._id}')">Редагувати</button>
      <button class="btn" onclick="deleteNotePrompt('${note._id}', '${viewPassword}')">Видалити</button>
      <button class="btn" onclick="shareNotePrompt('${note._id}')">Поділитися</button>
    </div>
  `).join('');
}

function showAddNoteOption(password) {
  const noteList = document.getElementById('noteList');
  noteList.insertAdjacentHTML('beforeend', `
    <div class="note-input">
      <textarea class="textarea" id="newNoteText" placeholder="Введіть текст нотатки"></textarea>
      <button class="btn" onclick="addNote('${password}')">Зберегти нотатку</button>
    </div>
  `);
}

function addNote(password) {
  const text = document.getElementById('newNoteText').value;
  fetch('/notes/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password, text })
  })
  .then(response => response.json())
  .then(data => {
    alert(data.message);
    showPasswordPrompt();
  })
  .catch(error => console.error('Error:', error));
}

function editNotePrompt(noteId) {
  const password = prompt("Введіть пароль для редагування:");
  const newText = prompt("Введіть новий текст нотатки:");

  fetch('/notes/edit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password, noteId, newText })
  })
  .then(response => response.json())
  .then(data => {
    alert(data.message);
    showPasswordPrompt();
  })
  .catch(error => console.error('Error:', error));
}

function deleteNotePrompt(noteId, password) {
  if (confirm("Ви впевнені, що хочете видалити цю нотатку?")) {
    fetch('/notes/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, noteId })
    })
    .then(response => response.json())
    .then(data => {
      alert(data.message);
      showPasswordPrompt();
    })
    .catch(error => console.error('Error:', error));
  }
}

function shareNotePrompt(noteId) {
  const newPassword = prompt("Встановіть пароль для перегляду цієї нотатки:");
  
  fetch('/notes/set-view-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ noteId, newPassword })
  })
  .then(response => response.json())
  .then(data => {
    alert(data.message);
    const shareUrl = `${window.location.origin}/notes/share/${noteId}`;
    prompt("Скопіюйте посилання для поділу:", shareUrl);
  })
  .catch(error => console.error('Error:', error));
}
