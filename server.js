require('dotenv').config();
const fs = require('fs');

const path = require('path');
const express = require('express');
const { Pool } = require('pg');
const multer = require('multer');
const bcrypt = require('bcryptjs');

const upload = multer({ storage: multer.memoryStorage() });

const app = express();

app.use(express.static('public'));

const session = require('express-session');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;

// Create a new pool instance using environment variables
const pool = new Pool({
    user: process.env.PGUSER,        
    host: process.env.PGHOST,        
    database: process.env.PGDATABASE, 
    password: process.env.PGPASSWORD, 
    port: process.env.PGPORT,        
});

app.use(session({
  secret: process.env.SESSION_SECRET, // Use a strong secret key
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Define middleware to set the common cookie
app.use((req, res, next) => {
  res.cookie('commonCookie', 'commonValue', { path: '/', httpOnly: true });
  next();
});

app.set('view engine', 'ejs');

// Specify the directory where your views (templates) are located
app.set('views', path.join(__dirname, 'views'));
// Serve static files from the 'public' folder

// Serve static files from the 'admin' folder
app.use('/admin', express.static('admin'));


app.use('/images', express.static('images'));

app.post('/registration', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if the username or email already exists in the database
    const existingUser = await pool.query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).send('Username or email already exists.');
    }

    // Hash the user's password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the number of salt rounds

    // Insert the new user into the database with the hashed password
    const newUser = await pool.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *', [username, email, hashedPassword]);

    console.log("New user created:", newUser.rows[0]); // Log the new user's data
    res.status(201).send(`User created with ID: ${newUser.rows[0].id}`);
  } catch (error) {
    console.error("Error in /registration route:", error);
    res.status(500).send('Server error');
  }
});


