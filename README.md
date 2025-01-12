# About This Project
TODO REAL is a web application that helps users manage their goals and tasks more effectively. It also works as a social platform, allowing users to share their to-do lists with others. By sending notifications and competing with friends, it makes achieving goals more engaging and easier.
This project is developed using Next.js, Firebase, and TypeScript.
For More information, please refer to the Top Page.
[TODO REAL](https://todo-real-c28fa.web.app/)

## Getting Started
Run the development server:

```bash
npm run dev
```
This includes `npm i` and `next dev`, so you don't have to care about refreshing packages.

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
This command includes `npm i`, `firebase emulators:start` and `npx tsc --watch` which watches the files and restarts the server when the files are changed.

if you don't want ts-node to watch the files, just use
```
firebase emulators:start
```

## Technical Documents
||Document in this project or related PR|Firebase/Google Cloud - Official Documents|
|-|-|-|
|API|[API Document](./Documents/API.md)|[Firebase Cloud Functions](https://firebase.google.com/docs/functions)|
|Database|[Database Document](./Documents/Database.md)|[Firestore](https://firebase.google.com/docs/firestore)|
|Storage||[Cloud Storage for Firebase](https://firebase.google.com/docs/storage)|
|Authentication||[Firebase Authentication](https://firebase.google.com/docs/auth)|
|Receive Notification|[Cloud Messagingを実装 #49](https://github.com/MurakawaTakuya/todo-real/pull/49)|[Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging/)|
|Schedule/Send Notificaiton|[期限が近い目標にCloud Tasksで通知を送信する機能を実装 #100](https://github.com/MurakawaTakuya/todo-real/pull/100)|[Cloud Tasks in Google Cloud](https://cloud.google.com/tasks/docs)|
|Security||[Firebase App Check](https://firebase.google.com/docs/app-check)|
