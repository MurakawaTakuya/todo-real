import { storage } from "@/app/firebase";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

export const uploadImage = (
  file: File,
  onProgress: (progress: number) => void,
  onError: (error: string) => void,
  onSuccess: (url: string, id: string) => void
) => {
  if (!file) {
    onError("ファイルが選択されていません");
    return;
  }

  // cryptoモジュールを使用してユニークなIDを生成
  const uniqueId = crypto.randomUUID();
  const storageRef = ref(storage, `post/${uniqueId}/image`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  uploadTask.on(
    "state_changed",
    (snapshot) => {
      const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      onProgress(percent);
    },
    (error) => {
      onError("ファイルアップに失敗しました。エラー: " + error.message);
    },
    () => {
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
        onSuccess(downloadURL, uniqueId); // 完了時にURLとIDを返す
      });
    }
  );
};
