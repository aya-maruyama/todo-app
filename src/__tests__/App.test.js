import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

describe('App', () => {
  beforeEach(() => {
    render(<App />);
  });

  it('初期状態でタスク一覧が空であること', () => {
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  it('新しいタスクを追加できること', () => {
    const input = screen.getByPlaceholderText('新しいタスクを追加...');
    const button = screen.getByText('追加');

    fireEvent.change(input, { target: { value: '新しいタスク' } });
    fireEvent.click(button);

    expect(screen.getByText('新しいタスク')).toBeInTheDocument();
  });

  it('タスクの完了状態を切り替えられること', () => {
    // まずタスクを追加
    const input = screen.getByPlaceholderText('新しいタスクを追加...');
    const addButton = screen.getByText('追加');
    fireEvent.change(input, { target: { value: 'テストタスク' } });
    fireEvent.click(addButton);

    // タスクをクリックして完了状態を切り替え
    const task = screen.getByText('テストタスク');
    fireEvent.click(task);

    // 完了状態のスタイルが適用されていることを確認
    expect(task).toHaveClass('completed');
  });

  it('タスクを削除できること', () => {
    // まずタスクを追加
    const input = screen.getByPlaceholderText('新しいタスクを追加...');
    const addButton = screen.getByText('追加');
    fireEvent.change(input, { target: { value: '削除するタスク' } });
    fireEvent.click(addButton);

    // 削除ボタンをクリック
    const deleteButton = screen.getByText('削除');
    fireEvent.click(deleteButton);

    // タスクが削除されたことを確認
    expect(screen.queryByText('削除するタスク')).not.toBeInTheDocument();
  });
}); 