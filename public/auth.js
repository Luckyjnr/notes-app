// Authentication JavaScript for register, login, and OTP verification

// API base URL
const API_BASE = 'http://localhost:4000/api';

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

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePhone(phone) {
  // Remove all non-digit characters except + at the beginning
  const cleaned = phone.replace(/[^\d+]/g, '');
  // Allow phone numbers with 7-15 digits (international format)
  return cleaned.length >= 7 && cleaned.length <= 15;
}

// Registration functionality
if (document.getElementById('registerForm')) {
  document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    hideMessages();
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    
    // Validation
    if (!name || !email || !phone || !password) {
      showError('registerError', 'All fields are required.');
      return;
    }
    
    if (!validateEmail(email)) {
      showError('registerError', 'Please enter a valid email address.');
      return;
    }
    
    if (!validatePhone(phone)) {
      showError('registerError', 'Please enter a valid phone number.');
      return;
    }
    
    if (password.length < 6) {
      showError('registerError', 'Password must be at least 6 characters long.');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, phone, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        showSuccess('registerSuccess', data.message);
        // Store email for OTP verification
        localStorage.setItem('pendingEmail', email);
        // Redirect to OTP verification after 2 seconds
        setTimeout(() => {
          window.location.href = 'verify-otp.html';
        }, 2000);
      } else {
        showError('registerError', data.message || 'Registration failed.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      showError('registerError', 'Network error. Please try again.');
    }
  });
}

// Login functionality
if (document.getElementById('loginForm')) {
  document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    hideMessages();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    // Validation
    if (!email || !password) {
      showError('loginError', 'Email and password are required.');
      return;
    }
    
    if (!validateEmail(email)) {
      showError('loginError', 'Please enter a valid email address.');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        showSuccess('loginSuccess', data.message);
        
        // Redirect to notes page after 1 second
        setTimeout(() => {
          window.location.href = 'notes.html';
        }, 1000);
      } else {
        showError('loginError', data.message || 'Login failed.');
      }
    } catch (error) {
      console.error('Login error:', error);
      showError('loginError', 'Network error. Please try again.');
    }
  });
}

// OTP verification functionality
if (document.getElementById('verifyForm')) {
  // Pre-fill email if available
  const pendingEmail = localStorage.getItem('pendingEmail');
  if (pendingEmail) {
    document.getElementById('email').value = pendingEmail;
  }
  
  document.getElementById('verifyForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    hideMessages();
    
    const email = document.getElementById('email').value.trim();
    const otp = document.getElementById('otp').value.trim();
    
    // Validation
    if (!email || !otp) {
      showError('verifyError', 'Email and OTP are required.');
      return;
    }
    
    if (!validateEmail(email)) {
      showError('verifyError', 'Please enter a valid email address.');
      return;
    }
    
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      showError('verifyError', 'Please enter a valid 6-digit OTP.');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp })
      });
      
      const data = await response.json();
      
      if (data.success) {
        showSuccess('verifySuccess', data.message);
        // Clear pending email
        localStorage.removeItem('pendingEmail');
        
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 2000);
      } else {
        showError('verifyError', data.message || 'OTP verification failed.');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      showError('verifyError', 'Network error. Please try again.');
    }
  });
}

// Auto-format phone number input
if (document.getElementById('phone')) {
  document.getElementById('phone').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 0) {
      // Format as XXX-XXX-XXXX for 10 digits
      if (value.length <= 3) {
        value = value;
      } else if (value.length <= 6) {
        value = value.slice(0, 3) + '-' + value.slice(3);
      } else if (value.length <= 10) {
        value = value.slice(0, 3) + '-' + value.slice(3, 6) + '-' + value.slice(6);
      } else {
        // For longer numbers, just add dashes every 3 digits
        value = value.slice(0, 3) + '-' + value.slice(3, 6) + '-' + value.slice(6, 10);
      }
    }
    e.target.value = value;
  });
}

// Auto-format OTP input
if (document.getElementById('otp')) {
  document.getElementById('otp').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 6) {
      value = value.slice(0, 6);
    }
    e.target.value = value;
  });
}
