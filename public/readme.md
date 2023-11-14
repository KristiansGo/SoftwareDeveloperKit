### Documentation for Software Developer Kit Project

### Introduction

# Project Overview:

Internet Store for Software Developer Kit is a Node.js web application designed for empowering businesses to sell products online efficiently, it offers a robust set of tools and components for creating a customizable and scalable online store. Built with simplicity and efficiency in mind, it leverages the Express framework to handle web requests and provide various functionalities.

# Technologies Used:

HTML, CSS, and JavaScript: Used for creating the user interface and client-side scripting.
Node.js: A JavaScript runtime for building fast and scalable server-side applications.
EJS: Used for server-side HTML templating.
Express: A minimal Node.js web application framework, facilitating the creation of API endpoints.
PostgreSQL: An advanced, open-source relational database.

# Prerequisites:

Node.js (including npm).
PostgreSQL database.

# Installation Steps:

Clone the project repository: git clone [https://github.com/KristiansGo/SoftwareDeveloperKit].
Navigate to the project directory.
Install Node.js dependencies: npm install.
Set up the PostgreSQL database.

### Architecture Overview

# Database Schema

# Products Table - Purpose: Stores information about products.
Fields:
product_id: INTEGER - Primary key, auto-increment.
product_name: VARCHAR(255) - Name of the product.
product_description: TEXT - Description of the product.
product_price: NUMERIC(10, 2) - Price of the product.
product_quantity: INTEGER - Available quantity.
created_at: TIMESTAMP - Date/time of product addition.
product_image: BYTEA - Image of the product.

# Shopping Cart Table - Purpose: Manages shopping cart contents.
Fields:
cart_id: INTEGER - Primary key, auto-increment.
user_id: INTEGER - User's ID (Foreign key from Users table).
product_id: INTEGER - Product's ID (Foreign key from Products table).
quantity: INTEGER - Quantity of product.
created_at: TIMESTAMP - Date/time of cart entry creation.
updated_at: TIMESTAMP - Date/time of last update.

# Specifications Table - Purpose: Holds product specifications.
Fields:
specification_id: INTEGER - Primary key, auto-increment.
product_id: INTEGER - Product's ID.
processor_family: VARCHAR(255) - Processor family.
processor_model: VARCHAR(255) - Processor model.
processor_frequency: VARCHAR(255) - Processor frequency.
processor_cores: INTEGER - Number of processor cores.
hdd_size: VARCHAR(255) - HDD size.
ram: VARCHAR(255) - RAM amount.
video_card_type: VARCHAR(255) - Video card type.
video_card: VARCHAR(255) - Video card model.
video_card_memory: VARCHAR(255) - Video card memory.
ssd_size: VARCHAR(255) - SSD size.

# Users Table - Purpose: Manages user information.
Fields:
user_id: INTEGER - Primary key, auto-increment.
username: VARCHAR(50) - Username, unique.
password: VARCHAR(255) - Password.
email: VARCHAR(100) - Email address.

Start the server: node index.js or use a script if defined in package.json.

### Code Documentation

# Code Structure:

Frontend: HTML and HTML,EJS templates for structure, CSS for styling, and JavaScript for interactive elements.
Backend: Node.js with Express framework handling server-side logic

### Security

Password Hashing is added to project to save hashed passwords in database.
Access countrol is working meaning that only specific user can access /admin routes. This scenario this feature is provided for user with email : kristiansgo@inbox.lv password: admin123

### Key Modules and Functions:

Frontend Interactivity: Utilization of JavaScript and EJS for dynamic content and user experiences.
Express Routers: Management of routing and HTTP requests through Express.
Database Interaction: How the application interacts with the PostgreSQL database.

API Documentation
Endpoints:
List and describe the API endpoints offered by the Express server, detailing their HTTP methods, paths, request/response formats, and functionalities.

### API Endpoints Documentation

### User Authentication

# User Registration

Endpoint: /registration
Method: POST
Description: Registers a new user.
Body:
username: String
email: String
password: String

# User Login

Endpoint: /login
Method: POST
Description: Authenticates a user and starts a session.
Body:
email: String
password: String

### Product Management

# List All Products

Endpoint: /api/products
Method: GET
Description: Retrieves a list of all products.

# Get Specific Product Details

Endpoint: /api/products/:productId
Method: GET
Description: Retrieves details of a specific product.
URL Parameters:
productId: Integer

# Add New Product

Endpoint: /api/products
Method: POST
Description: Adds a new product to the database.
Body: Form data with product details including image.

# Edit Product

Endpoint: /edit-product
Method: GET
Description: Fetches product and specification details for editing.
Query Parameters:
id: Integer (Product ID)

### Shopping Cart

# Add to Cart

Endpoint: /api/cart/add
Method: POST
Description: Adds a product to a user's shopping cart.
Body:
productId: Integer
username: String
quantity: Integer

# View Cart

Endpoint: /api/cart/:username
Method: GET
Description: Retrieves the contents of a user's shopping cart.
URL Parameters:
username: String

# Delete from Cart

Endpoint: /api/cart/:username/delete/:productId
Method: DELETE
Description: Removes a product from a user's shopping cart.
URL Parameters:
username: String
productId: Integer

### User Management (Admin)

# Add User (Admin)

Endpoint: /admin/adduser
Method: POST
Description: Admin route to add a new user.
Body:
username: String
email: String
password: String

# View Users

Endpoint: /api/users
Method: GET
Description: Retrieves a list of all users (Admin).

# Delete User

Endpoint: /api/users/:userId
Method: DELETE
Description: Deletes a specific user.
URL Parameters:
userId: Integer

# Update User Details

Endpoint: /api/users/:userId
Method: PUT
Description: Updates user details.
URL Parameters:
userId: Integer
Body:
username: String (optional)
email: String (optional)
password: String (optional)

### Product and Specification Deletion

# Delete Product and Specifications

Endpoint: /api/products/:productId
Method: DELETE
Description: Deletes a product and its related specifications.
URL Parameters:
productId: Integer


### User Guide

1. User Registration
Accessing Registration Page: Navigate to the registration page, typically labeled 'Sign Up' or 'Register'.
Filling Out the Form: Enter your desired username, email address, and a secure password.
Submitting the Form: Click the 'Register' or 'Sign Up' button to create your account.
Confirmation: You should receive a confirmation message indicating successful registration.

2. User Login
Accessing Login Page: Go to the login page, often found at the home page or under a 'Login' link.
Entering Credentials: Type in your registered email address and password.
Logging In: Click the 'Login' button to access your account.
Post-Login Navigation: Once logged in, you can navigate the site, view products, and manage your shopping cart.

3. Viewing Products
Product Catalog: Access the product catalog or product list, where all available products are displayed.
Product Details: Click on a product to view its detailed information, including price, description, and specifications.

4. Adding Products to Cart
Selecting Products: Browse through the product listings and select the product you wish to purchase.
Adding to Cart: Click the 'Add to Cart' button next to the product. You may need to specify the quantity before adding.
Dynamic Cart Update: The cart icon or section will update dynamically, showing the number of items and the total cost.

5. Managing the Shopping Cart
Accessing the Cart: Click on the cart icon or link to view your shopping cart.
Viewing Cart Contents: The cart page will display all the items you’ve added, along with quantities and prices.
Updating Quantities: You can change the quantity of each item, and the total price will update dynamically.
Removing Items: If you wish to remove an item, click the 'Remove' or 'Delete' button next to the item. The cart will update automatically.

6. Checkout and Balance
Viewing Total Balance: The total cost of the items in the cart will be displayed, usually at the bottom of the cart page.
Proceed to Checkout: When you’re ready to purchase, click the 'Checkout' button.

7. Dynamic Updates
Real-Time Updates: The application provides real-time updates. When you add or remove products from the cart, the total balance and cart contents will refresh automatically without the need to reload the page.
