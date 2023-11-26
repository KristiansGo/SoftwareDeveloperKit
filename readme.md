### Documentation for Software Developer Kit Project

### Introduction

# Important Info

.env file is not included in .gitignore to be able to see every file that was used in this project.

# Project Overview:

Internet Store for Software Developer Kit is a Node.js web application designed for empowering businesses to sell products online efficiently, it offers a robust set of tools and components for creating a customizable and scalable online store. Built with simplicity and efficiency in mind, it leverages the Express framework to handle web requests and provide various functionalities.

# Technologies Used:

Visual Studio Code V1.84.2
PostgreSQL: An advanced, open-source relational database, as well as - pgAdmin 4 v7.8
HTML, CSS, and JavaScript: Used for creating the user interface and client-side scripting.
Node.js v21.2.0: A JavaScript runtime for building fast and scalable server-side applications.
EJS: Used for server-side HTML templating.
Express: A minimal Node.js web application framework, facilitating the creation of API endpoints.
 

# Prerequisites:

Node.js (including npm).
PostgreSQL database.

# Installation Steps:

Clone the project repository: git clone [https://github.com/KristiansGo/SoftwareDeveloperKit].
Navigate to the project directory.
Install Node.js - https://nodejs.org/en , choose current version v21.2.0
Install dependencies through your command prompt.
1. npm install dotenv (For loading environment variables from a .env file)
2. npm install express (The core framework for handling HTTP requests and responses)
3. npm install pg (The PostgreSQL client for Node.js, used to interact with your PostgreSQL database)
4. npm install multer (Used for uploading files)
5. npm install bcryptjs (A library for hashing and comparing passwords securely)
6. npm install express-session (Middleware for handling sessions in Express)
7. npm install ejs (A templating engine to render HTML from templates)
For easier installing use command - npm install dotenv express pg multer bcryptjs express-session ejs
Download postgreSQL - https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
Set up the PostgreSQL database(In my case called - Shop). Database Schema with script for creating tables provided in section - Database Schema
Please remember your password you created in database installation, you will need to use it later.

### Architecture Overview

# Database Schema

# Create sequences

CREATE SEQUENCE products_product_id_seq;
CREATE SEQUENCE shopping_cart_cart_id_seq;
CREATE SEQUENCE specifications_specification_id_seq;
CREATE SEQUENCE users_user_id_seq;

# Products Table - Purpose: Stores information about products.
CREATE TABLE IF NOT EXISTS public.products
(
    product_id integer NOT NULL DEFAULT nextval('products_product_id_seq'::regclass),
    product_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    product_description text COLLATE pg_catalog."default",
    product_price numeric(10,2),
    product_quantity integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    product_image bytea,
    CONSTRAINT products_pkey PRIMARY KEY (product_id)
)

# Users Table - Purpose: Manages user information.
CREATE TABLE IF NOT EXISTS public.users
(
    user_id integer NOT NULL DEFAULT nextval('users_user_id_seq'::regclass),
    username character varying(50) COLLATE pg_catalog."default" NOT NULL,
    password character varying(255) COLLATE pg_catalog."default" NOT NULL,
    email character varying(100) COLLATE pg_catalog."default",
    CONSTRAINT users_pkey PRIMARY KEY (user_id),
    CONSTRAINT users_username_key UNIQUE (username)
)

# Specifications Table - Purpose: Holds product specifications.
CREATE TABLE IF NOT EXISTS public.specifications
(
    specification_id integer NOT NULL DEFAULT nextval('specifications_specification_id_seq'::regclass),
    product_id integer NOT NULL,
    processor_family character varying(255) COLLATE pg_catalog."default",
    processor_model character varying(255) COLLATE pg_catalog."default",
    processor_frequency character varying(255) COLLATE pg_catalog."default",
    processor_cores integer,
    hdd_size character varying(255) COLLATE pg_catalog."default",
    ram character varying(255) COLLATE pg_catalog."default",
    video_card_type character varying(255) COLLATE pg_catalog."default",
    video_card character varying(255) COLLATE pg_catalog."default",
    video_card_memory character varying(255) COLLATE pg_catalog."default",
    ssd_size character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT specifications_pkey PRIMARY KEY (specification_id)
)

# Shopping Cart Table - Purpose: Manages shopping cart contents.
CREATE TABLE IF NOT EXISTS public.shopping_cart
(
    cart_id integer NOT NULL DEFAULT nextval('shopping_cart_cart_id_seq'::regclass),
    user_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT shopping_cart_pkey PRIMARY KEY (cart_id),
    CONSTRAINT shopping_cart_product_id_fkey FOREIGN KEY (product_id)
        REFERENCES public.products (product_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT shopping_cart_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.users (user_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

### Start up the project

1. Open project file explorer
2. Find .env file open it and find lane "PGPASSWORD=20345646" please change "20345646" to your password you cretaed when installed postgreSQL, if you have named your database other than Shop please change also "PGDATABASE=Shop" accordingly.
2. Find server.js file in it and open it
3. In navigation bar click Run and from dropdown list select Run Without Debugging
4. Now your project is up and is available when you open broswer and use link - http://localhost:3000

### Code Documentation

# Code Structure:

Frontend: HTML and HTML,EJS templates for structure, CSS for styling, and JavaScript for interactive elements.
Backend: Node.js with Express framework handling server-side logic

### Security

Password Hashing is added to project to save hashed passwords in database.
Access countrol is working meaning that only specific user can access /admin routes. This scenario this feature will be available for user that will be created with username = admin, all other users with any other username will not be able to access admin routes.

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


