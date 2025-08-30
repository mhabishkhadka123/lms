const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');
const { body, validationResult } = require('express-validator');
const connectDB = require('./config/database');

// Import models
const User = require('./models/User');
const Book = require('./models/Book');
const Borrowing = require('./models/Borrowing');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

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

// In production, prefer explicit allowlist. If none provided, allow common frontend domains
const productionFallbackOrigins = [
  'https://kabya.com',
  'https://www.kabya.com',
  'https://app.kabya.com',
  'https://api.kabya.com',
  'https://lms-backend-czla.onrender.com',
  'https://*.vercel.app',
  'https://*.netlify.app',
  'https://*.onrender.com'
];

const allowedOrigins = configuredCorsOrigins.length
  ? configuredCorsOrigins
  : (process.env.NODE_ENV === 'production' ? productionFallbackOrigins : defaultDevOrigins);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    
    // Allow all origins in development
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    const isExplicit = allowedOrigins.includes(origin);
    const isKabyaSubdomain = /(^https?:\/\/)([a-z0-9-]+\.)*kabya\.com(?::\d+)?$/i.test(origin);
    const isVercelPreview = /vercel\.app$/i.test(origin);
    const isNetlifyPreview = /netlify\.app$/i.test(origin);
    const isRenderPreview = /onrender\.com$/i.test(origin);
    
    if (isExplicit || isKabyaSubdomain || isVercelPreview || isNetlifyPreview || isRenderPreview) {
      return callback(null, true);
    }
    
    console.log('CORS blocked origin:', origin);
    return callback(new Error('CORS not allowed from this origin'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Serve static files from React build directory in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
}

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

// Initialize default data
const initializeData = async () => {
  try {
    // Check if default librarian exists
    const existingLibrarian = await User.findOne({ username: 'librarian' });
    if (!existingLibrarian) {
      const defaultLibrarian = new User({
        username: 'librarian',
        email: 'librarian@library.com',
        password: 'librarian123',
        role: 'librarian'
      });
      await defaultLibrarian.save();
      console.log('Default librarian created successfully');
    }

    // Check if sample books exist
    const bookCount = await Book.countDocuments();
    if (bookCount === 0) {
      const sampleBooks = [
        {
          title: 'The Great Gatsby',
          author: 'F. Scott Fitzgerald',
          isbn: '978-0743273565',
          category: 'Fiction',
          totalCopies: 3,
          availableCopies: 3,
          publishedYear: 1925,
          description: 'A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.'
        },
        {
          title: 'To Kill a Mockingbird',
          author: 'Harper Lee',
          isbn: '978-0446310789',
          category: 'Fiction',
          totalCopies: 2,
          availableCopies: 2,
          publishedYear: 1960,
          description: 'The story of young Scout Finch and her father Atticus in a racially divided Alabama town.'
        },
        {
          title: '1984',
          author: 'George Orwell',
          isbn: '978-0451524935',
          category: 'Science Fiction',
          totalCopies: 4,
          availableCopies: 4,
          publishedYear: 1949,
          description: 'A dystopian novel about totalitarianism and surveillance society.'
        }
      ];

      await Book.insertMany(sampleBooks);
      console.log('Sample books created successfully');
    }
  } catch (error) {
    console.error('Error initializing data:', error);
  }
};

// Initialize data when server starts
initializeData();

// Routes

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running with MongoDB!' });
});

// User Registration
app.post('/api/register', [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    const user = new User({
      username,
      email,
      password,
      role: 'borrower'
    });

    await user.save();
    res.status(201).json({ message: 'User registered successfully', userId: user._id });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// User Login
app.post('/api/login', async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      console.log('User not found:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('User found:', { id: user._id, username: user.username, role: user.role });
    const validPassword = await user.comparePassword(password);
    if (!validPassword) {
      console.log('Invalid password for user:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful for user:', username);
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Get all books
app.get('/api/books', async (req, res) => {
  try {
    const books = await Book.find().sort({ title: 1 });
    res.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ message: 'Failed to fetch books' });
  }
});

// Get single book
app.get('/api/books/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ message: 'Failed to fetch book' });
  }
});

// Add new book (librarian only)
app.post('/api/books', authenticateToken, requireLibrarian, [
  body('title').notEmpty().withMessage('Title is required'),
  body('author').notEmpty().withMessage('Author is required'),
  body('isbn').notEmpty().withMessage('ISBN is required'),
  body('totalCopies').isInt({ min: 1 }).withMessage('Total copies must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, author, isbn, category, totalCopies, publishedYear, description } = req.body;

    // Check if book with ISBN already exists
    const existingBook = await Book.findOne({ isbn });
    if (existingBook) {
      return res.status(400).json({ message: 'Book with this ISBN already exists' });
    }

    const book = new Book({
      title,
      author,
      isbn,
      category,
      totalCopies,
      availableCopies: totalCopies,
      publishedYear,
      description
    });

    await book.save();
    res.status(201).json({ message: 'Book added successfully', bookId: book._id });
  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).json({ message: 'Failed to add book' });
  }
});

