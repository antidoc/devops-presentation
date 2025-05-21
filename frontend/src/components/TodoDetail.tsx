import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Todo, TodoUpdate } from '../types/Todo';
import { TodoApi } from '../api/TodoApi';
import './TodoDetail.css';

interface TodoDetailProps {
  onTodoUpdated: () => void;
}

const TodoDetail: React.FC<TodoDetailProps> = ({ onTodoUpdated }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [todo, setTodo] = useState<Todo | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTodo = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const todoId = parseInt(id, 10);
        const data = await TodoApi.getTodo(todoId);
        setTodo(data);
        setTitle(data.title);
        setDescription(data.description || '');
        setCompleted(data.completed);
        setError(null);
      } catch (err) {
        console.error('Error fetching todo:', err);
        setError('Failed to load todo. It might have been deleted or there was a server error.');
      } finally {
        setLoading(false);
      }
    };

    fetchTodo();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id || !title.trim()) {
      alert('Title is required');
      return;
    }

    const todoId = parseInt(id, 10);
    const updatedTodo: TodoUpdate = {
      title: title.trim(),
      description: description.trim() || undefined,
      completed
    };

    try {
      setSubmitting(true);
      await TodoApi.updateTodo(todoId, updatedTodo);
      onTodoUpdated();
      navigate('/');
    } catch (err) {
      console.error('Error updating todo:', err);
      alert('Failed to update todo. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading todo...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Back to List
        </button>
      </div>
    );
  }

  if (!todo) {
    return (
      <div className="error-container">
        <div className="error-message">Todo not found</div>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="todo-detail-container">
      <h2>Edit Todo</h2>
      <form onSubmit={handleSubmit} className="todo-form">
        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-container">
            <input
              type="checkbox"
              checked={completed}
              onChange={(e) => setCompleted(e.target.checked)}
            />
            <span className="checkmark"></span>
            Mark as completed
          </label>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TodoDetail;