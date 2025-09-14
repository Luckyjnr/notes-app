// Notes JavaScript for create note and view all notes functionality

// API base URL
const API_BASE = 'https://notes-app-9bid.onrender.com/api';

// Global variables
let currentPage = 1;
let currentFilters = {};

// Utility functions
function showError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
}

function showSuccess(elementId, message) {
  const successElement = document.getElementById(elementId);
  if (successElement) {
    successElement.textContent = message;
    successElement.style.display = 'block';
  }
}

function hideMessages() {
  const errorElements = document.querySelectorAll('.error');
  const successElements = document.querySelectorAll('.success');
  
  errorElements.forEach(el => el.style.display = 'none');
  successElements.forEach(el => el.style.display = 'none');
}

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  if (!checkAuth()) return;
  
  // Set user info
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userNameElement = document.getElementById('userName');
  if (userNameElement) {
    userNameElement.textContent = `Welcome, ${user.name || 'User'}`;
  }
  
  // Set up logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
  
  // Set up navigation buttons
  const viewNotesBtn = document.getElementById('viewNotesBtn');
  if (viewNotesBtn) {
    viewNotesBtn.addEventListener('click', () => {
      window.location.href = 'notes.html';
    });
  }
  
  const createNoteBtn = document.getElementById('createNoteBtn');
  if (createNoteBtn) {
    createNoteBtn.addEventListener('click', () => {
      window.location.href = 'create-note.html';
    });
  }
  
  // Load notes if on notes page
  if (window.location.pathname.includes('notes.html')) {
    loadNotes();
    setupSearchAndFilter();
  }
});

