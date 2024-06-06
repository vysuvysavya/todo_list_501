const request = require('supertest')
const cheerio = require('cheerio')

const db = require('../models/index')
const app = require('../app')

let server

function extractCsrfToken (html) {
  const $ = cheerio.load(html)
  return $('input[name=_csrf]').val()
}

async function loginHelper (agent, username, password) {
  let response = await agent.get('/login')
  const csrfToken = extractCsrfToken(response.text)
  response = await agent.post('/session').send({
    email: username,
    password,
    _csrf: csrfToken
  })
  return response
}

describe('Todo test suite', () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true })
    server = app.listen(4000, () => {})
  })

  afterAll(async () => {
    await db.sequelize.close()
    await server.close()
  })

  test('Sign Up a new user', async () => {
    const agent = request.agent(server)
    let response = await agent.get('/signup')
    const csrfToken = extractCsrfToken(response.text)
    response = await agent.post('/users').send({
      firstName: 'John',
      lastName: 'Doe',
      email: 'johndoe@email.com',
      password: 'password',
      _csrf: csrfToken
    })
    expect(response.statusCode).toBe(302)
    expect(response.headers.location).toEqual('/todos')
  })

  test('Sign out a user', async () => {
    const agent = request.agent(server)
    await loginHelper(agent, 'johndoe@email.com', 'password')
    let response = await agent.get('/todos')
    expect(response.statusCode).toBe(200)
    response = await agent.get('/signout')
    expect(response.statusCode).toBe(302)
    expect(response.headers.location).toEqual('/')
    response = await agent.get('/todos')
    expect(response.statusCode).toBe(302)
    expect(response.headers.location).toEqual('/login')
  })

  test('Create a new todo by POST /todos', async () => {
    const agent = request.agent(server)
    await loginHelper(agent, 'johndoe@email.com', 'password')
    const home = await agent.get('/todos')
    const csrfToken = extractCsrfToken(home.text)
    const response = await agent
      .post('/todos')
      .set('Accept', 'application/json')
      .send({
        title: 'Test creating a new todo',
        dueDate: new Date().toISOString(),
        completed: false,
        _csrf: csrfToken
      })

    expect(response.statusCode).toBe(200)
    expect(response.headers['content-type']).toEqual(
      expect.stringContaining('json')
    )
    const parseResponse = JSON.parse(response.text)
    expect(parseResponse).toHaveProperty('id')
    expect(parseResponse).toHaveProperty('title')
    expect(parseResponse).toHaveProperty('dueDate')
    expect(parseResponse).toHaveProperty('completed')
  })

  test('Mark a todo as completed and then incomplete by PUT /todos/:id', async () => {
    const agent = request.agent(server)
    await loginHelper(agent, 'johndoe@email.com', 'password')
    // create an uncompleted todo
    let home = await agent.get('/todos')
    let csrfToken = extractCsrfToken(home.text)
    const response = await agent
      .post('/todos')
      .set('Accept', 'application/json')
      .send({
        title: 'Test marking a todo as completed',
        dueDate: new Date().toISOString(),
        completed: false,
        _csrf: csrfToken
      })

    expect(response.statusCode).toBe(200)
    const todo = JSON.parse(response.text)

    home = await agent.get('/todos')
    csrfToken = extractCsrfToken(home.text)

    const markCompleteResponse = await agent
      .set('Accept', 'application/json')
      .put(`/todos/${todo.id}`)
      .send({ completed: true, _csrf: csrfToken })

    expect(markCompleteResponse.statusCode).toBe(200)
    expect(markCompleteResponse.headers['content-type']).toEqual(
      expect.stringContaining('json')
    )
    const parseMarkCompleteResponse = JSON.parse(markCompleteResponse.text)
    expect(parseMarkCompleteResponse).toHaveProperty('completed')
    expect(parseMarkCompleteResponse.completed).toBe(true)

    home = await agent.get('/todos')
    csrfToken = extractCsrfToken(home.text)

    const markIncompleteResponse = await agent
      .set('Accept', 'application/json')
      .put(`/todos/${todo.id}`)
      .send({ completed: false, _csrf: csrfToken })

    expect(markIncompleteResponse.statusCode).toBe(200)
    expect(markIncompleteResponse.headers['content-type']).toEqual(
      expect.stringContaining('json')
    )
    const parseMarkIncompleteResponse = JSON.parse(markIncompleteResponse.text)
    expect(parseMarkIncompleteResponse).toHaveProperty('completed')
    expect(parseMarkIncompleteResponse.completed).toBe(false)
  })

  test('Delete a todo by DELETE /todos/:id where the todo exists', async () => {
    const agent = request.agent(server)
    await loginHelper(agent, 'johndoe@email.com', 'password')
    // extract csrf token from home page
    let home = await agent.get('/todos').set('Accept', 'html')
    let csrfToken = extractCsrfToken(home.text)

    const response = await agent
      .post('/todos')
      .set('Accept', 'application/json')
      .send({
        title: 'Test deleting a todo',
        dueDate: new Date().toISOString(),
        completed: false,
        _csrf: csrfToken
      })

    expect(response.statusCode).toBe(200)
    const todo = JSON.parse(response.text)

    home = await agent.get('/todos')
    csrfToken = extractCsrfToken(home.text)

    const deleteResponse = await agent
      .delete(`/todos/${todo.id}`)
      .set('Accept', 'application/json')
      .send({ _csrf: csrfToken })
    expect(deleteResponse.statusCode).toBe(200)
    expect(deleteResponse.headers['content-type']).toEqual(
      expect.stringContaining('json')
    )
    expect(deleteResponse.text).toBe('true')
  })
})