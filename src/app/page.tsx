import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-1');

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
      {heroImage && (
        <Image
          src={heroImage.imageUrl}
          alt={heroImage.description}
          fill
          className="object-cover"
          quality={100}
          data-ai-hint={heroImage.imageHint}
          priority
        />
      )}
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 flex flex-col items-center text-center p-8 max-w-2xl">
        <div className="bg-background/30 backdrop-blur-lg p-8 md:p-12 rounded-2xl border border-white/10 shadow-2xl">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight tracking-tighter">
            Build Advanced Web Apps
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-8">
            Leverage Firebase and Next.js to create secure, scalable, and stunningly fast applications. Your journey to modern web development starts here.
          </p>
          <Button asChild size="lg" className="group">
            <Link href="/signup">
              Get Started Free <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
