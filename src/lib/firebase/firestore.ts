
import { doc, setDoc, getDoc, serverTimestamp, collection, addDoc, Firestore } from "firebase/firestore";
import type { User } from "firebase/auth";

export const createUserProfile = async (db: Firestore, user: User) => {
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

export const getUserProfile = async (db: Firestore, uid: string) => {
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

export const saveContactMessage = async (db: Firestore, message: ContactMessage) => {
    try {
        console.log("--- Sending Email ---");
        console.log(`To: admin@example.com`);
        console.log(`From: ${message.email}`);
        console.log(`Name: ${message.name}`);
        console.log(`Message: ${message.message}`);
        console.log("---------------------");

        const docRef = await addDoc(collection(db, "contacts"), {
            ...message,
            createdAt: serverTimestamp(),
        });
        
        console.log("Message saved to Firestore with ID:", docRef.id);
        // In a real application, you would add an email sending service here.
        
        return docRef.id;
    } catch (error) {
        console.error("Error saving contact message:", error);
        throw new Error("Could not save message.");
    }
};
