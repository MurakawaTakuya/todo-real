
# API
API is provided by Firebase Cloud Functions. Database is provided by Firestore.
## UserData
### Create User Data
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
  UserId is hash string generated by Firebase and saved as its document id.

### Get User
#### Get User by User Id
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

#### Get User by User Name
- URL: /user/name/:userName
- Method: GET
- Response  
  the same as Get User by User Id

### Update User Data
- URL: /user/:userId
- Method: PUT
- Request
  - Headers
    - Content-Type: application/json
  - Body
    - name?: string
    - fcmToken?: string

### Delete User Data
- URL: /user/:userId
- Method: DELETE

## Goals
### Create Goal
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

### Get Goal
- URL: /goal/:goalId
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

### Update Goal
- URL: /goal/:goalId
- Method: PUT
- Request
  - Headers
    - Content-Type: application/json
  - Body
    - userId?: string
    - deadline?: Date
    - text?: string

### Delete Goal
- URL: /goal/:goalId
- Method: DELETE

## Posts
### Create Post
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
  imageUrl is the URL of the uploaded image.

### Get Post
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

### Update Post
Use Create Post API to update post.

### Delete Post
- URL: /post/:postId
- Method: DELETE

## Result
### Get Result
- URL: /result/:?userId
  - Empty userId will return all results.
- Parameters
  - limit?: number - The maximum number of results to return. (Default is 50)
  - offset?: number - The number of results to skip before starting to collect the result set.
  - onlyPending?: boolean - If true, only pending goals will be returned. (Default is false)
  - onlyCompleted?: boolean - If true, only completed or failed goals will be returned. (Default is false)
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