// Create note functionality
if (document.getElementById('noteForm')) {
  document.getElementById('noteForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    hideMessages();
    
    const title = document.getElementById('noteTitle').value.trim();
    const content = document.getElementById('noteContent').value.trim();
    const tags = document.getElementById('noteTags').value.trim();
    
    // Validation
    if (!title || !content) {
      showError('noteError', 'Title and content are required.');
      return;
    }
    
    if (title.length > 100) {
      showError('noteError', 'Title must be less than 100 characters.');
      return;
    }
    
    if (content.length > 5000) {
      showError('noteError', 'Content must be less than 5000 characters.');
      return;
    }
    
    // Process tags
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    
    try {
      const response = await fetch(`${API_BASE}/notes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ title, content, tags: tagsArray })
      });
      
      const data = await response.json();
      
      if (data.success) {
        showSuccess('noteSuccess', data.message);
        
        // Clear form
        document.getElementById('noteTitle').value = '';
        document.getElementById('noteContent').value = '';
        document.getElementById('noteTags').value = '';
        
        // Redirect to notes page after 1 second
        setTimeout(() => {
          window.location.href = 'notes.html';
        }, 1000);
      } else {
        showError('noteError', data.message || 'Failed to create note.');
      }
    } catch (error) {
      console.error('Create note error:', error);
      showError('noteError', 'Network error. Please try again.');
    }
  });
}

// Load notes functionality
async function loadNotes(page = 1) {
  const notesList = document.getElementById('notesList');
  if (!notesList) return;
  
  notesList.innerHTML = '<div class="loading">Loading notes...</div>';
  
  try {
    const params = new URLSearchParams({
      page: page,
      limit: 12,
      ...currentFilters
    });
    
    const response = await fetch(`${API_BASE}/notes?${params}`, {
      headers: getAuthHeaders()
    });
    
    const data = await response.json();
    
    if (data.success) {
      displayNotes(data.notes);
      displayPagination(data.pagination);
      currentPage = page;
    } else {
      notesList.innerHTML = '<div class="error">Failed to load notes. Please try again.</div>';
    }
  } catch (error) {
    console.error('Load notes error:', error);
    notesList.innerHTML = '<div class="error">Network error. Please try again.</div>';
  }
}

// Display notes
function displayNotes(notes) {
  const notesList = document.getElementById('notesList');
  if (!notesList) return;
  
  if (notes.length === 0) {
    notesList.innerHTML = '<div class="loading">No notes found. Create your first note!</div>';
    return;
  }
  
  notesList.innerHTML = notes.map(note => `
    <div class="note">
      <h3>${escapeHtml(note.title)}</h3>
      <p>${escapeHtml(note.content.length > 150 ? note.content.substring(0, 150) + '...' : note.content)}</p>
      ${note.tags && note.tags.length > 0 ? `
        <div class="tags">
          ${note.tags.map(tag => `<span>${escapeHtml(tag)}</span>`).join('')}
        </div>
      ` : ''}
      <div class="note-meta">
        <span>Created: ${new Date(note.createdAt).toLocaleDateString()}</span>
        <span>Updated: ${new Date(note.updatedAt).toLocaleDateString()}</span>
      </div>
      <div class="note-actions">
        <button class="edit-btn" onclick="editNote('${note._id}')">Edit</button>
        <button class="delete-btn" onclick="deleteNote('${note._id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

// Display pagination
function displayPagination(pagination) {
  const paginationElement = document.getElementById('pagination');
  if (!paginationElement || !pagination) return;
  
  const { currentPage, totalPages, hasNext, hasPrev } = pagination;
  
  if (totalPages <= 1) {
    paginationElement.innerHTML = '';
    return;
  }
  
  let paginationHTML = '';
  
  // Previous button
  if (hasPrev) {
    paginationHTML += `<button onclick="loadNotes(${currentPage - 1})">Previous</button>`;
  }
  
  // Page numbers
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);
  
  for (let i = startPage; i <= endPage; i++) {
    const isActive = i === currentPage ? 'style="background: #f76b1c; color: white;"' : '';
    paginationHTML += `<button onclick="loadNotes(${i})" ${isActive}>${i}</button>`;
  }
  
  // Next button
  if (hasNext) {
    paginationHTML += `<button onclick="loadNotes(${currentPage + 1})">Next</button>`;
  }
  
  paginationElement.innerHTML = paginationHTML;
}

// Setup search and filter
function setupSearchAndFilter() {
  const searchInput = document.getElementById('searchInput');
  const tagFilter = document.getElementById('tagFilter');
  const searchBtn = document.getElementById('searchBtn');
  const clearFiltersBtn = document.getElementById('clearFiltersBtn');
  
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      const searchTerm = searchInput ? searchInput.value.trim() : '';
      const tag = tagFilter ? tagFilter.value.trim() : '';
      
      currentFilters = {};
      if (searchTerm) {
        // Note: This is a simple client-side search
        // In a real app, you'd want server-side search
        currentFilters.search = searchTerm;
      }
      if (tag) {
        currentFilters.tag = tag;
      }
      
      loadNotes(1);
    });
  }
  
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (tagFilter) tagFilter.value = '';
      currentFilters = {};
      loadNotes(1);
    });
  }
  
  // Search on Enter key
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        searchBtn.click();
      }
    });
  }
  
  if (tagFilter) {
    tagFilter.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        searchBtn.click();
      }
    });
  }
}

// Edit note (placeholder - would open edit modal or redirect to edit page)
function editNote(noteId) {
  // For now, just show an alert
  alert('Edit functionality would be implemented here. Note ID: ' + noteId);
  // In a real app, you might:
  // 1. Open a modal with the note data
  // 2. Redirect to an edit page
  // 3. Make the note inline-editable
}

// Delete note
async function deleteNote(noteId) {
  if (!confirm('Are you sure you want to delete this note?')) {
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/notes/${noteId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Reload notes
      loadNotes(currentPage);
    } else {
      alert('Failed to delete note: ' + (data.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('Delete note error:', error);
    alert('Network error. Please try again.');
  }
}

// Utility function to escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Make functions globally available
window.loadNotes = loadNotes;
window.editNote = editNote;
window.deleteNote = deleteNote;
