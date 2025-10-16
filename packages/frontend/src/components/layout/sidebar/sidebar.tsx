import { useState, useCallback } from 'react';
import { ProjectSelector } from '@/components/projects/project-selector';
import { ProjectActionsMenu } from '@/components/projects/project-actions-menu';
import { ProjectFormDialog } from '@/components/projects/project-form-dialog';
import { DeleteConfirmationDialog } from '@/components/shared/delete-confirmation-dialog';
import { UserList } from '@/components/users/user-list';
import { useAppContext } from '@/hooks/useAppContext';
import { useProjects } from '@/hooks/useProjects';
import { toast } from 'sonner';

export function Sidebar() {
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
      <div className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
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