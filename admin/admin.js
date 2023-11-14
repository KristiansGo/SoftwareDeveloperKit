const addUserForm = document.getElementById('addUserForm');
if (addUserForm) {
    addUserForm.addEventListener('submit', function(event) {
        event.preventDefault();
        // Implement user addition logic here
    });
}


document.addEventListener('DOMContentLoaded', function() {
    var editUserForm = document.getElementById('editUserForm');
    if (editUserForm) {
        editUserForm.addEventListener('submit', function(event) {
            event.preventDefault();
            // Implement user update logic here
        });
    } else {
        console.log('editUserForm not found');
    }
});


function deleteUser(userId) {
    // Implement user deletion logic here
}

function cancelEdit() {
    document.getElementById('editUserForm').style.display = 'none';
}

  

function loadProducts() {
    console.log('Loading products...'); // Add this line

    // Implement AJAX call to get products and populate the table
    fetch('/api/product_list') // Use the route you defined for products
        .then((response) => {
            if (!response.ok) {
                console.error('Error:', response.status);
                return;
            }
            return response.json();
        })
        .then((data) => {
            console.log('Data received from API:', data);

            // Get a reference to the productTableBody
            const productTableBody = document.getElementById('productTableBody');

            // Clear the existing rows (optional, in case you're reloading the product list)
            productTableBody.innerHTML = '';

            // Loop through the retrieved products and create rows for each product
            data.forEach((product) => {
                const actionsCell = document.createElement('td');

                const row = document.createElement('tr');
                const productIdCell = document.createElement('td');
                productIdCell.textContent = product.product_id;

                const productNameCell = document.createElement('td');
                productNameCell.textContent = product.product_name;

                const descriptionCell = document.createElement('td');
                descriptionCell.textContent = product.product_description;

                const priceCell = document.createElement('td');
                priceCell.textContent = product.product_price;

                // Add more cells for other product attributes if needed

                const editButton = createProductEditButton(product.product_id, product); // Pass the product data as an argument
                const deleteButton = createProductDeleteButton(product.product_id);

                actionsCell.appendChild(editButton);
                actionsCell.appendChild(deleteButton);
                // Append cells to the row
                row.appendChild(productIdCell);
                row.appendChild(productNameCell);
                row.appendChild(descriptionCell);
                row.appendChild(priceCell);
                row.appendChild(actionsCell);

                // Append the row to the table body
                productTableBody.appendChild(row);
            });
        })
        .catch((error) => {
            console.error('Error fetching products:', error);
        });
}


document.addEventListener('DOMContentLoaded', function() {
    loadProducts();;
});

function loadUsers() {
    console.log('Loading users...'); // Add this line

    // Implement AJAX call to get users and populate the table
    fetch('/api/users') // Use the route you defined in step 1
        .then((response) => {
            if (!response.ok) {
                console.error('Error:', response.status);
                return;
            }
            return response.json();
        })
        .then((data) => {
            console.log('Data received from API:', data);

            // Get a reference to the userTableBody
            const userTableBody = document.getElementById('userTableBody');

            // Clear the existing rows (optional, in case you're reloading the user list)
            userTableBody.innerHTML = '';

            // Loop through the retrieved users and create rows for each user
            data.forEach((user) => {
                const row = document.createElement('tr');
                const userIdCell = document.createElement('td');
                userIdCell.textContent = user.user_id; // Replace 'id' with the actual property name for user ID

                const usernameCell = document.createElement('td');
                usernameCell.textContent = user.username; // Replace 'username' with the actual property name for username

                const emailCell = document.createElement('td');
                emailCell.textContent = user.email; // Replace 'email' with the actual property name for email

                const actionsCell = document.createElement('td');

                const editButton = createEditButton(user.user_id, user); // Pass the user data as an argument
                const deleteButton = createDeleteButton(user.user_id);

                actionsCell.appendChild(editButton);
                actionsCell.appendChild(deleteButton);

                // Append cells to the row
                row.appendChild(userIdCell);
                row.appendChild(usernameCell);
                row.appendChild(emailCell);
                row.appendChild(actionsCell);

                // Append the row to the table body
                userTableBody.appendChild(row);
            });
        })
        .catch((error) => {
            console.error('Error fetching users:', error);
        });
}

document.addEventListener('DOMContentLoaded', function() {
    // Call the loadUsers function once the DOM is ready
    loadUsers();;
});

function createProductEditButton(productId, productData) {
    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () => editProduct(productId, productData)); // Pass the product data to the editProduct function
    return editButton;
}

