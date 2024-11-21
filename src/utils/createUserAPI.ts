/**
 * Cloud FunctionsのAPIを呼び出して、ユーザー情報をFirestoreに登録する
 *
 * @param {string} name
 * @param {string} uid
 */
export const createUserAPI = async (name: string, uid: string) => {
  try {
    const response = await fetch(
      "http://127.0.0.1:5001/todo-real-c28fa/asia-northeast1/firestore/user/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid, name }),
      }
    );

    if (!response.ok) {
      new Error("Network response was not ok");
    }
    const data = await response.json();
    console.log("Successfully created user");
    // console.log("Success:", data);
  } catch (error) {
    throw error;
  }
};
