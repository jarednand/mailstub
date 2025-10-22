import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppProvider } from './app-provider';
import { useAppContext } from '@/hooks/useAppContext';
import { createMockProject, createMockUser, createMockMessage } from '@/test/mock-app-context';
import axios from 'axios';
import { toast } from 'sonner';

vi.mock('axios');
vi.mock('sonner');

// Test component that uses the context
function TestConsumer() {
  const context = useAppContext();
  
  if (!context) {
    return <div>Loading context...</div>;
  }
  
  return (
    <div>
      <div data-testid="projects-count">{context.projects?.length || 0}</div>
      <div data-testid="users-count">{context.users?.length || 0}</div>
      <div data-testid="messages-count">{context.messages?.length || 0}</div>
      <div data-testid="selected-project">{context.selectedProjectId || 'none'}</div>
      <div data-testid="selected-user">{context.selectedUserId || 'none'}</div>
      <div data-testid="selected-message">{context.selectedMessageId || 'none'}</div>
      <div data-testid="loading-projects">{String(context.isLoadingProjects)}</div>
      <div data-testid="loading-users">{String(context.isLoadingUsers)}</div>
      <div data-testid="loading-messages">{String(context.isLoadingMessages)}</div>
      <div data-testid="theme">{context.theme}</div>
      <button onClick={() => context.setSelectedProjectId('p_test')}>Set Project</button>
      <button onClick={() => context.setSelectedUserId('u_test')}>Set User</button>
      <button onClick={context.toggleTheme}>Toggle Theme</button>
    </div>
  );
}

