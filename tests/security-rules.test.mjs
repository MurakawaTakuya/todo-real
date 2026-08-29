import fs from "node:fs";
import test, { after, before, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import {
  getBytes,
  ref,
  uploadBytes,
} from "firebase/storage";

const projectId = "todo-real-security-rules-test";
let testEnvironment;

const verifiedClaims = {
  email: "user-a@example.com",
  email_verified: true,
  firebase: { sign_in_provider: "password" },
};

before(async () => {
  testEnvironment = await initializeTestEnvironment({
    projectId,
    firestore: { rules: fs.readFileSync("firestore.rules", "utf8") },
    storage: { rules: fs.readFileSync("storage.rules", "utf8") },
  });
});

beforeEach(async () => {
  await testEnvironment.clearFirestore();
  await testEnvironment.clearStorage();
});

after(async () => {
  await testEnvironment.cleanup();
});

test("Firestore rejects all direct client reads and writes", async () => {
  const authenticated = testEnvironment.authenticatedContext(
    "user-a",
    verifiedClaims
  );
  const unauthenticated = testEnvironment.unauthenticatedContext();

  await assertFails(getDoc(doc(authenticated.firestore(), "goal", "goal-a")));
  await assertFails(
    setDoc(doc(authenticated.firestore(), "goal", "goal-a"), {
      userId: "user-a",
    })
  );
  await assertFails(
    getDoc(doc(unauthenticated.firestore(), "goal", "goal-a"))
  );
});

test("Storage permits only verified owners to create allowed images", async () => {
  const owner = testEnvironment.authenticatedContext(
    "user-a",
    verifiedClaims
  );
  const otherUser = testEnvironment.authenticatedContext("user-b", {
    ...verifiedClaims,
    email: "user-b@example.com",
  });
  const unverifiedUser = testEnvironment.authenticatedContext("user-a", {
    ...verifiedClaims,
    email_verified: false,
  });
  const anonymousUser = testEnvironment.authenticatedContext("user-a", {
    firebase: { sign_in_provider: "anonymous" },
  });
  const bytes = new Uint8Array([137, 80, 78, 71]);
  const ownPath = "post/user-a/00000000-0000-4000-8000-000000000001";

  await assertSucceeds(
    uploadBytes(ref(owner.storage(), ownPath), bytes, {
      contentType: "image/png",
    })
  );
  await assertFails(
    uploadBytes(
      ref(otherUser.storage(), "post/user-a/other-object"),
      bytes,
      { contentType: "image/png" }
    )
  );
  await assertFails(
    uploadBytes(
      ref(unverifiedUser.storage(), "post/user-a/unverified-object"),
      bytes,
      { contentType: "image/png" }
    )
  );
  await assertFails(
    uploadBytes(
      ref(anonymousUser.storage(), "post/user-a/anonymous-object"),
      bytes,
      { contentType: "image/png" }
    )
  );
  await assertFails(
    uploadBytes(ref(owner.storage(), "post/user-a/svg-object"), bytes, {
      contentType: "image/svg+xml",
    })
  );
});

test("legacy objects are authenticated-read-only during migration", async () => {
  const legacyPath = "post/legacy-object";
  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    await uploadBytes(
      ref(context.storage(), legacyPath),
      new Uint8Array([1, 2, 3]),
      { contentType: "image/png" }
    );
  });

  const authenticated = testEnvironment.authenticatedContext(
    "user-a",
    verifiedClaims
  );
  const unauthenticated = testEnvironment.unauthenticatedContext();
  const existing = await assertSucceeds(
    getBytes(ref(authenticated.storage(), legacyPath))
  );
  assert.equal(existing.byteLength, 3);
  await assertFails(getBytes(ref(unauthenticated.storage(), legacyPath)));
  await assertFails(
    uploadBytes(
      ref(authenticated.storage(), legacyPath),
      new Uint8Array([4]),
      { contentType: "image/png" }
    )
  );
});
