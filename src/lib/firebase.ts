import firebase from "firebase/compat/app";
import "firebase/compat/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDPeJXZRbGoyVr8CJgCIMERQajG_BtZ3uk",
  authDomain: "potlam-e6ef0.firebaseapp.com",
  projectId: "potlam-e6ef0",
  storageBucket: "potlam-e6ef0.appspot.com",
  messagingSenderId: "1041406706362",
  appId: "1:1041406706362:web:1d4f6977b31c425ec8b883",
  measurementId: "G-7FC9WZK37C",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const storage = firebase.storage();

const uploadImage = async (file: Blob, path: string): Promise<string> => {
  const storageRef = storage.ref();
  const fileRef = storageRef.child(path);
  await fileRef.put(file);
  return await fileRef.getDownloadURL();
};

export { storage, uploadImage };
