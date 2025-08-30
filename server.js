const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Configure CORS to allow configurable origins via env (comma-separated)
const configuredCorsOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const defaultDevOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:19006',
  'http://192.168.100.173:19006'
];

// In production, prefer explicit allowlist. If none provided, allow kabya.com and subdomains by default.
const productionFallbackOrigins = [
  'https://kabya.com',
  'https://www.kabya.com',
  'https://app.kabya.com',
  'https://api.kabya.com'
];

const allowedOrigins = configuredCorsOrigins.length
  ? configuredCorsOrigins
  : (process.env.NODE_ENV === 'production' ? productionFallbackOrigins : defaultDevOrigins);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    const isExplicit = allowedOrigins.includes(origin);
    const isKabyaSubdomain = /(^https?:\/\/)([a-z0-9-]+\.)*kabya\.com(?::\d+)?$/i.test(origin);
    const isVercelPreview = /vercel\.app$/i.test(origin);
    const isNetlifyPreview = /netlify\.app$/i.test(origin);
    if (isExplicit || isKabyaSubdomain || isVercelPreview || isNetlifyPreview) {
      return callback(null, true);
    }
    return callback(new Error('CORS not allowed from this origin'));
  },
  credentials: true
}));
app.use(express.json());

// Serve static files from React build directory in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
}

// Database setup
const db = new sqlite3.Database('./library.db');

// Initialize database tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'borrower',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Books table
  db.run(`CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    isbn TEXT UNIQUE,
    category TEXT,
    total_copies INTEGER DEFAULT 1,
    available_copies INTEGER DEFAULT 1,
    published_year INTEGER,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Borrowings table
  db.run(`CREATE TABLE IF NOT EXISTS borrowings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    book_id INTEGER NOT NULL,
    borrowed_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    due_date DATETIME NOT NULL,
    returned_date DATETIME,
    status TEXT DEFAULT 'borrowed',
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (book_id) REFERENCES books (id)
  )`);

  // Insert default librarian
  const defaultLibrarian = {
    username: 'librarian',
    email: 'librarian@library.com',
    password: bcrypt.hashSync('librarian123', 10),
    role: 'librarian'
  };

  db.get("SELECT * FROM users WHERE username = ?", [defaultLibrarian.username], (err, row) => {
    if (err) {
      console.error('Error checking for default librarian:', err);
    } else if (!row) {
      console.log('Creating default librarian user...');
      db.run("INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
        [defaultLibrarian.username, defaultLibrarian.email, defaultLibrarian.password, defaultLibrarian.role],
        function(err) {
          if (err) {
            console.error('Error creating default librarian:', err);
          } else {
            console.log('Default librarian created successfully');
          }
        });
    } else {
      console.log('Default librarian already exists');
    }
  });

  // Insert sample books
  const sampleBooks = [
    {
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      isbn: '978-0743273565',
      category: 'Fiction',
      total_copies: 3,
      available_copies: 3,
      published_year: 1925,
      description: 'A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.'
    },
    {
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      isbn: '978-0446310789',
      category: 'Fiction',
      total_copies: 2,
      available_copies: 2,
      published_year: 1960,
      description: 'The story of young Scout Finch and her father Atticus in a racially divided Alabama town.'
    },
    {
      title: '1984',
      author: 'George Orwell',
      isbn: '978-0451524935',
      category: 'Science Fiction',
      total_copies: 4,
      available_copies: 4,
      published_year: 1949,
      description: 'A dystopian novel about totalitarianism and surveillance society.'
    }
  ];

  sampleBooks.forEach(book => {
    db.get("SELECT * FROM books WHERE isbn = ?", [book.isbn], (err, row) => {
      if (!row) {
        db.run(`INSERT INTO books (title, author, isbn, category, total_copies, available_copies, published_year, description) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [book.title, book.author, book.isbn, book.category, book.total_copies, book.available_copies, book.published_year, book.description]);
      }
    });
  });
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Middleware to check if user is librarian
const requireLibrarian = (req, res, next) => {
  if (req.user.role !== 'librarian') {
    return res.status(403).json({ message: 'Librarian access required' });
  }
  next();
};

