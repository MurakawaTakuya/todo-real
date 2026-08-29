"use strict";

const { deleteApp, initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");

const expectedProject = "todo-real-c28fa";
const bucketName = "todo-real-c28fa.firebasestorage.app";

const main = async () => {
  const execute = process.argv.includes("--execute");
  const projectArgument = process.argv.find((value) =>
    value.startsWith("--project=")
  );
  const projectId = projectArgument?.split("=")[1];
  if (!execute || projectId !== expectedProject) {
    throw new Error(
      "Refusing to run without --execute --project=todo-real-c28fa"
    );
  }

  const app = initializeApp({ projectId, storageBucket: bucketName });
  const db = getFirestore(app);
  const bucket = getStorage(app).bucket();
  const summary = {
    mode: "copy-and-repoint",
    discovered: 0,
    migrated: 0,
    alreadyMigrated: 0,
    copiedEarlier: 0,
    failed: 0,
    sourceObjectsDeleted: 0,
  };

  try {
    const snapshot = await db.collection("goal").where("post", "!=", null).get();
    summary.discovered = snapshot.size;

    for (const goal of snapshot.docs) {
      const data = goal.data();
      const storedId = data.post?.storedId;
      const userId = data.userId;
      if (typeof storedId !== "string" || typeof userId !== "string") {
        summary.failed += 1;
        continue;
      }
      if (storedId.includes("/")) {
        summary.alreadyMigrated += 1;
        continue;
      }

      const targetId = `${userId}/${storedId}`;
      const source = bucket.file(`post/${storedId}`);
      const target = bucket.file(`post/${targetId}`);

      try {
        const [[sourceExists], [targetExists]] = await Promise.all([
          source.exists(),
          target.exists(),
        ]);
        if (!sourceExists) {
          throw new Error("source object is missing");
        }

        if (!targetExists) {
          await source.copy(target, {
            preconditionOpts: { ifGenerationMatch: 0 },
          });
        } else {
          summary.copiedEarlier += 1;
        }

        const [[sourceMetadata], [targetMetadata]] = await Promise.all([
          source.getMetadata(),
          target.getMetadata(),
        ]);
        if (
          sourceMetadata.size !== targetMetadata.size ||
          sourceMetadata.md5Hash !== targetMetadata.md5Hash
        ) {
          throw new Error("copied object failed integrity verification");
        }

        const updated = await db.runTransaction(async (transaction) => {
          const freshGoal = await transaction.get(goal.ref);
          const freshStoredId = freshGoal.data()?.post?.storedId;
          if (freshStoredId === targetId) return false;
          if (freshStoredId !== storedId) {
            throw new Error("goal post changed during migration");
          }
          transaction.update(goal.ref, { "post.storedId": targetId });
          return true;
        });

        if (updated) summary.migrated += 1;
        else summary.alreadyMigrated += 1;
      } catch (error) {
        summary.failed += 1;
        console.error("Migration item failed", {
          goalId: goal.id,
          reason: error.message,
        });
      }
    }

    process.stdout.write(JSON.stringify(summary, null, 2) + "\n");
    if (summary.failed > 0) process.exitCode = 2;
  } finally {
    await deleteApp(app);
  }
};

main().catch((error) => {
  console.error("Storage migration failed:", error.message);
  process.exitCode = 1;
});
