import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MessageListItem } from './message-list-item';
import { createMockMessage } from '@/test/mock-app-context';

describe('MessageListItem', () => {
  const mockOnSelect = vi.fn();
  const mockOnClick = vi.fn();

  const defaultProps = {
    message: createMockMessage({
      subject: 'Test Subject',
      sender: 'sender@example.com',
      body: '<p>Test body content</p>',
      read: false,
    }),
    isSelected: false,
    onSelect: mockOnSelect,
    onClick: mockOnClick,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(<MessageListItem {...defaultProps} {...props} />);
  };

  describe('Rendering', () => {
    it('should render message subject', () => {
      renderComponent();
      expect(screen.getByTestId('message-subject')).toHaveTextContent('Test Subject');
    });

    it('should render message sender', () => {
      renderComponent();
      expect(screen.getByTestId('message-sender')).toHaveTextContent('sender@example.com');
    });

    it('should render message body without HTML', () => {
      renderComponent();
      expect(screen.getByTestId('message-body')).toHaveTextContent('Test body content');
    });

    it('should strip HTML tags from body', () => {
      const message = createMockMessage({
        body: '<div><strong>Bold</strong> and <em>italic</em> text</div>',
      });
      renderComponent({ message });
      expect(screen.getByTestId('message-body')).toHaveTextContent('Bold and italic text');
    });

    it('should render timestamp', () => {
      renderComponent();
      expect(screen.getByTestId('message-timestamp')).toBeInTheDocument();
    });

    it('should render checkbox', () => {
      renderComponent();
      expect(screen.getByTestId('message-checkbox')).toBeInTheDocument();
    });
  });

  describe('Click Interactions', () => {
    it('should call onClick when message is clicked', () => {
      const message = createMockMessage({ id: 'm_test-123' });
      renderComponent({ message });
      
      fireEvent.click(screen.getByTestId('message-list-item'));
      
      expect(mockOnClick).toHaveBeenCalledWith('m_test-123');
    });

    it('should call onSelect when checkbox is changed', () => {
      const message = createMockMessage({ id: 'm_test-456' });
      renderComponent({ message });
      
      fireEvent.click(screen.getByTestId('message-checkbox'));
      
      expect(mockOnSelect).toHaveBeenCalledWith('m_test-456');
    });

    it('should not propagate checkbox click to message', () => {
      renderComponent();
      
      fireEvent.click(screen.getByTestId('message-checkbox'));
      
      expect(mockOnSelect).toHaveBeenCalled();
      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe('Selected State', () => {
    it('should apply selected styles when selected', () => {
      renderComponent({ isSelected: true });
      
      const item = screen.getByTestId('message-list-item');
      expect(item).toHaveClass('bg-cyan-50');
    });

    it('should not apply selected styles when not selected', () => {
      renderComponent({ isSelected: false });
      
      const item = screen.getByTestId('message-list-item');
      expect(item).not.toHaveClass('bg-cyan-50');
    });

    it('should check checkbox when selected', () => {
      renderComponent({ isSelected: true });
      
      const checkbox = screen.getByTestId('message-checkbox');
      expect(checkbox).toHaveAttribute('data-state', 'checked');
    });

    it('should not check checkbox when not selected', () => {
      renderComponent({ isSelected: false });
      
      const checkbox = screen.getByTestId('message-checkbox');
      expect(checkbox).toHaveAttribute('data-state', 'unchecked');
    });
  });

  describe('Read/Unread State', () => {
    it('should apply unread styles for unread messages', () => {
      const message = createMockMessage({ read: false });
      renderComponent({ message, isSelected: false });
      
      const subject = screen.getByTestId('message-subject');
      expect(subject).toHaveClass('font-semibold');
    });

    it('should apply read styles for read messages', () => {
      const message = createMockMessage({ read: true });
      renderComponent({ message, isSelected: false });
      
      const subject = screen.getByTestId('message-subject');
      expect(subject).toHaveClass('font-medium');
      expect(subject).not.toHaveClass('font-semibold');
    });

    it('should apply background highlight for unread messages', () => {
      const message = createMockMessage({ read: false });
      renderComponent({ message, isSelected: false });
      
      const item = screen.getByTestId('message-list-item');
      expect(item.className).toContain('bg-cyan-50/30');
    });
  });

  describe('Timestamp Formatting', () => {
    it('should format recent timestamps correctly', () => {
      const now = new Date();
      const message = createMockMessage({
        createdAt: new Date(now.getTime() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
      });
      renderComponent({ message });
      
      expect(screen.getByTestId('message-timestamp')).toHaveTextContent('5m ago');
    });

    it('should format hour-old timestamps correctly', () => {
      const now = new Date();
      const message = createMockMessage({
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      });
      renderComponent({ message });
      
      expect(screen.getByTestId('message-timestamp')).toHaveTextContent('2h ago');
    });

    it('should format day-old timestamps correctly', () => {
      const now = new Date();
      const message = createMockMessage({
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      });
      renderComponent({ message });
      
      expect(screen.getByTestId('message-timestamp')).toHaveTextContent('3d ago');
    });

    it('should show "Just now" for very recent messages', () => {
      const message = createMockMessage({
        createdAt: new Date().toISOString(),
      });
      renderComponent({ message });
      
      expect(screen.getByTestId('message-timestamp')).toHaveTextContent('Just now');
    });
  });

  describe('HTML Stripping', () => {
    it('should handle empty body', () => {
      const message = createMockMessage({ body: '' });
      renderComponent({ message });
      
      expect(screen.getByTestId('message-body')).toHaveTextContent('');
    });

    it('should handle plain text body', () => {
      const message = createMockMessage({ body: 'Plain text' });
      renderComponent({ message });
      
      expect(screen.getByTestId('message-body')).toHaveTextContent('Plain text');
    });

    it('should strip complex nested HTML', () => {
      const message = createMockMessage({
        body: '<div><p>First <strong>paragraph</strong></p><p>Second paragraph</p></div>',
      });
      renderComponent({ message });
      
      const bodyText = screen.getByTestId('message-body').textContent;
      expect(bodyText).not.toContain('<');
      expect(bodyText).not.toContain('>');
    });

    it('should clean up extra whitespace', () => {
      const message = createMockMessage({
        body: '<p>Text   with    extra    spaces</p>',
      });
      renderComponent({ message });
      
      expect(screen.getByTestId('message-body')).toHaveTextContent('Text with extra spaces');
    });
  });

  describe('Different Message Properties', () => {
    it('should render different subjects', () => {
      const message = createMockMessage({ subject: 'Another Subject' });
      renderComponent({ message });
      
      expect(screen.getByTestId('message-subject')).toHaveTextContent('Another Subject');
    });

    it('should render different senders', () => {
      const message = createMockMessage({ sender: 'different@example.com' });
      renderComponent({ message });
      
      expect(screen.getByTestId('message-sender')).toHaveTextContent('different@example.com');
    });

    it('should handle long subjects', () => {
      const message = createMockMessage({
        subject: 'This is a very long subject line that should be truncated',
      });
      renderComponent({ message });
      
      const subject = screen.getByTestId('message-subject');
      expect(subject).toHaveClass('truncate');
    });

    it('should handle long body content', () => {
      const message = createMockMessage({
        body: '<p>This is a very long body content that should be truncated when displayed in the message list item</p>',
      });
      renderComponent({ message });
      
      const body = screen.getByTestId('message-body');
      expect(body).toHaveClass('truncate');
    });
  });
});