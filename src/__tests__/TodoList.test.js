import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TodoList from '../components/TodoList';

describe('TodoList', () => {
  const mockTodos = [
    { id: 1, text: 'テストタスク1', completed: false },
    { id: 2, text: 'テストタスク2', completed: true },
  ];

  const mockToggleTodo = jest.fn();
  const mockDeleteTodo = jest.fn();

  beforeEach(() => {
    render(
      <TodoList
        todos={mockTodos}
        toggleTodo={mockToggleTodo}
        deleteTodo={mockDeleteTodo}
      />
    );
  });

  it('タスク一覧が正しく表示されること', () => {
    expect(screen.getByText('テストタスク1')).toBeInTheDocument();
    expect(screen.getByText('テストタスク2')).toBeInTheDocument();
  });

  it('タスクの完了状態が正しく表示されること', () => {
    const task1 = screen.getByText('テストタスク1');
    const task2 = screen.getByText('テストタスク2');
    
    expect(task1).not.toHaveClass('completed');
    expect(task2).toHaveClass('completed');
  });

  it('タスクの削除ボタンが機能すること', () => {
    const deleteButtons = screen.getAllByText('削除');
    fireEvent.click(deleteButtons[0]);
    expect(mockDeleteTodo).toHaveBeenCalledWith(1);
  });

  it('タスクの完了状態を切り替えることができること', () => {
    const task1 = screen.getByText('テストタスク1');
    fireEvent.click(task1);
    expect(mockToggleTodo).toHaveBeenCalledWith(1);
  });
}); 