function createProductDeleteButton(productId) {
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => confirmProductDelete(productId));
    return deleteButton;
}


function editUser(userId, userData) {
    // Fill the edit form with user's data
    // Show the edit form
    console.log('Edit button clicked');
    console.log('User data:', userData); // Log the user data to verify that it's passed correctly

    // Populate the edit form fields with user data
    document.getElementById('editUserId').value = userData.user_id;
    document.getElementById('editUsername').value = userData.username;
    document.getElementById('editEmail').value = userData.email;
    document.getElementById('editPassword').value = ''; // Clear the password field or handle it as needed

    // Show the edit form
    document.getElementById('editUserTitle').style.display = 'block';
    document.getElementById('editUserForm').style.display = 'block';

    // Remove any existing event listeners on the edit form submit button
    const editUserForm = document.getElementById('editUserForm');
    const existingListener = editUserForm.onsubmit;
    editUserForm.removeEventListener('submit', existingListener);

    // Attach a new event listener to the edit form submission
    editUserForm.onsubmit = async (event) => {
        event.preventDefault();

        // Get the updated user data from the edit form fields
        const editUserId = document.getElementById('editUserId').value;
        const editUsername = document.getElementById('editUsername').value;
        const editEmail = document.getElementById('editEmail').value;
        const editPassword = document.getElementById('editPassword').value;

        // Check if the data has changed
        if (
            editUsername === userData.username &&
            editEmail === userData.email &&
            editPassword.trim() === ''
        ) {
            // No changes made, so just hide the form and return
            document.getElementById('editUserForm').style.display = 'none'; // Hide the edit form
            document.getElementById('editUserTitle').style.display = 'none'; // Hide the title
            return;
        }

        // Create an object with the updated user data
        const updatedUser = {
            username: editUsername,
            email: editEmail,
        };

        // Include the password field in the updatedUser object only if it's not empty
        if (editPassword.trim() !== '') {
            updatedUser.password = editPassword;
        }

        try {
            // Send a PUT or PATCH request to update the user data
            const response = await fetch(`/api/users/${editUserId}`, {
                method: 'PUT', // or 'PATCH' depending on your API
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedUser),
            });

            if (response.status === 200) {
                // User updated successfully, you may want to reload the user list or handle the response accordingly
                // Reload the user list or update the UI
                loadUsers(); // Reload the user list
                document.getElementById('editUserForm').style.display = 'none'; // Hide the edit form
                document.getElementById('editUserTitle').style.display = 'none'; // Hide the title
            } else {
                // Handle errors, e.g., display an error message
                console.error('Error updating user');
            }
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };
}

document.addEventListener("DOMContentLoaded", function() {
    const productForm = document.getElementById('productForm');

    if (productForm) {
        // Add the event listener only if the form is found
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(productForm);

            // Logic for adding a product
            try {
                const addProductResponse = await fetch('/api/products', {
                    method: 'POST',
                    body: formData,
                });

                if (addProductResponse.ok) {
                    console.log('Product added successfully.');
                    // Additional logic after successfully adding a product
                } else {
                    console.error('Product add failed.');
                }
            } catch (error) {
                console.error('Error adding product:', error);
            }

            // Logic for uploading an image
            try {
                const uploadResponse = await fetch('/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (uploadResponse.ok) {
                    const result = await uploadResponse.json();
                    const imagePath = result.filePath;
                    console.log('Image uploaded successfully:', imagePath);
                    // Additional logic after successfully uploading an image
                } else {
                    console.error('Image upload failed.');
                }
            } catch (error) {
                console.error('Error uploading image:', error);
            }
        });
    } else {
    }
});


function navigateToProdList() {
    // Redirect to the Users page
    window.location.href = '/admin/product_list';
}

function navigateToUsers() {
    // Redirect to the Users page
    window.location.href = '/admin/users';
}

function navigateToHome() {
    // Redirect to the Users page
    window.location.href = '/';
}

// Function to navigate to the Products page
function navigateToProducts() {
    // Redirect to the Products page
    window.location.href = '/admin/products';
}


function cancelEdit() {
    // Hide the edit form and title
    document.getElementById('editUserForm').style.display = 'none';
    document.getElementById('editUserTitle').style.display = 'none'; // Hide the title
}
 

function createEditButton(userId, userData) {
    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () => editUser(userId, userData)); // Pass the user data to the editUser function
    return editButton;
}


function createDeleteButton(userId) {
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => confirmDelete(userId));
    return deleteButton;
}

