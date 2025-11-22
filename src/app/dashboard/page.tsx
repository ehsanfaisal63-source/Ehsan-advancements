
"use client";

import { useEffect, useState, useRef, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useUser, useFirestore } from "@/firebase";
import {
  getUserProfile,
  uploadProfileImage,
  addNote,
  subscribeToNotes,
  deleteNote,
  type Note
} from "@/lib/firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Trash2, PlusCircle, LogOut } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

type UserProfile = {
  email: string;
  photoURL?: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
};

const NotesSection = ({ userId, db }: { userId: string; db: any }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId || !db) return;
    const unsubscribe = subscribeToNotes(db, userId, setNotes);
    return () => unsubscribe();
  }, [userId, db]);

  const handleAddNote = async () => {
    if (!newNote.trim()) {
        toast({
            variant: "destructive",
            title: "Cannot add empty note",
        });
        return;
    }
    setIsAddingNote(true);
    try {
        await addNote(db, userId, newNote);
        setNewNote("");
        toast({ title: "Note added!" });
    } catch (error) {
        toast({ variant: "destructive", title: "Failed to add note." });
    } finally {
        setIsAddingNote(false);
    }
  };
  
  const handleDeleteNote = async (noteId: string) => {
    try {
        await deleteNote(db, userId, noteId);
        toast({ title: "Note deleted." });
    } catch (error) {
        toast({ variant: "destructive", title: "Failed to delete note." });
    }
  };

  return (
    <Card className="mt-8 bg-background/30 backdrop-blur-lg border-white/10">
      <CardHeader>
        <CardTitle>My Notes</CardTitle>
        <CardDescription>Jot down your thoughts. Only you can see these.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
            <Textarea 
                placeholder="What's on your mind?"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="flex-grow"
            />
            <Button onClick={handleAddNote} disabled={isAddingNote || !newNote.trim()}>
                {isAddingNote ? <Loader2 className="animate-spin" /> : <PlusCircle />}
                <span className="sr-only">Add Note</span>
            </Button>
        </div>
        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {notes.length > 0 ? (
                notes.map(note => (
                    <div key={note.id} className="flex items-start justify-between gap-4 p-3 rounded-lg bg-secondary/50">
                        <div>
                            <p className="text-sm">{note.content}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(note.createdAt, { addSuffix: true })}
                            </p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => handleDeleteNote(note.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                ))
            ) : (
                <p className="text-center text-muted-foreground py-4">No notes yet. Add one above!</p>
            )}
        </div>
      </CardContent>
    </Card>
  );
};


export default function DashboardPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const db = useFirestore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user && db) {
        setProfileLoading(true);
        const userProfile = (await getUserProfile(db, user.uid)) as UserProfile;
        setProfile(userProfile);
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, [user, db]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
        setIsUploading(true);
        try {
            const photoURL = await uploadProfileImage(user.uid, file);
            setProfile(prev => prev ? { ...prev, photoURL } : null);
            toast({
                title: "Upload Successful!",
                description: "Your new profile picture is now visible.",
            })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Upload Failed",
                description: "Could not upload your profile picture. Please try again.",
            })
        } finally {
            setIsUploading(false);
        }
    }
  };

  if (loading || !user) {
    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="flex items-center space-x-4 mb-8">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>
            <Skeleton className="h-40 w-full" />
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
        <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 mb-8">
            <div className="relative">
                <Avatar className="h-24 w-24 md:h-28 md:w-28 border-4 border-primary/20">
                    <AvatarImage src={profile?.photoURL || user.photoURL || undefined} alt="Profile picture" />
                    <AvatarFallback className="text-4xl">
                        {profile?.email?.[0].toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <Button 
                    size="icon" 
                    className="absolute -bottom-2 -right-2 rounded-full h-8 w-8"
                    onClick={handleUploadClick}
                    disabled={isUploading}
                    aria-label="Upload profile picture"
                >
                    {isUploading ? <Loader2 className="animate-spin" /> : <Upload />}
                </Button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            </div>
            <div className="text-center sm:text-left">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                {profileLoading ? (
                    <Skeleton className="h-6 w-1/4 mt-2"/>
                ) : (
                    <p className="text-muted-foreground">Welcome back, {profile?.email || 'User'}.</p>
                )}
            </div>
        </div>
        
        {user && db && <NotesSection userId={user.uid} db={db} />}
    </div>
  );
}
