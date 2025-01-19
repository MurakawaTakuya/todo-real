# TODO REALとは
TODO REALは、TODOリストをSNSのように共有できるようにすることで、目標やタスクの達成を効果的かつ継続的にサポートするWebアプリケーションです。  
<p align="center">
  <img src="https://github.com/user-attachments/assets/3f4aea01-ef49-43ac-af95-62d9e61a61ff" alt="画像の説明" width="500">
</p>
アプリの使用方法や特徴、詳細については、トップページを参照してください。

[TODO REAL トップページ](https://todo-real-c28fa.web.app/)

# ローカルで開発する手順
開発にはFirebaseプロジェクトもしくは権原が必要です。
## フロントエンドを起動

```bash
npm run dev
```
このコマンドは`npm i`と`next dev`を含んでいます。
Next.jsに関しては[公式サイト](https://nextjs.org/learn)や[公式ドキュメント](https://nextjs.org/docs)を参照してください。

## バックエンドを起動
初回のみ以下のコマンドを実行
```
npm install -g firebase-tools
firebase login
```
エミュレーターを起動(ローカルでは認証やデータベース、API等全てのサーバーサイドの機能をエミュレーターで実行します。)
```
cd .\functions\
npm run emu
```
`npm run emu`は`npm i`, `firebase emulators:start`, `npx tsc --watch`を含んでいます。ファイルに変更があった場合にはAPIを自動で再起動します。

ファイル変更時に自動で再起動をしない場合は次のコマンドを実行してください。
```
firebase emulators:start
```

## 技術的なドキュメント
このプロジェクトはフロントエンドにTypeScript, Next.jsを使用し、バックエンドにTypeScript, Node.js, Firebaseを使用しています。  
技術的な実装方法や仕様に関しては以下のドキュメントを参照してください。
||このプロジェクト内のドキュメント/関連するPR|Firebase/Google Cloudの公式ドキュメント|
|-|-|-|
|API|[API Document](./Documents/API.md)|[Cloud Functions for Firebase](https://firebase.google.com/docs/functions)|
|データベース|[Database Document](./Documents/Database.md)|[Cloud Firestore](https://firebase.google.com/docs/firestore)|
|ストレージ||[Cloud Storage for Firebase](https://firebase.google.com/docs/storage)|
|認証|[PR: ログイン機能をFirebase Authenticationに接続 #39](https://github.com/MurakawaTakuya/todo-real/pull/39)|[Firebase Authentication](https://firebase.google.com/docs/auth)|
|通知を受信|[PR: Cloud Messagingを実装 #49](https://github.com/MurakawaTakuya/todo-real/pull/49)|[Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging/)|
|スケジューラー/通知を送信|[PR: 期限が近い目標にCloud Tasksで通知を送信する機能を実装 #100](https://github.com/MurakawaTakuya/todo-real/pull/100)|[Cloud Tasks in Google Cloud](https://cloud.google.com/tasks/docs)|
|セキュリティ|[PR: App CheckとAnalyticaの導入 #84](https://github.com/MurakawaTakuya/todo-real/pull/84)|[Firebase App Check](https://firebase.google.com/docs/app-check)|
|ログ||[Cloud Logging](https://firebase.google.com/docs/functions/writing-and-viewing-logs?hl=ja&gen=2nd)|
