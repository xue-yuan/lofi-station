import { beforeEach, afterEach, describe, expect, it } from "vite-plus/test";
import { render, screen, cleanup, fireEvent } from "@solidjs/testing-library";
import TodoList from "./TodoList";

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe("TodoList", () => {
  it("renders and round-trips a task", () => {
    render(() => <TodoList />);
    const input = screen.getByLabelText("Add a task");

    fireEvent.input(input, { target: { value: "write tests" } });
    fireEvent.submit(input.closest("form")!);

    expect(screen.getByText("write tests")).toBeInTheDocument();
    expect(localStorage.getItem("lofi_todos")).toContain("write tests");
  });

  it("survives malformed stored data instead of blanking the app", () => {
    localStorage.setItem("lofi_todos", "{{{not json");
    expect(() => render(() => <TodoList />)).not.toThrow();
    expect(screen.getByText("No tasks yet")).toBeInTheDocument();
  });

  it("discards stored entries with the wrong shape", () => {
    localStorage.setItem("lofi_todos", JSON.stringify([{ nope: true }, 42]));
    render(() => <TodoList />);
    expect(screen.getByText("No tasks yet")).toBeInTheDocument();
  });

  it("keeps a well-formed stored list", () => {
    localStorage.setItem(
      "lofi_todos",
      JSON.stringify([{ id: "1", text: "existing", completed: false }]),
    );
    render(() => <TodoList />);
    expect(screen.getByText("existing")).toBeInTheDocument();
  });
});
