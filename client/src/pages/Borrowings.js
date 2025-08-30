import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { borrowingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react';

const Borrowings = () => {
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [returningBook, setReturningBook] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchBorrowings();
  }, []);

  const fetchBorrowings = async () => {
    try {
      const response = await borrowingsAPI.getUserBorrowings();
      setBorrowings(response.data);
    } catch (error) {
      setError('Failed to fetch borrowings');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (bookId) => {
    setReturningBook(bookId);
    try {
      await borrowingsAPI.return(bookId);
      // Refresh borrowings
      fetchBorrowings();
      alert('Book returned successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to return book');
    } finally {
      setReturningBook(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const getDaysRemaining = (dueDate) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="loading">
          <div className="spinner"></div>
          <span className="ml-2">Loading borrowings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="card-header">
        <h1 className="card-title">My Borrowings</h1>
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-blue-600" />
          <span className="text-sm text-gray-600">Borrowing History</span>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {borrowings.length === 0 ? (
        <div className="card text-center py-8">
          <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No borrowings found
          </h3>
          <p className="text-gray-500 mb-4">
            You haven't borrowed any books yet.
          </p>
          <Link to="/books" className="btn btn-primary">
            Browse Books
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {borrowings.map((borrowing) => (
            <div key={borrowing.id} className="card">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold">{borrowing.title}</h3>
                    <span className="badge badge-info">{borrowing.isbn}</span>
                    {borrowing.status === 'borrowed' && (
                      <span className="badge badge-warning">Borrowed</span>
                    )}
                    {borrowing.status === 'returned' && (
                      <span className="badge badge-success">Returned</span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-2">by {borrowing.author}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>
                        <span className="text-gray-600">Borrowed:</span>{' '}
                        {formatDate(borrowing.borrowed_date)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>
                        <span className="text-gray-600">Due:</span>{' '}
                        {formatDate(borrowing.due_date)}
                      </span>
                    </div>
                    
                    {borrowing.returned_date && (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>
                          <span className="text-gray-600">Returned:</span>{' '}
                          {formatDate(borrowing.returned_date)}
                        </span>
                      </div>
                    )}
                  </div>

                  {borrowing.status === 'borrowed' && (
                    <div className="mt-3">
                      {isOverdue(borrowing.due_date) ? (
                        <div className="flex items-center space-x-2 text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          <span className="font-medium">
                            Overdue by {Math.abs(getDaysRemaining(borrowing.due_date))} days
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 text-green-600">
                          <Clock className="h-4 w-4" />
                          <span>
                            {getDaysRemaining(borrowing.due_date)} days remaining
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {borrowing.status === 'borrowed' && (
                  <button
                    onClick={() => handleReturn(borrowing.book_id)}
                    disabled={returningBook === borrowing.book_id}
                    className="btn btn-success"
                  >
                    {returningBook === borrowing.book_id ? (
                      <div className="flex items-center">
                        <div className="spinner mr-2"></div>
                        Returning...
                      </div>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Return Book
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Borrowings;
