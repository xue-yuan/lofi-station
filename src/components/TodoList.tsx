import { createSignal, createEffect, For, type Component } from "solid-js";

interface Todo {
    id: string;
    text: string;
    completed: boolean;
}

const TodoList: Component = () => {
    const savedTodos = localStorage.getItem("lofi_todos");
    const initialTodos = savedTodos ? JSON.parse(savedTodos) : [];

    const [todos, setTodos] = createSignal<Todo[]>(initialTodos);
    const [inputValue, setInputValue] = createSignal("");

    createEffect(() => {
        localStorage.setItem("lofi_todos", JSON.stringify(todos()));
    });

    const addTodo = (e: Event) => {
        e.preventDefault();
        if (!inputValue().trim()) return;

        const newTodo: Todo = {
            id: Date.now().toString(),
            text: inputValue(),
            completed: false,
        };

        setTodos([newTodo, ...todos()]);
        setInputValue("");
    };

    const toggleTodo = (id: string) => {
        setTodos(todos().map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const deleteTodo = (id: string) => {
        setTodos(todos().filter(t => t.id !== id));
    };

    return (
        <div class="w-full flex flex-col">
            <div class="flex flex-col h-full">
                <h2 class="card-title text-sm text-white/80 uppercase tracking-widest mb-2 flex justify-between items-center">
                </h2>
                <form onSubmit={addTodo} class="mb-3">
                    <input
                        type="text"
                        placeholder="Add a task..."
                        class="input input-sm input-bordered w-full bg-white/5 text-white placeholder-white/40 focus:outline-none focus:border-primary"
                        value={inputValue()}
                        onInput={(e) => setInputValue(e.currentTarget.value)}
                    />
                </form>
                <div class="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar min-h-0">
                    <For each={todos()} fallback={<div class="text-xs text-center text-white/30 py-4">No tasks yet</div>}>
                        {(todo) => (
                            <div class="flex items-start gap-2 group">
                                <label class="label cursor-pointer p-0 mt-0.5">
                                    <input
                                        type="checkbox"
                                        class="checkbox checkbox-xs checkbox-primary rounded-sm"
                                        checked={todo.completed}
                                        onChange={() => toggleTodo(todo.id)}
                                    />
                                </label>
                                <span class={`text-sm flex-1 break-words ${todo.completed ? 'opacity-40 line-through' : 'text-white/90'}`}>
                                    {todo.text}
                                </span>
                                <button
                                    class="btn btn-ghost btn-xs text-white/20 hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => deleteTodo(todo.id)}
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                    </For>
                </div>
            </div>
        </div>
    );
};

export default TodoList;
