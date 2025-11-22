
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createUserWithEmailAndPassword, GoogleAuthProvider, GithubAuthProvider, signInWithRedirect, UserCredential } from "firebase/auth";
import { createUserProfile } from "@/lib/firebase/firestore";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth, useFirestore } from "@/firebase";

const formSchema = z
  .object({
    email: z.string().email({ message: "Invalid email address." }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

const GoogleIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"><title>Google</title><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.36 1.95-4.25 1.95-3.87 0-7.02-3.22-7.02-7.2s3.15-7.2 7.02-7.2c2.2 0 3.68.86 4.54 1.68l2.54-2.54C18.3 1.19 15.74 0 12.48 0 5.88 0 .42 5.6 0 12s5.88 12 12.48 12c3.24 0 5.95-1.08 7.93-3.03s2.95-5.05 2.95-8.35c0-.79-.06-1.29-.18-1.72h-10.7z"/></svg>
);

const GitHubIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"><title>GitHub</title><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
);

export default function SignupForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isProviderLoading, setIsProviderLoading] = useState<null | 'google' | 'github'>(null);
  const auth = useAuth();
  const db = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSuccess = async (userCredential: UserCredential) => {
    if (!db) return;
    await createUserProfile(db, userCredential.user);
    toast({
      title: "Account Created",
      description: "You have successfully signed up.",
    });
    router.push("/dashboard");
  }

  const handleError = (error: any, provider?: string) => {
    toast({
      variant: "destructive",
      title: provider ? "Authentication Failed" : "Signup Failed",
      description: error.message || (provider ? `Could not sign up with ${provider}.` : "An unexpected error occurred."),
    });
  }

  async function handleOAuth(provider: 'google' | 'github') {
    if (!auth || !db) return;
    setIsProviderLoading(provider);
    const authProvider = provider === 'google' ? new GoogleAuthProvider() : new GithubAuthProvider();
    try {
      // Using signInWithRedirect for a more reliable auth flow.
      await signInWithRedirect(auth, authProvider);
      // The page will redirect away. After the user signs in with the provider,
      // they will be redirected back. The user state will be handled by the
      // onAuthStateChanged listener, which will then trigger profile creation if needed.
    } catch (error: any) {
      handleError(error, provider);
      setIsProviderLoading(null);
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!auth || !db) return;
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      await handleSuccess(userCredential);
    } catch (error: any) {
      handleError(error);
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm bg-background/30 backdrop-blur-lg border-white/10">
      <CardHeader>
        <CardTitle>Create an Account</CardTitle>
        <CardDescription>
          Enter your details below to get started.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={() => handleOAuth('google')} disabled={isProviderLoading !== null || !auth || !db}>
                {isProviderLoading === 'google' ? <Loader2 className="mr-2 animate-spin" /> : <GoogleIcon />}
                Google
            </Button>
            <Button variant="outline" onClick={() => handleOAuth('github')} disabled={isProviderLoading !== null || !auth || !db}>
                {isProviderLoading === 'github' ? <Loader2 className="mr-2 animate-spin" /> : <GitHubIcon />}
                GitHub
            </Button>
        </div>

        <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                Or continue with
                </span>
            </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading || isProviderLoading !== null || !auth || !db}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
          </form>
        </Form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="underline hover:text-primary">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
