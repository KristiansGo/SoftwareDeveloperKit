document.addEventListener("DOMContentLoaded", function() {
    const registrationForm = document.getElementById("registration-form");
  
    if (registrationForm) {
        registrationForm.addEventListener("submit", function(e) {
            e.preventDefault();
            const username = document.getElementById("inputUsername").value;
            const email = document.getElementById("inputEmail").value;
            const password = document.getElementById("inputPassword").value;
  
            // Prepare the user data to be sent to the server
            const userData = {
                username: username,
                email: email,
                password: password
            };
  
            // Send the user data to your server for database insertion
            fetch('/registration', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            })
            .then(response => {
                if (response.ok) {
                    return response.text(); // or response.json() if your server sends a JSON response
                }
                // Handle non-OK responses from the server
                return response.text().then(text => { throw new Error(text || 'Registration failed'); });
            })
            .then(data => {
                console.log(data);
                clearInputFields();
                alert('Registration successful!');
                // Redirect to a success page or perform any other desired actions
                window.location.href = '/login';
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Username or email address already exists.');
                clearInputFields();
            });
        });
    } else {
        console.error("Registration form not found");
    }
  });
  
  function clearInputFields() {
    document.getElementById("inputUsername").value = '';
    document.getElementById("inputEmail").value = '';
    document.getElementById("inputPassword").value = '';
  }