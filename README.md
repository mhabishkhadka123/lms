# Library Management System

A comprehensive library management system built with React, Node.js, Express, and SQLite. The system supports both web and mobile interfaces with role-based access control for librarians and borrowers.

## Features

### 🔐 Authentication & Authorization
- User registration and login
- Role-based access control (Librarian/Borrower)
- JWT token-based authentication
- Secure password hashing with bcrypt

### 📚 Book Management
- Browse all available books
- Search and filter books
- View book details (title, author, ISBN, availability)
- Add new books (Librarian only)
- Edit book information (Librarian only)
- Delete books (Librarian only)

### 📖 Borrowing System
- Borrow books (up to 14 days)
- Return books
- View personal borrowing history
- Check due dates and overdue books
- View all borrowings (Librarian only)

### 📊 Dashboard & Analytics
- Library statistics overview
- Total books, users, and active borrowings
- Overdue books monitoring
- User activity tracking

### 📱 Multi-Platform Support
- **Web Application**: React-based responsive web interface
- **Mobile Application**: React Native mobile app with Expo

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Frontend (Web)
- **React** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

### Mobile
- **React Native** - Mobile framework
- **Expo** - Development platform
- **React Navigation** - Navigation
- **React Native Paper** - UI components

## Project Structure

```
library-management-system/
├── server.js              # Main server file
├── library.db             # SQLite database
├── package.json           # Server dependencies
├── start-app.bat          # Windows startup script
├── start-app.ps1          # PowerShell startup script
├── client/                # React web application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context
│   │   ├── services/      # API services
│   │   └── App.js         # Main app component
│   └── package.json
└── mobile/                # React Native mobile app
    ├── src/
    │   ├── screens/       # Screen components
    │   ├── context/       # React context
    │   ├── services/      # API services
    │   └── App.js         # Main app component
    └── package.json
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd library-management-system
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   cd ..
   
   # Install mobile dependencies (optional)
   cd mobile
   npm install
   cd ..
   ```

3. **Start the application**

   **Option 1: Using the startup script (Windows)**
   ```bash
   # Double-click start-app.bat or run:
   start-app.bat
   ```

   **Option 2: Using PowerShell script**
   ```bash
   powershell -ExecutionPolicy Bypass -File start-app.ps1
   ```

   **Option 3: Manual startup**
   ```bash
   # Terminal 1: Start backend server
   npm start
   
   # Terminal 2: Start React client
   cd client
   npm start
   ```

4. **Access the application**
   - Web Application: http://localhost:3000
   - Backend API: http://localhost:5000

### Mobile App Setup

1. **Install Expo CLI**
   ```bash
   npm install -g @expo/cli
   ```

2. **Start mobile development server**
   ```bash
   cd mobile
   npm start
   ```

3. **Run on device/simulator**
   - Install Expo Go app on your mobile device
   - Scan the QR code from the terminal
   - Or press 'a' for Android emulator or 'i' for iOS simulator

## Default Users

The system comes with a default librarian account:

- **Username**: `librarian`
- **Password**: `librarian123`
- **Role**: Librarian

You can register new borrower accounts through the web interface.

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login

### Books
- `GET /api/books` - Get all books
- `GET /api/books/:id` - Get book by ID
- `POST /api/books` - Add new book (Librarian only)
- `PUT /api/books/:id` - Update book (Librarian only)
- `DELETE /api/books/:id` - Delete book (Librarian only)

### Borrowings
- `POST /api/borrow` - Borrow a book
- `POST /api/return` - Return a book
- `GET /api/borrowings` - Get user's borrowings
- `GET /api/all-borrowings` - Get all borrowings (Librarian only)

### Dashboard
- `GET /api/dashboard-stats` - Get library statistics (Librarian only)

## Database Schema

### Users Table
- `id` (Primary Key)
- `username` (Unique)
- `email` (Unique)
- `password` (Hashed)
- `role` (librarian/borrower)
- `created_at`

### Books Table
- `id` (Primary Key)
- `title`
- `author`
- `isbn` (Unique)
- `category`
- `total_copies`
- `available_copies`
- `published_year`
- `description`
- `created_at`