// Routes

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// User Registration
app.post('/api/register', [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  db.run("INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, 'borrower')",
    [username, email, hashedPassword],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ message: 'Username or email already exists' });
        }
        return res.status(500).json({ message: 'Registration failed' });
      }
      res.status(201).json({ message: 'User registered successfully', userId: this.lastID });
    });
});

// User Login
app.post('/api/login', (req, res) => {
  console.log('Login request received:', req.body);
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (err) {
      console.error('Database error during login:', err);
      return res.status(500).json({ message: 'Login failed' });
    }
    if (!user) {
      console.log('User not found:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('User found:', { id: user.id, username: user.username, role: user.role });
    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      console.log('Invalid password for user:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful for user:', username);
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  });
});

// Get all books
app.get('/api/books', (req, res) => {
  db.all("SELECT * FROM books ORDER BY title", (err, books) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch books' });
    }
    res.json(books);
  });
});

// Get single book
app.get('/api/books/:id', (req, res) => {
  db.get("SELECT * FROM books WHERE id = ?", [req.params.id], (err, book) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch book' });
    }
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  });
});

// Add new book (librarian only)
app.post('/api/books', authenticateToken, requireLibrarian, [
  body('title').notEmpty().withMessage('Title is required'),
  body('author').notEmpty().withMessage('Author is required'),
  body('isbn').notEmpty().withMessage('ISBN is required'),
  body('total_copies').isInt({ min: 1 }).withMessage('Total copies must be at least 1')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, author, isbn, category, total_copies, published_year, description } = req.body;

  db.run(`INSERT INTO books (title, author, isbn, category, total_copies, available_copies, published_year, description) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, author, isbn, category, total_copies, total_copies, published_year, description],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ message: 'Book with this ISBN already exists' });
        }
        return res.status(500).json({ message: 'Failed to add book' });
      }
      res.status(201).json({ message: 'Book added successfully', bookId: this.lastID });
    });
});

// Update book (librarian only)
app.put('/api/books/:id', authenticateToken, requireLibrarian, (req, res) => {
  const { title, author, isbn, category, total_copies, published_year, description } = req.body;
  const bookId = req.params.id;

  db.run(`UPDATE books SET title = ?, author = ?, isbn = ?, category = ?, total_copies = ?, 
          published_year = ?, description = ? WHERE id = ?`,
    [title, author, isbn, category, total_copies, published_year, description, bookId],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Failed to update book' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Book not found' });
      }
      res.json({ message: 'Book updated successfully' });
    });
});

// Delete book (librarian only)
app.delete('/api/books/:id', authenticateToken, requireLibrarian, (req, res) => {
  db.run("DELETE FROM books WHERE id = ?", [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Failed to delete book' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json({ message: 'Book deleted successfully' });
  });
});

// Borrow book
app.post('/api/borrow', authenticateToken, [
  body('bookId').isInt().withMessage('Valid book ID required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { bookId } = req.body;
  const userId = req.user.id;

  // Check if book is available
  db.get("SELECT * FROM books WHERE id = ?", [bookId], (err, book) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to process borrowing' });
    }
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    if (book.available_copies <= 0) {
      return res.status(400).json({ message: 'Book is not available for borrowing' });
    }

    // Check if user already borrowed this book
    db.get("SELECT * FROM borrowings WHERE user_id = ? AND book_id = ? AND status = 'borrowed'", 
      [userId, bookId], (err, existingBorrowing) => {
        if (err) {
          return res.status(500).json({ message: 'Failed to process borrowing' });
        }
        if (existingBorrowing) {
          return res.status(400).json({ message: 'You have already borrowed this book' });
        }

        // Calculate due date (14 days from now)
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14);

        // Create borrowing record
        db.run("INSERT INTO borrowings (user_id, book_id, due_date) VALUES (?, ?, ?)",
          [userId, bookId, dueDate.toISOString()], function(err) {
            if (err) {
              return res.status(500).json({ message: 'Failed to process borrowing' });
            }

            // Update available copies
            db.run("UPDATE books SET available_copies = available_copies - 1 WHERE id = ?",
              [bookId], (err) => {
                if (err) {
                  return res.status(500).json({ message: 'Failed to update book availability' });
                }
                res.status(201).json({ 
                  message: 'Book borrowed successfully',
                  dueDate: dueDate.toISOString()
                });
              });
          });
      });
  });
});

// Return book
app.post('/api/return', authenticateToken, [
  body('bookId').isInt().withMessage('Valid book ID required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { bookId } = req.body;
  const userId = req.user.id;

  // Check if user has borrowed this book
  db.get("SELECT * FROM borrowings WHERE user_id = ? AND book_id = ? AND status = 'borrowed'",
    [userId, bookId], (err, borrowing) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to process return' });
      }
      if (!borrowing) {
        return res.status(400).json({ message: 'You have not borrowed this book' });
      }

      // Update borrowing status
      db.run("UPDATE borrowings SET returned_date = CURRENT_TIMESTAMP, status = 'returned' WHERE id = ?",
        [borrowing.id], function(err) {
          if (err) {
            return res.status(500).json({ message: 'Failed to process return' });
          }

          // Update available copies
          db.run("UPDATE books SET available_copies = available_copies + 1 WHERE id = ?",
            [bookId], (err) => {
              if (err) {
                return res.status(500).json({ message: 'Failed to update book availability' });
              }
              res.json({ message: 'Book returned successfully' });
            });
        });
    });
});

// Get user's borrowings
app.get('/api/borrowings', authenticateToken, (req, res) => {
  const userId = req.user.id;
  
  db.all(`SELECT b.*, bk.title, bk.author, bk.isbn 
          FROM borrowings b 
          JOIN books bk ON b.book_id = bk.id 
          WHERE b.user_id = ? 
          ORDER BY b.borrowed_date DESC`, [userId], (err, borrowings) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch borrowings' });
    }
    res.json(borrowings);
  });
});

// Get all borrowings (librarian only)
app.get('/api/all-borrowings', authenticateToken, requireLibrarian, (req, res) => {
  db.all(`SELECT b.*, u.username, bk.title, bk.author 
          FROM borrowings b 
          JOIN users u ON b.user_id = u.id 
          JOIN books bk ON b.book_id = bk.id 
          ORDER BY b.borrowed_date DESC`, (err, borrowings) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch borrowings' });
    }
    res.json(borrowings);
  });
});

// Dashboard stats (librarian only)
app.get('/api/dashboard-stats', authenticateToken, requireLibrarian, (req, res) => {
  const stats = {};
  
  // Total books
  db.get("SELECT COUNT(*) as count FROM books", (err, result) => {
    if (err) return res.status(500).json({ message: 'Failed to fetch stats' });
    stats.totalBooks = result.count;
    
    // Total users
    db.get("SELECT COUNT(*) as count FROM users WHERE role = 'borrower'", (err, result) => {
      if (err) return res.status(500).json({ message: 'Failed to fetch stats' });
      stats.totalUsers = result.count;
      
      // Active borrowings
      db.get("SELECT COUNT(*) as count FROM borrowings WHERE status = 'borrowed'", (err, result) => {
        if (err) return res.status(500).json({ message: 'Failed to fetch stats' });
        stats.activeBorrowings = result.count;
        
        // Overdue books
        db.get("SELECT COUNT(*) as count FROM borrowings WHERE status = 'borrowed' AND due_date < CURRENT_TIMESTAMP", (err, result) => {
          if (err) return res.status(500).json({ message: 'Failed to fetch stats' });
          stats.overdueBooks = result.count;
          
          res.json(stats);
        });
      });
    });
  });
});

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
