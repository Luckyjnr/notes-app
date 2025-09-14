// Legacy app.js - redirects to new structure
// This file is kept for backward compatibility

// Check if user is already logged in and redirect appropriately
document.addEventListener('DOMContentLoaded', function() {
  const token = localStorage.getItem('token');
  
  if (token) {
    // Verify token is still valid
    fetch('/api/notes', {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    })
    .then(response => {
      if (response.ok) {
        // Redirect to new notes page
        window.location.href = 'notes.html';
      } else {
        // Token is invalid, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
      }
    })
    .catch(() => {
      // Network error, redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = 'login.html';
    });
  } else {
    // No token, redirect to welcome page
    window.location.href = 'index.html';
  }
});
