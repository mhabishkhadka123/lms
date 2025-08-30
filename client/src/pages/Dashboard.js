import React, { useState, useEffect } from 'react';
import { dashboardAPI, borrowingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BarChart3, BookOpen, Users, Clock, AlertTriangle, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [allBorrowings, setAllBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, borrowingsResponse] = await Promise.all([
        dashboardAPI.getStats(),
        borrowingsAPI.getAllBorrowings()
      ]);
      setStats(statsResponse.data);
      setAllBorrowings(borrowingsResponse.data);
    } catch (error) {
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="loading">
          <div className="spinner"></div>
          <span className="ml-2">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="card-header">
        <h1 className="card-title">Librarian Dashboard</h1>
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          <span className="text-sm text-gray-600">Library Overview</span>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card text-center">
          <div className="flex justify-center mb-4">
            <BookOpen className="h-12 w-12 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {stats?.totalBooks || 0}
          </h3>
          <p className="text-gray-600">Total Books</p>
        </div>

        <div className="card text-center">
          <div className="flex justify-center mb-4">
            <Users className="h-12 w-12 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {stats?.totalUsers || 0}
          </h3>
          <p className="text-gray-600">Registered Users</p>
        </div>

        <div className="card text-center">
          <div className="flex justify-center mb-4">
            <Clock className="h-12 w-12 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {stats?.activeBorrowings || 0}
          </h3>
          <p className="text-gray-600">Active Borrowings</p>
        </div>

        <div className="card text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {stats?.overdueBooks || 0}
          </h3>
          <p className="text-gray-600">Overdue Books</p>
        </div>
      </div>

      {/* All Borrowings Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">All Borrowings</h2>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-600">
              {allBorrowings.length} total records
            </span>
          </div>
        </div>

        {allBorrowings.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No borrowings found
            </h3>
            <p className="text-gray-500">
              No books have been borrowed yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Book</th>
                  <th>Borrowed Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Returned Date</th>
                </tr>
              </thead>
              <tbody>
                {allBorrowings.map((borrowing) => (
                  <tr key={borrowing.id}>
                    <td className="font-medium">{borrowing.username}</td>
                    <td>
                      <div>
                        <div className="font-medium">{borrowing.title}</div>
                        <div className="text-sm text-gray-600">
                          by {borrowing.author}
                        </div>
                      </div>
                    </td>
                    <td>{formatDate(borrowing.borrowed_date)}</td>
                    <td>
                      <div className={`flex items-center space-x-2 ${
                        borrowing.status === 'borrowed' && isOverdue(borrowing.due_date)
                          ? 'text-red-600'
                          : ''
                      }`}>
                        <span>{formatDate(borrowing.due_date)}</span>
                        {borrowing.status === 'borrowed' && isOverdue(borrowing.due_date) && (
                          <AlertTriangle className="h-4 w-4" />
                        )}
                      </div>
                    </td>
                    <td>
                      {borrowing.status === 'borrowed' ? (
                        <span className="badge badge-warning">Borrowed</span>
                      ) : (
                        <span className="badge badge-success">Returned</span>
                      )}
                    </td>
                    <td>
                      {borrowing.returned_date ? (
                        formatDate(borrowing.returned_date)
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <a href="/add-book" className="btn btn-primary w-full">
              <BookOpen className="h-4 w-4 mr-2" />
              Add New Book
            </a>
            <a href="/books" className="btn btn-secondary w-full">
              Manage Books
            </a>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Database</span>
              <span className="badge badge-success">Online</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">API</span>
              <span className="badge badge-success">Active</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Overdue Books</span>
              <span className={`badge ${
                stats?.overdueBooks > 0 ? 'badge-danger' : 'badge-success'
              }`}>
                {stats?.overdueBooks || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
