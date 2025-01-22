"use client";

import { useMutation, gql, useApolloClient } from "@apollo/client";
import useSWR, { mutate } from "swr";
import { useEffect, useState, FormEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Check, X, Edit, Trash2 } from "lucide-react";
import Cookies from "js-cookie";

const GET_USER = gql`
  query {
    getUser {
      id
      name
      todos {
        id
        task
        description
        isDone
      }
    }
  }
`;

const ADD_TODO = gql`
  mutation ($task: String!, $description: String) {
    createTodo(task: $task, description: $description)
  }
`;

const DELETE_TODO = gql`
  mutation ($deleteTodoId: Int!) {
    deleteTodo(id: $deleteTodoId)
  }
`;

const MERGED_TODO_MUTATION = gql`
  mutation ($todoId: Int!, $task: String, $isMark: Boolean, $description: String) {
    updateOrMarkTodo(todoId: $todoId, task: $task, isMark: $isMark, description: $description) {
      id
      task
      isDone
    }
  }
`;

type TodoType = {
  id: number;
  task: string;
  description: string;
  isDone: boolean;
};

export default function Todo() {
  const router = useRouter();
  const client = useApolloClient();
  const [loadingToken, setLoadingToken] = useState(true);
  const [editMode, setEditMode] = useState<{ id: number | null; task: string; description: string }>({
    id: null,
    task: "",
    description: "",
  });
  const [newTask, setNewTask] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/");
    } else {
      setLoadingToken(false);
    }
  }, [router]);

  // SWR to fetch user data
  const { data, error, isLoading } = useSWR("getUser", async () => {
    const { data } = await client.query({ query: GET_USER });
    return data.getUser;
  });

  const [addTodo] = useMutation(ADD_TODO);
  const [deleteTodo] = useMutation(DELETE_TODO);
  const [updateOrMarkTodo] = useMutation(MERGED_TODO_MUTATION);

  const handleToggleTodo = async (todoId: number) => {
    try {
      await updateOrMarkTodo({ variables: { todoId, isMark: true } });
      // Refetch after updating the status
      mutate("getUser");
    } catch (err) {
      console.error("Error toggling todo status:", err);
    }
  };

  const handleAddTodo = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const task = new FormData(event.currentTarget).get("task") as string;
    const description = new FormData(event.currentTarget).get("description") as string;
    if (!task.trim()) return alert("Task cannot be empty!");

    try {
      await addTodo({ variables: { task: task.trim(), description: description.trim() } });
      // Refetch after adding a new todo
      mutate("getUser");
    } catch (err) {
      console.error("Error adding todo:", err);
    }
  };

  const handleDeleteTodo = async (todoId: number) => {
    try {
      await deleteTodo({ variables: { deleteTodoId: todoId } });
      // Refetch after deleting a todo
      mutate("getUser");
    } catch (err) {
      console.error("Error deleting todo:", err);
    }
  };

  const handleEditTodo = (todo: TodoType) => {
    router.push(`/protected/todo/${todo.id}`);
  };

  const handleUpdateTodo = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newTask.trim()) return alert("Task cannot be empty!");

    try {
      await updateOrMarkTodo({
        variables: { todoId: editMode.id!, task: newTask.trim(), isMark: false, description: newDescription.trim() },
      });
      // Refetch after updating a todo
      mutate("getUser");
      setEditMode({ id: null, task: "", description: "" });
      setNewTask("");
      setNewDescription("");
    } catch (err) {
      console.error("Error updating todo:", err);
    }
  };

  const handleLogout = () => {
    Cookies.remove("token");
    client.clearStore();
    router.push("/");
  };

  if (loadingToken || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-red-500 text-lg">Error fetching data. Try again later.</p>
    );
  }

  const { todos, name } = data;
  const pendingTodos = todos.filter((todo: TodoType) => !todo.isDone);
  const completedTodos = todos.filter((todo: TodoType) => todo.isDone);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 ">
      <div className="max-w-3xl w-full bg-white p-8 rounded-2xl shadow-xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Welcome, {name}!</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
          >
            Logout
          </button>
        </div>

        <form onSubmit={handleAddTodo} className="flex items-center mb-8 space-x-3" ref={formRef}>
          <input
            name="task"
            type="text"
            placeholder="What needs to be done?"
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 transition"
          />
          <input
            name="description"
            type="text"
            placeholder="Description"
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 transition"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-black hover:bg-grey-800 text-white rounded-xl flex items-center transition"
          >
            <Plus size={20} />
            <span>Add Task</span>
          </button>
        </form>

        {pendingTodos.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Pending Tasks</h2>
            <div className="space-y-3">
              {pendingTodos.map((todo: TodoType) => (
                <div
                  key={todo.id}
                  className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-md hover:shadow-xl transition"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <input
                      type="checkbox"
                      checked={todo.isDone}
                      onChange={() => handleToggleTodo(todo.id)}
                      className="h-5 w-5 text-black border-gray-300 rounded-lg"
                    />
                    {editMode.id === todo.id ? (
                      <form onSubmit={handleUpdateTodo} className="flex items-center space-x-3 flex-1">
                        <input
                          type="text"
                          value={newTask}
                          onChange={(e) => setNewTask(e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg"
                        />
                        <input
                          type="text"
                          value={newDescription}
                          onChange={(e) => setNewDescription(e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg"
                        />
                        <button type="submit" className="p-2 text-green-600">
                          <Check size={20} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditMode({ id: null, task: "", description: "" })}
                          className="p-2 text-red-600"
                        >
                          <X size={20} />
                        </button>
                      </form>
                    ) : (
                      <span className="text-lg font-semibold">{todo.task} - {todo.description}</span>
                    )}
                  </div>
                  {editMode.id !== todo.id && (
                    <div className="flex items-center space-x-2">
                      <button onClick={() => handleEditTodo(todo)} className="text-gray-400">
                        <Edit size={20} />
                      </button>
                      <button onClick={() => handleDeleteTodo(todo.id)} className="text-gray-400">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {completedTodos.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Completed Tasks</h2>
            <div className="space-y-3">
              {completedTodos.map((todo: TodoType) => (
                <div
                  key={todo.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl shadow-sm"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <input
                      type="checkbox"
                      checked={todo.isDone}
                      onChange={() => handleToggleTodo(todo.id)}
                      className="h-5 w-5 text-black border-gray-300 rounded-lg"
                    />
                    <span className="text-lg text-gray-400 line-through">{todo.task} - {todo.description}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteTodo(todo.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
