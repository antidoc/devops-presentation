import axios from 'axios';
import { Todo, TodoCreate, TodoUpdate } from '../types/Todo';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const TodoApi = {
  getTodos: async (): Promise<Todo[]> => {
    const response = await axios.get(`${API_URL}/todos/`);
    return response.data;
  },

  getTodo: async (id: number): Promise<Todo> => {
    const response = await axios.get(`${API_URL}/todos/${id}`);
    return response.data;
  },

  createTodo: async (todo: TodoCreate): Promise<Todo> => {
    const response = await axios.post(`${API_URL}/todos/`, todo);
    return response.data;
  },

  updateTodo: async (id: number, todo: TodoUpdate): Promise<Todo> => {
    const response = await axios.put(`${API_URL}/todos/${id}`, todo);
    return response.data;
  },

  deleteTodo: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/todos/${id}`);
  }
};