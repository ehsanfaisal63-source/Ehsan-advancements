'use client';

import { useEffect, useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import {
  addProject,
  subscribeToProjects,
  deleteProject,
  Project,
} from '@/lib/firebase/firestore';
import { formatDistanceToNow } from 'date-fns';

const projectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters.'),
  description: z.string().optional(),
  status: z.enum(['Not Started', 'In Progress', 'Completed']),
});

export default function ProjectsPage() {
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'Not Started' as 'Not Started' | 'In Progress' | 'Completed',
    },
  });

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if (user && db) {
      const unsubscribe = subscribeToProjects(db, user.uid, setProjects);
      return () => unsubscribe();
    }
  }, [user, db]);

  const handleAddProject = async (data: z.infer<typeof projectSchema>) => {
    if (!user || !db) return;
    setIsSubmitting(true);
    try {
      await addProject(db, user.uid, data);
      toast({ title: 'Project created successfully!' });
      reset();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to create project',
        description: 'Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = (projectId: string) => {
    if (!user || !db) return;
    deleteProject(db, user.uid, projectId);
    toast({ title: 'Project deleted.' });
  };

  if (userLoading) {
    return (
      <div className="container mx-auto p-4 md:p-8 text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin" />
        <p className="mt-4 text-muted-foreground">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight mb-8">My Projects</h1>

        <Card className="mb-8 bg-background/30 backdrop-blur-lg border-white/10">
          <CardHeader>
            <CardTitle>Create a New Project</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(handleAddProject)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Input
                  placeholder="Project Name"
                  {...register('name')}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Textarea
                  placeholder="Project Description (optional)"
                  {...register('description')}
                />
              </div>
              <div className="space-y-2">
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Not Started">Not Started</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <PlusCircle className="mr-2 h-4 w-4" />
                )}
                Create Project
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Your Projects</h2>
          {projects.length > 0 ? (
            projects.map((project) => (
              <Card
                key={project.id}
                className="bg-background/30 backdrop-blur-lg border-white/10"
              >
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div>
                    <CardTitle>{project.name}</CardTitle>
                    <CardDescription>
                      Created{' '}
                      {formatDistanceToNow(project.createdAt, {
                        addSuffix: true,
                      })}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteProject(project.id)}
                    className="shrink-0"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                    <span className="sr-only">Delete project</span>
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {project.description || 'No description provided.'}
                  </p>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
                      ${
                        project.status === 'Completed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : project.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                  >
                    {project.status}
                  </span>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">
                You haven't created any projects yet.
              </p>
              <p className="text-sm text-muted-foreground">
                Use the form above to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
