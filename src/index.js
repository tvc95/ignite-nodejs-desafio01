const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

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
 * A rota deve receber name, e username dentro do corpo da 
 * requisição. Ao cadastrar um novo usuário, ele deve ser 
 * armazenado dentro de um objeto no seguinte formato:
 * { id (uuid), name (string), username (string), todos ([])}
 * 
 * Certifique-se que o ID seja um UUID, e de sempre iniciar a 
 * lista todos como um array vazio. O objeto do usuário deve 
 * ser retornado na resposta da requisição.
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

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

module.exports = app;