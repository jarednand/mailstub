import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MainContent } from './main-content';
import { AppContext } from '@/contexts/AppContext';
import { createMockAppContext } from '@/test/mock-app-context';

// Mock child components
vi.mock('@/components/messages/message-list', () => ({
  MessageList: ({ searchQuery }: { searchQuery: string }) => (
    <div data-testid="message-list">Message List: {searchQuery}</div>
  ),
}));

vi.mock('@/components/messages/message-detail-view', () => ({
  MessageDetailView: () => <div data-testid="message-detail-view">Message Detail View</div>,
}));

describe('MainContent', () => {
  const renderComponent = (searchQuery = '', contextOverrides = {}) => {
    const mockContext = createMockAppContext(contextOverrides);
    return render(
      <AppContext.Provider value={mockContext}>
        <MainContent searchQuery={searchQuery} />
      </AppContext.Provider>
    );
  };

  it('should render MessageList when no message is selected', () => {
    renderComponent('', { selectedMessageId: null });
    expect(screen.getByTestId('message-list')).toBeInTheDocument();
    expect(screen.queryByTestId('message-detail-view')).not.toBeInTheDocument();
  });

  it('should render MessageDetailView when a message is selected', () => {
    renderComponent('', { selectedMessageId: 'm_test-123' });
    expect(screen.getByTestId('message-detail-view')).toBeInTheDocument();
    expect(screen.queryByTestId('message-list')).not.toBeInTheDocument();
  });

  it('should pass searchQuery to MessageList', () => {
    renderComponent('test query', { selectedMessageId: null });
    expect(screen.getByText('Message List: test query')).toBeInTheDocument();
  });

  it('should render with empty search query', () => {
    renderComponent('', { selectedMessageId: null });
    expect(screen.getByTestId('message-list')).toBeInTheDocument();
  });
});