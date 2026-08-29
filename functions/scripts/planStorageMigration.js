"use strict";

const { deleteApp, initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");

const projectId = "todo-real-c28fa";
const bucketName = "todo-real-c28fa.firebasestorage.app";

const main = async () => {
  const app = initializeApp({ projectId, storageBucket: bucketName });
  const db = getFirestore(app);
  const bucket = getStorage(app).bucket();

  try {
    const [goalSnapshot, filesResult] = await Promise.all([
      db.collection("goal").where("post", "!=", null).get(),
      bucket.getFiles({ prefix: "post/" }),
    ]);
    const files = filesResult[0];
    const fileByName = new Map(files.map((file) => [file.name, file]));
    const referencedNames = new Set();
    const plannedTargets = new Set();
    let legacyReferences = 0;
    let alreadyScopedReferences = 0;
    let missingSources = 0;
    let targetConflicts = 0;
    let invalidOwnerRecords = 0;
    let totalBytes = 0;

    for (const goal of goalSnapshot.docs) {
      const data = goal.data();
      const storedId = data.post?.storedId;
      const userId = data.userId;
      if (typeof storedId !== "string" || typeof userId !== "string") {
        invalidOwnerRecords += 1;
        continue;
      }

      const sourceName = `post/${storedId}`;
      referencedNames.add(sourceName);
      if (storedId.includes("/")) {
        alreadyScopedReferences += 1;
        continue;
      }

      legacyReferences += 1;
      const targetName = `post/${userId}/${storedId}`;
      if (plannedTargets.has(targetName) || fileByName.has(targetName)) {
        targetConflicts += 1;
      }
      plannedTargets.add(targetName);

      const source = fileByName.get(sourceName);
      if (!source) {
        missingSources += 1;
      } else {
        totalBytes += Number(source.metadata.size || 0);
      }
    }

    const orphanObjects = files.filter(
      (file) => !referencedNames.has(file.name)
    ).length;

    process.stdout.write(
      JSON.stringify(
        {
          mode: "read-only",
          goalPosts: goalSnapshot.size,
          storageObjectsUnderPost: files.length,
          legacyReferences,
          alreadyScopedReferences,
          missingSources,
          targetConflicts,
          invalidOwnerRecords,
          orphanObjects,
          migrationBytes: totalBytes,
        },
        null,
        2
      ) + "\n"
    );
  } finally {
    await deleteApp(app);
  }
};

main().catch((error) => {
  console.error("Storage migration dry-run failed:", error.message);
  process.exitCode = 1;
});
