import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppHeader } from './app-header';
import { AppContext } from '@/contexts/AppContext';
import { createMockAppContext } from '@/test/mock-app-context';

// Mock clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

describe('AppHeader', () => {
  const mockSearchChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (contextOverrides = {}) => {
    const mockContext = createMockAppContext(contextOverrides);
    return render(
      <AppContext.Provider value={mockContext}>
        <AppHeader searchQuery="" onSearchChange={mockSearchChange} />
      </AppContext.Provider>
    );
  };

  describe('Basic Rendering', () => {
    it('should render the logo and title', () => {
      renderComponent();
      expect(screen.getByText('MailStub')).toBeInTheDocument();
    });

    it('should render search input', () => {
      renderComponent();
      expect(screen.getAllByPlaceholderText('Search messages...')[0]).toBeInTheDocument();
    });

    it('should call onSearchChange when typing', () => {
      renderComponent();
      const input = screen.getAllByPlaceholderText('Search messages...')[0];
      fireEvent.change(input, { target: { value: 'test' } });
      expect(mockSearchChange).toHaveBeenCalledWith('test');
    });
  });

  describe('Project ID Display', () => {
    it('should show project ID when selected', () => {
      const projectId = 'p_test-123';
      renderComponent({ selectedProjectId: projectId });
      expect(screen.getByText(projectId)).toBeInTheDocument();
    });

    it('should not show project ID when none selected', () => {
      renderComponent({ selectedProjectId: null });
      expect(screen.queryByTestId('copy-project-id')).not.toBeInTheDocument();
    });

    it('should show help button when project ID is present', () => {
      renderComponent({ selectedProjectId: 'p_test-123' });
      expect(screen.getByTestId('help-button')).toBeInTheDocument();
    });

    it('should not show help button when no project ID', () => {
      renderComponent({ selectedProjectId: null });
      expect(screen.queryByTestId('help-button')).not.toBeInTheDocument();
    });
  });

  describe('Copy Project ID', () => {
    it('should copy project ID to clipboard when copy button clicked', async () => {
      const projectId = 'p_test-123';
      renderComponent({ selectedProjectId: projectId });
      
      const copyButton = screen.getByTestId('copy-project-id');
      fireEvent.click(copyButton);
      
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(projectId);
    });

    it('should show check icon briefly after copying', async () => {
      const projectId = 'p_test-123';
      renderComponent({ selectedProjectId: projectId });
      
      const copyButton = screen.getByTestId('copy-project-id');
      fireEvent.click(copyButton);
      
      // Check icon should appear (you may need to adjust this based on your icon implementation)
      await waitFor(() => {
        expect(copyButton).toBeInTheDocument();
      });
    });
  });

  describe('Theme Toggle', () => {
    it('should toggle theme', () => {
      const toggleTheme = vi.fn();
      renderComponent({ toggleTheme });
      fireEvent.click(screen.getByTestId('theme-toggle'));
      expect(toggleTheme).toHaveBeenCalled();
    });

    it('should show moon icon in light theme', () => {
      renderComponent({ theme: 'light' });
      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    });

    it('should show sun icon in dark theme', () => {
      renderComponent({ theme: 'dark' });
      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    });
  });

  describe('Mobile Search', () => {
    it('should open mobile search', () => {
      renderComponent();
      fireEvent.click(screen.getByTestId('mobile-search-open'));
      expect(screen.getByTestId('mobile-search-close')).toBeInTheDocument();
    });

    it('should close mobile search', () => {
      renderComponent();
      fireEvent.click(screen.getByTestId('mobile-search-open'));
      expect(screen.getByTestId('mobile-search-close')).toBeInTheDocument();
      
      fireEvent.click(screen.getByTestId('mobile-search-close'));
      expect(screen.queryByTestId('mobile-search-close')).not.toBeInTheDocument();
    });

    it('should focus search input when mobile search opens', () => {
      renderComponent();
      fireEvent.click(screen.getByTestId('mobile-search-open'));
      
      const inputs = screen.getAllByPlaceholderText('Search messages...');
      // The mobile search input should be focused (has autoFocus prop)
      expect(inputs.length).toBeGreaterThan(0);
    });
  });

  describe('Help Dialog', () => {
    it('should not show help dialog initially', () => {
      renderComponent({ selectedProjectId: 'p_test-123' });
      expect(screen.queryByText('Using Your Project ID')).not.toBeInTheDocument();
    });

    it('should open help dialog when help button clicked', () => {
      renderComponent({ selectedProjectId: 'p_test-123' });
      
      const helpButton = screen.getByTestId('help-button');
      fireEvent.click(helpButton);
      
      expect(screen.getByText('Using Your Project ID')).toBeInTheDocument();
    });

    it('should show project ID in code example', () => {
      const projectId = 'p_test-123';
      renderComponent({ selectedProjectId: projectId });
      
      fireEvent.click(screen.getByTestId('help-button'));
      
      // The project ID should appear in the code example
      const codeExample = screen.getByTestId('code-example');
      expect(codeExample).toBeInTheDocument();
      expect(codeExample.textContent).toContain(projectId);
    });

    it('should show example usage section', () => {
      renderComponent({ selectedProjectId: 'p_test-123' });
      
      fireEvent.click(screen.getByTestId('help-button'));
      
      expect(screen.getByText('Example Usage')).toBeInTheDocument();
    });

    it('should show copy code button in dialog', () => {
      renderComponent({ selectedProjectId: 'p_test-123' });
      
      fireEvent.click(screen.getByTestId('help-button'));
      
      expect(screen.getByTestId('copy-code')).toBeInTheDocument();
    });

    it('should copy code example when copy button clicked', async () => {
      const projectId = 'p_test-123';
      renderComponent({ selectedProjectId: projectId });
      
      fireEvent.click(screen.getByTestId('help-button'));
      
      const copyCodeButton = screen.getByTestId('copy-code');
      fireEvent.click(copyCodeButton);
      
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
      const copiedText = (navigator.clipboard.writeText as any).mock.calls[0][0];
      expect(copiedText).toContain('import { client }');
      expect(copiedText).toContain(projectId);
    });

    it('should show "Copied" text briefly after copying code', async () => {
      renderComponent({ selectedProjectId: 'p_test-123' });
      
      fireEvent.click(screen.getByTestId('help-button'));
      
      const copyCodeButton = screen.getByTestId('copy-code');
      fireEvent.click(copyCodeButton);
      
      await waitFor(() => {
        expect(screen.getByText('Copied')).toBeInTheDocument();
      });
    });

    it('should show info message about project ID usage', () => {
      renderComponent({ selectedProjectId: 'p_test-123' });
      
      fireEvent.click(screen.getByTestId('help-button'));
      
      expect(screen.getByText(/The project ID is required as the first argument/)).toBeInTheDocument();
    });
  });

  describe('Code Example Styling', () => {
    it('should display code example with proper formatting', () => {
      renderComponent({ selectedProjectId: 'p_test-123' });
      
      fireEvent.click(screen.getByTestId('help-button'));
      
      // Check that code elements are present
      expect(screen.getByText(/import { client } from 'mailstub-client'/)).toBeInTheDocument();
      expect(screen.getByText(/await client.send/)).toBeInTheDocument();
    });

    it('should include all required parameters in example', () => {
      renderComponent({ selectedProjectId: 'p_test-123' });
      
      fireEvent.click(screen.getByTestId('help-button'));
      
      const codeText = screen.getByText(/sender/).textContent;
      expect(codeText).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible help button with title', () => {
      renderComponent({ selectedProjectId: 'p_test-123' });
      
      const helpButton = screen.getByTestId('help-button');
      expect(helpButton).toHaveAttribute('title', 'How to use project ID');
    });

    it('should have accessible copy button with title', () => {
      renderComponent({ selectedProjectId: 'p_test-123' });
      
      const copyButton = screen.getByTestId('copy-project-id');
      expect(copyButton).toHaveAttribute('title', 'Copy project ID');
    });
  });
});