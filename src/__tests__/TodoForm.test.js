import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TodoForm from '../components/TodoForm';

describe('TodoForm', () => {
  const mockAddTodo = jest.fn();

  beforeEach(() => {
    render(<TodoForm addTodo={mockAddTodo} />);
  });

  it('フォームが正しく表示されること', () => {
    expect(screen.getByPlaceholderText('新しいタスクを追加...')).toBeInTheDocument();
    expect(screen.getByText('追加')).toBeInTheDocument();
  });

  it('タスクを追加できること', () => {
    const input = screen.getByPlaceholderText('新しいタスクを追加...');
    const button = screen.getByText('追加');

    fireEvent.change(input, { target: { value: '新しいタスク' } });
    fireEvent.click(button);

    expect(mockAddTodo).toHaveBeenCalledWith('新しいタスク');
    expect(input.value).toBe('');
  });

  it('空のタスクは追加できないこと', () => {
    const button = screen.getByText('追加');
    fireEvent.click(button);
    expect(mockAddTodo).not.toHaveBeenCalled();
  });
}); 