"use client";

import { useQuery, useMutation, gql } from "@apollo/client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, FormEvent } from "react";
import { Check, X } from "lucide-react";

const GET_TODO = gql`
  query ($id: Int!) {
    getTodoById(id: $id) {
      id
      task
      isDone
      description
    }
  }
`;

const MERGED_TODO_MUTATION = gql`
  mutation ($todoId: Int!, $task: String, $isMark: Boolean, $description: String) {
    updateOrMarkTodo(todoId: $todoId, task: $task, isMark: $isMark, description: $description) {
      id
      task
      isDone
      description
    }
  }
`;

type TodoDetailProps = {
  params: Promise<{ id: string }>;
};

export default function TodoDetail({ params }: TodoDetailProps) {
  const router = useRouter();

  const [todoId, setTodoId] = useState<number | null>(null);
  const [task, setTask] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    params
      .then((resolvedParams) => {
        const id = parseInt(resolvedParams.id, 10);
        if (!isNaN(id)) {
          setTodoId(id);
        } else {
          router.push("/protected/todo");
        }
      })
      .catch(() => {
        router.push("/protected/todo");
      });
  }, [params, router]);

  const { data, loading, error } = useQuery(GET_TODO, {
    variables: { id: todoId },
    skip: todoId === null,
    onError: () => {
      router.push("/protected/todo");
    },
  });

  const [updateTodo] = useMutation(MERGED_TODO_MUTATION, {
    onError: () => {
      router.push("/protected/todo");
    },
  });

  useEffect(() => {
    if (data?.getTodoById) {
      setTask(data.getTodoById.task);
      setDescription(data.getTodoById.description || "");
    }
  }, [data]);

  if (loading || todoId === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg animate-pulse">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-lg font-semibold animate-shake">Error fetching task details. Please try again later.</p>
      </div>
    );
  }

  const handleUpdateTodo = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!task.trim()) {
      alert("Task cannot be empty!");
      return;
    }

    try {
      await updateTodo({
        variables: { todoId, task, description },
      });
      router.push("/protected/todo");
    } catch (err) {
      console.error("Error updating todo:", err);
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white p-8 rounded-xl shadow-xl transition-all transform hover:scale-105">
        <h1 className="text-3xl font-bold text-gray-700 mb-6 text-center">Edit Task</h1>
        <form onSubmit={handleUpdateTodo} className="space-y-8">
          <div className="flex flex-col">
            <label htmlFor="task" className="text-lg font-medium text-gray-600 mb-2">Task Title</label>
            <input
              id="task"
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="Update your task..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 transition-all ease-in-out"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="description" className="text-lg font-medium text-gray-600 mb-2">Task Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 transition-all ease-in-out"
            />
          </div>

          <div className="flex justify-between items-center space-x-4">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all ease-in-out"
            >
              <Check size={20} className="inline-block mr-2" />
              Update Task
            </button>
            <button
              type="button"
              onClick={() => router.push("/protected/todo")}
              className="w-full bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-all ease-in-out"
            >
              <X size={20} className="inline-block mr-2" />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
