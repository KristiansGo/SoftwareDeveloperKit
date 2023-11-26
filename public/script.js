function createProductHTML(product) {
  // Use the image URL directly from the product data, which is now coming from the database
  const imageSrc = `/images/${product.product_id}`;
  return `
    <div class="product">
      <a href="${imageSrc}" class="product-image-link">
        <img src="${imageSrc}" alt="${product.product_name}" class="product-image">
      </a>
      <h3 class="product-name">${product.product_name}</h3> 
      <p class="product-description">${product.product_description}</p>
      <div class="product-info">
        <span class="product-price">${product.product_price} €</span>
        <button class="btn-add-cart" data-product-id="${product.product_id}" data-quantity="1">Add to Cart</button>
      </div>
    </div>
  `;
}



function attachEventListeners() {
  const addToCartButtons = document.querySelectorAll('.btn-add-cart');
  addToCartButtons.forEach(button => {
    button.addEventListener('click', function(event) {
      event.preventDefault();
      const productId = button.getAttribute('data-product-id');
      const quantity = parseInt(button.getAttribute('data-quantity'), 10) || 1;
      const username = localStorage.getItem('username'); // or sessionStorage
      addToCart(productId, quantity, username);
    });
  });
}


async function addToCart(productId, quantity, username) {
  try {
    if (!username) {
      console.error('User is not logged in');
      // Optionally, prompt the user to log in
      return;
    }

    const response = await fetch('/api/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId,
        quantity,
        username,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      console.log('Product added:', data.message);

      // Update the cart item count after a successful addition
      updateCartItemCount();

      // You can also update the UI, such as displaying a confirmation message
    } else {
      console.error('Failed to add product:', data.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}


// Function to get the cart item count from the server
async function getCartItemCount() {
  try {
    // Replace 'exampleUsername' with the actual username you want to fetch the count for
    const username = localStorage.getItem('username'); // Retrieve the username from localStorage

    // Make a GET request to your server's '/api/cart-item-count/:username' endpoint
    const response = await fetch(`/api/cart-item-count/${username}`);
    if (!response.ok) {
      throw new Error('Failed to fetch cart item count');
    }

    // Parse the response as JSON
    const data = await response.json();

    console.log('Cart Data:', data);


    // Update the cart item count in your HTML (assuming you have a cart icon element with id 'cart-icon')
    const cartIcon = document.getElementById('cart-icon');
    if (cartIcon) {
      cartIcon.textContent = `(${data.itemCount})`; // Update the text content with the item count
    }
  } catch (error) {
    console.error('Error fetching cart item count:', error);
  }
}

// Call the getCartItemCount function to fetch and update the cart item count
getCartItemCount();



//////////////////////////
// Fetch product details based on product ID
function fetchProductDetails(productId) {
  return fetch(`/api/products/${productId}`)
    .then(response => response.json())
    .then(productDetails => productDetails)
    .catch(error => console.error(`Error fetching details for product ${productId}:`, error));
}



async function handleDelete(event) {
  const productId = event.target.getAttribute('data-product-id');
  const username = localStorage.getItem('username');

  try {
    const response = await fetch(`/api/cart/${username}/delete/${productId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      // Find the cart item element
      const cartItemElement = event.target.closest('.cart-item');

      // Get the product's price and quantity
      const price = parseFloat(cartItemElement.querySelector('.cart-item-info p:nth-of-type(2)').textContent.split(' ')[1]);
      const quantity = parseInt(cartItemElement.querySelector('.cart-item-info .quantity').textContent);

      // Subtract the product's total price from the totalSum
      const totalSumElement = document.getElementById('total-sum');
      let totalSum = parseFloat(totalSumElement.textContent.split(' ')[2]);
      totalSum -= price * quantity;

      // Update the totalSum display
      totalSumElement.textContent = `Total Sum: ${totalSum.toFixed(2)} €`;

      // Remove the product from the DOM
      cartItemElement.remove();

      // Update the cart item count after product deletion
      updateCartItemCount();

      // Trigger checkout logic after deletion
      handleCheckout();
    } else {
      console.error('Error deleting product:', response.statusText);
    }
  } catch (error) {
    console.error('Error deleting product:', error);
  }
}



// Load and display the shopping cart with a single "Checkout" button
async function loadShoppingCart() {
  const username = localStorage.getItem('username');
  if (username) {
    try {
      const response = await fetch(`/api/cart/${username}`);
      
      const cartItems = await response.json();

      const cartListElement = document.getElementById('cart-list');
      cartListElement.innerHTML = ''; 
      let totalSum = 0; // Initialize the total sum to 0

      const productIds = []; // Keep track of product IDs to avoid duplicates

      for (const item of cartItems) {
        const productDetails = await fetchProductDetails(item.product_id);

        // Use the product image URL directly from the product data
        const imageSrc = `/images/${item.product_id}`;

        // Check if the product ID is already in the list, and if so, skip it
        if (productIds.includes(item.product_id)) {
          continue;
        }
        
        const itemHtml = `
          <div class="cart-item">
            <a href="${imageSrc}" class="cart-item-image-link">
              <img src="${imageSrc}" alt="${productDetails.product_name}" class="cart-item-image">
            </a>
            <div class="cart-item-info">
              <h3>${productDetails.product_name}</h3>
              <p>Quantity: <span class="quantity">${item.quantity}</span></p>
              
              <p>Price: ${productDetails.product_price} €</p>
              <button class="btn-delete-cart-item" data-product-id="${item.product_id}">Delete</button>
            </div>
          </div>
        `;

        cartListElement.innerHTML += itemHtml;

        // Add the product ID to the list
        productIds.push(item.product_id);

        // Calculate the total sum for each product and add it to the totalSum variable
        totalSum += item.quantity * productDetails.product_price;
      }

      // Display the total sum
      const totalSumElement = document.getElementById('total-sum');
      totalSumElement.textContent = `Total Sum: ${totalSum} €`;

      // Add event listeners for delete buttons
      const deleteButtons = document.querySelectorAll('.btn-delete-cart-item');
      deleteButtons.forEach(button => {
        button.addEventListener('click', handleDelete);
      });

      // Add event listeners for quantity buttons
      const increaseButtons = document.querySelectorAll('.btn-increase-quantity');
      increaseButtons.forEach(button => {
        button.addEventListener('click', handleIncreaseQuantity);
      });

      const decreaseButtons = document.querySelectorAll('.btn-decrease-quantity');
      decreaseButtons.forEach(button => {
        button.addEventListener('click', handleDecreaseQuantity);
      });

      // Add a single "Checkout" button for the entire cart
      const checkoutButton = document.createElement('button');
      checkoutButton.textContent = 'Checkout';
      checkoutButton.classList.add('checkout-button');
      checkoutButton.addEventListener('click', handleCheckout);

      // Append the "Checkout" button to the cartListElement
      cartListElement.appendChild(checkoutButton);
      
    } catch (error) {
      
    }
  } else {
    // Handle the case where there is no username
  }
}
document.addEventListener('DOMContentLoaded', loadShoppingCart);

document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('login-form');
  const loginButton = document.getElementById('login-button');
  const welcomeMessage = document.getElementById('welcome-message');

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('email-input').value;
    const password = document.getElementById('password-input').value;

    fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Login failed');
      }
    })
    .then((data) => {
      localStorage.setItem('username', data.username); // Store the username
      window.location.href = '/products'; // Redirect to /products
    })
    .catch((error) => {
      console.error('Error:', error);
      alert('Login failed. Please check your credentials.');
    });
    
  });
});


// Consolidate DOMContentLoaded listener
document.addEventListener('DOMContentLoaded', function () {
  loadProducts(); // Load products
  // Other initialization code...
});

// Update loadProducts to attach event listeners after rendering
function loadProducts() {
  fetch('/api/products')
    .then(response => response.json())
    .then(products => {
      const productListElement = document.getElementById('product-list');
      productListElement.innerHTML = '';
      products.forEach(product => {
        productListElement.innerHTML += createProductHTML(product);
      });
      attachEventListeners(); // Attach event listeners after products are loaded
    })
    .catch(error => console.error('Error fetching products:', error));
}


  // Load products when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', loadProducts);
  
  // Get the modal elements
  var modal = document.getElementById('lightbox-modal');
  var modalImg = document.getElementById("full-image");
  var captionText = document.getElementsByClassName("caption")[0];
  var closeBtn = document.getElementsByClassName("close")[0];
  
  var span = document.getElementsByClassName("close")[0];

  // When the user clicks on <span> (x), close the modal
  span.onclick = function() {
      modal.style.display = "none";
  }

  // Function to open the modal with the correct image and caption
  function openModal(event) {
    var target = event.target; // The clicked element
    if (target.classList.contains('product-image')) { // Check if the clicked element is an image
      modal.style.display = "block";
      modalImg.src = target.src; // Set the modal image source to the image's src
      captionText.innerHTML = target.alt; // Set the modal caption to the image's alt text
      event.preventDefault(); // Prevent the default link action
    }
  }
  
  // Event delegation for dynamically loaded images
  // Bind click event on the product-list section instead of individual images
  document.getElementById('product-list').addEventListener('click', openModal);
  
  // When the user clicks on <span> (x), close the modal
  closeBtn.onclick = function() {
    modal.style.display = "none";
  }
  

// Function to fetch and update the cart item count
async function updateCartItemCount() {
  try {
    const username = localStorage.getItem('username'); // Retrieve the username from local storage
    const response = await fetch(`/api/cart-item-count/${username}`);
    if (!response.ok) {
      throw new Error('Failed to fetch cart item count');
    }

    const data = await response.json();

    // Update the cart icon text content
    const cartIcon = document.getElementById('cart-icon');
    if (cartIcon) {
      cartIcon.textContent = `(${data.itemCount})`;
    }
  } catch (error) {
    console.error('Error fetching cart item count:', error);
  }
}

// Call updateCartItemCount both during page load and after a deletion action
window.addEventListener('load', updateCartItemCount);

// Example: Call updateCartItemCount after a successful product deletion
function deleteProduct(productId) {
  // Perform product deletion logic here

  // After successful deletion, call updateCartItemCount
  updateCartItemCount();
}
