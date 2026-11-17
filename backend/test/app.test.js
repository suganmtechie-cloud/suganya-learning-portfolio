import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import app from "../src/app.js";

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await once(server, "listening");
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
});

test("GET / returns API identity", async () => {
  const response = await fetch(baseUrl);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    name: "Suganya Learning API",
    version: "0.1.0",
  });
});

test("unknown routes return a JSON 404", async () => {
  const response = await fetch(`${baseUrl}/not-a-route`);
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: "Route not found" });
});
