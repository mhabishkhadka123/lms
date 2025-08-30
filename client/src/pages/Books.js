import React, { useState, useEffect } from 'react';
import { booksAPI, borrowingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Search, Plus, Edit, Trash2 } from 'lucide-react';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [borrowingBook, setBorrowingBook] = useState(null);
  const { isLibrarian } = useAuth();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await booksAPI.getAll();
      setBooks(response.data);
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('Error fetching books:', error);
      setError(error.message || 'Failed to fetch books. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = async (bookId) => {
    setBorrowingBook(bookId);
    try {
      await borrowingsAPI.borrow(bookId);
      // Refresh books to update availability
      fetchBooks();
      alert('Book borrowed successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to borrow book');
    } finally {
      setBorrowingBook(null);
    }
  };

  const handleDelete = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await booksAPI.delete(bookId);
        setBooks(books.filter(book => book.id !== bookId));
        alert('Book deleted successfully!');
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete book');
      }
    }
  };

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="loading">
          <div className="spinner"></div>
          <span className="ml-2">Loading books...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="card-header">
        <h1 className="card-title">Books</h1>
        {isLibrarian() && (
          <a href="/add-book" className="btn btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Book
          </a>
        )}
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search books by title, author, or category..."
            className="form-input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBooks.map((book) => (
          <div key={book.id} className="card">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 text-blue-600" />
                <span className="badge badge-info">{book.category}</span>
              </div>
              {isLibrarian() && (
                <div className="flex space-x-2">
                  <a
                    href={`/edit-book/${book.id}`}
                    className="btn btn-sm btn-secondary"
                  >
                    <Edit className="h-3 w-3" />
                  </a>
                  <button
                    onClick={() => handleDelete(book.id)}
                    className="btn btn-sm btn-danger"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>

            <h3 className="text-lg font-semibold mb-2">{book.title}</h3>
            <p className="text-gray-600 mb-2">by {book.author}</p>
            
            {book.description && (
              <p className="text-sm text-gray-500 mb-4 line-clamp-3">
                {book.description}
              </p>
            )}

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">ISBN:</span>
                <span className="font-mono">{book.isbn}</span>
              </div>
              {book.published_year && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Published:</span>
                  <span>{book.published_year}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Available:</span>
                <span className={book.available_copies > 0 ? 'text-green-600' : 'text-red-600'}>
                  {book.available_copies} of {book.total_copies}
                </span>
              </div>
            </div>

            {!isLibrarian() && (
              <button
                onClick={() => handleBorrow(book.id)}
                disabled={book.available_copies <= 0 || borrowingBook === book.id}
                className={`btn w-full ${
                  book.available_copies > 0 ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                {borrowingBook === book.id ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner mr-2"></div>
                    Borrowing...
                  </div>
                ) : book.available_copies > 0 ? (
                  'Borrow Book'
                ) : (
                  'Not Available'
                )}
              </button>
            )}
          </div>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-8">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            {searchTerm ? 'No books found' : 'No books available'}
          </h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'Check back later for new additions.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Books;
