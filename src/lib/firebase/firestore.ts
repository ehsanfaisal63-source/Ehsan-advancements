
import { doc, setDoc, getDoc, serverTimestamp, collection, addDoc, Firestore, updateDoc, deleteDoc, onSnapshot, query, orderBy, Unsubscribe } from "firebase/firestore";
import type { User } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const createUserProfile = async (db: Firestore, user: User) => {
  const userRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    const { email, photoURL } = user;
    try {
      await setDoc(userRef, {
        email,
        photoURL: photoURL || null,
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

export const uploadProfileImage = async (uid: string, file: File): Promise<string> => {
    const storage = getStorage();
    const storageRef = ref(storage, `profileImages/${uid}/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    const db = getFirestore();
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { photoURL: downloadURL });
    
    return downloadURL;
};

type ContactMessage = {
    name: string;
    email: string;
    message: string;
};

/**
 * @deprecated Use the `handleContactMessage` flow instead.
 */
export const saveContactMessage = async (db: Firestore, message: ContactMessage) => {
    try {
        const docRef = await addDoc(collection(db, "contacts"), {
            ...message,
            createdAt: serverTimestamp(),
        });
        
        console.log("Message saved to Firestore with ID:", docRef.id);
        
        return docRef.id;
    } catch (error) {
        console.error("Error saving contact message:", error);
        throw new Error("Could not save message.");
    }
};

// Notes related functions
export interface Note {
    id: string;
    content: string;
    createdAt: Date;
}

export const addNote = async (db: Firestore, userId: string, content: string) => {
    if (!content.trim()) return;
    const notesCollectionRef = collection(db, `users/${userId}/notes`);
    await addDoc(notesCollectionRef, {
        content,
        createdAt: serverTimestamp(),
    });
};

export const subscribeToNotes = (
    db: Firestore,
    userId: string,
    callback: (notes: Note[]) => void
): Unsubscribe => {
    const notesCollectionRef = collection(db, `users/${userId}/notes`);
    const q = query(notesCollectionRef, orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const notes = querySnapshot.docs.map(doc => ({
            id: doc.id,
            content: doc.data().content,
            createdAt: doc.data().createdAt?.toDate() || new Date(),
        }));
        callback(notes);
    });

    return unsubscribe;
};

export const deleteNote = async (db: Firestore, userId: string, noteId: string) => {
    const noteDocRef = doc(db, `users/${userId}/notes`, noteId);
    await deleteDoc(noteDocRef);
};
