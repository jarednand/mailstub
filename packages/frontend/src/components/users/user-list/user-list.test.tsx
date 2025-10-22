import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserList } from './user-list';
import { AppContext } from '@/contexts/AppContext';
import { createMockAppContext, createMockUser, createMockMessage } from '@/test/mock-app-context';
import { createMockUseUsers } from '@/test/mock-use-users';

// Mock hooks
vi.mock('@/hooks/useUsers', () => ({
  useUsers: () => mockUseUsers,
}));

// Mock child components
vi.mock('@/components/users/user-list-item', () => ({
  UserListItem: ({ user, unreadCount, isSelected, onEdit, onDelete }: any) => (
    <div data-testid={`user-item-${user.id}`}>
      <span>{user.email}</span>
      {unreadCount > 0 && <span data-testid={`unread-${user.id}`}>{unreadCount}</span>}
      {isSelected && <span data-testid="selected-indicator">Selected</span>}
      <button onClick={() => onEdit(user)} data-testid={`edit-${user.id}`}>Edit</button>
      <button onClick={() => onDelete(user.id)} data-testid={`delete-${user.id}`}>Delete</button>
    </div>
  ),
}));

vi.mock('@/components/users/user-form-dialog', () => ({
  UserFormDialog: ({ open, mode }: any) =>
    open ? <div data-testid="user-form-dialog">User Form: {mode}</div> : null,
}));

vi.mock('@/components/shared/delete-confirmation-dialog', () => ({
  DeleteConfirmationDialog: ({ open, onConfirm }: any) =>
    open ? (
      <div data-testid="delete-confirmation-dialog">
        <button onClick={onConfirm} data-testid="confirm-delete">Confirm</button>
      </div>
    ) : null,
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

let mockUseUsers: ReturnType<typeof createMockUseUsers>;

describe('UserList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUsers = createMockUseUsers();
  });

  const renderComponent = (contextOverrides = {}) => {
    const mockContext = createMockAppContext(contextOverrides);
    return render(
      <AppContext.Provider value={mockContext}>
        <UserList />
      </AppContext.Provider>
    );
  };

  it('should render Users header', () => {
    renderComponent();
    expect(screen.getByText('Users')).toBeInTheDocument();
  });

  it('should render Add User button', () => {
    renderComponent();
    expect(screen.getByTestId('add-user-button')).toBeInTheDocument();
  });

  it('should render users for selected project', () => {
    const user1 = createMockUser({ id: 'u_1', projectId: 'p_test', email: 'user1@test.com' });
    const user2 = createMockUser({ id: 'u_2', projectId: 'p_test', email: 'user2@test.com' });
    
    renderComponent({
      users: [user1, user2],
      selectedProjectId: 'p_test',
    });
    
    expect(screen.getByText('user1@test.com')).toBeInTheDocument();
    expect(screen.getByText('user2@test.com')).toBeInTheDocument();
  });

  it('should not render users from other projects', () => {
    const user1 = createMockUser({ id: 'u_1', projectId: 'p_test', email: 'user1@test.com' });
    const user2 = createMockUser({ id: 'u_2', projectId: 'p_other', email: 'user2@test.com' });
    
    renderComponent({
      users: [user1, user2],
      selectedProjectId: 'p_test',
    });
    
    expect(screen.getByText('user1@test.com')).toBeInTheDocument();
    expect(screen.queryByText('user2@test.com')).not.toBeInTheDocument();
  });

  it('should calculate unread counts correctly', () => {
    const user = createMockUser({ id: 'u_1', projectId: 'p_test' });
    const message1 = createMockMessage({ userId: 'u_1', read: false });
    const message2 = createMockMessage({ userId: 'u_1', read: false });
    const message3 = createMockMessage({ userId: 'u_1', read: true });
    
    renderComponent({
      users: [user],
      selectedProjectId: 'p_test',
      messages: [message1, message2, message3],
    });
    
    expect(screen.getByTestId('unread-u_1')).toHaveTextContent('2');
  });

  it('should show selected indicator for selected user', () => {
    const user = createMockUser({ id: 'u_1', projectId: 'p_test' });
    
    renderComponent({
      users: [user],
      selectedProjectId: 'p_test',
      selectedUserId: 'u_1',
    });
    
    expect(screen.getByTestId('selected-indicator')).toBeInTheDocument();
  });

  it('should open create user dialog when Add User is clicked', () => {
    renderComponent();
    
    fireEvent.click(screen.getByTestId('add-user-button'));
    
    expect(screen.getByTestId('user-form-dialog')).toBeInTheDocument();
    expect(screen.getByText('User Form: create')).toBeInTheDocument();
  });

  it('should open edit user dialog when edit is clicked', () => {
    const user = createMockUser({ id: 'u_1', projectId: 'p_test' });
    
    renderComponent({
      users: [user],
      selectedProjectId: 'p_test',
    });
    
    fireEvent.click(screen.getByTestId('edit-u_1'));
    
    expect(screen.getByTestId('user-form-dialog')).toBeInTheDocument();
    expect(screen.getByText('User Form: edit')).toBeInTheDocument();
  });

  it('should open delete confirmation dialog when delete is clicked', () => {
    const user = createMockUser({ id: 'u_1', projectId: 'p_test' });
    
    renderComponent({
      users: [user],
      selectedProjectId: 'p_test',
    });
    
    fireEvent.click(screen.getByTestId('delete-u_1'));
    
    expect(screen.getByTestId('delete-confirmation-dialog')).toBeInTheDocument();
  });

  it('should delete user when deletion is confirmed', async () => {
    const user = createMockUser({ id: 'u_1', projectId: 'p_test' });
    
    renderComponent({
      users: [user],
      selectedProjectId: 'p_test',
    });
    
    fireEvent.click(screen.getByTestId('delete-u_1'));
    fireEvent.click(screen.getByTestId('confirm-delete'));
    
    await waitFor(() => {
      expect(mockUseUsers.deleteUser).toHaveBeenCalledWith('u_1');
    });
  });

  it('should render empty list when no users', () => {
    renderComponent({
      users: [],
      selectedProjectId: 'p_test',
    });
    
    expect(screen.queryByText(/@/)).not.toBeInTheDocument();
  });

  it('should handle multiple users with different unread counts', () => {
    const user1 = createMockUser({ id: 'u_1', projectId: 'p_test' });
    const user2 = createMockUser({ id: 'u_2', projectId: 'p_test' });
    
    const message1 = createMockMessage({ userId: 'u_1', read: false });
    const message2 = createMockMessage({ userId: 'u_2', read: false });
    const message3 = createMockMessage({ userId: 'u_2', read: false });
    
    renderComponent({
      users: [user1, user2],
      selectedProjectId: 'p_test',
      messages: [message1, message2, message3],
    });
    
    expect(screen.getByTestId('unread-u_1')).toHaveTextContent('1');
    expect(screen.getByTestId('unread-u_2')).toHaveTextContent('2');
  });
});