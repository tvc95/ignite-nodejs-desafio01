const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

/**
 * Middleware de verificação da conta do usuário
 * @param {*} request 
 * @param {*} response 
 * @param {*} next 
 * @returns 
 */
function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((u) => u.username === username);

  if (!user) {
    return response.status(404).json({
      error: 'User not found!'
    });
  }

  request.user = user;

  return next();
}

/**
 * Rota de cadastro de um novo usuário
 */
app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userExists = users.some((user) => user.username === username);

  if (userExists) {
    return response.status(400).json({
      error: 'Username already exists!'
    });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

/**
 * Retorna a lista de To-do's de um usuário específico
 */
app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

/**
 * Cria um novo todo para um usuário específico
 */
app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  if (title === "" || deadline === "") {
    return response.status(400).json({
      error: "No request body data"
    });
  }

  const newTodo = {
    id: uuidv4(),
    title,
    created_at: new Date(),
    deadline: new Date(deadline),
    done: false
  };

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

/**
 * Atualiza um To-do específico de um usuário
 */
app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const findTodo = user.todos.some((todo) => todo.id === id);

  if (!findTodo) {
    return response.status(404).json({
      error: "To-do not found"
    });
  }

  const todoIdx = user.todos.findIndex((todo) => todo.id === id);

  user.todos[todoIdx] = {
    ...user.todos[todoIdx],
    title,
    deadline: new Date(deadline),
  };

  return response.status(201).json(user.todos[todoIdx]);
});

/**
 * Marca um To-do específico como "feito"
 */
app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const findTodo = user.todos.some((todo) => todo.id === id);

  if (!findTodo) {
    return response.status(404).json({
      error: "To-do not found"
    });
  }

  const todoIdx = user.todos.findIndex((todo) => todo.id === id);

  user.todos[todoIdx] = {
    ...user.todos[todoIdx],
    done: true,
  };

  return response.status(201).json(user.todos[todoIdx]);
});

/**
 * Exclui um To-do
 */
app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoIdx = user.todos.findIndex((todo) => todo.id === id);

  if (todoIdx === -1) {
    return response.status(404).json({
      error: 'To-do not found'
    });
  }

  user.todos.splice(todoIdx, 1);

  return response.status(204).send();

});

module.exports = app;