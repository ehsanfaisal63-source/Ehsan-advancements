"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getUserProfile } from "@/lib/firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Activity, Users, Server } from "lucide-react";

type UserProfile = {
  email: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
};

const StatCard = ({ title, value, icon: Icon, imageId }: { title: string; value: string; icon: React.ElementType, imageId: string }) => {
    const cardImage = PlaceHolderImages.find(p => p.id === imageId);
    return (
        <Card className="bg-background/30 backdrop-blur-lg border-white/10 overflow-hidden">
            {cardImage && (
                 <div className="relative h-24">
                    <Image 
                        src={cardImage.imageUrl} 
                        alt={cardImage.description} 
                        fill 
                        className="object-cover" 
                        data-ai-hint={cardImage.imageHint}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                 </div>
            )}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );
};


export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        setProfileLoading(true);
        const userProfile = (await getUserProfile(user.uid)) as UserProfile;
        setProfile(userProfile);
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  if (loading || !user) {
    return (
        <div className="container mx-auto p-4 md:p-8">
            <Skeleton className="h-10 w-1/2 mb-8" />
            <div className="grid gap-4 md:grid-cols-3">
                <Skeleton className="h-40" />
                <Skeleton className="h-40" />
                <Skeleton className="h-40" />
            </div>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
        <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            {profileLoading ? (
                <Skeleton className="h-6 w-1/4 mt-2"/>
            ) : (
                <p className="text-muted-foreground">Welcome back, {profile?.email || 'User'}.</p>
            )}
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard title="Active Users" value="1,204" icon={Users} imageId="dashboard-stat-1"/>
            <StatCard title="Server Load" value="23%" icon={Server} imageId="dashboard-stat-2"/>
            <StatCard title="User Activity" value="+573" icon={Activity} imageId="dashboard-stat-3"/>
        </div>

        <div className="mt-8">
            <Card className="bg-background/30 backdrop-blur-lg border-white/10">
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">No recent activity to display.</p>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