// Function to show the confirmation pop-up
function confirmDelete(userId) {
    const confirmation = window.confirm("Are you sure you want to delete this user?");
    if (confirmation) {
        // User confirmed, trigger delete action
        deleteUser(userId);
    }
}

// Function to delete the user (you should implement this)
function deleteUser(userId) {
    // Implement the delete user logic here, e.g., make an API call to delete the user from the database
    fetch(`/api/users/${userId}`, {
        method: 'DELETE'
    })
    .then((response) => {
        if (response.status === 200) {
            // User deleted successfully, you may want to reload the user list or remove the row from the table
            // Reload the user list or remove the row from the table
            loadUsers(); // Reload the user list
        } else if (response.status === 404) {
            // Handle the case where the user was not found (optional)
            console.error('User not found');
        } else {
            // Handle other errors (optional)
            console.error('Error deleting user');
        }
    })
    .catch((error) => {
        console.error('Error deleting user:', error);
    });
}

function confirmProductDelete(productId) {
    // Implement the delete product logic here
    if (confirm('Are you sure you want to delete this product?')) {
        // User confirmed, proceed with deletion
        deleteProduct(productId);
    }
}

function deleteProduct(productId) {
    // Implement the API call to delete the product by productId
    fetch(`/api/products/${productId}`, {
        method: 'DELETE'
    })
    .then((response) => {
        if (response.status === 200) {
            // Product deleted successfully, you may want to reload the product list or remove the row from the table
            // Reload the product list or remove the row from the table
            loadProducts(); // Reload the product list
        } else if (response.status === 404) {
            // Handle the case where the product was not found (optional)
            console.error('Product not found');
        } else {
            // Handle other errors (optional)
            console.error('Error deleting product');
        }
    })
    .catch((error) => {
        console.error('Error deleting product:', error);
    });
}

///

document.addEventListener("DOMContentLoaded", function() {
    const addUserForm = document.getElementById("addUserForm");
  
    if (addUserForm) {
        addUserForm.addEventListener("submit", function(e) {
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
            fetch('/admin/adduser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            })
            .then(response => {
                if (response.ok) {
                    return response.text(); // or response.json() if your server sends a JSON response
                } else {
                    throw new Error('Registration failed');
                }
            })
            .then(data => {
                console.log(data);
                clearInputFields();
                // Redirect to a success page or perform any other desired actions
                window.location.href = '/login';
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error during registration. Please try again.');
                clearInputFields();
            });
        });
    } else {
        console.error("Registration form not found");
    }
  });

///


document.addEventListener("DOMContentLoaded", function() {
    const addUserForm = document.getElementById("addUserForm");
  
    if (addUserForm) {
      addUserForm.addEventListener("submit", function(e) {
        e.preventDefault();
        console.log("Add User button pressed");

        const username = document.getElementById("addUsername").value;
        const email = document.getElementById("addEmail").value;
        const password = document.getElementById("addPassword").value;
  
        // Prepare the user data to be sent to the server
        const userData = {
          username: username,
          email: email,
          password: password
        };
  
        // Send the user data to your server for database insertion
        fetch('/admin/adduser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userData)
        })
        .then(response => {
            if (response.ok) {
              return response.text(); // or response.json()
            } else {
              console.error('Response error:', response.status);
              throw new Error('Failed to add user');
            }
          })          
        .then(data => {
          console.log(data);
          clearInputFields(); // Ensure you have this function defined to clear the input fields
          alert('User successfully added');
          // Optionally, update the user list on the page without reloading
        })
        .catch(error => {
          console.error('Error:', error);
          alert('Error adding user. Please try again.');
          clearInputFields();
        });
      });
    } else {
      console.error("Add user form not found");
    }
  });
  
  function clearInputFields() {
    document.getElementById("addUsername").value = '';
    document.getElementById("addEmail").value = '';
    document.getElementById("addPassword").value = '';
  }

  

// Function to edit a product
function editProduct(productId) {
    // Redirect to the edit page for the selected product
    // You can specify the URL of your edit page and pass the productId as a query parameter
    window.location.href = `/edit-product?id=${productId}`;
}

// Function to populate the product list table with data (you can implement this)
function populateProductList() {
    // Fetch and populate product data here
    // Example: you can use AJAX or fetch API to retrieve data from the server
}

// Call the function to populate the product list when the page loads
populateProductList();


// Call loadUsers on page load
window.onload = function() {
    loadUsers();
    loadProducts();
};
