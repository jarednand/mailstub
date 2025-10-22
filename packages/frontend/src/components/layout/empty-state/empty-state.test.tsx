import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from './empty-state';
import { AppContext } from '@/contexts/AppContext';
import { createMockAppContext } from '@/test/mock-app-context';

// Mock the components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, 'data-testid': dataTestId, ...props }: any) => (
    <button onClick={onClick} data-testid={dataTestId} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/projects/project-form-dialog', () => ({
  ProjectFormDialog: ({ open, onOpenChange, mode }: any) => (
    open ? (
      <div data-testid="project-form-dialog" data-mode={mode}>
        <button onClick={() => onOpenChange(false)}>Close Dialog</button>
      </div>
    ) : null
  ),
}));

vi.mock('lucide-react', () => ({
  Mail: () => <svg data-testid="mail-icon" />,
  Moon: () => <svg data-testid="moon-icon" />,
  Sun: () => <svg data-testid="sun-icon" />,
}));

describe('EmptyState', () => {
  const renderWithContext = (contextValue = createMockAppContext()) => {
    return render(
      <AppContext.Provider value={contextValue}>
        <EmptyState />
      </AppContext.Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the component without crashing', () => {
      renderWithContext();
      expect(screen.getByText('MailStub')).toBeInTheDocument();
    });

    it('should render the Mail icon in the header', () => {
      renderWithContext();
      expect(screen.getByTestId('mail-icon')).toBeInTheDocument();
    });

    it('should render the welcome heading and description', () => {
      renderWithContext();
      expect(screen.getByText('Welcome to MailStub')).toBeInTheDocument();
      expect(screen.getByText('Get started by creating your first project')).toBeInTheDocument();
    });

    it('should render all three onboarding steps', () => {
      renderWithContext();
      expect(screen.getByText('Create a Project')).toBeInTheDocument();
      expect(screen.getByText('Add a User')).toBeInTheDocument();
      expect(screen.getByText('Send Test Emails')).toBeInTheDocument();
    });

    it('should render step descriptions', () => {
      renderWithContext();
      expect(screen.getByText(/Projects help you organize test emails/)).toBeInTheDocument();
      expect(screen.getByText(/Create test users to receive emails/)).toBeInTheDocument();
      expect(screen.getByText(/Install the MailStub client/)).toBeInTheDocument();
    });

    it('should render the code example with npm install command', () => {
      renderWithContext();
      expect(screen.getByText('npm install mailstub-client')).toBeInTheDocument();
    });

    it('should render the code example with import and client.send', () => {
      renderWithContext();
      const codeText = screen.getByText(/import { client } from 'mailstub-client'/);
      expect(codeText).toBeInTheDocument();
      expect(screen.getByText(/await client.send/)).toBeInTheDocument();
    });

    it('should render help text with documentation link', () => {
      renderWithContext();
      expect(screen.getByText(/Need help\? Check out the/)).toBeInTheDocument();
      expect(screen.getByText('documentation')).toBeInTheDocument();
    });
  });

  describe('Theme Toggle', () => {
    it('should render theme toggle button', () => {
      renderWithContext();
      expect(screen.getByTestId('theme-toggle-button')).toBeInTheDocument();
    });

    it('should show Moon icon when theme is light', () => {
      const mockContext = createMockAppContext({ theme: 'light' });
      renderWithContext(mockContext);
      
      expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('sun-icon')).not.toBeInTheDocument();
    });

    it('should show Sun icon when theme is dark', () => {
      const mockContext = createMockAppContext({ theme: 'dark' });
      renderWithContext(mockContext);
      
      expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('moon-icon')).not.toBeInTheDocument();
    });

    it('should call toggleTheme when theme toggle button is clicked', () => {
      const mockToggleTheme = vi.fn();
      const mockContext = createMockAppContext({ toggleTheme: mockToggleTheme });
      renderWithContext(mockContext);
      
      const themeButton = screen.getByTestId('theme-toggle-button');
      fireEvent.click(themeButton);
      
      expect(mockToggleTheme).toHaveBeenCalledTimes(1);
    });

    it('should call toggleTheme multiple times when clicked multiple times', () => {
      const mockToggleTheme = vi.fn();
      const mockContext = createMockAppContext({ toggleTheme: mockToggleTheme });
      renderWithContext(mockContext);
      
      const themeButton = screen.getByTestId('theme-toggle-button');
      fireEvent.click(themeButton);
      fireEvent.click(themeButton);
      fireEvent.click(themeButton);
      
      expect(mockToggleTheme).toHaveBeenCalledTimes(3);
    });
  });

  describe('Project Dialog', () => {
    it('should not render ProjectFormDialog initially', () => {
      renderWithContext();
      expect(screen.queryByTestId('project-form-dialog')).not.toBeInTheDocument();
    });

    it('should render Create Project button', () => {
      renderWithContext();
      expect(screen.getByTestId('create-project-button')).toHaveTextContent('Create Project');
    });

    it('should open ProjectFormDialog when Create Project button is clicked', () => {
      renderWithContext();
      
      const createButton = screen.getByTestId('create-project-button');
      fireEvent.click(createButton);
      
      expect(screen.getByTestId('project-form-dialog')).toBeInTheDocument();
    });

    it('should pass mode="create" to ProjectFormDialog', () => {
      renderWithContext();
      
      const createButton = screen.getByTestId('create-project-button');
      fireEvent.click(createButton);
      
      const dialog = screen.getByTestId('project-form-dialog');
      expect(dialog).toHaveAttribute('data-mode', 'create');
    });

    it('should close dialog when onOpenChange is called with false', () => {
      renderWithContext();
      
      // Open dialog
      const createButton = screen.getByTestId('create-project-button');
      fireEvent.click(createButton);
      expect(screen.getByTestId('project-form-dialog')).toBeInTheDocument();
      
      // Close dialog
      const closeButton = screen.getByText('Close Dialog');
      fireEvent.click(closeButton);
      expect(screen.queryByTestId('project-form-dialog')).not.toBeInTheDocument();
    });
  });

  describe('Content Structure', () => {
    it('should have proper heading hierarchy', () => {
      renderWithContext();
      
      const h1 = screen.getByText('MailStub');
      const h2 = screen.getByText('Welcome to MailStub');
      const h3Elements = screen.getAllByRole('heading', { level: 3 });
      
      expect(h1.tagName).toBe('H1');
      expect(h2.tagName).toBe('H2');
      expect(h3Elements).toHaveLength(3); // Three step headings
    });

    it('should render step numbers in order', () => {
      renderWithContext();
      const numbers = screen.getAllByText(/^[1-3]$/);
      expect(numbers).toHaveLength(3);
    });

    it('should render documentation link with correct href', () => {
      renderWithContext();
      const docLink = screen.getByText('documentation');
      expect(docLink).toHaveAttribute('href', '#');
    });
  });

  describe('State Management', () => {
    it('should initialize with projectDialog closed', () => {
      renderWithContext();
      expect(screen.queryByTestId('project-form-dialog')).not.toBeInTheDocument();
    });

    it('should manage dialog open/close state correctly', () => {
      renderWithContext();
      
      // Initially closed
      expect(screen.queryByTestId('project-form-dialog')).not.toBeInTheDocument();
      
      // Open
      fireEvent.click(screen.getByTestId('create-project-button'));
      expect(screen.getByTestId('project-form-dialog')).toBeInTheDocument();
      
      // Close
      fireEvent.click(screen.getByText('Close Dialog'));
      expect(screen.queryByTestId('project-form-dialog')).not.toBeInTheDocument();
      
      // Open again
      fireEvent.click(screen.getByTestId('create-project-button'));
      expect(screen.getByTestId('project-form-dialog')).toBeInTheDocument();
    });
  });

  describe('Integration with AppContext', () => {
    it('should work with default light theme', () => {
      const mockContext = createMockAppContext({ theme: 'light' });
      renderWithContext(mockContext);
      
      expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
    });

    it('should work with dark theme', () => {
      const mockContext = createMockAppContext({ theme: 'dark' });
      renderWithContext(mockContext);
      
      expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
    });

    it('should throw error when rendered outside AppContext', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => render(<EmptyState />)).toThrow(
        'useAppContext must be used within AppContextProvider'
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button for creating projects', () => {
      renderWithContext();
      const button = screen.getByTestId('create-project-button');
      expect(button).toHaveTextContent('Create Project');
      expect(button.tagName).toBe('BUTTON');
    });

    it('should have accessible theme toggle button', () => {
      renderWithContext();
      const button = screen.getByTestId('theme-toggle-button');
      expect(button.tagName).toBe('BUTTON');
    });

    it('should have link with accessible text', () => {
      renderWithContext();
      const link = screen.getByText('documentation');
      expect(link.tagName).toBe('A');
      expect(link).toHaveAttribute('href');
    });
  });
});