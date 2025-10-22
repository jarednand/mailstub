import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

  const renderComponent = (contextOverrides = {}) => {
    const mockContext = createMockAppContext(contextOverrides);
    return render(
      <AppContext.Provider value={mockContext}>
        <AppHeader searchQuery="" onSearchChange={mockSearchChange} />
      </AppContext.Provider>
    );
  };

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

  it('should show project ID when selected', () => {
    const projectId = 'p_test-123';
    renderComponent({ selectedProjectId: projectId });
    expect(screen.getByText(projectId)).toBeInTheDocument();
  });

  it('should not show project ID when none selected', () => {
    renderComponent({ selectedProjectId: null });
    expect(screen.queryByTestId('copy-project-id')).not.toBeInTheDocument();
  });

  it('should toggle theme', () => {
    const toggleTheme = vi.fn();
    renderComponent({ toggleTheme });
    fireEvent.click(screen.getByTestId('theme-toggle'));
    expect(toggleTheme).toHaveBeenCalled();
  });

  it('should open mobile search', () => {
    renderComponent();
    fireEvent.click(screen.getByTestId('mobile-search-open'));
    expect(screen.getByTestId('mobile-search-close')).toBeInTheDocument();
  });
});