This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started
First run this command to install required packages:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

## Learn More
To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Before using Firebase Emulator
```
npm install -g firebase-tools
```

## Emulate in local
### Frontend
```
npm run dev
```

### Backend
Before using Firebase Emulator, you need to login to Firebase.
```
npm install -g firebase-tools
firebase login
```

Then, you can start the emulator by running the following command if you have access to this project:
```
cd .\functions\
npm run emu
```
This command includes `firebase emulators:start` and `npx tsc --watch` which watches the files and restarts the server when the files are changed.

if you don't want ts-node to watch the files, just use
```
firebase emulators:start
```

## Technical Documents
||Document in this project or related PR|Firebase|
|-|-|-|
|API|[API Document](./Documents/API.md)|[Firebase Cloud Functions](https://firebase.google.com/docs/functions)|
|Database||[Firestore](https://firebase.google.com/docs/firestore)|
|Storage||[Cloud Storage for Firebase](https://firebase.google.com/docs/storage)|
|Authentication||[Firebase Authentication](https://firebase.google.com/docs/auth)|
|Receive Notification|[Cloud Messagingを実装 #49](https://github.com/MurakawaTakuya/todo-real/pull/49)|[Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging/)|
|Schedule/Send Notificaiton|[期限が近い目標にCloud Tasksで通知を送信する機能を実装 #100](https://github.com/MurakawaTakuya/todo-real/pull/100)|[Cloud Tasks in Google Cloud](https://cloud.google.com/tasks/docs)|
|Security||[Firebase App Check](https://firebase.google.com/docs/app-check)|
