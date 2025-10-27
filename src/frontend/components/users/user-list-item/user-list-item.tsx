import { memo, useCallback } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/hooks/useAppContext';
import type { User } from '@/types';

interface UserListItemProps {
  user: User;
  unreadCount: number;
  isSelected: boolean;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
}

export const UserListItem = memo(function UserListItem({
  user,
  unreadCount,
  isSelected,
  onEdit,
  onDelete,
}: UserListItemProps) {
  const { setSelectedUserId } = useAppContext();

  const handleClick = useCallback(() => {
    setSelectedUserId(user.id);
  }, [user.id, setSelectedUserId]);

  const handleEdit = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit(user);
    },
    [user, onEdit]
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete(user.id);
    },
    [user.id, onDelete]
  );

  return (
    <div
      data-testid="user-list-item"
      className={`p-3 cursor-pointer transition-all group ${
        isSelected
          ? 'bg-cyan-50 dark:bg-cyan-950/30'
          : 'hover:bg-slate-50 dark:hover:bg-slate-800'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between mb-1">
        <span
          data-testid="user-email"
          className={`text-sm font-medium truncate flex-1 ${
            isSelected ? 'text-cyan-900 dark:text-cyan-100' : 'text-slate-700 dark:text-slate-300'
          }`}
        >
          {user.email}
        </span>
        {unreadCount > 0 && (
          <span 
            data-testid="unread-count"
            className="bg-cyan-600 text-white text-xs rounded-full px-2 py-0.5 ml-2 font-medium shadow-sm"
          >
            {unreadCount}
          </span>
        )}
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          data-testid="edit-user-button"
          variant="ghost"
          size="sm"
          className="h-7 text-xs flex-1 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
          onClick={handleEdit}
        >
          <Edit2 className="w-3 h-3 mr-1" />
          Edit
        </Button>
        <Button
          data-testid="delete-user-button"
          variant="ghost"
          size="sm"
          className="h-7 text-xs flex-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
          onClick={handleDelete}
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Delete
        </Button>
      </div>
    </div>
  );
});