### Borrowings Table
- `id` (Primary Key)
- `user_id` (Foreign Key)
- `book_id` (Foreign Key)
- `borrowed_date`
- `due_date`
- `returned_date`
- `status` (borrowed/returned)

## Security Features

- **Password Hashing**: All passwords are hashed using bcrypt
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Server-side validation using express-validator
- **CORS Protection**: Configured CORS for secure cross-origin requests
- **SQL Injection Prevention**: Parameterized queries with SQLite

## Troubleshooting

### Common Issues

1. **Port 5000 already in use**
   ```bash
   # Kill process using port 5000
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   ```

2. **Port 3000 already in use**
   ```bash
   # Kill process using port 3000
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

3. **Database connection issues**
   - Ensure `library.db` file exists in the root directory
   - Check file permissions

4. **Mobile app connection issues**
   - Update the IP address in `mobile/src/services/api.js` to match your local network
   - Ensure both devices are on the same network

### Error Messages

- **"Server connection test failed"**: Backend server is not running
- **"Network Error"**: Check if the server is running on port 5000
- **"Invalid credentials"**: Check username/password combination

## Development

### Adding New Features

1. **Backend**: Add new routes in `server.js`
2. **Frontend**: Create new components in `client/src/`
3. **Mobile**: Add new screens in `mobile/src/screens/`

### Database Changes

1. Modify the database schema in `server.js`
2. Update the initialization queries
3. Test with existing data

## Deployment

### Production Setup

1. **Set environment variables**
   ```bash
   NODE_ENV=production
   JWT_SECRET=your-secret-key
   PORT=5000
   # Comma-separated list of allowed origins for CORS in production
   CORS_ORIGINS=https://kabya.com,https://www.kabya.com,https://app.kabya.com,https://api.kabya.com
   ```

2. **Build the React app**
   ```bash
   cd client
   npm run build
   cd ..
   ```

3. **Start production server**
   ```bash
   npm start
   ```

### Cloud Deployment (Recommended)

- Web Frontend: Deploy `client/` to Vercel or Netlify.
  - Set env `REACT_APP_API_URL` to your backend URL, e.g. `https://api.kabya.com/api`.
  - Build command: `npm run build`; Output directory: `client/build` (Vercel: use monorepo config, set root to `client`).

- Backend API: Deploy the root `server.js` to Render (Web Service, Node).
  - Start command: `node server.js`
  - Environment: set `NODE_ENV=production`, `JWT_SECRET=<secure>`, and `CORS_ORIGINS` to include your frontend origins.
  - Persistent DB: Current project uses SQLite file `library.db`. For stateless cloud, prefer a managed DB. If migrating to MongoDB, create a cluster and set `MONGODB_URI` and update code accordingly.

### Domain & DNS for kabya.com

- Point `kabya.com` and `www.kabya.com` to Vercel/Netlify site.
- Create subdomain `api.kabya.com` as a CNAME to the Render service URL.
- Ensure `CORS_ORIGINS` contains your exact frontend origins.

### Mobile (Expo) Production

- Set `EXPO_PUBLIC_API_URL=https://api.kabya.com/api` in Expo project before publishing.
- Publish: `cd mobile && npx expo publish` to get a public URL and QR code.

### GitHub Repository

1. Create a new GitHub repo (public).
2. Push code:
   ```bash
   git init
   git branch -M main
   git add .
   git commit -m "Initial commit: web, mobile, backend"
   git remote add origin https://github.com/<your-username>/<repo>.git
   git push -u origin main
   ```

### Environment Examples

Create `.env` at project root:
```
NODE_ENV=production
JWT_SECRET=replace-me
# Render will provide PORT; locally you can set PORT=5000
CORS_ORIGINS=https://kabya.com,https://www.kabya.com,https://app.kabya.com,https://api.kabya.com
```

Frontend `.env` in `client/`:
```
REACT_APP_API_URL=https://api.kabya.com/api
```

Mobile (Expo) env:
```
EXPO_PUBLIC_API_URL=https://api.kabya.com/api
```

## License

This project is licensed under the MIT License.

## Author

Library Management System - A comprehensive solution for modern library management.

---

**Note**: This system is designed for educational and demonstration purposes. For production use, additional security measures and error handling should be implemented.
