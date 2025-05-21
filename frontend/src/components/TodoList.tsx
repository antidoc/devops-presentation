import React from 'react';
import { Todo } from '../types/Todo';
import { TodoApi } from '../api/TodoApi';
import { Link } from 'react-router-dom';
import './TodoList.css';

interface TodoListProps {
  todos: Todo[];
  loading: boolean;
  onTodoUpdated: () => void;
}

const TodoList: React.FC<TodoListProps> = ({ todos, loading, onTodoUpdated }) => {
  const handleToggleComplete = async (todo: Todo) => {
    try {
      await TodoApi.updateTodo(todo.id, {
        completed: !todo.completed
      });
      onTodoUpdated();
    } catch (err) {
      console.error('Error updating todo:', err);
      alert('Failed to update todo. Please try again.');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      try {
        await TodoApi.deleteTodo(id);
        onTodoUpdated();
      } catch (err) {
        console.error('Error deleting todo:', err);
        alert('Failed to delete todo. Please try again.');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading todos...</div>;
  }

  if (todos.length === 0) {
    return <div className="empty-list">No todos found. Add one!</div>;
  }

  return (
    <div className="todo-list">
      <h2>Your Todos</h2>
      <ul>
        {todos.map(todo => (
          <li key={todo.id} className={todo.completed ? 'completed' : ''}>
            <div className="todo-header">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggleComplete(todo)}
                />
                <span className="checkmark"></span>
              </label>
              <Link to={`/todo/${todo.id}`} className="todo-title">
                {todo.title}
              </Link>
            </div>
            {todo.description && <p className="todo-description">{todo.description}</p>}
            <div className="todo-actions">
              <Link to={`/todo/${todo.id}`} className="btn btn-edit">Edit</Link>
              <button
                className="btn btn-delete"
                onClick={() => handleDelete(todo.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;