let token = '';
document.getElementById('loginForm').onsubmit = async function(e) {
  e.preventDefault();
  const email = loginEmail.value;
  const password = loginPassword.value;
  loginError.textContent = '';
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok) {
      token = data.token;
      loadNotes();
    } else {
      loginError.textContent = data.message || 'Login failed.';
    }
  } catch (err) {
    loginError.textContent = 'Network error.';
  }
};
document.getElementById('noteForm').onsubmit = async function(e) {
  e.preventDefault();
  if (!token) {
    noteError.textContent = 'Please login first.';
    return;
  }
  const title = noteTitle.value;
  const content = noteContent.value;
  const tags = noteTags.value.split(',').map(t => t.trim()).filter(Boolean);
  noteError.textContent = '';
  try {
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ title, content, tags })
    });
    const data = await res.json();
    if (res.ok) {
      noteTitle.value = '';
      noteContent.value = '';
      noteTags.value = '';
      loadNotes();
    } else {
      noteError.textContent = data.message || 'Error creating note.';
    }
  } catch (err) {
    noteError.textContent = 'Network error.';
  }
};
async function loadNotes() {
  if (!token) return;
  const res = await fetch('/api/notes', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const notes = await res.json();
  const notesList = document.getElementById('notesList');
  notesList.innerHTML = '';
  if (Array.isArray(notes)) {
    notes.forEach(note => {
      const div = document.createElement('div');
      div.className = 'note';
      div.innerHTML = `<strong>${note.title}</strong><br>${note.content}<br><span class='tags'>Tags: ${note.tags.join(', ')}</span><br><small>Created: ${new Date(note.createdAt).toLocaleString()}</small>`;
      notesList.appendChild(div);
    });
  }
}
