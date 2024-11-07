This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

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

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

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
Make sure to build the functions before starting the emulator everytime you make changes to the functions
```
cd .\functions\
npm run build
```

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
  - example
    ```json
    {
      "name": "testUser"
    }
    ```
    In case of streak is not specified, it will be set to 0.
    ```json
    {
      "name": "testUser",
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

  When a user with the same name already exists, the response will be
  ```json
  {
    "message":"A user with the same user name 'testUser' already exists"
  }
  ```

### Get User Data
#### Get User Data by User Id
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

#### Get User Data by User Name
- URL: /user/name/:userName
- Method: GET
- Response  
the same as Get User Data by User Id

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
  - example
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
      "id":"RXlHJiv3GtpzSDHhfljS",
      "userId":"IK0Zc2hoUYaYjXoqzmCl",
      "deadline":"2024-12-31T23:59:59.000Z",
      "text":"数学の勉強する"
    }
  ]
  ```
