interface User {
  uid: string;
  name: string;
}

export /**
 * Cloud FunctionsのAPIを呼び出して、ユーザー情報をFirestoreから取得する
 *
 * @param {string} uid
 * @return {*}  {Promise<User>}
 */
const fetchUserAPI = async (uid: string): Promise<User> => {
  const response = await fetch(
    `http://127.0.0.1:5001/todo-real-c28fa/asia-northeast1/firestore/user/id/${uid}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    new Error("Network response was not ok");
  }
  const data = await response.json();
  return data;
};
