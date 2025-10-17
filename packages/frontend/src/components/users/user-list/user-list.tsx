import { useMemo, useCallback, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserListItem } from '@/components/users/user-list-item';
import { UserFormDialog } from '@/components/users/user-form-dialog';
import { DeleteConfirmationDialog } from '@/components/shared/delete-confirmation-dialog';
import { useAppContext } from '@/hooks/useAppContext';
import { useUsers } from '@/hooks/useUsers';
import type { User } from 'mailstub-types';
import { toast } from 'sonner';

export function UserList() {
  const { users, selectedProjectId, selectedUserId, messages } = useAppContext();
  const { deleteUser } = useUsers();
  
  const [userDialog, setUserDialog] = useState<{ open: boolean; mode: 'create' | 'edit'; user?: User }>({
    open: false,
    mode: 'create',
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; userId?: string }>({
    open: false,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const projectUsers = useMemo(
    () => users.filter(u => u.projectId === selectedProjectId),
    [users, selectedProjectId]
  );

  const unreadCountsByUser = useMemo(() => {
    const counts: Record<string, number> = {};
    messages.forEach(message => {
      if (!message.read) {
        counts[message.userId] = (counts[message.userId] || 0) + 1;
      }
    });
    return counts;
  }, [messages]);

  const handleEditUser = useCallback((user: User) => {
    setUserDialog({ open: true, mode: 'edit', user });
  }, []);

  const handleDeleteUser = useCallback((userId: string) => {
    setDeleteDialog({ open: true, userId });
  }, []);

  const handleConfirmDelete = async () => {
    if (!deleteDialog.userId) return;

    setIsDeleting(true);
    try {
      await deleteUser(deleteDialog.userId);
      toast.success('User deleted successfully');
      setDeleteDialog({ open: false });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3 block">
            Users
          </span>
          <Button
            size="sm"
            onClick={() => setUserDialog({ open: true, mode: 'create' })}
            className="w-full h-9 gap-2 bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm shadow-cyan-600/20"
          >
            <Plus className="w-4 h-4" />
            Add User
          </Button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {projectUsers.map(user => (
            <UserListItem
              key={user.id}
              user={user}
              unreadCount={unreadCountsByUser[user.id] || 0}
              isSelected={selectedUserId === user.id}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
            />
          ))}
        </div>
      </div>

      <UserFormDialog
        open={userDialog.open}
        onOpenChange={(open) => setUserDialog({ ...userDialog, open })}
        mode={userDialog.mode}
        user={userDialog.user}
      />

      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        description="This will permanently delete the user and all their messages. This action cannot be undone."
        isDeleting={isDeleting}
      />
    </>
  );
}