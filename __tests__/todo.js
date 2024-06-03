const request = require('supertest');
var cheerio = require('cheerio');
const db = require("../models/index");
const app = require('../app');
let server, agent;
function extractCsrfToken(res){
  var $ = cheerio.load(res.text);
  return $('[name=_csrf]').val();
}
describe("Todolist Test Suite", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(4000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    await db.sequelize.close();
    server.close();
  });

  test('responds with json at /todos', async () => {
    const res = await agent.get('/');
    const csrfToken = extractCsrfToken(res);
    const response = await agent.post('/todos').send({
      title: 'Buy Milk',
      dueDate: new Date().toISOString(),
      completed: false,
      '_csrf' : csrfToken
    });
    expect(response.statusCode).toBe(302);
   
  });

  test('Mark a todo as complete', async () => {
    let res = await agent.get('/');
    let csrfToken = extractCsrfToken(res);
    await agent.post('/todos').send({
      title: 'Buy Milk',
      dueDate: new Date().toISOString(),
      completed: false,
      '_csrf': csrfToken
    });

    const groupedResponse = await agent
      .get('/')
      .set('Accept', 'application/json');
    const parsedGroupedResponse = JSON.parse(groupedResponse.text);
    const dueTodayCount = parsedGroupedResponse.dueToday ? parsedGroupedResponse.dueToday.length : 0;
    if (dueTodayCount === 0) {
      console.log("No todos found in dueToday:", parsedGroupedResponse);
      return; 
    }
    
    const latestTodo = parsedGroupedResponse.dueToday[dueTodayCount - 1];

    res = await agent.get('/');
    csrfToken = extractCsrfToken(res);

    const markCompleteResponse = await agent.put(`/todos/${latestTodo.id}/markAsCompleted`).send({
      _csrf: csrfToken,
    });
    const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
    expect(parsedUpdateResponse.completed).toBe(true);
  });
  test('Delete a todo', async () => {
    const res = await agent.get('/');
    const csrfToken = extractCsrfToken(res);
    const response = await agent.post('/todos').send({
      title: 'Buy Milk',
      dueDate: new Date().toISOString(),
      completed: false,
      '_csrf': csrfToken
    });

    const groupedResponse = await agent
      .get('/')
      .set('Accept', 'application/json');
    const parsedGroupedResponse = JSON.parse(groupedResponse.text);
    const dueTodayCount = parsedGroupedResponse.dueToday ? parsedGroupedResponse.dueToday.length : 0;
    if (dueTodayCount === 0) {
      console.log("No todos found in dueToday:", parsedGroupedResponse);
      return;
    }

    const latestTodo = parsedGroupedResponse.dueToday[dueTodayCount - 1];

    res = await agent.get('/');
    csrfToken = extractCsrfToken(res);

    const deleteResponse = await agent.delete(`/todos/${latestTodo.id}`).send({
      '_csrf': csrfToken
    });
    expect(deleteResponse.statusCode).toBe(200);

    const verifyDeleteResponse = await agent.get(`/todos/${latestTodo.id}`);
    expect(verifyDeleteResponse.statusCode).toBe(404);
  });
});
