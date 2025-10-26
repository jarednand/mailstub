import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserFormDialog } from './user-form-dialog';
import { AppContext } from '@/contexts/AppContext';
import { createMockAppContext, createMockUser } from '@/test/mock-app-context';
import { createMockUseUsers } from '@/test/mock-use-users';
import { useUsers } from '@/hooks/useUsers';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

vi.mock('@/hooks/useUsers');
vi.mock('sonner');

describe('UserFormDialog', () => {
  const mockOnOpenChange = vi.fn();

  const defaultProps = {
    open: true,
    onOpenChange: mockOnOpenChange,
    mode: 'create' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default useUsers mock
    vi.mocked(useUsers).mockReturnValue(createMockUseUsers());
    vi.mocked(toast.success).mockReturnValue(1);
    vi.mocked(toast.error).mockReturnValue(1);
  });

  const renderUserFormDialog = (props = {}, contextOverrides = {}) => {
    const mockContext = createMockAppContext({
      selectedProjectId: 'p_123',
      users: [],
      ...contextOverrides,
    });

    return {
      ...render(
        <AppContext.Provider value={mockContext}>
          <UserFormDialog {...defaultProps} {...props} />
        </AppContext.Provider>
      ),
      mockContext,
    };
  };

  describe('Dialog rendering', () => {
    it('renders create mode dialog with correct title and description', () => {
      renderUserFormDialog();

      expect(screen.getByText('Create User')).toBeInTheDocument();
      expect(
        screen.getByText('Add a new user to receive test emails.')
      ).toBeInTheDocument();
    });

    it('renders edit mode dialog with correct title and description', () => {
      const user = createMockUser({ email: 'test@example.com' });

      renderUserFormDialog({
        mode: 'edit',
        user,
      });

      expect(screen.getByText('Edit User')).toBeInTheDocument();
      expect(screen.getByText('Update the user email address.')).toBeInTheDocument();
    });

    it('does not render when open is false', () => {
      renderUserFormDialog({ open: false });

      expect(screen.queryByText('Create User')).not.toBeInTheDocument();
    });

    it('renders form fields', () => {
      renderUserFormDialog();

      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(screen.getByTestId('user-email-input')).toBeInTheDocument();
    });

    it('renders action buttons', () => {
      renderUserFormDialog();

      expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });
  });

  describe('Form initialization', () => {
    it('initializes with empty email in create mode', () => {
      renderUserFormDialog();

      const input = screen.getByTestId('user-email-input') as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('initializes with user email in edit mode', () => {
      const user = createMockUser({ email: 'existing@example.com' });

      renderUserFormDialog({
        mode: 'edit',
        user,
      });

      const input = screen.getByTestId('user-email-input') as HTMLInputElement;
      expect(input.value).toBe('existing@example.com');
    });

    it('resets form when dialog opens', async () => {
      const { rerender, mockContext } = renderUserFormDialog({ open: false });

      rerender(
        <AppContext.Provider value={mockContext}>
          <UserFormDialog {...defaultProps} open={true} />
        </AppContext.Provider>
      );

      await waitFor(() => {
        const input = screen.getByTestId('user-email-input') as HTMLInputElement;
        expect(input.value).toBe('');
      });
    });

    it('updates form when switching from create to edit mode', async () => {
      const user = createMockUser({ email: 'edit@example.com' });
      const { rerender, mockContext } = renderUserFormDialog({ mode: 'create' });

      rerender(
        <AppContext.Provider value={mockContext}>
          <UserFormDialog
            open={true}
            onOpenChange={mockOnOpenChange}
            mode="edit"
            user={user}
          />
        </AppContext.Provider>
      );

      await waitFor(() => {
        const input = screen.getByTestId('user-email-input') as HTMLInputElement;
        expect(input.value).toBe('edit@example.com');
      });
    });
  });

  describe('Create mode', () => {
    it('creates user successfully', async () => {
      const user = userEvent.setup();
      const mockCreateUser = vi.fn().mockResolvedValue(undefined);
      vi.mocked(useUsers).mockReturnValue(
        createMockUseUsers({ createUser: mockCreateUser })
      );

      renderUserFormDialog();

      const input = screen.getByTestId('user-email-input');
      const submitButton = screen.getByTestId('submit-button');

      await user.type(input, 'newuser@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreateUser).toHaveBeenCalledWith({
          projectId: 'p_123',
          email: 'newuser@example.com',
        });
      });

      expect(toast.success).toHaveBeenCalledWith('User created successfully');
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it('shows loading state during submission', async () => {
      const user = userEvent.setup();
      const mockCreateUser = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );
      vi.mocked(useUsers).mockReturnValue(
        createMockUseUsers({ createUser: mockCreateUser })
      );

      renderUserFormDialog();

      const input = screen.getByTestId('user-email-input');
      const submitButton = screen.getByTestId('submit-button');

      await user.type(input, 'newuser@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Creating...')).toBeInTheDocument();
      });

      expect(submitButton).toBeDisabled();
      expect(screen.getByTestId('cancel-button')).toBeDisabled();

      await waitFor(() => {
        expect(mockCreateUser).toHaveBeenCalled();
      });
    });

    it('validates required email field', async () => {
      const user = userEvent.setup();
      const mockCreateUser = vi.fn();
      vi.mocked(useUsers).mockReturnValue(
        createMockUseUsers({ createUser: mockCreateUser })
      );

      renderUserFormDialog();

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      // The form should not submit without email
      await waitFor(() => {
        expect(mockCreateUser).not.toHaveBeenCalled();
      });

      // An error should be displayed
      const formMessages = screen.queryAllByRole('paragraph');
      const hasError = formMessages.some(msg => msg.textContent && msg.textContent.length > 0);
      expect(hasError).toBe(true);
    });

    it('validates email format', async () => {
      const user = userEvent.setup();
      const mockCreateUser = vi.fn();
      vi.mocked(useUsers).mockReturnValue(
        createMockUseUsers({ createUser: mockCreateUser })
      );

      renderUserFormDialog();

      const input = screen.getByTestId('user-email-input');
      const submitButton = screen.getByTestId('submit-button');

      await user.type(input, 'invalid-email');
      await user.click(submitButton);

      // The form should not submit with invalid email
      await waitFor(() => {
        expect(mockCreateUser).not.toHaveBeenCalled();
      });
    });

    it('validates email uniqueness within project', async () => {
      const user = userEvent.setup();
      const mockCreateUser = vi.fn().mockResolvedValue(undefined);
      const existingUser = createMockUser({
        projectId: 'p_123',
        email: 'existing@example.com',
      });

      vi.mocked(useUsers).mockReturnValue(
        createMockUseUsers({ 
          users: [existingUser],
          createUser: mockCreateUser 
        })
      );

      renderUserFormDialog({}, { users: [existingUser] });

      const input = screen.getByTestId('user-email-input');
      const submitButton = screen.getByTestId('submit-button');

      await user.type(input, 'existing@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        const errorElement = screen.queryByText((content, element) => {
          return element?.tagName.toLowerCase() === 'p' && 
                 content.toLowerCase().includes('already exists');
        });
        expect(errorElement).toBeInTheDocument();
      });

      expect(mockCreateUser).not.toHaveBeenCalled();
    });

    it('allows same email in different projects', async () => {
      const user = userEvent.setup();
      const mockCreateUser = vi.fn().mockResolvedValue(undefined);
      const existingUser = createMockUser({
        projectId: 'p_other',
        email: 'test@example.com',
      });

      vi.mocked(useUsers).mockReturnValue(
        createMockUseUsers({ 
          users: [existingUser],
          createUser: mockCreateUser 
        })
      );

      renderUserFormDialog({}, { users: [existingUser] });

      const input = screen.getByTestId('user-email-input');
      const submitButton = screen.getByTestId('submit-button');

      await user.type(input, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreateUser).toHaveBeenCalledWith({
          projectId: 'p_123',
          email: 'test@example.com',
        });
      });

      expect(toast.success).toHaveBeenCalledWith('User created successfully');
    });

    it('shows error when no project is selected', async () => {
      const user = userEvent.setup();
      const mockCreateUser = vi.fn().mockResolvedValue(undefined);
      vi.mocked(useUsers).mockReturnValue(
        createMockUseUsers({ createUser: mockCreateUser })
      );

      renderUserFormDialog({}, { selectedProjectId: null });

      const input = screen.getByTestId('user-email-input');
      const submitButton = screen.getByTestId('submit-button');

      await user.type(input, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('No project selected');
      });

      expect(mockCreateUser).not.toHaveBeenCalled();
    });

    it('handles server error during creation', async () => {
      const user = userEvent.setup();
      const mockCreateUser = vi.fn().mockRejectedValue(new Error('Server error'));
      vi.mocked(useUsers).mockReturnValue(
        createMockUseUsers({ createUser: mockCreateUser })
      );

      renderUserFormDialog();

      const input = screen.getByTestId('user-email-input');
      const submitButton = screen.getByTestId('submit-button');

      await user.type(input, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to create user');
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
              email: 'Email is already taken',
            },
          },
        },
      } as AxiosError;

      const mockCreateUser = vi.fn().mockRejectedValue(axiosError);
      vi.mocked(useUsers).mockReturnValue(
        createMockUseUsers({ createUser: mockCreateUser })
      );

      renderUserFormDialog();

      const input = screen.getByTestId('user-email-input');
      const submitButton = screen.getByTestId('submit-button');

      await user.type(input, 'duplicate@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email is already taken')).toBeInTheDocument();
      });

      expect(mockOnOpenChange).not.toHaveBeenCalled();
    });
  });

  describe('Edit mode', () => {
    it('updates user successfully', async () => {
      const user = userEvent.setup();
      const existingUser = createMockUser({
        id: 'u_1',
        email: 'old@example.com',
      });
      const mockUpdateUser = vi.fn().mockResolvedValue(undefined);
      vi.mocked(useUsers).mockReturnValue(
        createMockUseUsers({ updateUser: mockUpdateUser })
      );

      renderUserFormDialog({
        mode: 'edit',
        user: existingUser,
      });

      const input = screen.getByTestId('user-email-input');
      const submitButton = screen.getByTestId('submit-button');

      await user.clear(input);
      await user.type(input, 'updated@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateUser).toHaveBeenCalledWith('u_1', { email: 'updated@example.com' });
      });

      expect(toast.success).toHaveBeenCalledWith('User updated successfully');
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it('shows correct button text in edit mode', async () => {
      const user = userEvent.setup();
      const existingUser = createMockUser({ email: 'test@example.com' });
      const mockUpdateUser = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );
      vi.mocked(useUsers).mockReturnValue(
        createMockUseUsers({ updateUser: mockUpdateUser })
      );

      renderUserFormDialog({
        mode: 'edit',
        user: existingUser,
      });

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    it('allows same email when editing own user', async () => {
      const user = userEvent.setup();
      const mockUpdateUser = vi.fn().mockResolvedValue(undefined);
      const existingUser = createMockUser({
        id: 'u_1',
        projectId: 'p_123',
        email: 'same@example.com',
      });

      vi.mocked(useUsers).mockReturnValue(
        createMockUseUsers({ 
          users: [existingUser],
          updateUser: mockUpdateUser 
        })
      );

      renderUserFormDialog(
        {
          mode: 'edit',
          user: existingUser,
        },
        { users: [existingUser] }
      );

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateUser).toHaveBeenCalled();
      });

      expect(toast.success).toHaveBeenCalledWith('User updated successfully');
    });

    it('validates uniqueness against other users when editing', async () => {
      const user = userEvent.setup();
      const mockUpdateUser = vi.fn().mockResolvedValue(undefined);
      const user1 = createMockUser({
        id: 'u_1',
        projectId: 'p_123',
        email: 'user1@example.com',
      });
      const user2 = createMockUser({
        id: 'u_2',
        projectId: 'p_123',
        email: 'user2@example.com',
      });

      vi.mocked(useUsers).mockReturnValue(
        createMockUseUsers({ 
          users: [user1, user2],
          updateUser: mockUpdateUser 
        })
      );

      renderUserFormDialog(
        {
          mode: 'edit',
          user: user1,
        },
        { users: [user1, user2] }
      );

      const input = screen.getByTestId('user-email-input');
      const submitButton = screen.getByTestId('submit-button');

      await user.clear(input);
      await user.type(input, 'user2@example.com');
      await user.click(submitButton);

      // Wait for form processing
      await waitFor(() => {
        // Check that an error message appears
        const errorElement = screen.queryByText((content, element) => {
          return element?.tagName.toLowerCase() === 'p' && 
                 content.toLowerCase().includes('already exists');
        });
        expect(errorElement).toBeInTheDocument();
      });

      // The form should prevent submission
      expect(mockUpdateUser).not.toHaveBeenCalled();
    });

    it('handles server error during update', async () => {
      const user = userEvent.setup();
      const existingUser = createMockUser({ email: 'test@example.com' });
      const mockUpdateUser = vi.fn().mockRejectedValue(new Error('Server error'));
      vi.mocked(useUsers).mockReturnValue(
        createMockUseUsers({ updateUser: mockUpdateUser })
      );

      renderUserFormDialog({
        mode: 'edit',
        user: existingUser,
      });

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to update user');
      });
    });

    it('does not submit without user in edit mode', async () => {
      const user = userEvent.setup();
      const mockUpdateUser = vi.fn().mockResolvedValue(undefined);
      vi.mocked(useUsers).mockReturnValue(
        createMockUseUsers({ updateUser: mockUpdateUser })
      );

      renderUserFormDialog({
        mode: 'edit',
        user: undefined,
      });

      const input = screen.getByTestId('user-email-input');
      const submitButton = screen.getByTestId('submit-button');

      await user.type(input, 'test@example.com');
      await user.click(submitButton);

      // Should not call updateUser if user is undefined
      await waitFor(() => {
        expect(mockUpdateUser).not.toHaveBeenCalled();
      });
    });
  });

  describe('Dialog interactions', () => {
    it('closes dialog when cancel button is clicked', async () => {
      const user = userEvent.setup();

      renderUserFormDialog();

      const cancelButton = screen.getByTestId('cancel-button');
      await user.click(cancelButton);

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it('does not close dialog on submission error', async () => {
      const user = userEvent.setup();
      const mockCreateUser = vi.fn().mockRejectedValue(new Error('Server error'));
      vi.mocked(useUsers).mockReturnValue(
        createMockUseUsers({ createUser: mockCreateUser })
      );

      renderUserFormDialog();

      const input = screen.getByTestId('user-email-input');
      const submitButton = screen.getByTestId('submit-button');

      await user.type(input, 'newuser@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });

      // Dialog should stay open
      expect(screen.getByText('Create User')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles email with special characters', async () => {
      const user = userEvent.setup();
      const mockCreateUser = vi.fn().mockResolvedValue(undefined);
      vi.mocked(useUsers).mockReturnValue(
        createMockUseUsers({ createUser: mockCreateUser })
      );

      renderUserFormDialog();

      const input = screen.getByTestId('user-email-input');
      const submitButton = screen.getByTestId('submit-button');

      await user.type(input, 'user+tag@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreateUser).toHaveBeenCalledWith({
          projectId: 'p_123',
          email: 'user+tag@example.com',
        });
      });
    });

    it('normalizes email to lowercase', async () => {
      const user = userEvent.setup();
      const mockCreateUser = vi.fn().mockResolvedValue(undefined);
      vi.mocked(useUsers).mockReturnValue(
        createMockUseUsers({ createUser: mockCreateUser })
      );

      renderUserFormDialog();

      const input = screen.getByTestId('user-email-input');
      const submitButton = screen.getByTestId('submit-button');

      await user.type(input, 'User@Example.COM');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreateUser).toHaveBeenCalledWith({
          projectId: 'p_123',
          email: 'user@example.com',
        });
      });
    });

    it('validates email uniqueness case-insensitively', async () => {
      const user = userEvent.setup();
      const mockCreateUser = vi.fn().mockResolvedValue(undefined);
      const existingUser = createMockUser({
        projectId: 'p_123',
        email: 'User@Example.com',
      });

      vi.mocked(useUsers).mockReturnValue(
        createMockUseUsers({ 
          users: [existingUser],
          createUser: mockCreateUser 
        })
      );

      renderUserFormDialog({}, { users: [existingUser] });

      const input = screen.getByTestId('user-email-input');
      const submitButton = screen.getByTestId('submit-button');

      await user.type(input, 'user@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreateUser).not.toHaveBeenCalled();
      });

      expect(screen.getByText((content, element) => {
        return element?.tagName.toLowerCase() === 'p' && 
               content.toLowerCase().includes('already exists');
      })).toBeInTheDocument();
    });

    it('validates uniqueness with different cases', async () => {
      const user = userEvent.setup();
      const mockCreateUser = vi.fn().mockResolvedValue(undefined);
      const existingUser = createMockUser({
        projectId: 'p_123',
        email: 'existing@example.com',
      });

      vi.mocked(useUsers).mockReturnValue(
        createMockUseUsers({ 
          users: [existingUser],
          createUser: mockCreateUser 
        })
      );

      renderUserFormDialog({}, { users: [existingUser] });

      const input = screen.getByTestId('user-email-input');
      const submitButton = screen.getByTestId('submit-button');

      await user.type(input, 'EXISTING@EXAMPLE.COM');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreateUser).not.toHaveBeenCalled();
      });

      expect(screen.getByText((content, element) => {
        return element?.tagName.toLowerCase() === 'p' && 
               content.toLowerCase().includes('already exists');
      })).toBeInTheDocument();
    });
  });
});