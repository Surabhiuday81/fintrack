document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
  
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
  
      try {
        const response = await fetch('/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
  
        if (!response.ok) throw new Error('Invalid login credentials');
  
        const { username } = await response.json();
        alert(`Welcome back, ${username}!`);
        window.location.href = '/';
      } catch (error) {
        alert(error.message);
      }
    });
  
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('signup-username').value;
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
  
      if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
      }
  
      try {
        const response = await fetch('/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password }),
        });
  
        if (!response.ok) throw new Error('Signup failed');
        alert('Signup successful! Please login.');
        window.location.href = '/login-signup';
      } catch (error) {
        alert(error.message);
      }
    });
  });
  