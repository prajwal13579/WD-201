const request = require("supertest");
var cheerio = require("cheerio");
const db = require("../models/index");
const app = require("../app");

let server, agent;

function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}

const login = async (agent, username, password) => {
  let res = await agent.get("/login");
  let csrfToken = extractCsrfToken(res);
  res = await agent.post("/session").send({
    email: username,
    password: password,
    _csrf: csrfToken,
  });
};

describe("Todo test suite", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(4000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    await db.sequelize.close();
    server.close();
  });

  test("Testing the Sign up functionality", async () => {
    let res = await agent.get("/signup");
    const csrfToken = extractCsrfToken(res);
    res = await agent.post("/users").send({
      firstName: "Testing",
      lastName: "Test",
      email: "testing@testing.com",
      password: "12345678",
      _csrf: csrfToken,
    });

    expect(res.statusCode).toBe(302);
  });

  test("Testing the Sign out functionality", async () => {
    let res = await agent.get("/todos");
    expect(res.statusCode).toBe(200);
    res = await agent.get("/signout");
    expect(res.statusCode).toBe(302);
    res = await agent.get("/todos");
    expect(res.statusCode).toBe(302);
  });

  test("creating response /todos by id", async () => {
    const agent = request.agent(server);
    await login(agent, "testing@testing.com", "12345678");
    const res = await agent.get("/todos");
    const csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      title: "Buy Milk",
      dueDate: new Date().toISOString().substring(0, 10),
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302);
  });

  test("Mark as Complete", async () => {
    const agent = request.agent(server);
    await login(agent, "testing@testing.com", "12345678");
    var res = await agent.get("/todos");
    var csrfToken = extractCsrfToken(res);

    await agent.post("/todos").send({
      title: "Buy Milk",
      dueDate: new Date().toISOString().substring(0, 10),
      completed: false,
      _csrf: csrfToken,
    });

    const todoResponse = await agent
      .get("/todos")
      .set("Accept", "application/json");
    const parsedResponse = JSON.parse(todoResponse.text);
    // console.log(`Todo Response: ${todoResponse.text}`);
    const todayItemsCount = parsedResponse.dueTodayItems.length;
    const latestTodo = parsedResponse.dueTodayItems[todayItemsCount - 1];

     res = await agent.get("/todos");
     csrfToken = extractCsrfToken(res);

    const markCompleteResponse = await agent
      .put(`/todos/${latestTodo.id}`)
      .send({
        _csrf: csrfToken,
        completed: true,
      });

    const parsedCompleteResponse = JSON.parse(markCompleteResponse.text);
    expect(parsedCompleteResponse.completed).toBe(true);
  });

  test("Mark Incomplete", async () => {
    const agent = request.agent(server);
    await login(agent, "testing@testing.com", "12345678");
    var res = await agent.get("/todos");
    var csrfToken = extractCsrfToken(res);

    await agent.post("/todos").send({
      title: "Buy Milk",
      dueDate: new Date().toISOString().substring(0, 10),
      completed: true,
      _csrf: csrfToken,
    });

    const todoResponse = await agent
      .get("/todos")
      .set("Accept", "application/json");
    const parsedResponse = JSON.parse(todoResponse.text);
    const todayItemsCount = parsedResponse.dueTodayItems.length;
    const latestTodo = parsedResponse.dueTodayItems[todayItemsCount - 1];

    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);

    const markCompleteResponse = await agent
      .put(`/todos/${latestTodo.id}`)
      .send({
        _csrf: csrfToken,
        completed: false,
      });

    const parsedCompleteResponse = JSON.parse(markCompleteResponse.text);
    expect(parsedCompleteResponse.completed).toBe(false);
  });

  test("Delete test", async () => {
    const agent = request.agent(server);
    await login(agent, "testing@testing.com", "12345678");
    var res = await agent.get("/todos");
    var csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Item to Delete",
      dueDate: new Date().toISOString().substring(0, 10),
      completed: false,
      _csrf: csrfToken,
    });

    const todoResponse = await agent
      .get("/todos")
      .set("Accept", "application/json");
    const parsedResponse = JSON.parse(todoResponse.text);
    const dueTodayCount = parsedResponse.dueTodayItems.length;
    const latestTodo = parsedResponse.dueTodayItems[dueTodayCount - 1];
    const todoID = latestTodo.id;
    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);
    const deletedResponse = await agent.delete(`/todos/${todoID}`).send({
      _csrf: csrfToken,
    });
    const parsedDeletedResponse = JSON.parse(deletedResponse.text);
    expect(deletedResponse.statusCode).toBe(200);
    expect(parsedDeletedResponse.success).toBe(true);
  });
});
