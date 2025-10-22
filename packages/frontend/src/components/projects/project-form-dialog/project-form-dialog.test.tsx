import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProjectFormDialog } from './project-form-dialog';
import { useProjects } from '@/hooks/useProjects';
import { createMockUseProjects } from '@/test/mock-use-projects';
import { createMockProject } from '@/test/mock-app-context';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

vi.mock('@/hooks/useProjects');
vi.mock('sonner');

describe('ProjectFormDialog', () => {
  const mockOnOpenChange = vi.fn();

  const defaultProps = {
    open: true,
    onOpenChange: mockOnOpenChange,
    mode: 'create' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default useProjects mock
    vi.mocked(useProjects).mockReturnValue(createMockUseProjects());
    vi.mocked(toast.success).mockReturnValue(1);
    vi.mocked(toast.error).mockReturnValue(1);
  });

  describe('Dialog rendering', () => {
    it('renders create mode dialog with correct title and description', () => {
      render(<ProjectFormDialog {...defaultProps} />);

      expect(screen.getByText('Create Project')).toBeInTheDocument();
      expect(
        screen.getByText('Create a new project to organize your test emails.')
      ).toBeInTheDocument();
    });

    it('renders edit mode dialog with correct title and description', () => {
      const project = createMockProject({ name: 'Test Project' });

      render(
        <ProjectFormDialog
          {...defaultProps}
          mode="edit"
          project={project}
        />
      );

      expect(screen.getByText('Edit Project')).toBeInTheDocument();
      expect(screen.getByText('Update the project details.')).toBeInTheDocument();
    });

    it('does not render when open is false', () => {
      render(<ProjectFormDialog {...defaultProps} open={false} />);

      expect(screen.queryByText('Create Project')).not.toBeInTheDocument();
    });

    it('renders form fields', () => {
      render(<ProjectFormDialog {...defaultProps} />);

      expect(screen.getByLabelText('Project Name')).toBeInTheDocument();
      expect(screen.getByTestId('project-name-input')).toBeInTheDocument();
    });

    it('renders action buttons', () => {
      render(<ProjectFormDialog {...defaultProps} />);

      expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });
  });

  describe('Form initialization', () => {
    it('initializes with empty name in create mode', () => {
      render(<ProjectFormDialog {...defaultProps} />);

      const input = screen.getByTestId('project-name-input') as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('initializes with project name in edit mode', () => {
      const project = createMockProject({ name: 'Existing Project' });

      render(
        <ProjectFormDialog
          {...defaultProps}
          mode="edit"
          project={project}
        />
      );

      const input = screen.getByTestId('project-name-input') as HTMLInputElement;
      expect(input.value).toBe('Existing Project');
    });

    it('resets form when dialog opens', async () => {
      const { rerender } = render(<ProjectFormDialog {...defaultProps} open={false} />);

      rerender(<ProjectFormDialog {...defaultProps} open={true} />);

      await waitFor(() => {
        const input = screen.getByTestId('project-name-input') as HTMLInputElement;
        expect(input.value).toBe('');
      });
    });
  });

  describe('Create mode', () => {
    it('creates project successfully', async () => {
      const user = userEvent.setup();
      const mockCreateProject = vi.fn().mockResolvedValue(undefined);
      vi.mocked(useProjects).mockReturnValue(
        createMockUseProjects({ createProject: mockCreateProject })
      );

      render(<ProjectFormDialog {...defaultProps} />);

      const input = screen.getByTestId('project-name-input');
      const submitButton = screen.getByTestId('submit-button');

      await user.type(input, 'New Project');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreateProject).toHaveBeenCalledWith({ name: 'New Project' });
      });

      expect(toast.success).toHaveBeenCalledWith('Project created successfully');
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it('shows loading state during submission', async () => {
      const user = userEvent.setup();
      const mockCreateProject = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );
      vi.mocked(useProjects).mockReturnValue(
        createMockUseProjects({ createProject: mockCreateProject })
      );

      render(<ProjectFormDialog {...defaultProps} />);

      const input = screen.getByTestId('project-name-input');
      const submitButton = screen.getByTestId('submit-button');

      await user.type(input, 'New Project');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Creating...')).toBeInTheDocument();
      });
      
      expect(submitButton).toBeDisabled();
      expect(screen.getByTestId('cancel-button')).toBeDisabled();

      await waitFor(() => {
        expect(mockCreateProject).toHaveBeenCalled();
      });
    });

    it('validates required fields', async () => {
      const user = userEvent.setup();

      render(<ProjectFormDialog {...defaultProps} />);

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/required/i)).toBeInTheDocument();
      });
    });

    it('validates project name uniqueness', async () => {
      const user = userEvent.setup();
      const existingProject = createMockProject({ name: 'Existing Project' });

      vi.mocked(useProjects).mockReturnValue(
        createMockUseProjects({ projects: [existingProject] })
      );

      render(<ProjectFormDialog {...defaultProps} />);

      const input = screen.getByTestId('project-name-input');
      const submitButton = screen.getByTestId('submit-button');

      await user.type(input, 'Existing Project');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/already exists/i)).toBeInTheDocument();
      });
    });

    it('handles server error during creation', async () => {
      const user = userEvent.setup();
      const mockCreateProject = vi.fn().mockRejectedValue(new Error('Server error'));
      vi.mocked(useProjects).mockReturnValue(
        createMockUseProjects({ createProject: mockCreateProject })
      );

      render(<ProjectFormDialog {...defaultProps} />);

      const input = screen.getByTestId('project-name-input');
      const submitButton = screen.getByTestId('submit-button');

      await user.type(input, 'New Project');
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to create project');
      });

      expect(mockOnOpenChange).not.toHaveBeenCalled();
    });

    it('handles axios validation error from server', async () => {
      const user = userEvent.setup();
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 400,
          data: {
            errors: {
              name: 'Project name is already taken',
            },
          },
        },
      } as AxiosError;

      const mockCreateProject = vi.fn().mockRejectedValue(axiosError);
      vi.mocked(useProjects).mockReturnValue(
        createMockUseProjects({ createProject: mockCreateProject })
      );

      render(<ProjectFormDialog {...defaultProps} />);

      const input = screen.getByTestId('project-name-input');
      const submitButton = screen.getByTestId('submit-button');

      await user.type(input, 'Duplicate Name');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Project name is already taken')).toBeInTheDocument();
      });

      expect(mockOnOpenChange).not.toHaveBeenCalled();
    });
  });

  describe('Edit mode', () => {
    it('updates project successfully', async () => {
      const user = userEvent.setup();
      const project = createMockProject({ id: 'p_1', name: 'Old Name' });
      const mockUpdateProject = vi.fn().mockResolvedValue(undefined);
      vi.mocked(useProjects).mockReturnValue(
        createMockUseProjects({ updateProject: mockUpdateProject })
      );

      render(
        <ProjectFormDialog
          {...defaultProps}
          mode="edit"
          project={project}
        />
      );

      const input = screen.getByTestId('project-name-input');
      const submitButton = screen.getByTestId('submit-button');

      await user.clear(input);
      await user.type(input, 'Updated Name');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateProject).toHaveBeenCalledWith('p_1', { name: 'Updated Name' });
      });

      expect(toast.success).toHaveBeenCalledWith('Project updated successfully');
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it('shows correct button text in edit mode', async () => {
      const user = userEvent.setup();
      const project = createMockProject({ name: 'Test Project' });
      const mockUpdateProject = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );
      vi.mocked(useProjects).mockReturnValue(
        createMockUseProjects({ updateProject: mockUpdateProject })
      );

      render(
        <ProjectFormDialog
          {...defaultProps}
          mode="edit"
          project={project}
        />
      );

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    it('allows same name when editing own project', async () => {
      const user = userEvent.setup();
      const project = createMockProject({ id: 'p_1', name: 'My Project' });
      const mockUpdateProject = vi.fn().mockResolvedValue(undefined);

      vi.mocked(useProjects).mockReturnValue(
        createMockUseProjects({ 
          projects: [project],
          updateProject: mockUpdateProject 
        })
      );

      render(
        <ProjectFormDialog
          {...defaultProps}
          mode="edit"
          project={project}
        />
      );

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateProject).toHaveBeenCalled();
      });

      expect(toast.success).toHaveBeenCalledWith('Project updated successfully');
    });

    it('validates uniqueness against other projects when editing', async () => {
      const user = userEvent.setup();
      const project1 = createMockProject({ id: 'p_1', name: 'Project 1' });
      const project2 = createMockProject({ id: 'p_2', name: 'Project 2' });
      const mockUpdateProject = vi.fn().mockResolvedValue(undefined);

      vi.mocked(useProjects).mockReturnValue(
        createMockUseProjects({ 
          projects: [project1, project2],
          updateProject: mockUpdateProject
        })
      );

      render(
        <ProjectFormDialog
          {...defaultProps}
          mode="edit"
          project={project1}
        />
      );

      const input = screen.getByTestId('project-name-input');
      const submitButton = screen.getByTestId('submit-button');

      await user.clear(input);
      await user.type(input, 'Project 2');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/already exists/i)).toBeInTheDocument();
      });

      expect(mockUpdateProject).not.toHaveBeenCalled();
    });

    it('handles server error during update', async () => {
      const user = userEvent.setup();
      const project = createMockProject({ name: 'Test Project' });
      const mockUpdateProject = vi.fn().mockRejectedValue(new Error('Server error'));
      vi.mocked(useProjects).mockReturnValue(
        createMockUseProjects({ updateProject: mockUpdateProject })
      );

      render(
        <ProjectFormDialog
          {...defaultProps}
          mode="edit"
          project={project}
        />
      );

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to update project');
      });
    });
  });

  describe('Dialog interactions', () => {
    it('closes dialog when cancel button is clicked', async () => {
      const user = userEvent.setup();

      render(<ProjectFormDialog {...defaultProps} />);

      const cancelButton = screen.getByTestId('cancel-button');
      await user.click(cancelButton);

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it('does not close dialog on submission error', async () => {
      const user = userEvent.setup();
      const mockCreateProject = vi.fn().mockRejectedValue(new Error('Server error'));
      vi.mocked(useProjects).mockReturnValue(
        createMockUseProjects({ createProject: mockCreateProject })
      );

      render(<ProjectFormDialog {...defaultProps} />);

      const input = screen.getByTestId('project-name-input');
      const submitButton = screen.getByTestId('submit-button');

      await user.type(input, 'New Project');
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });

      // Dialog should stay open
      expect(screen.getByText('Create Project')).toBeInTheDocument();
    });
  });
});