// Update book (librarian only)
app.put('/api/books/:id', authenticateToken, requireLibrarian, async (req, res) => {
  try {
    const { title, author, isbn, category, totalCopies, publishedYear, description } = req.body;
    const bookId = req.params.id;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Update book fields
    Object.assign(book, {
      title,
      author,
      isbn,
      category,
      totalCopies,
      publishedYear,
      description
    });

    await book.save();
    res.json({ message: 'Book updated successfully' });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ message: 'Failed to update book' });
  }
});

// Delete book (librarian only)
app.delete('/api/books/:id', authenticateToken, requireLibrarian, async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ message: 'Failed to delete book' });
  }
});

// Borrow book
app.post('/api/borrow', authenticateToken, [
  body('bookId').isMongoId().withMessage('Valid book ID required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { bookId } = req.body;
    const userId = req.user.id;

    // Check if book is available
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    if (book.availableCopies <= 0) {
      return res.status(400).json({ message: 'Book is not available for borrowing' });
    }

    // Check if user already borrowed this book
    const existingBorrowing = await Borrowing.findOne({
      userId,
      bookId,
      status: { $in: ['borrowed', 'overdue'] }
    });

    if (existingBorrowing) {
      return res.status(400).json({ message: 'You have already borrowed this book' });
    }

    // Calculate due date (14 days from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    // Create borrowing record
    const borrowing = new Borrowing({
      userId,
      bookId,
      dueDate
    });

    await borrowing.save();

    // Update available copies
    book.availableCopies -= 1;
    await book.save();

    res.status(201).json({
      message: 'Book borrowed successfully',
      dueDate: dueDate.toISOString()
    });
  } catch (error) {
    console.error('Error borrowing book:', error);
    res.status(500).json({ message: 'Failed to process borrowing' });
  }
});

// Return book
app.post('/api/return', authenticateToken, [
  body('bookId').isMongoId().withMessage('Valid book ID required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { bookId } = req.body;
    const userId = req.user.id;

    // Check if user has borrowed this book
    const borrowing = await Borrowing.findOne({
      userId,
      bookId,
      status: { $in: ['borrowed', 'overdue'] }
    });

    if (!borrowing) {
      return res.status(400).json({ message: 'You have not borrowed this book' });
    }

    // Update borrowing status
    borrowing.returnBook();
    await borrowing.save();

    // Update available copies
    const book = await Book.findById(bookId);
    if (book) {
      book.availableCopies += 1;
      await book.save();
    }

    res.json({ message: 'Book returned successfully' });
  } catch (error) {
    console.error('Error returning book:', error);
    res.status(500).json({ message: 'Failed to process return' });
  }
});

// Get user's borrowings
app.get('/api/borrowings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const borrowings = await Borrowing.find({ userId })
      .populate('bookId', 'title author isbn')
      .sort({ borrowedDate: -1 });

    res.json(borrowings);
  } catch (error) {
    console.error('Error fetching borrowings:', error);
    res.status(500).json({ message: 'Failed to fetch borrowings' });
  }
});

// Get all borrowings (librarian only)
app.get('/api/all-borrowings', authenticateToken, requireLibrarian, async (req, res) => {
  try {
    const borrowings = await Borrowing.find()
      .populate('userId', 'username')
      .populate('bookId', 'title author')
      .sort({ borrowedDate: -1 });

    res.json(borrowings);
  } catch (error) {
    console.error('Error fetching all borrowings:', error);
    res.status(500).json({ message: 'Failed to fetch borrowings' });
  }
});

// Dashboard stats (librarian only)
app.get('/api/dashboard-stats', authenticateToken, requireLibrarian, async (req, res) => {
  try {
    const stats = {};
    
    // Total books
    stats.totalBooks = await Book.countDocuments();
    
    // Total users (borrowers only)
    stats.totalUsers = await User.countDocuments({ role: 'borrower' });
    
    // Active borrowings
    stats.activeBorrowings = await Borrowing.countDocuments({ 
      status: { $in: ['borrowed', 'overdue'] } 
    });
    
    // Overdue books
    stats.overdueBooks = await Borrowing.countDocuments({ 
      status: { $in: ['borrowed', 'overdue'] },
      dueDate: { $lt: new Date() }
    });
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} with MongoDB`);
});
