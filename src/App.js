import React, { useState, useEffect } from 'react';
import './App.css';
import useLocalStorage from './hooks/useLocalStorage';

// ラベルのカラーパレット
const LABEL_COLORS = [
  { id: 'red', value: '#f44336' },
  { id: 'pink', value: '#e91e63' },
  { id: 'purple', value: '#9c27b0' },
  { id: 'deep-purple', value: '#673ab7' },
  { id: 'indigo', value: '#3f51b5' },
  { id: 'blue', value: '#2196f3' },
  { id: 'cyan', value: '#00bcd4' },
  { id: 'teal', value: '#009688' },
  { id: 'green', value: '#4caf50' },
  { id: 'light-green', value: '#8bc34a' },
  { id: 'orange', value: '#ff9800' },
  { id: 'deep-orange', value: '#ff5722' }
];

// 優先度の定義
const PRIORITIES = {
  high: { value: 'high', label: '高', color: '#f44336' },
  medium: { value: 'medium', label: '中', color: '#ff9800' },
  low: { value: 'low', label: '低', color: '#4caf50' }
};

// 優先度のアイコン
const PRIORITY_ICONS = {
  high: '🔥',
  medium: '⭐',
  low: '🌱'
};

function App() {
  const [todos, setTodos] = useLocalStorage('todos', []);
  const [labels, setLabels] = useLocalStorage('labels', []);
  const [isDarkMode, setIsDarkMode] = useLocalStorage('darkMode', false);
  const [newTodo, setNewTodo] = useState('');
  const [error, setError] = useState('');
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [editingLabel, setEditingLabel] = useState(null);
  const [showLabelManager, setShowLabelManager] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const deleteCompletedTodos = () => {
    if (window.confirm('完了したタスクをすべて削除しますか？')) {
      setTodos(todos.filter(todo => !todo.completed));
    }
  };

  const addTodo = (e) => {
    e.preventDefault();
    if (newTodo.trim() === '') {
      setError('タスクを入力してください');
      return;
    }
    try {
      setTodos([...todos, {
        id: Date.now(),
        text: newTodo,
        completed: false,
        priority: 'medium',
        dueDate: null,
        subTasks: [],
        memo: '',
        labels: [],
        createdAt: new Date().toISOString()
      }]);
      setNewTodo('');
      setError('');
    } catch (err) {
      setError('タスクの追加に失敗しました');
      console.error('タスク追加エラー:', err);
    }
  };

  const updateTodo = (updatedTodo) => {
    setTodos(todos.map(todo =>
      todo.id === updatedTodo.id ? updatedTodo : todo
    ));
    setSelectedTodo(null);
  };

  const deleteTodo = (id) => {
    try {
      setTodos(todos.filter(todo => todo.id !== id));
      setSelectedTodo(null);
      setError('');
    } catch (err) {
      setError('タスクの削除に失敗しました');
      console.error('タスク削除エラー:', err);
    }
  };

  const reorderTodos = (draggedId, droppedId) => {
    try {
      const draggedIndex = todos.findIndex(todo => todo.id === draggedId);
      const droppedIndex = todos.findIndex(todo => todo.id === droppedId);
      
      const newTodos = [...todos];
      const [draggedTodo] = newTodos.splice(draggedIndex, 1);
      newTodos.splice(droppedIndex, 0, draggedTodo);
      
      setTodos(newTodos.map((todo, index) => ({
        ...todo,
        priority: index
      })));
    } catch (err) {
      setError('タスクの並び替えに失敗しました');
      console.error('タスク並び替えエラー:', err);
    }
  };

  const filteredTodos = todos.filter(todo => {
    const matchesSearch = todo.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLabels = selectedLabels.length === 0 || 
      selectedLabels.every(labelId => todo.labels.includes(labelId));
    return matchesSearch && matchesLabels;
  });

  // ラベルの追加
  const addLabel = () => {
    const newLabel = {
      id: Date.now(),
      text: '新しいラベル',
      color: LABEL_COLORS[0].value
    };
    setLabels([...labels, newLabel]);
    setEditingLabel(newLabel);
  };

  // ラベルの更新
  const updateLabel = (labelId, updates) => {
    setLabels(labels.map(label =>
      label.id === labelId ? { ...label, ...updates } : label
    ));
  };

  // ラベルの削除
  const deleteLabel = (labelId) => {
    setLabels(labels.filter(label => label.id !== labelId));
    // タスクからも該当ラベルを削除
    setTodos(todos.map(todo => ({
      ...todo,
      labels: todo.labels.filter(id => id !== labelId)
    })));
  };

  // タスクにラベルを追加
  const addLabelToTodo = (todoId, labelId) => {
    setSelectedTodo(prev => ({
      ...prev,
      labels: [...new Set([...prev.labels, labelId])]
    }));
  };

  // タスクからラベルを削除
  const removeLabelFromTodo = (todoId, labelId) => {
    setSelectedTodo(prev => ({
      ...prev,
      labels: prev.labels.filter(id => id !== labelId)
    }));
  };

  // ラベル名の変更
  const handleLabelTextChange = (labelId, text) => {
    setEditingLabel(prev => ({
      ...prev,
      text: text
    }));
    updateLabel(labelId, { text });
  };

  // ラベルの色変更
  const handleColorChange = (labelId, color) => {
    setEditingLabel(prev => ({
      ...prev,
      color: color
    }));
    updateLabel(labelId, { color });
  };

  const addSubTask = (todoId, subTaskText) => {
    if (!subTaskText.trim()) return;
    
    setTodos(todos.map(todo => {
      if (todo.id === todoId) {
        return {
          ...todo,
          subTasks: [...todo.subTasks, {
            id: Date.now(),
            text: subTaskText,
            completed: false
          }]
        };
      }
      return todo;
    }));
  };

  const toggleSubTask = (todoId, subTaskId) => {
    setTodos(todos.map(todo => {
      if (todo.id === todoId) {
        return {
          ...todo,
          subTasks: todo.subTasks.map(subTask => 
            subTask.id === subTaskId
              ? { ...subTask, completed: !subTask.completed }
              : subTask
          )
        };
      }
      return todo;
    }));
  };

  const deleteSubTask = (todoId, subTaskId) => {
    setTodos(todos.map(todo => {
      if (todo.id === todoId) {
        return {
          ...todo,
          subTasks: todo.subTasks.filter(st => st.id !== subTaskId)
        };
      }
      return todo;
    }));
  };

  return (
    <div className={`app ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="header">
        <h1>Todoリスト</h1>
        <div className="header-actions">
          <label className="dark-mode-toggle">
            <input
              type="checkbox"
              checked={isDarkMode}
              onChange={toggleDarkMode}
            />
            <span className="slider"></span>
          </label>
          <button onClick={deleteCompletedTodos} className="delete-completed">
            完了タスクを削除
          </button>
          <button
            onClick={() => setShowLabelManager(true)}
            className="label-manager-button"
          >
            ラベル管理
          </button>
          <a href="javascript:void(0)" onClick={() => {
            const data = localStorage.getItem('todos');
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'todos.json';
            a.click();
            URL.revokeObjectURL(url);
          }} className="storage-link">
            データをエクスポート
          </a>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* ラベルフィルター */}
      <div className="label-filter">
        {labels.map(label => (
          <button
            key={label.id}
            className={`label-button ${selectedLabels.includes(label.id) ? 'selected' : ''}`}
            style={{ backgroundColor: label.color }}
            onClick={() => {
              setSelectedLabels(prev => 
                prev.includes(label.id)
                  ? prev.filter(id => id !== label.id)
                  : [...prev, label.id]
              );
            }}
          >
            {label.text}
          </button>
        ))}
      </div>

      {/* ラベル管理モーダル */}
      {showLabelManager && (
        <div className="modal">
          <div className="modal-content">
            <h2>ラベル管理</h2>
            <div className="label-manager">
              <button onClick={addLabel} className="add-label-button">
                ラベルを追加
              </button>
              <div className="label-list">
                {labels.map(label => (
                  <div key={label.id} className="label-item">
                    {editingLabel?.id === label.id ? (
                      <div className="label-edit-form">
                        <input
                          type="text"
                          value={editingLabel.text}
                          onChange={(e) => handleLabelTextChange(label.id, e.target.value)}
                          className="label-input"
                          autoFocus
                        />
                        <div className="color-picker">
                          <div className="color-options">
                            {LABEL_COLORS.map(color => (
                              <button
                                key={color.id}
                                className={`color-option ${editingLabel.color === color.value ? 'selected' : ''}`}
                                style={{ backgroundColor: color.value }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleColorChange(label.id, color.value);
                                }}
                                title={color.id}
                              >
                                {editingLabel.color === color.value && (
                                  <div className="color-selected-indicator">✓</div>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="label-edit-actions">
                          <button
                            type="button"
                            onClick={() => setEditingLabel(null)}
                          >
                            閉じる
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span style={{ backgroundColor: label.color }}>{label.text}</span>
                        <button
                          type="button"
                          onClick={() => setEditingLabel(label)}
                        >
                          編集
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteLabel(label.id)}
                        >
                          削除
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" onClick={() => setShowLabelManager(false)}>閉じる</button>
            </div>
          </div>
        </div>
      )}

      {/* タスク詳細モーダル */}
      {selectedTodo && (
        <div className="modal">
          <div className="modal-content">
            <h2>タスクの詳細</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              updateTodo(selectedTodo);
            }}>
              <div className="form-group">
                <label>タスク名</label>
                <input
                  type="text"
                  value={selectedTodo.text}
                  onChange={(e) => setSelectedTodo({ ...selectedTodo, text: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>優先度</label>
                <div className="priority-selector">
                  {Object.values(PRIORITIES).map(priority => (
                    <button
                      key={priority.value}
                      type="button"
                      className={`priority-button ${selectedTodo.priority === priority.value ? 'selected' : ''}`}
                      style={{ backgroundColor: priority.color }}
                      onClick={() => setSelectedTodo({ ...selectedTodo, priority: priority.value })}
                    >
                      {priority.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>期日</label>
                <input
                  type="date"
                  value={selectedTodo.dueDate || ''}
                  onChange={(e) => setSelectedTodo({ ...selectedTodo, dueDate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>サブタスク</label>
                <div className="subtask-list">
                  {selectedTodo.subTasks.map(subTask => (
                    <div key={subTask.id} className="subtask-item">
                      <input
                        type="checkbox"
                        checked={subTask.completed}
                        onChange={() => {
                          const updatedSubTasks = selectedTodo.subTasks.map(st =>
                            st.id === subTask.id ? { ...st, completed: !st.completed } : st
                          );
                          setSelectedTodo({ ...selectedTodo, subTasks: updatedSubTasks });
                        }}
                      />
                      <span className={subTask.completed ? 'completed' : ''}>{subTask.text}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updatedSubTasks = selectedTodo.subTasks.filter(st => st.id !== subTask.id);
                          setSelectedTodo({ ...selectedTodo, subTasks: updatedSubTasks });
                        }}
                        className="delete-subtask"
                      >
                        削除
                      </button>
                    </div>
                  ))}
                  <div className="add-subtask">
                    <input
                      type="text"
                      placeholder="新しいサブタスクを追加"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const newSubTask = {
                            id: Date.now(),
                            text: e.target.value,
                            completed: false
                          };
                          setSelectedTodo({
                            ...selectedTodo,
                            subTasks: [...selectedTodo.subTasks, newSubTask]
                          });
                          e.target.value = '';
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>メモ</label>
                <textarea
                  value={selectedTodo.memo}
                  onChange={(e) => setSelectedTodo({ ...selectedTodo, memo: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>ラベル</label>
                <div className="label-selector">
                  {labels.map(label => (
                    <button
                      key={label.id}
                      type="button"
                      className={`label-button ${selectedTodo.labels.includes(label.id) ? 'selected' : ''}`}
                      style={{ backgroundColor: label.color }}
                      onClick={() => {
                        if (selectedTodo.labels.includes(label.id)) {
                          removeLabelFromTodo(selectedTodo.id, label.id);
                        } else {
                          addLabelToTodo(selectedTodo.id, label.id);
                        }
                      }}
                    >
                      {label.text}
                    </button>
                  ))}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setSelectedTodo(null)}>キャンセル</button>
                <button type="submit">保存</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* タスクリスト */}
      <div className="search-container">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="タスクを検索..."
          className="search-input"
        />
      </div>

      <form onSubmit={addTodo} className="todo-form">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="新しいタスクを追加..."
          className="todo-input"
        />
        <button type="submit" className="add-button">追加</button>
      </form>

      <ul className="todo-list">
        {filteredTodos.map(todo => (
          <li
            key={todo.id}
            className="todo-item"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', todo.id);
            }}
            onDragOver={(e) => {
              e.preventDefault();
            }}
            onDrop={(e) => {
              e.preventDefault();
              const draggedId = e.dataTransfer.getData('text/plain');
              reorderTodos(Number(draggedId), todo.id);
            }}
          >
            <div className="drag-handle">⋮⋮</div>
            <div className="todo-content" onClick={() => setSelectedTodo(todo)}>
              <div className="todo-main">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => updateTodo({ ...todo, completed: !todo.completed })}
                  className="todo-checkbox"
                />
                <span className={todo.completed ? 'completed' : ''}>{todo.text}</span>
              </div>
              <div className="todo-labels">
                {todo.labels.map(labelId => {
                  const label = labels.find(l => l.id === labelId);
                  return label ? (
                    <span
                      key={labelId}
                      className="todo-label"
                      style={{ backgroundColor: label.color }}
                    >
                      {label.text}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
            <div className="todo-meta">
              {todo.subTasks.length > 0 && (
                <span className="subtask-count">
                  {todo.subTasks.filter(st => st.completed).length}/{todo.subTasks.length}
                </span>
              )}
              {todo.dueDate && (
                <span className="due-date">
                  📅 {new Date(todo.dueDate).toLocaleDateString()}
                </span>
              )}
              <span className="priority-icon" style={{ color: PRIORITIES[todo.priority]?.color || '#666' }}>
                {PRIORITY_ICONS[todo.priority] || '⭐'}
              </span>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="delete-button"
              >
                削除
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App; 