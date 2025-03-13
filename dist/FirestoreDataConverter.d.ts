import { FirestoreDataConverter } from 'firebase/firestore';
declare const createFirestoreDataConverter: <T>() => FirestoreDataConverter<T>;
export default createFirestoreDataConverter;
