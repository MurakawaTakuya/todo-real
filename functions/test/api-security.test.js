const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");
const { deleteApp, initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");

const projectId = "todo-real-c28fa";
const apiBase =
  "http://127.0.0.1:5001/todo-real-c28fa/asia-northeast1/firestore";
let adminApp;
let auth;
let db;
let userAToken;
let userBToken;

const signIn = async (email, password) => {
  const response = await fetch(
    "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/" +
      "accounts:signInWithPassword?key=emulator",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );
  assert.equal(response.status, 200);
  return (await response.json()).idToken;
};

const apiRequest = (method, path, token, body) =>
  fetch(`${apiBase}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

before(async () => {
  adminApp = initializeApp({ projectId }, "api-security-test");
  auth = getAuth(adminApp);
  db = getFirestore(adminApp);

  await auth.createUser({
    uid: "user-a",
    email: "user-a@example.com",
    emailVerified: true,
    password: "correct-horse-battery-staple",
  });
  await auth.createUser({
    uid: "user-b",
    email: "user-b@example.com",
    emailVerified: true,
    password: "another-correct-password",
  });
  userAToken = await signIn(
    "user-a@example.com",
    "correct-horse-battery-staple"
  );
  userBToken = await signIn(
    "user-b@example.com",
    "another-correct-password"
  );

  await db.collection("user").doc("user-a").set({
    name: "User A",
    streak: 0,
    fcmToken: "",
  });
  await db.collection("user").doc("user-b").set({
    name: "User B",
    streak: 0,
    fcmToken: "",
  });
  await db.collection("goal").doc("goal-a").set({
    userId: "user-a",
    deadline: Timestamp.fromMillis(Date.now() + 60 * 60 * 1000),
    text: "Owner A goal",
    post: null,
    reaction: null,
  });
});

after(async () => {
  await deleteApp(adminApp);
});

test("write requests require a Firebase ID token", async () => {
  const response = await apiRequest("PUT", "/goal/goal-a", undefined, {
    text: "unauthorized",
  });
  assert.equal(response.status, 401);
});

test("a user cannot update another user's profile or goal", async () => {
  const profileResponse = await apiRequest(
    "PUT",
    "/user/user-a",
    userBToken,
    { name: "Impersonated" }
  );
  assert.equal(profileResponse.status, 403);

  const goalResponse = await apiRequest(
    "PUT",
    "/goal/goal-a",
    userBToken,
    { text: "Hijacked" }
  );
  assert.equal(goalResponse.status, 403);
  assert.equal((await db.collection("goal").doc("goal-a").get()).data().text,
    "Owner A goal");
});

test("an owner can update their own goal", async () => {
  const response = await apiRequest("PUT", "/goal/goal-a", userAToken, {
    text: "Updated by owner",
  });
  assert.equal(response.status, 200);
  assert.equal((await db.collection("goal").doc("goal-a").get()).data().text,
    "Updated by owner");
});

test("client supplied ownership fields are ignored", async () => {
  const response = await apiRequest("POST", "/goal/", userAToken, {
    userId: "user-b",
    deadline: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    text: "Spoofed owner",
  });
  assert.equal(response.status, 201);
  const { goalId } = await response.json();
  const created = (await db.collection("goal").doc(goalId).get()).data();
  assert.equal(created.userId, "user-a");
});

test("reactions ignore supplied userId and use the authenticated uid", async () => {
  const accepted = await apiRequest(
    "PUT",
    "/reaction/goal-a",
    userBToken,
    { userId: "user-a", reactionType: "clap" }
  );
  assert.equal(accepted.status, 200);
  const goal = (await db.collection("goal").doc("goal-a").get()).data();
  assert.equal(goal.reaction["user-b"], "clap");
  assert.equal(goal.reaction["user-a"], undefined);
});

test("a user cannot attach a post to another user's goal", async () => {
  const response = await apiRequest("POST", "/post/", userBToken, {
    goalId: "goal-a",
    storedId: "user-b/00000000-0000-4000-8000-000000000001",
    text: "Not my post",
  });
  assert.equal(response.status, 403);
});
