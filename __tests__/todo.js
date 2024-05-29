const request = require('supertest');
const db = require("../models/index");
const app = require('../app');
let server, agent;

describe("Todolist Test Suite", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(3000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    await db.sequelize.close();
    server.close();
  });

  test('responds with json at /todos', async () => {
    const response = await agent.post('/todos').send({
      title: 'Buy Milk',
      dueDate: new Date().toISOString(),
      completed: false
    });
    expect(response.statusCode).toBe(200);
    expect(response.header['content-type']).toBe(
      "application/json; charset=utf-8"
    );
    const parsedResponse = JSON.parse(response.text);
    expect(parsedResponse.id).toBeDefined();
  });

  test('Mark a todo as complete', async () => {
    const response = await agent.post('/todos').send({
      title: 'Buy Milk',
      dueDate: new Date().toISOString(),
      completed: false
    });
    const parsedResponse = JSON.parse(response.text);
    const todoID = parsedResponse.id;

    expect(parsedResponse.completed).toBe(false);

    const markCompleteResponse = await agent.put(`/todos/${todoID}/markAsCompleted`).send();
    const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
    expect(parsedUpdateResponse.completed).toBe(true);
  });

  test('Delete a todo', async () => {
    const response = await agent.post('/todos').send({
      title: 'Buy Milk',
      dueDate: new Date().toISOString(),
      completed: false
    });
    const parsedResponse = JSON.parse(response.text);
    const todoID = parsedResponse.id;

    expect(parsedResponse.id).toBeDefined();

    const deleteResponse = await agent.delete(`/todos/${todoID}`).send();
    expect(deleteResponse.statusCode).toBe(200);
    const deleteParsedResponse = JSON.parse(deleteResponse.text);
    expect(deleteParsedResponse.message).toBe('Todo deleted successfully');

    const getResponse = await agent.get(`/todos/${todoID}`).send();
    expect(getResponse.statusCode).toBe(404);
  });
});
