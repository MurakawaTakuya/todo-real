import UserForm from './PostForm';
import styles from './Posts.module.scss';

export default function UserFormPage() {
  return (
    <div className={styles.container}>
      <h1>ユーザー登録</h1>
      <UserForm />
    </div>
  );
}
