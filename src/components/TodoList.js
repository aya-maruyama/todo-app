import React from 'react';

const TodoList = ({ todos, toggleTodo, deleteTodo }) => {
  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <li key={todo.id}>
          <span
            onClick={() => toggleTodo(todo.id)}
            className={todo.completed ? 'completed' : ''}
          >
            {todo.text}
          </span>
          <button onClick={() => deleteTodo(todo.id)}>削除</button>
        </li>
      ))}
    </ul>
  );
};

export default TodoList; 