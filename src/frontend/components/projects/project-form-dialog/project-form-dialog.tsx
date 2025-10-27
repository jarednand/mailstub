import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useProjects } from '@/hooks/useProjects';
import { projectFormSchema, validateProjectUniqueness, type ProjectFormData } from '@/schemas/project-schema';
import type { Project } from '@/types';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  project?: Project;
}

export function ProjectFormDialog({ open, onOpenChange, mode, project }: ProjectFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { projects, createProject, updateProject } = useProjects();

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: '',
    },
  });

  // Reset form when dialog opens/closes or mode changes
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && project) {
        form.reset({
          name: project.name,
        });
      } else {
        form.reset({
          name: '',
        });
      }
    }
  }, [open, mode, project, form]);

  const onSubmit = async (data: ProjectFormData) => {
    // Validate uniqueness
    const uniquenessErrors = validateProjectUniqueness(
      data,
      projects,
      mode === 'edit' ? project?.id : undefined
    );

    if (uniquenessErrors.name) {
      form.setError('name', { message: uniquenessErrors.name });
    }
    if (uniquenessErrors.name) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'create') {
        await createProject(data);
        toast.success('Project created successfully');
      } else if (project) {
        await updateProject(project.id, data);
        toast.success('Project updated successfully');
      }

      onOpenChange(false);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 400 && error.response?.data?.errors?.name){
        form.setError('name', { message: error.response?.data?.errors?.name })
      } else {
        toast.error(`Failed to ${mode === 'create' ? 'create' : 'update'} project`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            {mode === 'create' ? 'Create Project' : 'Edit Project'}
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            {mode === 'create'
              ? 'Create a new project to organize your test emails.'
              : 'Update the project details.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Project Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      data-testid="project-name-input"
                      placeholder="My Awesome App"
                      className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus-visible:ring-cyan-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                data-testid="cancel-button"
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                data-testid="submit-button"
                type="submit"
                disabled={isSubmitting}
                className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {mode === 'create' ? 'Creating...' : 'Saving...'}
                  </>
                ) : (
                  mode === 'create' ? 'Create' : 'Save'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}