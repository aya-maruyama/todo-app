import React, { useState } from 'react';

const TodoForm = ({ addTodo }) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value) return;
    addTodo(value);
    setValue('');
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="todo-input"
        placeholder="新しいタスクを追加..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button type="submit" className="add-button">
        追加
      </button>
    </form>
  );
};

export default TodoForm; 