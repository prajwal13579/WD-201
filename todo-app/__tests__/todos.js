const request = require("supertest");
const db = require("../models/index");
const app = require("../app");
var cheerio = require("cheerio");
const csrf = require("csrf");

let server, agent;
function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}

describe("Todo Application", function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(4000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    try {
      await db.sequelize.close();
      await server.close();
    } catch (error) {
      console.log(error);
    }
  });

  test("Creates a new todo and responds with json at /todos POST endpoint", async () => {
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302);
  });

  test("Marks a todo with given id as complete", async () => {
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });

    const todoResponse = await agent.get("/").set("Accept", "application/json");
    const parsedResponse = JSON.parse(todoResponse.text);
    const todayItemsCount = parsedResponse.dueToday.length;
    const latestTodo = parsedResponse.dueToday[todayItemsCount - 1];

    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);
    const markCompleteResponse = await agent.put(`/todos/${latestTodo.id}`).send({
        _csrf: csrfToken,
        completed: true,
      });
    const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
    expect(parsedUpdateResponse.completed).toBe(true);
  });
  test("Marks a todo with given id as Incomplete", async () => {
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: true,
      _csrf: csrfToken,
    });

    const todoResponse = await agent.get("/").set("Accept", "application/json");
    const parsedResponse = JSON.parse(todoResponse.text);
    const todayItemsCount = parsedResponse.dueToday.length;
    const latestTodo = parsedResponse.dueToday[todayItemsCount - 1];

    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);
    const markCompleteResponse = await agent.put(`/todos/${latestTodo.id}`).send({
        _csrf: csrfToken,
        completed: false,
      });
    const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
    expect(parsedUpdateResponse.completed).toBe(false);
  });
  test("Delete a todo ", async () => {
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);

    await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: true,
      _csrf: csrfToken,
    });

    const todoResponse = await agent.get("/").set("Accept", "application/json");
    const parsedResponse = JSON.parse(todoResponse.text);
    const allTodosCount = parsedResponse.allTodos.length;
    const latestTodo = parsedResponse.allTodos[allTodosCount - 1];

    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);

    const deletedResponse = await agent
      .delete(`/todos/${latestTodo.id}`)
      .send({ _csrf: csrfToken });
    const parsedDeletedResponse = JSON.parse(deletedResponse.text);
    expect(parsedDeletedResponse.success).toBe(true);
  });
})