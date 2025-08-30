# Library Mobile App

A React Native mobile application for the Library Management System, designed for borrowers to browse and borrow books.

## Features

### Borrower Interface
- **Home Screen**: Lists all available books with search functionality to filter by title or author
- **Book Details Screen**: Displays comprehensive book information with a "Borrow" button (disabled if no copies are available)
- **Profile Screen**: Shows user information (name, email, role) without edit functionality to keep the app simple
- **Borrowings Screen**: Displays user's borrowed books with return functionality

### Navigation
- Uses stack and tab navigators for seamless navigation between screens
- Bottom tab navigation for main screens (Books, My Books, Profile)
- Stack navigation for detailed views (Book Details)

### API Integration
- Connects to the backend APIs using Axios for data fetching
- Secure token-based authentication
- Real-time data synchronization

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Expo Go app on your mobile device (for testing)

## Installation

1. **Navigate to the mobile directory:**
   ```bash
   cd mobile
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Run on your device:**
   - Install Expo Go on your mobile device
   - Scan the QR code displayed in the terminal or browser
   - The app will load on your device

## Configuration

### API Configuration
Update the API base URL in `src/services/api.js` if your backend server is running on a different port or host:

```javascript
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Change this to your server URL
  // ...
});
```

### Backend Server
Make sure your backend server is running on port 5000 before testing the mobile app.

## Usage

### Login
- Use the demo credentials provided on the login screen:
  - Username: `librarian`
  - Password: `librarian123`
- Or create a new borrower account through the web interface

### Browsing Books
- The home screen displays all available books
- Use the search bar to filter books by title or author
- Tap "View Details" to see more information about a book

### Borrowing Books
- Navigate to book details
- Tap "Borrow Book" if copies are available
- Confirm the borrowing action
- The book will be added to your borrowings

### Managing Borrowings
- Go to the "My Books" tab to see your borrowed books
- View due dates and return status
- Tap "Return Book" to return a borrowed book

### Profile
- View your account information
- See your role and member status
- Logout from the app

## Project Structure

```
mobile/
├── App.js                 # Main app component with navigation
├── app.json              # Expo configuration
├── babel.config.js       # Babel configuration
├── package.json          # Dependencies and scripts
├── src/
│   ├── context/
│   │   └── AuthContext.js # Authentication context
│   ├── screens/
│   │   ├── LoginScreen.js
│   │   ├── HomeScreen.js
│   │   ├── BookDetailsScreen.js
│   │   ├── ProfileScreen.js
│   │   └── BorrowingsScreen.js
│   └── services/
│       └── api.js        # API service configuration
└── README.md
```

## Development

### Adding New Features
1. Create new screen components in `src/screens/`
2. Add navigation routes in `App.js`
3. Update the API service if needed
4. Test thoroughly on both iOS and Android

### Styling
- Uses React Native Paper for Material Design components
- Custom styles defined in each component
- Consistent color scheme and typography

### State Management
- Uses React Context for authentication state
- Local state for component-specific data
- API calls for data fetching and updates

## Troubleshooting

### Common Issues

1. **App won't load:**
   - Check if the backend server is running
   - Verify the API URL in `src/services/api.js`
   - Ensure you have a stable internet connection

2. **Login fails:**
   - Verify the username and password
   - Check if the backend server is accessible
   - Clear app data and try again

3. **Books not loading:**
   - Check the backend server status
   - Verify the API endpoints
   - Check network connectivity

### Debug Mode
- Shake your device to open the developer menu
- Enable remote debugging for better error messages
- Check the console for detailed error logs

## Contributing

This mobile app is designed to be simple and beginner-friendly. When contributing:

1. Keep the UI simple and intuitive
2. Focus on core functionality (browsing and borrowing)
3. Maintain consistent styling
4. Test on both iOS and Android devices
5. Follow React Native best practices

## License

This project is part of the Library Management System and follows the same license terms.
