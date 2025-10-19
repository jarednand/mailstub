import { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectSelector } from '@/components/projects/project-selector';
import { ProjectActionsMenu } from '@/components/projects/project-actions-menu';
import { ProjectFormDialog } from '@/components/projects/project-form-dialog';
import { DeleteConfirmationDialog } from '@/components/shared/delete-confirmation-dialog';
import { UserList } from '@/components/users/user-list';
import { useAppContext } from '@/hooks/useAppContext';
import { useProjects } from '@/hooks/useProjects';
import { toast } from 'sonner';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { selectedProjectId, projects } = useAppContext();
  const { deleteProject } = useProjects();
  
  const [projectDialog, setProjectDialog] = useState<{ open: boolean; mode: 'create' | 'edit' }>({
    open: false,
    mode: 'create',
  });
  const [deleteProjectDialog, setDeleteProjectDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const handleCreateProject = useCallback(() => {
    setProjectDialog({ open: true, mode: 'create' });
  }, []);

  const handleEditProject = useCallback(() => {
    setProjectDialog({ open: true, mode: 'edit' });
  }, []);

  const handleDeleteProject = useCallback(() => {
    setDeleteProjectDialog(true);
  }, []);

  const handleConfirmDelete = async () => {
    if (!selectedProjectId) return;

    setIsDeleting(true);
    try {
      await deleteProject(selectedProjectId);
      toast.success('Project deleted successfully');
      setDeleteProjectDialog(false);
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="relative h-full">
        <div className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out overflow-hidden h-full ${
          isCollapsed ? 'w-0' : 'w-72'
        }`}>
          <div className={`w-72 h-full flex flex-col ${isCollapsed ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Project
                </span>
                <ProjectActionsMenu
                  onCreateProject={handleCreateProject}
                  onEditProject={handleEditProject}
                  onDeleteProject={handleDeleteProject}
                />
              </div>
              <ProjectSelector />
            </div>

            <UserList />
          </div>
        </div>

        {/* Collapse button - visible when sidebar is open */}
        {!isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-md hover:bg-slate-100 dark:hover:bg-slate-800 z-50"
          >
            <ChevronLeft className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </Button>
        )}

        {/* Expand button - visible when sidebar is collapsed */}
        {isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-md hover:bg-slate-100 dark:hover:bg-slate-800 z-50"
          >
            <ChevronRight className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </Button>
        )}
      </div>

      <ProjectFormDialog
        open={projectDialog.open}
        onOpenChange={(open) => setProjectDialog({ ...projectDialog, open })}
        mode={projectDialog.mode}
        project={selectedProject}
      />

      <DeleteConfirmationDialog
        open={deleteProjectDialog}
        onOpenChange={setDeleteProjectDialog}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        description="This will permanently delete the project, all users, and all messages. This action cannot be undone."
        isDeleting={isDeleting}
      />
    </>
  );
}