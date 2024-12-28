
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
    "userId":"VikWgycxDM4FM7Z0IlSs"
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
    "streak":10
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
              "storedId": "ointtq9NT5TPgEnKS4tb",
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
          "text": "hoge fuga"
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
    - userId: string
    - storedId: string (画像のストレージパス、/post/{storedId}/image)
    - text: string
    - goalId: string
    - submittedAt: Date
  - Example
    ```json
    {
        "userId": "IK0Zc2hoUYaYjXoqzmCl",
        "storedId": "DF48XfTFc42l6C58lLDq",
        "text": "今日は勉強をがんばった",
        "goalId": "RXlHJiv3GtpzSDHhfljS",
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
          "id": "9fgWJA6wMN54EkxIC2WD",
          "userId": "IK0Zc2hoUYaYjXoqzmCl",
          "storedId": "t8eo1wEE7AT12eZo3dKA",
          "text": "今日は勉強をがんばった",
          "goalId": "RXlHJiv3GtpzSDHhfljS",
          "submittedAt": "2024-12-31T23:59:59.000Z"
      }
  ]
  ```

### Update Post
- URL: /post/:postId
- Method: PUT
- Request
  - Headers
    - Content-Type: application/json
  - Body
    - userId?: string
    - storedId?: string
    - text?: string
    - goalId?: string
    - submittedAt?: Date

### Delete Post
- URL: /post/:postId
- Method: DELETE

## Result
### Get Result
- URL: /result/:?userId
  - Empty userId will return all results.
- Parameters
  - limit?: number - The maximum number of results to return.(Default is 50)
  - offset?: number - The number of results to skip before starting to collect the result set.
- Method: GET
- Response
  ```json
  {
      "successResults": [
          {
              "goalId": "iU2YbeHYWzTOv6THwKBS",
              "userId": "Vlx6GCtq90ag3lxgh0pcCKGp5ba0",
              "deadline": "2025-12-01T23:59:59.000Z",
              "text": "hoge fuga",
              "post": {
                  "userId": "Vlx6GCtq90ag3lxgh0pcCKGp5ba0",
                  "storedURL": "ointtq9NT5TPgEnKS4tb",
                  "text": "数学の勉強したよ^^",
                  "submittedAt": "2024-12-30T23:59:59.000Z"
              },
              "userName": "yaho"
          }
      ],
      "failedResults": [
          {
              "goalId": "MCvDIHWMFYKIOiFO5iaF",
              "userId": "Vlx6GCtq90ag3lxgh0pcCKGp5ba0",
              "deadline": "2023-12-01T23:59:59.000Z",
              "text": "hoge fuga",
              "userName": "yaho"
          },
      ],
      "pendingResults": [
          {
              "goalId": "nmul2KBXWZlGlbHw2Yz4",
              "userId": "Vlx6GCtq90ag3lxgh0pcCKGp5ba0",
              "deadline": "2025-12-01T23:59:59.000Z",
              "text": "hoge fuga",
              "userName": "yaho"
          }
      ]
  }
  ```