import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Sidebar } from './sidebar';
import { AppContext } from '@/contexts/AppContext';
import { createMockAppContext, createMockProject } from '@/test/mock-app-context';
import { createMockUseProjects } from '@/test/mock-use-projects';

// Mock hooks
vi.mock('@/hooks/useProjects', () => ({
  useProjects: () => mockUseProjects,
}));

// Mock child components
vi.mock('@/components/projects/project-selector', () => ({
  ProjectSelector: () => <div data-testid="project-selector">Project Selector</div>,
}));

vi.mock('@/components/projects/project-actions-menu', () => ({
  ProjectActionsMenu: ({ onCreateProject, onEditProject, onDeleteProject }: any) => (
    <div data-testid="project-actions-menu">
      <button onClick={onCreateProject} data-testid="create-project-action">Create</button>
      <button onClick={onEditProject} data-testid="edit-project-action">Edit</button>
      <button onClick={onDeleteProject} data-testid="delete-project-action">Delete</button>
    </div>
  ),
}));

vi.mock('@/components/users/user-list', () => ({
  UserList: () => <div data-testid="user-list">User List</div>,
}));

vi.mock('@/components/projects/project-form-dialog', () => ({
  ProjectFormDialog: ({ open, mode }: any) => 
    open ? <div data-testid="project-form-dialog">Project Form: {mode}</div> : null,
}));

vi.mock('@/components/shared/delete-confirmation-dialog', () => ({
  DeleteConfirmationDialog: ({ open, onConfirm }: any) =>
    open ? (
      <div data-testid="delete-confirmation-dialog">
        <button onClick={onConfirm} data-testid="confirm-delete-button">Confirm</button>
      </div>
    ) : null,
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

let mockUseProjects: ReturnType<typeof createMockUseProjects>;

describe('Sidebar', () => {
  const mockToggle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseProjects = createMockUseProjects();
  });

  const renderComponent = (isCollapsed = false, contextOverrides = {}) => {
    const mockContext = createMockAppContext(contextOverrides);
    return render(
      <AppContext.Provider value={mockContext}>
        <Sidebar isCollapsed={isCollapsed} onToggle={mockToggle} />
      </AppContext.Provider>
    );
  };

  it('should render sidebar when not collapsed', () => {
    renderComponent(false);
    expect(screen.getByTestId('project-selector')).toBeInTheDocument();
    expect(screen.getByTestId('user-list')).toBeInTheDocument();
  });

  it('should render project actions menu', () => {
    renderComponent(false);
    expect(screen.getByTestId('project-actions-menu')).toBeInTheDocument();
  });

  it('should show collapse button when sidebar is open', () => {
    renderComponent(false);
    expect(screen.getByTestId('sidebar-collapse-button')).toBeInTheDocument();
  });

  it('should call onToggle when collapse button is clicked', () => {
    renderComponent(false);
    fireEvent.click(screen.getByTestId('sidebar-collapse-button'));
    expect(mockToggle).toHaveBeenCalled();
  });

  it('should show expand button when sidebar is collapsed', () => {
    renderComponent(true);
    expect(screen.getByTestId('sidebar-expand-button')).toBeInTheDocument();
  });

  it('should open create project dialog when create action is clicked', () => {
    renderComponent(false);
    fireEvent.click(screen.getByTestId('create-project-action'));
    expect(screen.getByTestId('project-form-dialog')).toBeInTheDocument();
    expect(screen.getByText('Project Form: create')).toBeInTheDocument();
  });

  it('should open edit project dialog when edit action is clicked', () => {
    const project = createMockProject({ name: 'Test Project' });
    renderComponent(false, { 
      selectedProjectId: project.id,
      projects: [project] 
    });
    fireEvent.click(screen.getByTestId('edit-project-action'));
    expect(screen.getByTestId('project-form-dialog')).toBeInTheDocument();
    expect(screen.getByText('Project Form: edit')).toBeInTheDocument();
  });

  it('should open delete confirmation dialog when delete action is clicked', () => {
    const project = createMockProject();
    renderComponent(false, { 
      selectedProjectId: project.id,
      projects: [project] 
    });
    fireEvent.click(screen.getByTestId('delete-project-action'));
    expect(screen.getByTestId('delete-confirmation-dialog')).toBeInTheDocument();
  });

  it('should delete project when deletion is confirmed', async () => {
    const project = createMockProject();
    renderComponent(false, { 
      selectedProjectId: project.id,
      projects: [project] 
    });
    
    fireEvent.click(screen.getByTestId('delete-project-action'));
    fireEvent.click(screen.getByTestId('confirm-delete-button'));
    
    await waitFor(() => {
      expect(mockUseProjects.deleteProject).toHaveBeenCalledWith(project.id);
    });
  });

  it('should render Project label', () => {
    renderComponent(false);
    expect(screen.getByText('Project')).toBeInTheDocument();
  });
});