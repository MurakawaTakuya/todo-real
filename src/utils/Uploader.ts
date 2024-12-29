import { storage } from "@/app/firebase";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

export const uploadImage = (
  file: File,
  onProgress: (progress: number) => void,
  onSuccess: (url: string, id: string) => void
) => {
  if (!file) {
    throw new Error("ファイルが選択されていません");
  }

  // メタデータを削除してからFirebaseにアップロード
  removeImageMetadata(file)
    .then((cleanFile) => {
      const uniqueId = crypto.randomUUID();
      const storageRef = ref(storage, `post/${uniqueId}`);
      const uploadTask = uploadBytesResumable(storageRef, cleanFile);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const percent =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(percent);
        },
        (error) => {
          throw new Error(
            "ファイルアップに失敗しました。エラー: " + error.message
          );
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            onSuccess(downloadURL, uniqueId); // 完了時にURLとIDを返す
          });
        }
      );
    })
    .catch((error) => {
      throw new Error(
        "画像のメタデータ削除に失敗しました。エラー: " + error.message
      );
    });
};

// 画像のメタデータを削除する関数
// モーションフォトの動画も削除できる
export const removeImageMetadata = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);

          canvas.toBlob((blob) => {
            if (blob) {
              const cleanFile = new File([blob], file.name, {
                type: file.type,
              });
              resolve(cleanFile);
            } else {
              reject(new Error("画像処理に失敗しました。"));
            }
          }, file.type);
        } else {
          reject(new Error("Canvas のコンテキストを取得できません。"));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error("画像を読み込めませんでした。"));
    };
    reader.readAsDataURL(file);
  });
};