describe('AppProvider', () => {
  const mockProject1 = createMockProject({ id: 'p_1', name: 'Project 1' });
  const mockProject2 = createMockProject({ id: 'p_2', name: 'Project 2' });
  const mockUser1 = createMockUser({ id: 'u_1', projectId: 'p_1', email: 'user1@example.com' });
  const mockUser2 = createMockUser({ id: 'u_2', projectId: 'p_1', email: 'user2@example.com' });
  const mockMessage1 = createMockMessage({ id: 'm_1', userId: 'u_1' });
  const mockMessage2 = createMockMessage({ id: 'm_2', userId: 'u_1' });

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(toast.error).mockReturnValue(1);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Initial loading', () => {
    it('loads projects on mount', async () => {
      vi.mocked(axios.get).mockResolvedValue({
        data: { projects: [mockProject1, mockProject2] },
      });

      render(
        <AppProvider>
          <TestConsumer />
        </AppProvider>
      );

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith('/api/projects');
      });

      await waitFor(() => {
        expect(screen.getByTestId('projects-count')).toHaveTextContent('2');
      });
    });

    it('sets first project as selected when projects load', async () => {
      vi.mocked(axios.get).mockResolvedValue({
        data: { projects: [mockProject1, mockProject2] },
      });

      render(
        <AppProvider>
          <TestConsumer />
        </AppProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('selected-project')).toHaveTextContent('p_1');
      });
    });

    it('shows loading state while fetching projects', async () => {
      vi.mocked(axios.get).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      render(
        <AppProvider>
          <TestConsumer />
        </AppProvider>
      );

      expect(screen.getByTestId('loading-projects')).toHaveTextContent('true');
    });

    it('handles project loading error', async () => {
      vi.mocked(axios.get).mockRejectedValue(new Error('Network error'));

      render(
        <AppProvider>
          <TestConsumer />
        </AppProvider>
      );

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Error loading projects.');
      });
    });
  });

  describe('Users loading', () => {
    it('loads users when project is selected', async () => {
      vi.mocked(axios.get)
        .mockResolvedValueOnce({ data: { projects: [mockProject1] } })
        .mockResolvedValueOnce({ data: { users: [mockUser1, mockUser2] } });

      render(
        <AppProvider>
          <TestConsumer />
        </AppProvider>
      );

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith('/api/users', {
          params: { projectId: 'p_1' },
        });
      });

      await waitFor(() => {
        expect(screen.getByTestId('users-count')).toHaveTextContent('2');
      });
    });

    it('sets first user as selected when users load', async () => {
      vi.mocked(axios.get)
        .mockResolvedValueOnce({ data: { projects: [mockProject1] } })
        .mockResolvedValueOnce({ data: { users: [mockUser1, mockUser2] } });

      render(
        <AppProvider>
          <TestConsumer />
        </AppProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('selected-user')).toHaveTextContent('u_1');
      });
    });

    it('handles user loading error', async () => {
      vi.mocked(axios.get)
        .mockResolvedValueOnce({ data: { projects: [mockProject1] } })
        .mockRejectedValueOnce(new Error('Network error'));

      render(
        <AppProvider>
          <TestConsumer />
        </AppProvider>
      );

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Error loading users.');
      });
    });
  });

  describe('Messages loading', () => {
    it('loads messages when user is selected', async () => {
      vi.mocked(axios.get)
        .mockResolvedValueOnce({ data: { projects: [mockProject1] } })
        .mockResolvedValueOnce({ data: { users: [mockUser1] } })
        .mockResolvedValueOnce({ data: { messages: [mockMessage1, mockMessage2] } });

      render(
        <AppProvider>
          <TestConsumer />
        </AppProvider>
      );

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith('/api/messages', {
          params: { userId: 'u_1' },
        });
      });

      await waitFor(() => {
        expect(screen.getByTestId('messages-count')).toHaveTextContent('2');
      });
    });

    it('clears selected message when user changes', async () => {
      const user = userEvent.setup();
      vi.mocked(axios.get)
        .mockResolvedValueOnce({ data: { projects: [mockProject1] } })
        .mockResolvedValueOnce({ data: { users: [mockUser1] } })
        .mockResolvedValue({ data: { messages: [] } });

      render(
        <AppProvider>
          <TestConsumer />
        </AppProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('selected-user')).toHaveTextContent('u_1');
      });

      // Change user
      const setUserButton = screen.getByText('Set User');
      await user.click(setUserButton);

      await waitFor(() => {
        expect(screen.getByTestId('selected-message')).toHaveTextContent('none');
      });
    });

    it('handles message loading error', async () => {
      vi.mocked(axios.get)
        .mockResolvedValueOnce({ data: { projects: [mockProject1] } })
        .mockResolvedValueOnce({ data: { users: [mockUser1] } })
        .mockRejectedValueOnce(new Error('Network error'));

      render(
        <AppProvider>
          <TestConsumer />
        </AppProvider>
      );

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Error loading messages.');
      });
    });
  });

  describe('Theme management', () => {
    it('initializes theme from localStorage', async () => {
      localStorage.setItem('mailstub-theme', 'dark');
      vi.mocked(axios.get).mockResolvedValue({ data: { projects: [] } });

      render(
        <AppProvider>
          <TestConsumer />
        </AppProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      });
    });

    it('defaults to light theme when localStorage is empty', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: { projects: [] } });

      render(
        <AppProvider>
          <TestConsumer />
        </AppProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('light');
      });
    });

    it('toggles theme', async () => {
      const user = userEvent.setup();
      vi.mocked(axios.get).mockResolvedValue({ data: { projects: [] } });

      render(
        <AppProvider>
          <TestConsumer />
        </AppProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('light');
      });

      const toggleButton = screen.getByText('Toggle Theme');
      await user.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      });
    });

    it('saves theme to localStorage when changed', async () => {
      const user = userEvent.setup();
      vi.mocked(axios.get).mockResolvedValue({ data: { projects: [] } });

      render(
        <AppProvider>
          <TestConsumer />
        </AppProvider>
      );

      const toggleButton = screen.getByText('Toggle Theme');
      await user.click(toggleButton);

      await waitFor(() => {
        expect(localStorage.getItem('mailstub-theme')).toBe('dark');
      });
    });
  });

  describe('Context value updates', () => {
    it('provides all context values', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: { projects: [] } });

      render(
        <AppProvider>
          <TestConsumer />
        </AppProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('projects-count')).toBeInTheDocument();
        expect(screen.getByTestId('users-count')).toBeInTheDocument();
        expect(screen.getByTestId('messages-count')).toBeInTheDocument();
      });
    });

    it('updates selected project', async () => {
      const user = userEvent.setup();
      vi.mocked(axios.get).mockResolvedValue({ data: { projects: [], users: [] } });

      render(
        <AppProvider>
          <TestConsumer />
        </AppProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('selected-project')).toHaveTextContent('none');
      });

      const setProjectButton = screen.getByText('Set Project');
      await user.click(setProjectButton);

      await waitFor(() => {
        expect(screen.getByTestId('selected-project')).toHaveTextContent('p_test');
      });
    });
  });

  describe('Loading states', () => {
    it('sets loading states correctly during fetch', async () => {
      let resolveProjects: any;
      const projectsPromise = new Promise(resolve => {
        resolveProjects = resolve;
      });

      vi.mocked(axios.get).mockReturnValue(projectsPromise as any);

      render(
        <AppProvider>
          <TestConsumer />
        </AppProvider>
      );

      expect(screen.getByTestId('loading-projects')).toHaveTextContent('true');

      resolveProjects({ data: { projects: [mockProject1] } });

      await waitFor(() => {
        expect(screen.getByTestId('loading-projects')).toHaveTextContent('false');
      });
    });
  });

  describe('Edge cases', () => {
    it('handles empty projects array', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: { projects: [] } });

      render(
        <AppProvider>
          <TestConsumer />
        </AppProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('projects-count')).toHaveTextContent('0');
        expect(screen.getByTestId('selected-project')).toHaveTextContent('none');
      });
    });

    it('handles empty users array', async () => {
      vi.mocked(axios.get)
        .mockResolvedValueOnce({ data: { projects: [mockProject1] } })
        .mockResolvedValueOnce({ data: { users: [] } });

      render(
        <AppProvider>
          <TestConsumer />
        </AppProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('users-count')).toHaveTextContent('0');
        expect(screen.getByTestId('selected-user')).toHaveTextContent('none');
      });
    });

    it('does not load users when no project is selected', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: { projects: [] } });

      render(
        <AppProvider>
          <TestConsumer />
        </AppProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading-projects')).toHaveTextContent('false');
      });

      // Should only call once for projects, not for users
      expect(axios.get).toHaveBeenCalledTimes(1);
    });
  });
});