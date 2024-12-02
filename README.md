This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started
First run this command to install required packages:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```
(Every time you add a new package, you need to run this command again.)

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Before using Firebase in local
```
npm install -g firebase-tools
```

## Emulate in local
### Frontend
```
npm run dev
```

### Backend
```
cd .\functions\
npm run emu
```
This command includes `firebase emulators:start` and `npx tsc --watch` which watches the files and restarts the server when the files are changed.

if you don't want ts-node to watch the files, just use
```
firebase emulators:start
```

## Deploy to Firebase
```
firebase deploy
```
if you want to deploy only the functions
```
firebase deploy --only functions
```

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
    - streak?: number
  - Example
    ```json
    {
      "name": "testUser",
      "uid": "uid genereated by Firebase Authentication"
    }
    ```
    In case of streak is not specified, it will be set to 0.
    ```json
    {
      "name": "testUser",
      "uid": "uid genereated by Firebase Authentication",
      "streak": 10
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
          "id": "AnaGg7GVwsXzJqSJdqGg",
          "userId": "IK0Zc2hoUYaYjXoqzmCl",
          "deadline": {
              "_seconds": 1732321560,
              "_nanoseconds": 0
          },
          "text": "数学の勉強する"
      }
  ]
  ```

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

## Result
### Get Result
- URL: /result/:userId
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
              "userId": "Vlx6GCtq90ag3lxgh0pcCKGp5ba0",
              "goalId": "DESiyiEIHFDpuCjo08Si",
              "postId": "5KffB5x2SykU6lY9sHGB",
              "goalText": "数学の勉強する",
              "postText": "数学の勉強したよ^^",
              "storedId": "ointtq9NT5TPgEnKS4tb",
              "deadline": "2025-01-31T23:59:59.000Z",
              "submittedAt": "2024-12-30T23:59:59.000Z"
          }
      ],
      "failedResults": [
          {
              "goalId": "cl2wtpf5RufkCL2N8s98",
              "userId": "Vlx6GCtq90ag3lxgh0pcCKGp5ba0",
              "deadline": "2024-10-30T23:59:59.000Z",
              "text": "ちょいと前のやつ"
          }
      ],
      "pendingResults": [
          {
              "goalId": "2CA5Q7JygkXSHUmJZ8B7",
              "userId": "Vlx6GCtq90ag3lxgh0pcCKGp5ba0",
              "deadline": "2024-12-09T23:59:59.000Z",
              "text": "まだまだ先だよ"
          }
      ]
  }
  ```
