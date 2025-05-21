import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TodoCreate } from '../types/Todo';
import { TodoApi } from '../api/TodoApi';
import './TodoForm.css';

interface TodoFormProps {
  onTodoCreated: () => void;
}

const TodoForm: React.FC<TodoFormProps> = ({ onTodoCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Title is required');
      return;
    }

    const newTodo: TodoCreate = {
      title: title.trim(),
      description: description.trim() || undefined,
      completed: false
    };

    try {
      setSubmitting(true);
      await TodoApi.createTodo(newTodo);
      onTodoCreated();
      navigate('/');
    } catch (err) {
      console.error('Error creating todo:', err);
      alert('Failed to create todo. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="todo-form-container">
      <h2>Add New Todo</h2>
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
            {submitting ? 'Adding...' : 'Add Todo'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TodoForm;