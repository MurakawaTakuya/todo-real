データベースには`user`と`goal`の2つのコレクションがあります。  
`user`コレクションにはユーザーの情報が、`goal`コレクションにはユーザーが設定した目標と結果の情報が保存されます。

# userコレクション
```
user (コレクション)
├── userId (ドキュメント)
│   ├── fcmToken: string (初期値: "")
│   ├── name: string
│   └── streak: number (初期値: 0, 目標完了時に更新, streakがリセットされる場合はAPI側で0を返す)
├── 他のドキュメント...
```

# goalコレクション
```
goal (コレクション)
├── goalId (ドキュメント)
│   ├── userId: string
│   ├── deadline: Timestamp (例: 2024年12月18日 23:00:00 UTC+9)
│   ├── text: string (""は禁止)
│   ├── post: map | null (初期値: null)
│   │   ├── storedId: string (storageに保存されたファイルのID)
│   │   ├── submittedAt: Timestamp (目標完了時間)
│   │   └── text: string (""もOK)
│   └── reaction?: map (初期値: undefined)
│       ├── userId: string (リアクションの種類)
│       ├── 他のUserId...
├── 他のドキュメント...
```
