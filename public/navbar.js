document.addEventListener('DOMContentLoaded', async () => {
    const usernameElement = document.getElementById('navbar-username');
    const signOutButton = document.getElementById('signout-button');
    const loginSignupLink = document.getElementById('login-signup-link');
    const expenseFormContainer = document.getElementById('expense-form-container');
    

  
    const fetchUserData = async () => {
      try {
        const response = await fetch('/user-data');
        if (!response.ok) {
          throw new Error('Not authenticated');
        }
  
        const data = await response.json();
        usernameElement.textContent = `Welcome, ${data.username}`;
        usernameElement.style.display = 'block';
        signOutButton.style.display = 'inline-block';
        loginSignupLink.style.display = 'none';
        expenseFormContainer.style.display = 'block';
      } catch {
        usernameElement.style.display = 'none';
        signOutButton.style.display = 'none';
        loginSignupLink.style.display = 'inline-block';
        expenseFormContainer.style.display = 'none';
      }
    };
  
    const handleSignOut = async () => {
      try {
        const response = await fetch('/logout', { method: 'POST' });
        if (response.ok) {
          window.location.href = '/login-signup';
        }
      } catch (error) {
        alert('Failed to sign out.');
      }
    };
  
    signOutButton.addEventListener('click', handleSignOut);
  
    
    fetchUserData();
  });
  