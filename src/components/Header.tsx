import React, { useEffect, useState } from 'react';
import { ErrorTypes } from '../types/ErrorTypes';
import cn from 'classnames';

type Props = {
  onAddTodo: (value: string) => Promise<void>;
  setErrorMessage: React.Dispatch<React.SetStateAction<ErrorTypes>>;
  isInputDisabled: boolean;
  areAllTodosCompleted: boolean;
  onToggleAll: () => Promise<void>;
  todosLength: number;
  inputRef: React.RefObject<HTMLInputElement> | null;
};

export const Header: React.FC<Props> = props => {
  const {
    onAddTodo,
    setErrorMessage,
    isInputDisabled,
    todosLength,
    onToggleAll,
    inputRef,
    areAllTodosCompleted,
  } = props;

  const [inputValue, setInputValue] = useState('');

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inputValue.trim() === '') {
      setErrorMessage(ErrorTypes.EmptyTitle);

      return;
    }

    try {
      await onAddTodo(inputValue.trim());
      setInputValue('');
    } catch (error) {}
  };

  useEffect(() => {
    if (!isInputDisabled) {
      inputRef?.current?.focus();
    } else if (todosLength !== undefined) {
      inputRef?.current?.focus();
    }
  }, [todosLength, isInputDisabled]);

  return (
    <header className="todoapp__header">
      {todosLength !== 0 && (
        <button
          type="button"
          className={cn('todoapp__toggle-all', {
            active: areAllTodosCompleted,
          })}
          data-cy="ToggleAllButton"
          onClick={onToggleAll}
        />
      )}

      {/* Add a todo on form submit */}
      <form onSubmit={onSubmit}>
        <input
          data-cy="NewTodoField"
          type="text"
          className="todoapp__new-todo"
          placeholder="What needs to be done?"
          ref={inputRef}
          value={inputValue}
          onChange={event => setInputValue(event.target.value)}
          disabled={isInputDisabled}
        />
      </form>
    </header>
  );
};
