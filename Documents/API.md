
# API
APIは[Cloud Functions for Firebase](https://firebase.google.com/docs/functions?hl=ja)を使用し、データベースは[Cloud Firestore](https://firebase.google.com/docs/firestore?hl=ja)を使用しています。
## ユーザーデータ
### ユーザーデータを作成
- URL: /user
- Method: POST
- Request
  - Headers
    - Content-Type: application/json
  - Body
    - name: string
    - uid: string
    - fcmToken?: string
  - Example
    ```json
    {
      "name": "testUser",
      "uid": "VikWgycxDM4FM7Z0IlSs",
      "fcmToken": "user's device Firebase Cloud Message Token (required to send notification)"
    }
    ```

- Response
  ```json
  {
    "message":"User created successfully",
    "userId":"VikWgycxDM4FM7Z0IlSs",
    "completed": 4,
    "failed": 1,
    "streak": 2,
  }
  ```
  UserIdはFirebaseによって生成されたハッシュ文字列であり、ドキュメントIDとして保存されます。

### ユーザーデータを取得
- URL: /user/id/:userId
- Method: GET
- Response
  ```json
  {
    "id":"krf6rGH3avZSJXU1nJs5",
    "name":"testUser",
    "completed": 4,
    "failed": 1,
    "streak": 2
  }
  ```

### ユーザーデータを更新
- URL: /user/:userId
- Method: PUT
- Request
  - Headers
    - Content-Type: application/json
  - Body
    - name?: string
    - fcmToken?: string

### ユーザーデータを削除
- URL: /user/:userId
- Method: DELETE

## 目標
### 目標を作成
- URL: /goal
- Method: POST
- Request
  - Headers
    - Content-Type: application/json
  - Body
    - userId: string
    - deadline: Date
    - text: string
  - Example
    ```json
    {
        "userId": "IK0Zc2hoUYaYjXoqzmCl",
        "deadline": "2024-12-31T23:59:59.000Z",
        "text": "数学の勉強する"
    }
    ```
- Response
  ```json
  {
    "message":"Goal created successfully",
    "goalId":"RXlHJiv3GtpzSDHhfljS"
  }
  ```

### 目標を取得
- URL: /goal/:userId
- Method: GET
- Response
  ```json
  [
      {
          "goalId": "QRisLJ9OWsXkkqQmqWDh",
          "deadline": "2025-12-01T23:59:59.000Z",
          "userId": "Vlx6GCtq90ag3lxgh0pcCKGp5ba0",
          "text": "hoge fuga",
          "post": {
              "userId": "Vlx6GCtq90ag3lxgh0pcCKGp5ba0",
              "storedId": "0f9a84ed-8ae8-44b0-a6f5-5ac5ca517948",
              "text": "数学の勉強したよ^^",
              "submittedAt": {
                  "_seconds": 1735603199,
                  "_nanoseconds": 0
              }
          }
      },
      {
          "goalId": "iU2YbeHYWzTOv6THwKBS",
          "deadline": "2025-12-01T23:59:59.000Z",
          "userId": "Vlx6GCtq90ag3lxgh0pcCKGp5ba0",
          "text": "hoge fuga",
          "post": null
      }
  ]
  ```

### 目標を更新
- URL: /goal/:goalId
- Method: PUT
- Request
  - Headers
    - Content-Type: application/json
  - Body
    - userId?: string
    - deadline?: Date
    - text?: string

### 目標を削除
- URL: /goal/:goalId
- Method: DELETE

## 目標完了投稿
### 投稿を作成
- URL: /post
- Method: POST
- Request
  - Headers
    - Content-Type: multipart/form-data
  - Body (form-data)
    - goalId: string
    - text: string
    - storedId: string (画像のストレージパス、/post/{storedId}/image)
    - submittedAt: Date
  - Example
    ```json
    {
        "goalId": "RXlHJiv3GtpzSDHhfljS",
        "text": "今日は勉強をがんばった",
        "storedId": "0f9a84ed-8ae8-44b0-a6f5-5ac5ca517948",
        "submittedAt": "2024-12-31T23:59:59.000Z"
    }
    ```

- Response
  ```json
  {
      "message": "Post created successfully",
      "postId": "mCKHSiUXRESoZhrUFvw6"
  }
  ```
  storedIdはアップロードされた画像のIdです。

### 投稿を取得
- URL: /post/:userId
- Method: GET
- Response
  ```json
  [
      {
          "goalId": "9fgWJA6wMN54EkxIC2WD",
          "userId": "IK0Zc2hoUYaYjXoqzmCl",
          "text": "今日は勉強をがんばった",
          "storedId": "0f9a84ed-8ae8-44b0-a6f5-5ac5ca517948",
          "goalId": "RXlHJiv3GtpzSDHhfljS",
          "submittedAt": "2024-12-31T23:59:59.000Z"
      }
  ]
  ```

### 投稿を更新
投稿を作成するAPIを使用して更新

### 目標を削除
- URL: /post/:postId
- Method: DELETE

## 結果
### 結果を取得
- URL: /result/:userId
  - Empty userId will return all results.
- Parameters
  - limit?: number - デフォルトは50, onlyFinishedの場合はsuccessはlimit分取得し、そこに追加でfailedを取得する形になる
  - offset?: number
  - onlyPending?: boolean - デフォルトはfalse, trueの場合は未完了の目標のみ取得
  - onlyFinished?: boolean - デフォルトはfalse, trueの場合は完了・失敗した目標のみ取得
- Method: GET
- Response
  ```json
  {
      "successResults": [
          {
              "goalId": "e1q1KRGjt9mtwg4eIkFY",
              "userId": "u6HqTq3fi17OH8ZflojatI09GRl3",
              "deadline": "2024-12-29T14:00:00.000Z",
              "text": "Duolingoやる",
              "post": {
                  "text": "フランス語したよ",
                  "storedId": "0f9a84ed-8ae8-44b0-a6f5-5ac5ca517948",
                  "submittedAt": "2024-12-28T09:45:10.718Z"
              },
              "userData": {
                  "name": "Hoge Fuga",
                  "completed": 4,
                  "failed": 1,
                  "streak": 2
              }
          },
      ],
      "failedResults": [
          {
              "goalId": "mtnlXIght7ibmPPX13gw",
              "userId": "u6HqTq3fi17OH8ZflojatI09GRl3",
              "deadline": "2024-12-28T09:47:00.000Z",
              "text": "世界一周する",
              "userData": {
                  "name": "Hoge Fuga",
                  "completed": 4,
                  "failed": 1,
                  "streak": 2
              }
          }
      ],
      "pendingResults": [
          {
              "goalId": "KvVRySu3Hkfl0V8Fubzf",
              "userId": "u6HqTq3fi17OH8ZflojatI09GRl3",
              "deadline": "2024-12-30T14:00:00.000Z",
              "text": "「機械学習からマルチモーダル情報処理へ」を読む",
              "userData": {
                  "name": "Hoge Fuga",
                  "completed": 4,
                  "failed": 1,
                  "streak": 2
              }
          }
      ]
  }
  ```

## リアクション
### リアクションを作成・更新
- URL: /reaction/:goalId
- Method: PUT
- Request
  - Headers
    - Content-Type: application/json
  - Body
    - userId: string
    - reaction: string
  - Example
    ```json
    {
        "userId": "IK0Zc2hoUYaYjXoqzmCl",
        "reactionType": "clap"
    }
    ```
