import { useCallback } from 'react';
import { Plus, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ProjectActionsMenuProps {
  onCreateProject: () => void;
  onEditProject: () => void;
  onDeleteProject: () => void;
}

export function ProjectActionsMenu({
  onCreateProject,
  onEditProject,
  onDeleteProject,
}: ProjectActionsMenuProps) {
  const handleCreate = useCallback(
    (e: Event) => {
      e.preventDefault();
      onCreateProject();
    },
    [onCreateProject]
  );

  const handleEdit = useCallback(
    (e: Event) => {
      e.preventDefault();
      onEditProject();
    },
    [onEditProject]
  );

  const handleDelete = useCallback(
    (e: Event) => {
      e.preventDefault();
      onDeleteProject();
    },
    [onDeleteProject]
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
      >
        <DropdownMenuItem
          onSelect={handleCreate}
          className="text-slate-700 dark:text-slate-200 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-slate-900 dark:focus:text-slate-100"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
        <DropdownMenuItem
          onSelect={handleEdit}
          className="text-slate-700 dark:text-slate-200 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-slate-900 dark:focus:text-slate-100"
        >
          <Edit2 className="w-4 h-4 mr-2" />
          Edit Project
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={handleDelete}
          className="text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/50 focus:text-red-700 dark:focus:text-red-300"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Project
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}