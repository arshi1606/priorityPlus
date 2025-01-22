const prisma = require('../prisma/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secret = "This is secret key";

const resolvers = {
  Query: {
    // Get all users along with their todos
    getUsers: async () => prisma.user.findMany({ include: { todos: true } }),

    // Get a single user by their ID (requires authentication)
    getUser: async (_, __, { userId }) => {
      if (!userId) {
        throw new Error("Unauthorized access. Please log in.");
      }
      return prisma.user.findUnique({ where: { id: userId }, include: { todos: true } });
    },

    // Get a single Todo by its ID (requires authentication)
    getTodoById: async (_, { id }, { userId }) => {
      if (!userId) {
        throw new Error("Unauthorized access. Please log in.");
      }
      const todo = await prisma.todo.findFirst({
        where: { id, userId },
      });
      if (!todo) {
        throw new Error(`Todo with ID ${id} not found`);
      }
      return todo;
    },

    // Get all Todos for a specific user ID
    getTodoByUserId: async (_, { userId }) => {
      try {
        const todos = await prisma.todo.findMany({
          where: { userId },
        });
        if (!todos.length) {
          throw new Error(`No todos found for user ID ${userId}`);
        }
        return todos;
      } catch (error) {
        throw new Error(`Error fetching todos: ${error.message}`);
      }
    },
  },

  Mutation: {
    // Create a new user
    createUser: async (_, { name, email, password }) =>
      prisma.user.create({ data: { name, email, password } }),

    // Add a new Todo for a user
    addTodo: async (_, { userId, task, description }) =>
      prisma.todo.create({
        data: {
          task,
          description,
          user: { connect: { id: userId } },
        },
      }),

    // Update or mark a Todo
    updateOrMarkTodo: async (_, { todoId, task, isMark, description }) => {
      const todo = await prisma.todo.findUnique({ where: { id: todoId } });
      if (!todo) {
        throw new Error("Todo not found");
      }

      if (isMark) {
        return prisma.todo.update({
          where: { id: todoId },
          data: {
            isDone: !todo.isDone,
            description: description || todo.description,
          },
        });
      }

      if (task || description) {
        return prisma.todo.update({
          where: { id: todoId },
          data: {
            task: task || todo.task,
            description: description || todo.description,
          },
        });
      }

      throw new Error("Invalid input for updating or marking Todo");
    },

    // Sign up a new user
    signUpUser: async (_, { name, email, password }) => {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        throw new Error("User already exists");
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await prisma.user.create({
        data: { name, email, password: hashedPassword },
      });

      const token = jwt.sign({ userId: newUser.id }, secret);
      return { token };
    },

    // Sign in an existing user
    signInUser: async (_, { email, password }) => {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new Error("User does not exist!");
      }

      if (!bcrypt.compareSync(password, user.password)) {
        throw new Error("Password incorrect");
      }

      const token = jwt.sign({ userId: user.id }, secret);
      return { token };
    },

    // Create a Todo for the currently authenticated user
    createTodo: async (_, { task, description }, { userId }) => {
      if (!userId) {
        throw new Error("Unauthorized access. Please log in.");
      }
      await prisma.todo.create({
        data: {
          task,
          description,
          user: { connect: { id: userId } },
        },
      });
      return "Todo saved successfully!";
    },

    // Delete a Todo
    deleteTodo: async (_, { id }) => {
      await prisma.todo.delete({ where: { id } });
      return "Todo deleted successfully!";
    },

    // Delete all users and their Todos
    deleteUsersTodos: async () => {
      await prisma.todo.deleteMany({});
      await prisma.user.deleteMany({});
      return "All Todos and Users have been deleted";
    },

    // Update the task or description of a Todo
    updateTodoTask: async (_, { id, task, description }) => {
      const todo = await prisma.todo.update({
        where: { id },
        data: { task, description },
      });
      return todo;
    },
  },

  // Resolve Todos for a User
  User: {
    todos: async (parent) => prisma.todo.findMany({ where: { userId: parent.id } }),
  },

  // Resolve the User for a Todo
  Todo: {
    user: async (parent) => prisma.user.findUnique({ where: { id: parent.userId } }),
  },
};

module.exports = resolvers;
