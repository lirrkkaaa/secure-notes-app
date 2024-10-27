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
      displayNotes(data);
      showAddNoteOption(password);
    }
  })
  .catch(error => console.error('Error:', error));
}

function displayNotes(notes) {
  const noteList = document.getElementById('noteList');
  noteList.innerHTML = notes.map(note => `
    <div>
      <p>${note.text}</p>
      <button class="btn" onclick="editNotePrompt('${note._id}')">Редагувати</button>
    </div>
  `).join('');
}

function deleteNotes(notes) {
  const noteList = document.getElementById('noteList');
  noteList.innerHTML = notes.map(note => `
    <div>
      <p>${note.text}</p>
      <button class="btn" onclick="editNotePrompt('${note._id}')">delete</button>
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
