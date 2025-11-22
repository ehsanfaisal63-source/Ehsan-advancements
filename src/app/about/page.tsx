"use client";

import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Target, Eye } from "lucide-react";

export default function AboutPage() {
  const aboutImage = PlaceHolderImages.find(p => p.id === 'about-hero');

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden mb-8">
        {aboutImage && (
          <Image
            src={aboutImage.imageUrl}
            alt={aboutImage.description}
            fill
            className="object-cover"
            data-ai-hint={aboutImage.imageHint}
            priority
          />
        )}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tighter">
            About Us
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto text-center mb-12">
        <p className="text-lg md:text-xl text-muted-foreground">
          We are a passionate team of innovators, creators, and problem-solvers dedicated to building the future of the web. Our mission is to empower businesses with cutting-edge technology and beautiful design.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <Card className="bg-background/30 backdrop-blur-lg border-white/10">
          <CardHeader className="items-center text-center">
            <div className="p-4 bg-primary/10 rounded-full mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Our Team</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              A diverse group of experts with a shared passion for excellence and a drive to push boundaries.
            </p>
          </CardContent>
        </Card>
        <Card className="bg-background/30 backdrop-blur-lg border-white/10">
          <CardHeader className="items-center text-center">
            <div className="p-4 bg-primary/10 rounded-full mb-4">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Our Mission</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              To deliver exceptional digital experiences that are secure, scalable, and beautifully designed for everyone.
            </p>
          </CardContent>
        </Card>
        <Card className="bg-background/30 backdrop-blur-lg border-white/10">
          <CardHeader className="items-center text-center">
            <div className="p-4 bg-primary/10 rounded-full mb-4">
              <Eye className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Our Vision</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              To be a leading force in web innovation, shaping a future where technology is both powerful and accessible.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
