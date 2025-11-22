import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./config";
import type { User } from "firebase/auth";

export const createUserProfile = async (user: User) => {
  const userRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    const { email } = user;
    try {
      await setDoc(userRef, {
        email,
        createdAt: new Date(),
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
