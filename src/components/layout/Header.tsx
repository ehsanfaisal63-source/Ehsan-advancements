
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { LogIn, LogOut, UserPlus, LayoutDashboard, Zap, Info, Briefcase, Mail, Sparkles, FolderKanban } from "lucide-react";

export default function Header() {
  const { user } = useUser();
  const router = useRouter();
  const auth = useAuth();

  const handleSignOut = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const navLinks = [
    { href: "/about", label: "About", icon: Info },
    { href: "/services", label: "Services", icon: Briefcase },
    { href: "/contact", label: "Contact", icon: Mail },
    { href: "/playground", label: "Playground", icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Zap className="h-6 w-6 text-primary" />
          <span className="font-bold">Ehsan Faisal</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm flex-grow">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-1 text-foreground/60 transition-colors hover:text-foreground"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
          {user && (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-1 text-foreground/60 transition-colors hover:text-foreground"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="/projects"
                className="flex items-center gap-1 text-foreground/60 transition-colors hover:text-foreground"
              >
                <FolderKanban className="h-4 w-4" />
                Projects
              </Link>
            </>
          )}
        </nav>
        <div className="flex items-center justify-end space-x-2">
          {user ? (
            <Button variant="ghost" onClick={handleSignOut} disabled={!auth}>
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" /> Login
                </Link>
              </Button>
              <Button asChild>
                <Link href="/signup">
                  <UserPlus className="mr-2 h-4 w-4" /> Sign Up
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
