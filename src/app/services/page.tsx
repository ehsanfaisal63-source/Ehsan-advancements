"use client";

import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const ServiceCard = ({ title, description, imageId }: { title: string; description: string; imageId: string }) => {
    const cardImage = PlaceHolderImages.find(p => p.id === imageId);
    return (
        <Card className="bg-background/30 backdrop-blur-lg border-white/10 overflow-hidden flex flex-col">
            {cardImage && (
                <div className="relative h-48">
                    <Image
                        src={cardImage.imageUrl}
                        alt={cardImage.description}
                        fill
                        className="object-cover"
                        data-ai-hint={cardImage.imageHint}
                    />
                </div>
            )}
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-muted-foreground mb-4">{description}</p>
            </CardContent>
            <div className="p-6 pt-0">
                <Button variant="outline" className="group w-full">
                    Learn More <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
            </div>
        </Card>
    );
};

export default function ServicesPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">
          Our Services
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          We provide a wide range of services to help your business grow. Explore our offerings and find the perfect solution for your needs.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <ServiceCard 
            title="Cloud Solutions"
            description="Scalable and secure cloud infrastructure to power your applications. We handle the complexity so you can focus on your business."
            imageId="services-card-1"
        />
        <ServiceCard 
            title="Cyber Security"
            description="Protect your digital assets with our comprehensive security services, from threat analysis to incident response."
            imageId="services-card-2"
        />
        <ServiceCard 
            title="Web Development"
            description="Custom web applications built with modern technologies to deliver a fast, responsive, and engaging user experience."
            imageId="services-card-3"
        />
      </div>
    </div>
  );
}
