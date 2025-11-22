import { doc, setDoc, getDoc, serverTimestamp, collection, addDoc } from "firebase/firestore";
import { initializeFirebase } from "./config";
import type { User } from "firebase/auth";

const { db } = initializeFirebase();

export const createUserProfile = async (user: User) => {
  const userRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    const { email } = user;
    try {
      await setDoc(userRef, {
        email,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error creating user profile:", error);
    }
  }
};

export const getUserProfile = async (uid: string) => {
  const userRef = doc(db, "users", uid);
  try {
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

type ContactMessage = {
    name: string;
    email: string;
    message: string;
};

export const saveContactMessage = async (message: ContactMessage) => {
    try {
        const docRef = await addDoc(collection(db, "contacts"), {
            ...message,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error("Error saving contact message:", error);
        throw new Error("Could not save message.");
    }
};
