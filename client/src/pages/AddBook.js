import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { booksAPI } from '../services/api';
import { BookOpen, ArrowLeft } from 'lucide-react';

const AddBook = () => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    total_copies: 1,
    published_year: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const bookData = {
        ...formData,
        total_copies: parseInt(formData.total_copies),
        published_year: formData.published_year ? parseInt(formData.published_year) : null
      };

      await booksAPI.create(bookData);
      alert('Book added successfully!');
      navigate('/books');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/books')}
            className="btn btn-secondary mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Books
          </button>
          
          <div className="card-header">
            <h1 className="card-title">Add New Book</h1>
            <div className="flex items-center">
              <BookOpen className="h-6 w-6 text-blue-600 mr-2" />
              <span className="text-sm text-gray-600">Librarian Access</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label htmlFor="title" className="form-label">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="form-input"
                placeholder="Enter book title"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="author" className="form-label">
                Author *
              </label>
              <input
                type="text"
                id="author"
                name="author"
                required
                className="form-input"
                placeholder="Enter author name"
                value={formData.author}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="isbn" className="form-label">
                ISBN *
              </label>
              <input
                type="text"
                id="isbn"
                name="isbn"
                required
                className="form-input"
                placeholder="Enter ISBN"
                value={formData.isbn}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="category" className="form-label">
                Category
              </label>
              <select
                id="category"
                name="category"
                className="form-input"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Select category</option>
                <option value="Fiction">Fiction</option>
                <option value="Non-Fiction">Non-Fiction</option>
                <option value="Science Fiction">Science Fiction</option>
                <option value="Mystery">Mystery</option>
                <option value="Romance">Romance</option>
                <option value="Biography">Biography</option>
                <option value="History">History</option>
                <option value="Science">Science</option>
                <option value="Technology">Technology</option>
                <option value="Philosophy">Philosophy</option>
                <option value="Religion">Religion</option>
                <option value="Children">Children</option>
                <option value="Reference">Reference</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="total_copies" className="form-label">
                Total Copies *
              </label>
              <input
                type="number"
                id="total_copies"
                name="total_copies"
                min="1"
                required
                className="form-input"
                placeholder="Enter number of copies"
                value={formData.total_copies}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="published_year" className="form-label">
                Published Year
              </label>
              <input
                type="number"
                id="published_year"
                name="published_year"
                min="1800"
                max={new Date().getFullYear()}
                className="form-input"
                placeholder="Enter published year"
                value={formData.published_year}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows="4"
              className="form-input"
              placeholder="Enter book description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={() => navigate('/books')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="spinner mr-2"></div>
                  Adding Book...
                </div>
              ) : (
                'Add Book'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBook;
