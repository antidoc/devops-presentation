import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Todo } from './types/Todo';
import { TodoApi } from './api/TodoApi';
import TodoList from './components/TodoList';
import TodoForm from './components/TodoForm';
import TodoDetail from './components/TodoDetail';
import './App.css';

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const data = await TodoApi.getTodos();
      setTodos(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching todos:', err);
      setError('Failed to load todos. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Todo App</h1>
          <h1>TEST</h1>
          <nav>
            <ul className="nav-links">
              <li>
                <Link to="/">All Todos</Link>
              </li>
              <li>
                <Link to="/new">Add New</Link>
              </li>
            </ul>
          </nav>
        </header>

        <main className="App-content">
          {error && <div className="error-message">{error}</div>}

          <Routes>
            <Route
              path="/"
              element={
                <TodoList
                  todos={todos}
                  loading={loading}
                  onTodoUpdated={fetchTodos}
                />
              }
            />
            <Route
              path="/new"
              element={
                <TodoForm
                  onTodoCreated={() => {
                    fetchTodos();
                  }}
                />
              }
            />
            <Route
              path="/todo/:id"
              element={
                <TodoDetail
                  onTodoUpdated={fetchTodos}
                />
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;