app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const userQuery = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userQuery.rows.length === 0) {
      return res.status(400).send('User not found. Please check your email or register.');
    }

    const user = userQuery.rows[0];
    const storedPasswordHash = user.password;
    const username = user.username; // Assuming there is a username field

    bcrypt.compare(password, storedPasswordHash, (err, result) => {
      if (err) {
        return res.status(500).send('Internal server error');
      }
      if (result) {
        req.session.username = username; // Store username in the session
        console.log('Logged in user:', username);
        res.status(200).json({ message: 'Login successful.', username: username });
      } else {
        res.status(400).send('Incorrect password. Please try again.');
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Endpoint for adding a product to the cart
app.post('/api/cart/add', async (req, res) => {
  try {
    const { productId, username, quantity } = req.body;

    // Look up the user ID based on the username
    const userResult = await pool.query('SELECT user_id FROM users WHERE username = $1', [username]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const userId = userResult.rows[0].user_id;


    // Check if the product is already in the cart
    const existingCartItem = await pool.query(
      'SELECT * FROM shopping_cart WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );

    if (existingCartItem.rows.length > 0) {
      // Product is already in the cart, update the quantity
      const updatedQuantity = existingCartItem.rows[0].quantity + quantity;
      await pool.query(
        'UPDATE shopping_cart SET quantity = $1, updated_at = NOW() WHERE user_id = $2 AND product_id = $3',
        [updatedQuantity, userId, productId]
      );
    } else {
      // Product is not in the cart, insert a new row
      await pool.query(
        'INSERT INTO shopping_cart (user_id, product_id, quantity) VALUES ($1, $2, $3)',
        [userId, productId, quantity]
      );
    }

    res.json({ message: 'Product added to cart successfully' });
  } catch (error) {
    console.error('Error adding product to cart:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Root route for the homepage

app.get('/', (req, res) => {
  res.redirect('/products');
});

// API endpoint for products
app.get('/api/products', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM products'); 
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching products:', err);
      res.status(500).json({ error: err.message }); // Send the error message back to the client for debugging purposes.
    }
  });

app.get('/admin/product_list', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'product_list.html'));
});
  
  // Add a new API endpoint for fetching product data
app.get('/api/product_list', async (req, res) => {
  try {
    const products = await pool.query('SELECT product_id, product_name, product_description, product_price FROM products');
    res.json(products.rows);
  } catch (error) {
    console.error('Error fetching product data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Protect the main admin route with authentication middleware
app.get('/admin/', (req, res) => {
  if (userIsAuthenticatedAndAuthorized(req)) {
      res.sendFile(path.join(__dirname, 'admin', 'admin.html'));
  } else {
      res.status(403).send('Access denied');
  }
});

app.post('/admin/adduser', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Optional: Add additional admin-level checks here, if necessary

    // Hash the user's password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the number of salt rounds

    // Insert the new user into the database with the hashed password
    const newUser = await pool.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *', [username, email, hashedPassword]);

    console.log("New user created by admin:", newUser.rows[0]); // Log the new user's data
    res.status(201).send(`User created with ID: ${newUser.rows[0].id}`);
  } catch (error) {
    console.error("Error in /admin/adduser route:", error);
    res.status(500).send('Server error');
  }
});

app.get('/images/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;
    // Assuming 'product_image' is the correct binary column containing the image
    const result = await pool.query('SELECT product_image FROM products WHERE product_id = $1', [productId]);
    
    if (result.rows.length > 0) {
      const imageBuffer = result.rows[0].product_image; // Directly use the binary data
      
      // Make sure to set the correct Content-Type for your image
      // This example assumes you're serving JPEG images
      res.writeHead(200, {
        'Content-Type': 'image/jpeg',
        'Content-Length': imageBuffer.length
      });
      res.end(imageBuffer);
    } else {
      res.status(404).send('Image not found');
    }
  } catch (err) {
    console.error('Error retrieving image:', err);
    res.status(500).send('Internal server error');
  }
});

app.delete('/api/cart/:username/delete/:productId', async (req, res) => {
  const { username, productId } = req.params;

  try {
    // Check if the product exists in the user's cart
    const cartItem = await pool.query(
      'SELECT * FROM shopping_cart WHERE user_id = (SELECT user_id FROM users WHERE username = $1) AND product_id = $2',
      [username, productId]
    );

    if (cartItem.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found in cart' });
    }

    // Delete the product from the user's cart
    await pool.query(
      'DELETE FROM shopping_cart WHERE user_id = (SELECT user_id FROM users WHERE username = $1) AND product_id = $2',
      [username, productId]
    );

    // Optionally, you can also delete the product from the products table if needed

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//  Retrieve product information from the 'products' table
app.get('/edit-product', async (req, res) => {
  try {
    const productId = req.query.id; // Retrieve the product ID from the query parameter
    // Fetch product data from the 'products' table based on productId
    const productQuery = `SELECT * FROM products WHERE product_id = $1`;
    const productResult = await pool.query(productQuery, [productId]);

    // 2. Retrieve specification information from the 'specifications' table for the corresponding product
    const specificationQuery = `SELECT * FROM specifications WHERE product_id = $1`;
    const specificationResult = await pool.query(specificationQuery, [productId]);

    // 3. Pass product and specification data to the 'edit-product.ejs' template
    const productData = productResult.rows[0]; // Assuming only one product is retrieved
    const specificationData = specificationResult.rows[0]; // Assuming only one specification is retrieved

    res.render('edit-product', { productData, specificationData });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/api/products', upload.single('productImage'), async (req, res) => {
  const { productName, productDescription, productPrice, productQuantity, processorFamily, processorModel, processorFrequency, processorCores, hddSize, ram, videoCardType, videoCard, videoCardMemory, ssdSize } = req.body;
  const productImageBuffer = req.file.buffer; // Access the uploaded image data

  try {
    // Insert the product details into the 'products' table
    const productInsertQuery = 'INSERT INTO products (product_name, product_description, product_price, product_quantity, product_image) VALUES ($1, $2, $3, $4, $5) RETURNING product_id';
    const productInsertValues = [productName, productDescription, productPrice, productQuantity, productImageBuffer];
    const productInsertResult = await pool.query(productInsertQuery, productInsertValues);
    
    // Get the newly inserted product's ID
    const productId = productInsertResult.rows[0].product_id;

    // Insert the product specifications into the 'specifications' table
    const specificationsInsertQuery = 'INSERT INTO specifications (product_id, processor_family, processor_model, processor_frequency, processor_cores, hdd_size, ram, video_card_type, video_card, video_card_memory, ssd_size) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)';
    const specificationsInsertValues = [productId, processorFamily, processorModel, processorFrequency, processorCores, hddSize, ram, videoCardType, videoCard, videoCardMemory, ssdSize];
    await pool.query(specificationsInsertQuery, specificationsInsertValues);

    res.status(201).json({ message: 'Product added successfully' });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/api/cart-item-count/:username', async (req, res) => {
  try {
    const { username } = req.params;

    // Fetch user ID based on username
    const userResult = await pool.query('SELECT user_id FROM users WHERE username = $1', [username]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const userId = userResult.rows[0].user_id;

    // Fetch and return the total quantity of items in the shopping cart for the user
    const cartItemCountResult = await pool.query(
      'SELECT SUM(quantity) AS item_count FROM shopping_cart WHERE user_id = $1', [userId]
    );

    const cartItemCount = cartItemCountResult.rows[0].item_count || 0;

    res.json({ itemCount: cartItemCount });
  } catch (error) {
    console.error('Error fetching cart item count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/api/cart/:username', async (req, res) => {
  try {
      const { username } = req.params;

      // Fetch user ID based on username
      const userResult = await pool.query('SELECT user_id FROM users WHERE username = $1', [username]);
      if (userResult.rows.length === 0) {
          return res.status(404).json({ error: 'User not found' });
      }
      const userId = userResult.rows[0].user_id;

      // Fetch shopping cart items for the user
      const cartItems = await pool.query(
          'SELECT * FROM shopping_cart WHERE user_id = $1', [userId]
      );

      res.json(cartItems.rows);
  } catch (error) {
      console.error('Error fetching shopping cart:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/products/:productId', async (req, res) => {
  try {
      const { productId } = req.params;
      const result = await pool.query('SELECT * FROM products WHERE product_id = $1', [productId]);
      if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Product not found' });
      }
      const product = result.rows[0];

      // Send back the product details, including image URL or image data
      res.json({
          product_id: product.product_id,
          product_name: product.product_name,
          product_image: product.product_image, // or the appropriate field for image
          product_price: product.product_price,
          // ... any other product details ...
      });
  } catch (err) {
      console.error('Error fetching product details:', err);
      res.status(500).json({ error: err.message });
  }
});

function isAdmin(req, res, next) {
  console.log('Current user:', req.session.username)
  if (req.session.username === 'admin') {
      next();
  } else {
      res.status(403).send('Access denied');
  }
}

app.get('/admin/users', isAdmin, async (req, res) => {
  res.sendFile(path.join(__dirname, '/admin/users.html'));
});

app.get('/admin/products', isAdmin, async (req, res) => {
  res.sendFile(path.join(__dirname, '/admin/products.html'));
});

app.get('/admin/products', isAdmin, async (req, res) => {
  res.sendFile(path.join(__dirname, '/admin/product_list.html'));
});

app.get('/api/users', async (req, res) => {
  try {
    // Execute the SQL query to fetch users from the database
    const result = await pool.query('SELECT * FROM users'); // Replace 'users' with your actual table name

    // Send the retrieved users as JSON response
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/admin/products', (req, res) => {
  const filePath = path.join(__dirname, 'admin', 'products.html');
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error('File does not exist:', err);
      res.status(404).send('File not found');
    } else {
      res.sendFile(filePath);
    }
  });
}); 

app.delete('/api/users/:userId', async (req, res) => {
  const userId = req.params.userId;
  
  try {
    // Check if the user exists in the database based on the user_id
    const user = await pool.query('SELECT * FROM users WHERE user_id = $1', [userId]);

    if (user.rows.length === 0) {
      // User not found, send a 404 response
      return res.status(404).json({ error: 'User not found' });
    }

    // If the user exists, delete it from the database
    await pool.query('DELETE FROM users WHERE user_id = $1', [userId]);

    // Send a 200 OK response to indicate successful deletion
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Define a route for deleting a product and its related specifications
app.delete('/api/products/:productId', async (req, res) => {
  const productId = req.params.productId;
  
  try {
      // Start a database transaction (if your database supports transactions)
      await pool.query('BEGIN');

      // Delete the product from the "products" table
      await pool.query('DELETE FROM products WHERE product_id = $1', [productId]);

      // Delete related entries in the "specifications" table based on the product ID
      await pool.query('DELETE FROM specifications WHERE product_id = $1', [productId]);

      // Commit the transaction (if your database supports transactions)
      await pool.query('COMMIT');

      // Send a 200 OK response to indicate successful deletion
      res.status(200).json({ message: 'Product and related specifications deleted successfully' });
  } catch (error) {
      // Rollback the transaction in case of an error (if your database supports transactions)
      await pool.query('ROLLBACK');
      console.error('Error deleting product:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/users/:userId', async (req, res) => {
  const userId = req.params.userId;
  const { username, email, password } = req.body;

  try {
    // Check if the user exists
    const existingUser = await pool.query('SELECT * FROM users WHERE user_id = $1', [userId]);

    if (existingUser.rows.length === 0) {
      // User not found
      return res.status(404).json({ error: 'User not found' });
    }

    // Prepare an array of field assignments for the SQL query
    const fieldAssignments = [];
    const fieldValues = [];

    // Check and update the username and email fields
    if (username) {
      fieldAssignments.push('username = $' + (fieldValues.length + 1));
      fieldValues.push(username);
    }
    if (email) {
      fieldAssignments.push('email = $' + (fieldValues.length + 1));
      fieldValues.push(email);
    }

    // Check if the password is provided and not empty
    if (password && password.trim() !== '') {
      fieldAssignments.push('password = $' + (fieldValues.length + 1));
      fieldValues.push(password);
    }

    // Add userId as the last parameter
    fieldValues.push(userId);

    // Update the user's data if there are valid field assignments
    if (fieldAssignments.length > 0) {
      // Construct the SQL query
      const query = 'UPDATE users SET ' + fieldAssignments.join(', ') + ' WHERE user_id = $' + fieldValues.length + ' RETURNING *';

      // Execute the SQL query
      const updatedUser = await pool.query(query, fieldValues);

      // User updated successfully
      res.status(200).json({ message: 'User updated successfully', user: updatedUser.rows[0] });
    } else {
      // No valid fields to update
      res.status(400).json({ error: 'No valid fields to update' });
    }
  } catch (error) {
    console.error('Error updating user:', error);

    // Log the error details
    console.error('Error details:', error.message);

    // Return a 500 Internal Server Error response
    res.status(500).json({ error: 'Internal server error' });
  }
});

  // Serve a products page
app.get('/products', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'products.html'));
  });

  app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
  });

  app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cart.html'));
  });
  
  
  app.get('/registration', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'registration.html'));
  });


  app.use((req, res, next) => {
    console.log('Request URL:', req.originalUrl); // This will log the URL of every request to the console
    next();
  });
    
// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Error handling middleware (optional but recommended)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

// Error handling middleware
app.use((err, req, res, next) => {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  if (err.status === 404) {
    res.send('404: The page you are looking for could not be found.');
  } else {
    res.send(`Error: ${res.locals.message}`);
  }
});

