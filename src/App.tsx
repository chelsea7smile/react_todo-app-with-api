import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ErrorNotification } from './components/ErrorNotification';
import { Todo } from './types/Todo';
import {
  getTodos,
  addTodo,
  USER_ID,
  deleteTodo,
  updateTodo,
} from './api/todos';
import { ErrorTypes } from './types/ErrorTypes';
import { FilterStatus } from './types/FilterStatus';
import { TodoList } from './components/TodoList';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [errorMessage, setErrorMessage] = useState<ErrorTypes>(
    ErrorTypes.Empty,
  );
  const [filterStatus, setFilterStatus] = useState<FilterStatus>(
    FilterStatus.All,
  );
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [loadingTodoIds, setLoadingTodoIds] = useState<number[]>([]);
  const inputAddRef = useRef<HTMLInputElement>(null);

  const filteredTodos = useMemo(
    () =>
      todos.filter(todo => {
        if (filterStatus === FilterStatus.All) {
          return true;
        }

        return filterStatus === FilterStatus.Completed
          ? todo.completed
          : !todo.completed;
      }),
    [todos, filterStatus],
  );

  const todosLeftNum = useMemo(
    () => todos.filter(todo => !todo.completed).length,
    [todos],
  );
  const todosCompletedNum = useMemo(
    () => todos.filter(todo => todo.completed).length,
    [todos],
  );
  const areAllTodosCompleted = useMemo(
    () => todos.length === todosCompletedNum,
    [todos],
  );
  const onAddTodo = async (todoTitle: string) => {
    setTempTodo({ id: 0, title: todoTitle, completed: false, userId: USER_ID });
    try {
      const newTodo = await addTodo({ title: todoTitle, completed: false });

      setTodos(prev => [...prev, newTodo]);
    } catch (error) {
      setErrorMessage(ErrorTypes.AddTodo);
      inputAddRef?.current?.focus();
      throw error;
    } finally {
      setTempTodo(null);
    }
  };

  const onDeleteTodo = async (todoId: number) => {
    setLoadingTodoIds(prev => [...prev, todoId]);
    try {
      await deleteTodo(todoId);
      setTodos(prev => prev.filter(todo => todo.id !== todoId));
    } catch (error) {
      setErrorMessage(ErrorTypes.DeleteTodo);
      inputAddRef?.current?.focus();
      throw error;
    } finally {
      setLoadingTodoIds(prev => prev.filter(id => id !== todoId));
    }
  };

  const onClearCompleted = async () => {
    const completedTodos = todos.filter(todo => todo.completed);

    completedTodos.forEach(todo => {
      onDeleteTodo(todo.id);
    });
  };

  const onUpdateTodo = async (todoToUpdate: Todo) => {
    setLoadingTodoIds(prev => [...prev, todoToUpdate.id]);
    try {
      const updatedTodo = await updateTodo(todoToUpdate);

      setTodos(prev =>
        prev.map(todo => (todo.id === updatedTodo.id ? updatedTodo : todo)),
      );
    } catch (error) {
      setErrorMessage(ErrorTypes.UpdateTodo);
      throw error;
    } finally {
      setLoadingTodoIds(prev => prev.filter(id => id !== todoToUpdate.id));
    }

    return;
  };

  const onToggleAll = async () => {
    if (todosLeftNum > 0) {
      const activeTodos = todos.filter(todo => !todo.completed);

      activeTodos.forEach(todo => {
        onUpdateTodo({ ...todo, completed: true });
      });
    } else {
      todos.forEach(todo => {
        onUpdateTodo({ ...todo, completed: false });
      });
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await getTodos();

        setTodos(data);
      } catch (error) {
        setErrorMessage(ErrorTypes.Loading);
      } finally {
      }
    })();
  }, []);

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>
      <div className="todoapp__content">
        <Header
          onAddTodo={onAddTodo}
          setErrorMessage={setErrorMessage}
          isInputDisabled={!!tempTodo}
          onToggleAll={onToggleAll}
          areAllTodosCompleted={areAllTodosCompleted}
          todosLength={todos.length}
          inputRef={inputAddRef}
        />

        {(todos.length > 0 || tempTodo) && (
          <>
            <TodoList
              filteredTodos={filteredTodos}
              onDeleteTodo={onDeleteTodo}
              onUpdateTodo={onUpdateTodo}
              loadingTodoIds={loadingTodoIds}
              tempTodo={tempTodo}
            />
            <Footer
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              todosLeft={todosLeftNum}
              todosCompleted={todosCompletedNum}
              onClearCompleted={onClearCompleted}
            />
          </>
        )}
      </div>

      <ErrorNotification
        data-cy="ErrorNotification"
        error={errorMessage}
        setError={setErrorMessage}
      />
    </div>
  );
};
