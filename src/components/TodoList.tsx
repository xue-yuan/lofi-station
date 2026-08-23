import { createSignal, createEffect, For, type Component } from "solid-js";
import { readJSON, writeJSON } from "../lib/storage";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

const TODOS_KEY = "lofi_todos";

const isTodoArray = (value: unknown): value is Todo[] =>
  Array.isArray(value) &&
  value.every(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as Todo).id === "string" &&
      typeof (item as Todo).text === "string" &&
      typeof (item as Todo).completed === "boolean",
  );

const TodoList: Component = () => {
  const [todos, setTodos] = createSignal<Todo[]>(readJSON<Todo[]>(TODOS_KEY, [], isTodoArray));
  const [inputValue, setInputValue] = createSignal("");

  createEffect(() => {
    writeJSON(TODOS_KEY, todos());
  });

  const addTodo = (e: Event) => {
    e.preventDefault();
    const text = inputValue().trim();
    if (!text) return;

    setTodos([
      {
        id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
        text,
        completed: false,
      },
      ...todos(),
    ]);
    setInputValue("");
  };

  const toggleTodo = (id: string) => {
    setTodos(todos().map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos().filter((t) => t.id !== id));
  };

  return (
    <div class="w-full flex flex-col">
      <div class="flex flex-col h-full">
        <form onSubmit={addTodo} class="mb-3 relative">
          <label class="sr-only" for="todo-input">
            Add a task
          </label>
          <input
            id="todo-input"
            type="text"
            placeholder="Add a task..."
            class="input input-sm input-bordered w-full bg-white/5 text-white placeholder-white/40 focus:outline-none focus:border-primary"
            value={inputValue()}
            onInput={(e) => setInputValue(e.currentTarget.value)}
          />
        </form>
        <ul class="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar min-h-0 list-none">
          <For
            each={todos()}
            fallback={<li class="text-xs text-center text-white/30 py-4">No tasks yet</li>}
          >
            {(todo) => (
              <li class="flex items-start gap-2 group">
                <input
                  id={`todo-${todo.id}`}
                  type="checkbox"
                  class="checkbox checkbox-xs checkbox-primary rounded-sm mt-0.5"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                />
                <label
                  for={`todo-${todo.id}`}
                  class={`text-sm flex-1 break-words cursor-pointer ${todo.completed ? "opacity-40 line-through" : "text-white/90"}`}
                >
                  {todo.text}
                </label>
                <button
                  type="button"
                  class="btn btn-ghost btn-xs text-white/20 hover:text-error opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
                  onClick={() => deleteTodo(todo.id)}
                  aria-label={`Delete task: ${todo.text}`}
                >
                  ✕
                </button>
              </li>
            )}
          </For>
        </ul>
      </div>
    </div>
  );
};

export default TodoList;
