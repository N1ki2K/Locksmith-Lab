import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";
import request from "supertest";
import { app } from "../src/index.js";
import { db } from "../src/database.js";

if (!process.env.TEST_DATABASE_URL || !new URL(process.env.TEST_DATABASE_URL).pathname.includes("test")) {
  throw new Error("Set TEST_DATABASE_URL to a dedicated database whose name includes 'test' before running tests");
}

const usernameA = `testa_${randomUUID().slice(0, 8)}`;
const usernameB = `testb_${randomUUID().slice(0, 8)}`;
const passwordA = "correct horse battery staple A1!";
const passwordB = "correct horse battery staple B1!";
const server = app.listen(0);
const agentA = request.agent(server);
const agentB = request.agent(server);
let noteA: number;
let noteB: number;
let initialSessionCookie: string | undefined;

async function token(agent: typeof agentA) {
  const response = await agent.get("/api/csrf-token").expect(200);
  const cookie = (response.headers["set-cookie"] as string[] | undefined)?.find((value) => value.startsWith("secured.sid="));
  if (agent === agentA && cookie && !initialSessionCookie) initialSessionCookie = cookie.split(";")[0];
  return response.body.csrfToken as string;
}
function post(agent: typeof agentA, path: string, body: object, csrf: string) {
  return agent.post(path).set("X-CSRF-Token", csrf).send(body);
}

before(async () => {
  await db.query("SELECT 1");
  await db.query("DELETE FROM users WHERE username LIKE 'testa_%' OR username LIKE 'testb_%'");
});
after(async () => {
  await db.query("DELETE FROM users WHERE username LIKE 'testa_%' OR username LIKE 'testb_%'");
  await db.end();
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

test("CSRF is required; users register with Argon2id hashes and SQL-like strings remain data", async () => {
  await post(agentA, "/api/auth/register", { username: usernameA, password: passwordA }, "").expect(403);
  const csrfA = await token(agentA);
  const registered = await post(agentA, "/api/auth/register", { username: usernameA, password: passwordA }, csrfA).expect(201);
  assert.equal(registered.body.user.username, usernameA);
  assert.equal("password" in registered.body.user, false);
  const stored = await db.query("SELECT password FROM users WHERE username = $1", [usernameA]);
  assert.match(stored.rows[0].password, /^\$argon2id\$/);
  assert.notEqual(stored.rows[0].password, passwordA);
  const dup = await post(agentA, "/api/auth/register", { username: usernameA, password: passwordA }, csrfA).expect(409);
  assert.equal(dup.body.error, "Username already exists");
  await post(agentB, "/api/auth/register", { username: usernameB, password: passwordB }, await token(agentB)).expect(201);
  await post(agentA, "/api/auth/login", { username: usernameA, password: "incorrect password" }, csrfA).expect(401);
  await post(agentA, "/api/auth/login", { username: "' OR '1'='1' --", password: "incorrect password" }, csrfA).expect(400);
});

test("login rotates session ID, and each user can only operate on owned notes", async () => {
  const oldId = initialSessionCookie;
  const csrfA = await token(agentA);
  const loginA = await post(agentA, "/api/auth/login", { username: usernameA, password: passwordA }, csrfA).expect(200);
  const loginCookies = loginA.headers["set-cookie"];
  const newId = (Array.isArray(loginCookies) ? loginCookies : loginCookies ? [loginCookies] : []).find((cookie) => cookie.startsWith("secured.sid="))?.split(";")[0];
  assert.ok(newId && oldId && newId !== oldId, "login must issue a fresh session cookie");
  assert.equal((await agentA.get("/api/notes").expect(200)).body.length, 0);

  const anonymous = request.agent(server);
  await anonymous.get("/api/notes").expect(401);
  const csrfB = await token(agentB);
  await post(agentB, "/api/auth/login", { username: usernameB, password: passwordB }, csrfB).expect(200);

  const mine = await agentA.post("/api/notes").set("X-CSRF-Token", loginA.body.csrfToken).send({ title: "SQL-like ' OR '1'='1", content: `quotes: ' \\"; DROP TABLE notes; --` }).expect(201);
  noteA = mine.body.id;
  const theirs = await agentB.post("/api/notes").set("X-CSRF-Token", (await agentB.get("/api/csrf-token")).body.csrfToken).send({ title: "B note", content: "private" }).expect(201);
  noteB = theirs.body.id;
  assert.deepEqual((await agentA.get("/api/notes").expect(200)).body.map((note: { id: number }) => note.id), [noteA]);
  assert.equal((await agentA.get(`/api/notes/${noteA}`).expect(200)).body.title, "SQL-like ' OR '1'='1");
  await agentA.get(`/api/notes/${noteB}`).expect(404);
  const update = await agentA.put(`/api/notes/${noteB}`).set("X-CSRF-Token", loginA.body.csrfToken).send({ title: "stolen", content: "no" }).expect(404);
  assert.equal(update.body.error, "Note not found");
  await agentA.delete(`/api/notes/${noteB}`).set("X-CSRF-Token", loginA.body.csrfToken).expect(404);
  await agentA.put(`/api/notes/${noteA}`).set("X-CSRF-Token", loginA.body.csrfToken).send({ title: "updated", content: "works" }).expect(200);
  await agentA.delete(`/api/notes/${noteA}`).set("X-CSRF-Token", loginA.body.csrfToken).expect(200);
  await agentB.get(`/api/notes/${noteB}`).expect(200);
  await agentB.put(`/api/notes/${noteB}`).set("X-CSRF-Token", (await agentB.get("/api/csrf-token")).body.csrfToken).send({ title: "B updated", content: "still private" }).expect(200);
  await agentB.delete(`/api/notes/${noteB}`).set("X-CSRF-Token", (await agentB.get("/api/csrf-token")).body.csrfToken).expect(200);
});

test("malformed IDs, unexpected fields, bad types and logout are handled safely", async () => {
  const csrf = await token(agentA);
  await agentA.get("/api/notes/0").expect(400);
  await agentA.get("/api/notes/1abc").expect(400);
  await post(agentA, "/api/notes", { title: "ok", content: "ok", user_id: 1 }, csrf).expect(400);
  await post(agentA, "/api/notes", { title: [], content: "ok" }, csrf).expect(400);
  await agentA.post("/api/auth/logout").expect(403);
  await agentA.post("/api/auth/logout").set("X-CSRF-Token", csrf).expect(200);
  await agentA.get("/api/notes").expect(401);
});
