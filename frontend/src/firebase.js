import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyCZO_ohBILyy9r_LqyZqgk9Ivz_TDV-i6U",
  authDomain: "mediquery1.firebaseapp.com",
  projectId: "mediquery1",
  storageBucket: "mediquery1.firebasestorage.app",
  messagingSenderId: "86545542107",
  appId: "1:86545542107:web:a38e95a3ef8d292163d5fe"
};

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider)
  return result.user
}

export async function signOutUser() {
  await signOut(auth)
}