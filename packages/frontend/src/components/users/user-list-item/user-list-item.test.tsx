import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserListItem } from './user-list-item';
import { AppContext } from '@/contexts/AppContext';
import { createMockAppContext, createMockUser } from '@/test/mock-app-context';

describe('UserListItem', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockSetSelectedUserId = vi.fn();

  const defaultProps = {
    user: createMockUser({ email: 'test@example.com' }),
    unreadCount: 0,
    isSelected: false,
    onEdit: mockOnEdit,
    onDelete: mockOnDelete,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (props = {}, contextOverrides = {}) => {
    const mockContext = createMockAppContext({
      setSelectedUserId: mockSetSelectedUserId,
      ...contextOverrides,
    });

    return render(
      <AppContext.Provider value={mockContext}>
        <UserListItem {...defaultProps} {...props} />
      </AppContext.Provider>
    );
  };

  it('should render user email', () => {
    renderComponent();
    
    expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
  });

  it('should render unread count when greater than 0', () => {
    renderComponent({ unreadCount: 5 });
    
    expect(screen.getByTestId('unread-count')).toHaveTextContent('5');
  });

  it('should not render unread count when 0', () => {
    renderComponent({ unreadCount: 0 });
    
    expect(screen.queryByTestId('unread-count')).not.toBeInTheDocument();
  });

  it('should call setSelectedUserId when clicked', () => {
    const user = createMockUser({ id: 'u_test-123' });
    renderComponent({ user });
    
    fireEvent.click(screen.getByTestId('user-list-item'));
    
    expect(mockSetSelectedUserId).toHaveBeenCalledWith('u_test-123');
  });

  it('should apply selected styles when selected', () => {
    renderComponent({ isSelected: true });
    
    const item = screen.getByTestId('user-list-item');
    expect(item).toHaveClass('bg-cyan-50');
  });

  it('should not apply selected styles when not selected', () => {
    renderComponent({ isSelected: false });
    
    const item = screen.getByTestId('user-list-item');
    expect(item).not.toHaveClass('bg-cyan-50');
  });

  it('should render edit button', () => {
    renderComponent();
    
    expect(screen.getByTestId('edit-user-button')).toBeInTheDocument();
  });

  it('should render delete button', () => {
    renderComponent();
    
    expect(screen.getByTestId('delete-user-button')).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', () => {
    const user = createMockUser({ email: 'edit@example.com' });
    renderComponent({ user });
    
    fireEvent.click(screen.getByTestId('edit-user-button'));
    
    expect(mockOnEdit).toHaveBeenCalledWith(user);
  });

  it('should call onDelete when delete button is clicked', () => {
    const user = createMockUser({ id: 'u_delete-123' });
    renderComponent({ user });
    
    fireEvent.click(screen.getByTestId('delete-user-button'));
    
    expect(mockOnDelete).toHaveBeenCalledWith('u_delete-123');
  });

  it('should stop propagation when edit button is clicked', () => {
    renderComponent();
    
    fireEvent.click(screen.getByTestId('edit-user-button'));
    
    expect(mockOnEdit).toHaveBeenCalled();
    expect(mockSetSelectedUserId).not.toHaveBeenCalled();
  });

  it('should stop propagation when delete button is clicked', () => {
    renderComponent();
    
    fireEvent.click(screen.getByTestId('delete-user-button'));
    
    expect(mockOnDelete).toHaveBeenCalled();
    expect(mockSetSelectedUserId).not.toHaveBeenCalled();
  });

  it('should render different email for different user', () => {
    const user = createMockUser({ email: 'another@example.com' });
    renderComponent({ user });
    
    expect(screen.getByTestId('user-email')).toHaveTextContent('another@example.com');
  });
});