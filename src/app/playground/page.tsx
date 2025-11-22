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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { simpleText } from "@/ai/flows/simple-flow";

const formSchema = z.object({
  prompt: z.string().min(10, { message: "Prompt must be at least 10 characters." }),
});

export default function PlaygroundPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setAiResponse("");
    try {
        const result = await simpleText(values);
        setAiResponse(result.response);
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Something went wrong",
            description: error.message || "Could not get a response from the AI.",
        });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">
                AI Playground
                </h1>
                <p className="text-lg text-muted-foreground">
                Interact with our generative AI. Give it a prompt and see what it comes up with!
                </p>
            </div>
            <Card className="bg-background/30 backdrop-blur-lg border-white/10 p-4 md:p-8">
            <CardContent className="p-0">
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                    control={form.control}
                    name="prompt"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Your Prompt</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="e.g., 'Write a short story about a robot who discovers music.'"
                            className="min-h-[100px]"
                            {...field}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Sparkles className="mr-2 h-4 w-4" />
                        )}
                        Generate
                    </Button>
                </form>
                </Form>
            </CardContent>
            </Card>

            {aiResponse && (
                <Card className="mt-8 bg-background/30 backdrop-blur-lg border-white/10">
                    <CardHeader>
                        <CardTitle>AI Response</CardTitle>
                        <CardDescription>Here's what the AI came up with:</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="whitespace-pre-wrap">{aiResponse}</p>
                    </CardContent>
                </Card>
            )}
      </div>
    </div>
  );
}
