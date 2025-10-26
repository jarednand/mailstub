import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MessageList } from './message-list';
import { AppContext } from '@/contexts/AppContext';
import { createMockAppContext, createMockMessage, createMockUser, createMockProject } from '@/test/mock-app-context';
import { createMockUseMessages } from '@/test/mock-use-messages';
import axios from 'axios';

// Mock hooks
vi.mock('@/hooks/useMessages', () => ({
  useMessages: () => mockUseMessages,
}));

vi.mock('axios');

// Mock child components
vi.mock('@/components/messages/message-list-item', () => ({
  MessageListItem: ({ message, isSelected, onSelect, onClick }: any) => (
    <div data-testid={`message-item-${message.id}`}>
      <span>{message.subject}</span>
      <button onClick={() => onSelect(message.id)} data-testid={`select-${message.id}`}>
        Select
      </button>
      <button onClick={() => onClick(message.id)} data-testid={`click-${message.id}`}>
        Click
      </button>
      {isSelected && <span data-testid={`selected-${message.id}`}>Selected</span>}
    </div>
  ),
}));

vi.mock('@/components/shared/delete-confirmation-dialog', () => ({
  DeleteConfirmationDialog: ({ open, onConfirm }: any) =>
    open ? (
      <div data-testid="delete-confirmation-dialog">
        <button onClick={onConfirm} data-testid="confirm-delete">
          Confirm
        </button>
      </div>
    ) : null,
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

let mockUseMessages: ReturnType<typeof createMockUseMessages>;

describe('MessageList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMessages = createMockUseMessages();
    vi.mocked(axios.get).mockResolvedValue({ data: { messages: [] } });
  });

  const renderComponent = (searchQuery = '', contextOverrides = {}) => {
    const mockContext = createMockAppContext(contextOverrides);
    return render(
      <AppContext.Provider value={mockContext}>
        <MessageList searchQuery={searchQuery} />
      </AppContext.Provider>
    );
  };

  describe('Rendering', () => {
    it('should render user email and project name', () => {
      const user = createMockUser({ email: 'test@example.com' });
      const project = createMockProject({ name: 'Test Project' });
      
      renderComponent('', {
        users: [user],
        projects: [project],
        selectedUserId: user.id,
        selectedProjectId: project.id,
      });
      
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText(/Test Project/)).toBeInTheDocument();
    });

    it('should render message count', () => {
      const user = createMockUser({ id: 'u_1', projectId: 'p_1' });
      const project = createMockProject({ id: 'p_1' });
      const messages = [
        createMockMessage({ userId: 'u_1', projectId: 'p_1' }),
        createMockMessage({ userId: 'u_1', projectId: 'p_1' }),
      ];
      
      renderComponent('', {
        users: [user],
        projects: [project],
        messages,
        selectedUserId: user.id,
        selectedProjectId: project.id,
      });
      
      expect(screen.getByText(/2 messages/)).toBeInTheDocument();
    });

    it('should render refresh button', () => {
      renderComponent();
      expect(screen.getByTestId('refresh-messages-button')).toBeInTheDocument();
    });

    it('should render empty state when no messages', () => {
      const user = createMockUser({ id: 'u_1' });
      const project = createMockProject({ id: 'p_1' });
      
      renderComponent('', {
        users: [user],
        projects: [project],
        selectedUserId: user.id,
        selectedProjectId: project.id,
        messages: [],
      });
      
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('No messages yet')).toBeInTheDocument();
    });

    it('should render messages for selected user', () => {
      const user = createMockUser({ id: 'u_1', projectId: 'p_1' });
      const project = createMockProject({ id: 'p_1' });
      const message1 = createMockMessage({ id: 'm_1', userId: 'u_1', projectId: 'p_1', subject: 'Message 1' });
      const message2 = createMockMessage({ id: 'm_2', userId: 'u_1', projectId: 'p_1', subject: 'Message 2' });
      
      renderComponent('', {
        users: [user],
        projects: [project],
        messages: [message1, message2],
        selectedUserId: user.id,
        selectedProjectId: project.id,
      });
      
      expect(screen.getByText('Message 1')).toBeInTheDocument();
      expect(screen.getByText('Message 2')).toBeInTheDocument();
    });

    it('should not render messages from other users', () => {
      const user1 = createMockUser({ id: 'u_1', projectId: 'p_1' });
      const user2 = createMockUser({ id: 'u_2', projectId: 'p_1' });
      const project = createMockProject({ id: 'p_1' });
      const message1 = createMockMessage({ userId: 'u_1', projectId: 'p_1', subject: 'User 1 Message' });
      const message2 = createMockMessage({ userId: 'u_2', projectId: 'p_1', subject: 'User 2 Message' });
      
      renderComponent('', {
        users: [user1, user2],
        projects: [project],
        messages: [message1, message2],
        selectedUserId: user1.id,
        selectedProjectId: project.id,
      });
      
      expect(screen.getByText('User 1 Message')).toBeInTheDocument();
      expect(screen.queryByText('User 2 Message')).not.toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should filter messages by subject', () => {
      const user = createMockUser({ id: 'u_1', projectId: 'p_1' });
      const project = createMockProject({ id: 'p_1' });
      const message1 = createMockMessage({ userId: 'u_1', projectId: 'p_1', subject: 'Important Email' });
      const message2 = createMockMessage({ userId: 'u_1', projectId: 'p_1', subject: 'Regular Message' });
      
      renderComponent('Important', {
        users: [user],
        projects: [project],
        messages: [message1, message2],
        selectedUserId: user.id,
        selectedProjectId: project.id,
      });
      
      expect(screen.getByText('Important Email')).toBeInTheDocument();
      expect(screen.queryByText('Regular Message')).not.toBeInTheDocument();
    });

    it('should filter messages by body content', () => {
      const user = createMockUser({ id: 'u_1', projectId: 'p_1' });
      const project = createMockProject({ id: 'p_1' });
      const message1 = createMockMessage({ userId: 'u_1', projectId: 'p_1', body: 'Contains keyword' });
      const message2 = createMockMessage({ userId: 'u_1', projectId: 'p_1', body: 'Different content' });
      
      renderComponent('keyword', {
        users: [user],
        projects: [project],
        messages: [message1, message2],
        selectedUserId: user.id,
        selectedProjectId: project.id,
      });
      
      expect(screen.getByTestId('message-item-' + message1.id)).toBeInTheDocument();
      expect(screen.queryByTestId('message-item-' + message2.id)).not.toBeInTheDocument();
    });

    it('should filter messages by sender', () => {
      const user = createMockUser({ id: 'u_1', projectId: 'p_1' });
      const project = createMockProject({ id: 'p_1' });
      const message1 = createMockMessage({ userId: 'u_1', projectId: 'p_1', sender: 'alice@example.com' });
      const message2 = createMockMessage({ userId: 'u_1', projectId: 'p_1', sender: 'bob@example.com' });
      
      renderComponent('alice', {
        users: [user],
        projects: [project],
        messages: [message1, message2],
        selectedUserId: user.id,
        selectedProjectId: project.id,
      });
      
      expect(screen.getByTestId('message-item-' + message1.id)).toBeInTheDocument();
      expect(screen.queryByTestId('message-item-' + message2.id)).not.toBeInTheDocument();
    });

    it('should be case insensitive', () => {
      const user = createMockUser({ id: 'u_1', projectId: 'p_1' });
      const project = createMockProject({ id: 'p_1' });
      const message = createMockMessage({ userId: 'u_1', projectId: 'p_1', subject: 'Important Message' });
      
      renderComponent('IMPORTANT', {
        users: [user],
        projects: [project],
        messages: [message],
        selectedUserId: user.id,
        selectedProjectId: project.id,
      });
      
      expect(screen.getByText('Important Message')).toBeInTheDocument();
    });
  });

  describe('Message Selection', () => {
    it('should select message when select button is clicked', () => {
      const user = createMockUser({ id: 'u_1', projectId: 'p_1' });
      const project = createMockProject({ id: 'p_1' });
      const message = createMockMessage({ id: 'm_1', userId: 'u_1', projectId: 'p_1' });
      const setSelectedMessages = vi.fn();
      
      renderComponent('', {
        users: [user],
        projects: [project],
        messages: [message],
        selectedUserId: user.id,
        selectedProjectId: project.id,
        setSelectedMessages,
      });
      
      fireEvent.click(screen.getByTestId('select-m_1'));
      
      expect(setSelectedMessages).toHaveBeenCalled();
    });

    it('should show delete button when messages are selected', () => {
      const user = createMockUser({ id: 'u_1', projectId: 'p_1' });
      const project = createMockProject({ id: 'p_1' });
      const message = createMockMessage({ id: 'm_1', userId: 'u_1', projectId: 'p_1' });
      const selectedMessages = new Set(['m_1']);
      
      renderComponent('', {
        users: [user],
        projects: [project],
        messages: [message],
        selectedUserId: user.id,
        selectedProjectId: project.id,
        selectedMessages,
      });
      
      expect(screen.getByTestId('delete-selected-button')).toBeInTheDocument();
      expect(screen.getByText('Delete 1')).toBeInTheDocument();
    });

    it('should not show delete button when no messages selected', () => {
      const user = createMockUser({ id: 'u_1', projectId: 'p_1' });
      const project = createMockProject({ id: 'p_1' });
      const message = createMockMessage({ userId: 'u_1', projectId: 'p_1' });
      
      renderComponent('', {
        users: [user],
        projects: [project],
        messages: [message],
        selectedUserId: user.id,
        selectedProjectId: project.id,
        selectedMessages: new Set(),
      });
      
      expect(screen.queryByTestId('delete-selected-button')).not.toBeInTheDocument();
    });
  });

  describe('Message Click', () => {
    it('should mark message as read when clicked', () => {
      const user = createMockUser({ id: 'u_1', projectId: 'p_1' });
      const project = createMockProject({ id: 'p_1' });
      const message = createMockMessage({ id: 'm_1', userId: 'u_1', projectId: 'p_1' });
      
      renderComponent('', {
        users: [user],
        projects: [project],
        messages: [message],
        selectedUserId: user.id,
        selectedProjectId: project.id,
      });
      
      fireEvent.click(screen.getByTestId('click-m_1'));
      
      expect(mockUseMessages.markMessageAsRead).toHaveBeenCalledWith('m_1');
    });

    it('should set selected message ID when clicked', () => {
      const user = createMockUser({ id: 'u_1', projectId: 'p_1' });
      const project = createMockProject({ id: 'p_1' });
      const message = createMockMessage({ id: 'm_1', userId: 'u_1', projectId: 'p_1' });
      const setSelectedMessageId = vi.fn();
      
      renderComponent('', {
        users: [user],
        projects: [project],
        messages: [message],
        selectedUserId: user.id,
        selectedProjectId: project.id,
        setSelectedMessageId,
      });
      
      fireEvent.click(screen.getByTestId('click-m_1'));
      
      expect(setSelectedMessageId).toHaveBeenCalledWith('m_1');
    });
  });

  describe('Delete Functionality', () => {
    it('should open delete dialog when delete button is clicked', () => {
      const user = createMockUser({ id: 'u_1', projectId: 'p_1' });
      const project = createMockProject({ id: 'p_1' });
      const message = createMockMessage({ userId: 'u_1', projectId: 'p_1' });
      const selectedMessages = new Set(['m_1']);
      
      renderComponent('', {
        users: [user],
        projects: [project],
        messages: [message],
        selectedUserId: user.id,
        selectedProjectId: project.id,
        selectedMessages,
      });
      
      fireEvent.click(screen.getByTestId('delete-selected-button'));
      
      expect(screen.getByTestId('delete-confirmation-dialog')).toBeInTheDocument();
    });

    it('should delete messages when confirmed', async () => {
      const user = createMockUser({ id: 'u_1', projectId: 'p_1' });
      const project = createMockProject({ id: 'p_1' });
      const message = createMockMessage({ id: 'm_1', userId: 'u_1', projectId: 'p_1' });
      const selectedMessages = new Set(['m_1', 'm_2']);
      
      renderComponent('', {
        users: [user],
        projects: [project],
        messages: [message],
        selectedUserId: user.id,
        selectedProjectId: project.id,
        selectedMessages,
      });
      
      fireEvent.click(screen.getByTestId('delete-selected-button'));
      fireEvent.click(screen.getByTestId('confirm-delete'));
      
      await waitFor(() => {
        expect(mockUseMessages.deleteMessages).toHaveBeenCalledWith(['m_1', 'm_2']);
      });
    });
  });

  describe('Refresh Functionality', () => {
    it('should refresh messages when refresh button is clicked', async () => {
      const user = createMockUser({ id: 'u_1' });
      const project = createMockProject({ id: 'p_1' });
      const setMessages = vi.fn();
      
      vi.mocked(axios.get).mockResolvedValue({
        data: { messages: [{ id: 'm_new' }] },
      });
      
      renderComponent('', {
        users: [user],
        projects: [project],
        selectedUserId: user.id,
        selectedProjectId: project.id,
        setMessages,
      });
      
      fireEvent.click(screen.getByTestId('refresh-messages-button'));
      
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith('/api/messages', {
          params: { userId: 'u_1' },
        });
      });
      
      await waitFor(() => {
        expect(setMessages).toHaveBeenCalledWith([{ id: 'm_new' }]);
      });
    });

    it('should show loading state while refreshing', async () => {
      const user = createMockUser({ id: 'u_1' });
      const project = createMockProject({ id: 'p_1' });
      const setIsLoadingMessages = vi.fn();
      
      vi.mocked(axios.get).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );
      
      renderComponent('', {
        users: [user],
        projects: [project],
        selectedUserId: user.id,
        selectedProjectId: project.id,
        setIsLoadingMessages,
      });
      
      fireEvent.click(screen.getByTestId('refresh-messages-button'));
      
      await waitFor(() => {
        expect(setIsLoadingMessages).toHaveBeenCalledWith(true);
      });
    });

    it('should disable refresh button while loading', () => {
      renderComponent('', { isLoadingMessages: true });
      
      expect(screen.getByTestId('refresh-messages-button')).toBeDisabled();
    });
  });
});