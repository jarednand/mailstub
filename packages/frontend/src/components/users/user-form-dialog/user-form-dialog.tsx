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
import { useUsers } from '@/hooks/useUsers';
import { useAppContext } from '@/hooks/useAppContext';
import { userFormSchema, validateUserUniqueness, type UserFormData } from '@/schemas/user-schema';
import type { User } from 'mailstub-types';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  user?: User;
}

export function UserFormDialog({ open, onOpenChange, mode, user }: UserFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { users, createUser, updateUser } = useUsers();
  const { selectedProjectId } = useAppContext();

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: '',
    },
  });

  // Reset form when dialog opens/closes or mode changes
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && user) {
        form.reset({
          email: user.email,
        });
      } else {
        form.reset({
          email: '',
        });
      }
    }
  }, [open, mode, user, form]);

  const onSubmit = async (data: UserFormData) => {
    if (!selectedProjectId) {
      toast.error('No project selected');
      return;
    }

    // Validate uniqueness
    const uniquenessError = validateUserUniqueness(
      data.email,
      users,
      selectedProjectId,
      mode === 'edit' ? user?.id : undefined
    );

    if (uniquenessError) {
      form.setError('email', { message: uniquenessError });
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'create') {
        await createUser({ projectId: selectedProjectId, email: data.email });
        toast.success('User created successfully');
      } else if (user) {
        await updateUser(user.id, data);
        toast.success('User updated successfully');
      }

      onOpenChange(false);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 400 && error.response?.data?.errors?.email){
        form.setError('email', { message: error.response.data.errors.email });
      } else {
        toast.error(`Failed to ${mode === 'create' ? 'create' : 'update'} user`);
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
            {mode === 'create' ? 'Create User' : 'Edit User'}
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            {mode === 'create'
              ? 'Add a new user to receive test emails.'
              : 'Update the user email address.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      data-testid="user-email-input"
                      type="email"
                      placeholder="user@example.com"
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