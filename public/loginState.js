document.addEventListener('DOMContentLoaded', function () {
    const userWelcome = document.getElementById('user-welcome');
    const loginButton = document.querySelector('.nav-button[href="/login"]');
    const logoutButton = document.getElementById('logout-button');
    const adminButton = document.getElementById('admin-button'); // Admin button
  
    const username = localStorage.getItem('username');
    const userEmail = localStorage.getItem('userEmail'); // Assuming you store the user's email

    console.log('User Email:', userEmail); // To check the retrieved email

  
    if (username) {
      if (loginButton) loginButton.style.display = 'none';
      userWelcome.textContent = `Welcome, ${username}`;
      if (logoutButton) logoutButton.style.display = 'block';
  
      // Show admin button if the logged-in user is an admin
      if (username === 'admin' && adminButton) {
        adminButton.style.display = 'block';
      } else {
        if (adminButton) adminButton.style.display = 'none';
      }
  
    } else {
      if (userWelcome) userWelcome.textContent = '';
      if (logoutButton) logoutButton.style.display = 'none';
      if (loginButton) loginButton.style.display = 'block';
      if (adminButton) adminButton.style.display = 'none'; // Hide admin button for non-logged in users
    }
  
    // Logout functionality
    if (logoutButton) {
      logoutButton.addEventListener('click', (e) => {
        e.preventDefault();
    
        // Clear the stored username or token
        localStorage.removeItem('username');
        localStorage.removeItem('userEmail'); // Also remove the email from local storage
  
        // Redirect to the login page
        window.location.href = '/login';
      });
    }
  });
  