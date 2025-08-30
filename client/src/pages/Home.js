import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Users, Clock, TrendingUp } from 'lucide-react';
import api from '../services/api';

const Home = () => {
  const { user, isLibrarian } = useAuth();
  const [serverStatus, setServerStatus] = useState('checking');

  useEffect(() => {
    // Test server connection
    const testServer = async () => {
      try {
        await api.get('/test');
        setServerStatus('connected');
      } catch (error) {
        console.error('Server connection test failed:', error);
        setServerStatus('error');
      }
    };
    
    testServer();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to the Library Management System
        </h1>
        <p className="text-xl text-gray-600">
          Hello, {user?.username}! You are logged in as a {user?.role}.
        </p>
        <div className="mt-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            serverStatus === 'connected' ? 'bg-green-100 text-green-800' :
            serverStatus === 'error' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {serverStatus === 'connected' ? '✓ Server Connected' :
             serverStatus === 'error' ? '✗ Server Error' :
             '⏳ Checking Connection...'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card text-center">
          <div className="flex justify-center mb-4">
            <BookOpen className="h-12 w-12 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Browse Books</h3>
          <p className="text-gray-600 mb-4">
            Explore our collection of books and find your next read.
          </p>
          <Link to="/books" className="btn btn-primary">
            View Books
          </Link>
        </div>

        <div className="card text-center">
          <div className="flex justify-center mb-4">
            <Clock className="h-12 w-12 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">My Borrowings</h3>
          <p className="text-gray-600 mb-4">
            Check your borrowed books and return dates.
          </p>
          <Link to="/borrowings" className="btn btn-success">
            View Borrowings
          </Link>
        </div>

        {isLibrarian() && (
          <>
            <div className="card text-center">
              <div className="flex justify-center mb-4">
                <Users className="h-12 w-12 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Manage Books</h3>
              <p className="text-gray-600 mb-4">
                Add, edit, or remove books from the library.
              </p>
              <Link to="/add-book" className="btn btn-secondary">
                Add Book
              </Link>
            </div>

            <div className="card text-center">
              <div className="flex justify-center mb-4">
                <TrendingUp className="h-12 w-12 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Dashboard</h3>
              <p className="text-gray-600 mb-4">
                View library statistics and manage borrowings.
              </p>
              <Link to="/dashboard" className="btn btn-primary">
                View Dashboard
              </Link>
            </div>
          </>
        )}
      </div>

      <div className="card">
        <h2 className="text-2xl font-bold mb-4">Quick Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">For Borrowers</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Browse and search for available books</li>
              <li>• Borrow books for up to 14 days</li>
              <li>• View your borrowing history</li>
              <li>• Return books on time to avoid fines</li>
            </ul>
          </div>
          {isLibrarian() && (
            <div>
              <h3 className="text-lg font-semibold mb-2">For Librarians</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Add new books to the collection</li>
                <li>• Manage book inventory and availability</li>
                <li>• View all borrowing activities</li>
                <li>• Monitor overdue books and statistics</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
