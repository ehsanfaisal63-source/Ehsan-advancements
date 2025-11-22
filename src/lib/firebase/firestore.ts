
import { doc, setDoc, getDoc, serverTimestamp, collection, addDoc, Firestore, updateDoc, deleteDoc, onSnapshot, query, orderBy, Unsubscribe } from "firebase/firestore";
import type { User } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export const createUserProfile = async (db: Firestore, user: User) => {
  const userRef = doc(db, "users", user.uid);
  try {
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      const { email, photoURL, displayName } = user;
      setDoc(userRef, {
        email,
        displayName: displayName || email,
        photoURL: photoURL || null,
        createdAt: serverTimestamp(),
      }).catch(error => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: userRef.path,
            operation: 'create',
            requestResourceData: { email, photoURL, displayName }
        }));
      });
    }
  } catch (error) {
    console.error("Error creating or checking user profile:", error);
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
    errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: userRef.path,
        operation: 'get',
    }));
    return null;
  }
};

export const uploadProfileImage = (uid: string, file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const storage = getStorage();
        const storageRef = ref(storage, `profileImages/${uid}/${file.name}`);
        
        uploadBytes(storageRef, file)
            .then(snapshot => getDownloadURL(snapshot.ref))
            .then(downloadURL => {
                const db = getFirestore();
                const userRef = doc(db, "users", uid);
                
                updateDoc(userRef, { photoURL: downloadURL })
                    .then(() => resolve(downloadURL))
                    .catch(error => {
                        errorEmitter.emit('permission-error', new FirestorePermissionError({
                            path: userRef.path,
                            operation: 'update',
                            requestResourceData: { photoURL: downloadURL }
                        }));
                        reject(error);
                    });
            })
            .catch(error => {
                console.error("Error uploading file:", error);
                reject(error);
            });
    });
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

export const addNote = (db: Firestore, userId: string, content: string) => {
    if (!content.trim()) return;
    const notesCollectionRef = collection(db, `users/${userId}/notes`);
    const noteData = {
        content,
        createdAt: serverTimestamp(),
    };
    addDoc(notesCollectionRef, noteData).catch(error => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: notesCollectionRef.path,
            operation: 'create',
            requestResourceData: noteData,
        }));
    });
};

export const subscribeToNotes = (
    db: Firestore,
    userId: string,
    callback: (notes: Note[]) => void
): Unsubscribe => {
    const notesCollectionRef = collection(db, `users/${userId}/notes`);
    const q = query(notesCollectionRef, orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, 
        (querySnapshot) => {
            const notes = querySnapshot.docs.map(doc => ({
                id: doc.id,
                content: doc.data().content,
                createdAt: doc.data().createdAt?.toDate() || new Date(),
            }));
            callback(notes);
        },
        (error) => {
            console.error("Error subscribing to notes:", error);
            const contextualError = new FirestorePermissionError({
                operation: 'list',
                path: notesCollectionRef.path
            });
            errorEmitter.emit('permission-error', contextualError);
        }
    );

    return unsubscribe;
};

export const deleteNote = (db: Firestore, userId: string, noteId: string) => {
    const noteDocRef = doc(db, `users/${userId}/notes`, noteId);
    deleteDoc(noteDocRef).catch(error => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: noteDocRef.path,
            operation: 'delete',
        }));
    });
};
